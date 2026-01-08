/**
 * React Hook for UpGrade A/B Testing Integration
 *
 * Features:
 * - Automatic initialization with user context
 * - Caching with configurable TTL
 * - Graceful degradation on network failure
 * - TypeScript support
 * - SSR-safe (checks for window)
 */

import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import UpgradeClient from 'upgrade_client_lib/dist/browser';
import { MARKED_DECISION_POINT_STATUS } from 'upgrade_client_lib';

// ============================================================================
// Types
// ============================================================================

interface UpgradeConfig {
  hostUrl: string;
  context: string;
  fallbackCondition?: string;
  cacheTTLMs?: number;
  timeoutMs?: number;
}

interface UserContext {
  userId: string;
  groupData?: Record<string, string>;
  altUserIds?: string[];
}

interface Assignment {
  condition: string | null;
  payload: unknown;
  experimentType: string | null;
  source: 'server' | 'cache' | 'fallback';
}

interface UpgradeContextValue {
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
  getAssignment: (site: string, target?: string) => Promise<Assignment>;
  markDecisionPoint: (site: string, status?: MARKED_DECISION_POINT_STATUS) => void;
  log: (key: string, value: string | number | boolean) => void;
}

// ============================================================================
// Cache Implementation
// ============================================================================

class AssignmentCache {
  private cache: Map<string, { assignment: Assignment; timestamp: number }> = new Map();
  private ttlMs: number;

  constructor(ttlMs: number = 5 * 60 * 1000) {
    this.ttlMs = ttlMs;
  }

