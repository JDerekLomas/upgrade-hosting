/**
 * Vanilla JavaScript UpGrade Integration
 *
 * Framework-agnostic implementation for:
 * - Legacy educational apps
 * - Simple HTML/JS games
 * - Embedded widgets
 * - Any non-React/Vue/Angular app
 */

// ============================================================================
// UMD Module Pattern (works in browser and Node)
// ============================================================================

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['upgrade_client_lib/dist/browser'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = factory(require('upgrade_client_lib/dist/node'));
  } else {
    // Browser globals
    root.UpgradeHelper = factory(root.UpgradeClient);
  }
}(typeof self !== 'undefined' ? self : this, function (UpgradeClientLib) {
  'use strict';

  var UpgradeClient = UpgradeClientLib.default || UpgradeClientLib;
  var MARKED_DECISION_POINT_STATUS = UpgradeClientLib.MARKED_DECISION_POINT_STATUS || {
    CONDITION_APPLIED: 'condition applied',
    CONDITION_FAILED_TO_APPLY: 'condition failed to apply',
    NO_CONDITION_ASSIGNED: 'no condition assigned'
  };

  // ============================================================================
  // Configuration
  // ============================================================================

  var defaultConfig = {
    hostUrl: '',
    context: '',
    fallbackCondition: 'control',
    cacheTTLMs: 5 * 60 * 1000, // 5 minutes
    timeoutMs: 5000,
    debug: false
  };

  // ============================================================================
  // Simple Cache
  // ============================================================================

  function AssignmentCache(ttlMs) {
    this.cache = {};
    this.ttlMs = ttlMs || 300000;
  }

  AssignmentCache.prototype.get = function (key) {
    var entry = this.cache[key];
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttlMs) {
      delete this.cache[key];
      return null;
    }

    return entry.assignment;
  };

  AssignmentCache.prototype.set = function (key, assignment) {
    this.cache[key] = {
      assignment: assignment,
      timestamp: Date.now()
    };
  };

  AssignmentCache.prototype.clear = function () {
    this.cache = {};
  };

  // ============================================================================
  // Main Helper Class
  // ============================================================================

  function UpgradeHelper(config) {
    this.config = Object.assign({}, defaultConfig, config);
    this.client = null;
    this.initialized = false;
    this.initPromise = null;
    this.cache = new AssignmentCache(this.config.cacheTTLMs);
    this.markedPoints = {};

    this._log('UpgradeHelper created with config:', this.config);
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Initialize the UpGrade client
   *
   * @param {string} userId - Unique user identifier
   * @param {Object} groupData - Group membership (classId, schoolId, etc.)
   * @param {Array<string>} altUserIds - Alternative user IDs (email, LTI ID, etc.)
   * @returns {Promise<void>}
   */
  UpgradeHelper.prototype.init = function (userId, groupData, altUserIds) {
    var self = this;

    // Return existing promise if already initializing
    if (this.initPromise) {
      return this.initPromise;
    }

    // Validate
    if (!userId) {
      return Promise.reject(new Error('userId is required'));
    }

    if (!this.config.hostUrl) {
      return Promise.reject(new Error('hostUrl is required in config'));
    }

    this._log('Initializing with userId:', userId);

    this.initPromise = new Promise(function (resolve, reject) {
      try {
        self.client = new UpgradeClient(
          userId,
          self.config.hostUrl,
          self.config.context
        );

        // Create timeout race
        var timeoutId = setTimeout(function () {
          reject(new Error('Initialization timeout'));
        }, self.config.timeoutMs);

        self.client.init(groupData || {})
          .then(function () {
            clearTimeout(timeoutId);

            // Set alternative IDs
            if (altUserIds && altUserIds.length > 0) {
              self.client.setAltUserIds(altUserIds);
            }

            self.initialized = true;
            self._log('Initialized successfully');
            resolve();
          })
          .catch(function (error) {
            clearTimeout(timeoutId);
            self._log('Initialization failed:', error);
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });

    return this.initPromise;
  };

  // ============================================================================
  // Get Assignment
  // ============================================================================

  /**
   * Get experiment assignment for a decision point
   *
   * @param {string} site - Decision point name
   * @param {string} target - Optional target within site
   * @returns {Promise<Object>} - { condition, payload, source }
   */
  UpgradeHelper.prototype.getAssignment = function (site, target) {
    var self = this;
    var cacheKey = site + ':' + (target || 'default');

    // Check cache first
    var cached = this.cache.get(cacheKey);
    if (cached) {
      this._log('Cache hit for', site);
      return Promise.resolve(cached);
    }

    // Not initialized
    if (!this.initialized || !this.client) {
      this._log('Not initialized, returning fallback');
      return Promise.resolve({
        condition: this.config.fallbackCondition,
        payload: null,
        source: 'fallback'
      });
    }

    return new Promise(function (resolve) {
      // Timeout race
      var timeoutId = setTimeout(function () {
        self._log('Assignment fetch timeout');
        resolve({
          condition: self.config.fallbackCondition,
          payload: null,
          source: 'fallback'
        });
      }, self.config.timeoutMs);

      self.client.getDecisionPointAssignment(site, target)
        .then(function (result) {
          clearTimeout(timeoutId);

          var assignment = {
            condition: result.getCondition(),
            payload: result.getPayload(),
            experimentType: result.getExperimentType(),
            source: 'server'
          };

          // Cache it
          self.cache.set(cacheKey, assignment);
          self._log('Got assignment for', site, ':', assignment.condition);

          resolve(assignment);
        })
        .catch(function (error) {
          clearTimeout(timeoutId);
          self._log('Assignment fetch failed:', error);

          resolve({
            condition: self.config.fallbackCondition,
            payload: null,
            source: 'fallback'
          });
        });
    });
  };

  // ============================================================================
  // Mark Decision Point
  // ============================================================================

  /**
   * Mark that a decision point condition was applied
   *
   * @param {string} site - Decision point name
   * @param {string} status - Optional status (defaults to CONDITION_APPLIED)
   */
  UpgradeHelper.prototype.markDecisionPoint = function (site, status) {
    if (!this.initialized || !this.client) {
      this._log('Cannot mark - not initialized');
      return;
    }

    var actualStatus = status || MARKED_DECISION_POINT_STATUS.CONDITION_APPLIED;
    this.client.markDecisionPoint(site, actualStatus);
    this.markedPoints[site] = true;
    this._log('Marked decision point:', site);
  };

  // ============================================================================
  // Log Metrics
  // ============================================================================

  /**
   * Log an outcome metric
   *
   * @param {string} key - Metric name
   * @param {string|number|boolean} value - Metric value
   * @param {string} site - Optional: associated decision point (for validation)
   */
  UpgradeHelper.prototype.log = function (key, value, site) {
    if (!this.initialized || !this.client) {
      this._log('Cannot log - not initialized');
      return;
    }

    // Type validation
    if (value === null || value === undefined) {
      console.error('[UpGrade] Invalid log value for key "' + key + '": ' + value);
      return;
    }

    var valueType = typeof value;
    if (valueType !== 'string' && valueType !== 'number' && valueType !== 'boolean') {
      console.error('[UpGrade] Invalid value type for key "' + key + '": ' + valueType);
      return;
    }

    // Warn if logging before marking
    if (site && !this.markedPoints[site]) {
      console.warn('[UpGrade] Logging "' + key + '" before marking decision point "' + site + '"');
    }

    this.client.log(key, value);
    this._log('Logged:', key, '=', value);
  };

  // ============================================================================
  // Convenience Methods
  // ============================================================================

  /**
   * Get assignment and auto-mark in one call
   *
   * @param {string} site - Decision point name
   * @param {string} target - Optional target
   * @returns {Promise<Object>}
   */
  UpgradeHelper.prototype.getAndMark = function (site, target) {
    var self = this;

    return this.getAssignment(site, target).then(function (assignment) {
      if (assignment.condition && assignment.source !== 'fallback') {
        self.markDecisionPoint(site);
      }
      return assignment;
    });
  };

  /**
   * Check if a specific condition is assigned
   *
   * @param {string} site - Decision point name
   * @param {string} conditionName - Condition to check for
   * @returns {Promise<boolean>}
   */
  UpgradeHelper.prototype.hasCondition = function (site, conditionName) {
    return this.getAssignment(site).then(function (assignment) {
      return assignment.condition === conditionName;
    });
  };

  /**
   * Feature flag check (boolean condition)
   *
   * @param {string} flagName - Feature flag name (used as site)
   * @returns {Promise<boolean>}
   */
  UpgradeHelper.prototype.isFeatureEnabled = function (flagName) {
    return this.getAssignment(flagName).then(function (assignment) {
      return assignment.condition === 'enabled' ||
             assignment.condition === 'true' ||
             assignment.condition === 'treatment';
    });
  };

  // ============================================================================
  // Utility Methods
  // ============================================================================

  UpgradeHelper.prototype.isInitialized = function () {
    return this.initialized;
  };

  UpgradeHelper.prototype.clearCache = function () {
    this.cache.clear();
    this._log('Cache cleared');
  };

  UpgradeHelper.prototype._log = function () {
    if (this.config.debug) {
      var args = ['[UpGrade]'].concat(Array.prototype.slice.call(arguments));
      console.log.apply(console, args);
    }
  };

  // ============================================================================
  // Static Factory
  // ============================================================================

  /**
   * Create and initialize in one step
   *
   * @param {Object} config - Configuration object
   * @param {string} userId - User identifier
   * @param {Object} groupData - Group membership
   * @param {Array<string>} altUserIds - Alternative IDs
   * @returns {Promise<UpgradeHelper>}
   */
  UpgradeHelper.create = function (config, userId, groupData, altUserIds) {
    var helper = new UpgradeHelper(config);
    return helper.init(userId, groupData, altUserIds).then(function () {
      return helper;
    });
  };

  return UpgradeHelper;
}));

// ============================================================================
// Usage Examples
// ============================================================================

/*
// Example 1: Basic usage in browser

<script src="https://unpkg.com/upgrade_client_lib/dist/browser/index.js"></script>
<script src="upgrade-helper.js"></script>
<script>
  var upgrade = new UpgradeHelper({
    hostUrl: 'https://upgrade.yourcompany.com',
    context: 'math-game',
    debug: true
  });

  upgrade.init('student-123', { classId: 'class-456' })
    .then(function() {
      return upgrade.getAndMark('new_problem_ui');
    })
    .then(function(assignment) {
      if (assignment.condition === 'treatment') {
        showNewUI();
      } else {
        showOldUI();
      }
    });

  // Log outcomes
  function onQuizComplete(score) {
    upgrade.log('quiz_score', score, 'new_problem_ui');
    upgrade.log('quiz_completed', true);
  }
</script>

// Example 2: With LTI context

function handleLtiLaunch(ltiParams) {
  var upgrade = new UpgradeHelper({
    hostUrl: 'https://upgrade.yourcompany.com',
    context: 'lti-app'
  });

  // Map LTI identity
  var userId = 'lti:' + ltiParams.iss + ':' + ltiParams.sub;
  var groupData = {
    classId: ltiParams.context_id,
    schoolId: ltiParams.platform_guid
  };
  var altIds = [ltiParams.sub, ltiParams.email].filter(Boolean);

  return upgrade.init(userId, groupData, altIds);
}

// Example 3: Feature flags for gradual rollout

upgrade.isFeatureEnabled('new_dashboard').then(function(enabled) {
  if (enabled) {
    loadNewDashboard();
  } else {
    loadOldDashboard();
  }
});

// Example 4: A/B test with payload

upgrade.getAssignment('feedback_timing').then(function(assignment) {
  var delayMs = assignment.payload?.delayMs || 0;

  if (assignment.condition === 'delayed') {
    setTimeout(showFeedback, delayMs);
  } else {
    showFeedback();
  }
});
*/
