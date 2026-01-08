export type DemoStep =
  | 'welcome'
  | 'get-key'
  | 'init-sdk'
  | 'get-assignment'
  | 'show-experiment'
  | 'mark-outcome'
  | 'view-results'
  | 'isolation-demo';

export interface ApiLogEntry {
  id: string;
  timestamp: Date;
  method: 'GET' | 'POST';
  endpoint: string;
  status: number;
  duration: number;
  request?: object;
  response?: object;
  tenant: string;
}

export interface TenantContext {
  id: string;
  name: string;
  description: string;
  apiKey: string;
  color: string;
}

export interface ExperimentAssignment {
  experimentId: string;
  experimentName: string;
  hypothesis: string;
  site: string;
  target: string;
  condition: string;
  payload?: {
    type: string;
    value: string;
  };
}

export interface DemoState {
  currentStep: DemoStep;
  currentTenant: TenantContext;
  tenants: TenantContext[];
  apiLogs: ApiLogEntry[];
  isInitialized: boolean;
  assignment: ExperimentAssignment | null;
  outcomeMarked: boolean;
  splitView: boolean;
  userId: string;
}

// Kiddom-focused tenants (school districts as tenants)
export const DEMO_TENANTS: TenantContext[] = [
  {
    id: 'lausd',
    name: 'Los Angeles USD',
    description: '600K students across 1,000+ schools',
    apiKey: 'upg_live_lausd_k8m2n4p6q8r0',
    color: '#2563EB', // blue
  },
  {
    id: 'chicago',
    name: 'Chicago Public Schools',
    description: '340K students, 500+ schools',
    apiKey: 'upg_live_cps_a1b2c3d4e5f6',
    color: '#DC2626', // red
  },
];

// Realistic educational experiments for Kiddom
export const DEMO_EXPERIMENTS: Record<string, ExperimentAssignment[]> = {
  'lausd': [
    {
      experimentId: 'exp-hints-001',
      experimentName: 'Adaptive Hint System',
      hypothesis: 'Progressive hints improve problem completion without reducing learning',
      site: 'math-practice',
      target: 'hint-system',
      condition: 'progressive-hints',
      payload: {
        type: 'json',
        value: JSON.stringify({
          hintStyle: 'progressive',
          maxHints: 3,
          showAfterAttempts: 2,
          hintTypes: ['conceptual', 'procedural', 'worked-example'],
        }),
      },
    },
  ],
  'chicago': [
    {
      experimentId: 'exp-feedback-002',
      experimentName: 'Immediate vs Delayed Feedback',
      hypothesis: 'Immediate feedback increases engagement but delayed feedback improves retention',
      site: 'assignment',
      target: 'feedback-timing',
      condition: 'immediate',
      payload: {
        type: 'json',
        value: JSON.stringify({
          feedbackTiming: 'immediate',
          showCorrectAnswer: true,
          allowRetry: true,
        }),
      },
    },
  ],
};

// Student context for realistic demo
export interface StudentContext {
  userId: string;
  grade: number;
  school: string;
  class: string;
  teacher: string;
}

export function generateStudentContext(): StudentContext {
  const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Mason', 'Sophia', 'Lucas'];
  const lastInitials = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const schools = ['Lincoln Elementary', 'Washington Middle', 'Jefferson Academy'];
  const teachers = ['Ms. Rodriguez', 'Mr. Chen', 'Mrs. Thompson', 'Mr. Patel'];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastInitial = lastInitials[Math.floor(Math.random() * lastInitials.length)];

  return {
    userId: `${firstName.toLowerCase()}-${lastInitial.toLowerCase()}-${Math.random().toString(36).slice(2, 6)}`,
    grade: Math.floor(Math.random() * 4) + 4, // Grades 4-7
    school: schools[Math.floor(Math.random() * schools.length)],
    class: `Math ${Math.floor(Math.random() * 3) + 1}01`,
    teacher: teachers[Math.floor(Math.random() * teachers.length)],
  };
}
