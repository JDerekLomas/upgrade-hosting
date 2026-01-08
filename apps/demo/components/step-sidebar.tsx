'use client';

import { Check, Circle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import type { DemoStep } from '@/lib/types';

interface StepSidebarProps {
  currentStep: DemoStep;
  completedSteps: Set<DemoStep>;
  onStepClick: (step: DemoStep) => void;
  apiCallCount: number;
  currentTenantColor: string;
}

const STEPS: { id: DemoStep; label: string; shortLabel: string }[] = [
  { id: 'welcome', label: 'Welcome', shortLabel: 'Start' },
  { id: 'get-key', label: 'Get API Key', shortLabel: 'Key' },
  { id: 'init-sdk', label: 'Initialize SDK', shortLabel: 'Init' },
  { id: 'get-assignment', label: 'Get Assignment', shortLabel: 'Assign' },
  { id: 'show-experiment', label: 'See Experiment', shortLabel: 'UI' },
  { id: 'mark-outcome', label: 'Mark Outcome', shortLabel: 'Mark' },
  { id: 'view-results', label: 'View Results', shortLabel: 'Results' },
  { id: 'isolation-demo', label: 'Isolation Demo', shortLabel: 'Isolation' },
];

export function StepSidebar({
  currentStep,
  completedSteps,
  onStepClick,
  apiCallCount,
  currentTenantColor,
}: StepSidebarProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-56 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Demo Steps</h2>
        <p className="text-xs text-gray-500 mt-1">
          Interactive walkthrough
        </p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.has(step.id);
          const isCurrent = step.id === currentStep;
          const isPast = index < currentIndex;
          const isClickable = isPast || isCompleted || index === currentIndex;

          return (
            <button
              key={step.id}
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                isCurrent && 'bg-blue-50 text-blue-700 font-medium',
                !isCurrent && isClickable && 'hover:bg-gray-100 text-gray-700',
                !isClickable && 'text-gray-400 cursor-not-allowed'
              )}
            >
              <span
                className={clsx(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                  isCompleted && 'bg-green-500 text-white',
                  isCurrent && !isCompleted && 'border-2',
                  !isCurrent && !isCompleted && 'border border-gray-300'
                )}
                style={isCurrent && !isCompleted ? { borderColor: currentTenantColor } : undefined}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5" />
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: currentTenantColor }} />
                ) : (
                  <span className="text-gray-500">{index + 1}</span>
                )}
              </span>
              <span className="truncate">{step.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
          Live Stats
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">API Calls</span>
          <span
            className="text-lg font-bold"
            style={{ color: currentTenantColor }}
          >
            {apiCallCount}
          </span>
        </div>
      </div>
    </div>
  );
}