  get(key: string): Assignment | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    return entry.assignment;
  }

  set(key: string, assignment: Assignment): void {
    this.cache.set(key, { assignment, timestamp: Date.now() });
  }

  invalidate(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

// ============================================================================
// Context Provider
// ============================================================================

const UpgradeContext = createContext<UpgradeContextValue | null>(null);

interface UpgradeProviderProps {
  config: UpgradeConfig;
  user: UserContext;
  children: React.ReactNode;
}

export function UpgradeProvider({ config, user, children }: UpgradeProviderProps) {
  const clientRef = useRef<UpgradeClient | null>(null);
  const cacheRef = useRef(new AssignmentCache(config.cacheTTLMs));
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize client
  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR guard

    let mounted = true;

    async function init() {
      try {
        setIsLoading(true);
        setError(null);

        const client = new UpgradeClient(
          user.userId,
          config.hostUrl,
          config.context
        );

        // Initialize with timeout
        const initPromise = client.init(user.groupData || {});
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Init timeout')), config.timeoutMs || 10000)
        );

        await Promise.race([initPromise, timeoutPromise]);

        // Set alternative user IDs if provided
        if (user.altUserIds?.length) {
          client.setAltUserIds(user.altUserIds);
        }

        if (mounted) {
          clientRef.current = client;
          setIsInitialized(true);
        }
      } catch (err) {
        console.error('UpGrade initialization failed:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [user.userId, config.hostUrl, config.context]);

  // Re-init if user changes
  useEffect(() => {
    if (clientRef.current && isInitialized) {
      // User changed - clear cache and re-init
      cacheRef.current.invalidate();
      setIsInitialized(false);
    }
  }, [user.userId]);

  const getAssignment = useCallback(async (site: string, target?: string): Promise<Assignment> => {
    const cacheKey = `${site}:${target || 'default'}`;

    // Check cache first
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Not initialized - return fallback
    if (!clientRef.current || !isInitialized) {
      console.warn('UpGrade not initialized, returning fallback');
      return {
        condition: config.fallbackCondition || 'control',
        payload: null,
        experimentType: null,
        source: 'fallback'
      };
    }

    try {
      // Fetch with timeout
      const fetchPromise = clientRef.current.getDecisionPointAssignment(site, target);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Assignment fetch timeout')), config.timeoutMs || 5000)
      );

      const result = await Promise.race([fetchPromise, timeoutPromise]);

      const assignment: Assignment = {
        condition: result.getCondition(),
        payload: result.getPayload(),
        experimentType: result.getExperimentType(),
        source: 'server'
      };

      // Cache the result
      cacheRef.current.set(cacheKey, assignment);

      return assignment;
    } catch (err) {
      console.error('Failed to get assignment:', err);

      // Return fallback
      return {
        condition: config.fallbackCondition || 'control',
        payload: null,
        experimentType: null,
        source: 'fallback'
      };
    }
  }, [isInitialized, config.fallbackCondition, config.timeoutMs]);

  const markDecisionPoint = useCallback((
    site: string,
    status: MARKED_DECISION_POINT_STATUS = MARKED_DECISION_POINT_STATUS.CONDITION_APPLIED
  ) => {
    if (!clientRef.current || !isInitialized) {
      console.warn('UpGrade not initialized, cannot mark decision point');
      return;
    }

    clientRef.current.markDecisionPoint(site, status);
  }, [isInitialized]);

  const log = useCallback((key: string, value: string | number | boolean) => {
    if (!clientRef.current || !isInitialized) {
      console.warn('UpGrade not initialized, cannot log metric');
      return;
    }

    // Type validation
    if (value === null || value === undefined) {
      console.error(`Invalid log value for key "${key}": ${value}`);
      return;
    }

    clientRef.current.log(key, value);
  }, [isInitialized]);

  const contextValue: UpgradeContextValue = {
    isInitialized,
    isLoading,
    error,
    getAssignment,
    markDecisionPoint,
    log
  };

  return (
    <UpgradeContext.Provider value={contextValue}>
      {children}
    </UpgradeContext.Provider>
  );
}

// ============================================================================
// Hooks
// ============================================================================

export function useUpgrade(): UpgradeContextValue {
  const context = useContext(UpgradeContext);
  if (!context) {
    throw new Error('useUpgrade must be used within an UpgradeProvider');
  }
  return context;
}

/**
 * Hook for getting an experiment assignment
 *
 * @example
 * const { condition, isLoading } = useExperiment('new_math_ui');
 * if (isLoading) return <Spinner />;
 * return condition === 'treatment' ? <NewMathUI /> : <OldMathUI />;
 */
export function useExperiment(site: string, target?: string) {
  const { getAssignment, markDecisionPoint, isInitialized } = useUpgrade();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const markedRef = useRef(false);

  useEffect(() => {
    if (!isInitialized) return;

    let mounted = true;

    async function fetchAssignment() {
      setIsLoading(true);
      const result = await getAssignment(site, target);

      if (mounted) {
        setAssignment(result);
        setIsLoading(false);

        // Auto-mark decision point on first load
        if (!markedRef.current && result.condition) {
          markDecisionPoint(site);
          markedRef.current = true;
        }
      }
    }

    fetchAssignment();

    return () => {
      mounted = false;
    };
  }, [site, target, isInitialized, getAssignment, markDecisionPoint]);

  return {
    condition: assignment?.condition,
    payload: assignment?.payload,
    source: assignment?.source,
    isLoading: isLoading || !isInitialized
  };
}

/**
 * Hook for logging experiment outcomes
 *
 * @example
 * const logOutcome = useExperimentLog();
 * // After quiz completion:
 * logOutcome('quiz_score', score);
 * logOutcome('time_spent_ms', duration);
 */
export function useExperimentLog() {
  const { log, isInitialized } = useUpgrade();

  return useCallback((key: string, value: string | number | boolean) => {
    if (!isInitialized) {
      console.warn('UpGrade not initialized, queueing log');
      // Could implement queue here for offline support
      return;
    }
    log(key, value);
  }, [log, isInitialized]);
}

// ============================================================================
// Example Usage
// ============================================================================

/*
// In your app root:
import { UpgradeProvider } from './upgrade-hook';

function App() {
  const user = useCurrentUser(); // Your auth hook

  return (
    <UpgradeProvider
      config={{
        hostUrl: 'https://upgrade.yourcompany.com',
        context: 'math-app',
        fallbackCondition: 'control',
        cacheTTLMs: 5 * 60 * 1000,
        timeoutMs: 5000
      }}
      user={{
        userId: user.id,
        groupData: {
          classId: user.classId,
          schoolId: user.schoolId,
          districtId: user.districtId
        },
        altUserIds: [user.email, user.ltiUserId].filter(Boolean)
      }}
    >
      <Router />
    </UpgradeProvider>
  );
}

// In a component:
function MathProblem() {
  const { condition, isLoading } = useExperiment('problem_feedback_timing');
  const logOutcome = useExperimentLog();

  if (isLoading) return <Spinner />;

  const handleSubmit = (answer: string, isCorrect: boolean) => {
    logOutcome('answer_correct', isCorrect);
    logOutcome('response_time_ms', Date.now() - startTime);

    if (condition === 'immediate_feedback') {
      showFeedback(isCorrect);
    } else {
      // Delayed feedback condition
      queueFeedbackForLater(isCorrect);
    }
  };

  return <Problem onSubmit={handleSubmit} />;
}
*/
