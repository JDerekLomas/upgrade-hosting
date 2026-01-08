'use client';

import { useState } from 'react';
import { Target, Check, Loader2, ArrowRight, BookOpen } from 'lucide-react';
import type { TenantContext, ExperimentAssignment } from '@/lib/types';

interface MarkOutcomeStepProps {
  tenant: TenantContext;
  assignment: ExperimentAssignment | null;
  onMarkOutcome: () => Promise<void>;
  onContinue: () => void;
  isMarked: boolean;
}

export function MarkOutcomeStep({
  tenant,
  assignment,
  onMarkOutcome,
  onContinue,
  isMarked,
}: MarkOutcomeStepProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleMark = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    await onMarkOutcome();
    setIsLoading(false);
  };

  const isHintExperiment = assignment?.target === 'hint-system';

  const codeExample = isHintExperiment
    ? `// When student completes problem (with or without hints)
await client.markExperimentPoint(
  'math-practice',     // site
  'hint-system',       // target
  'problem-completed'  // outcome
);

// Log detailed learning metrics
await client.log([{
  timestamp: new Date().toISOString(),
  metrics: {
    groupedMetrics: [{
      key: 'problem-completion',
      attributes: {
        hintsUsed: 2,
        attempts: 3,
        timeSpent: 45,
        correct: true
      }
    }]
  }
}]);`
    : `// When student submits answer
await client.markExperimentPoint(
  'assignment',        // site
  'feedback-timing',   // target
  'answer-submitted'   // outcome
);

// Log retry behavior for analysis
await client.log([{
  timestamp: new Date().toISOString(),
  metrics: {
    groupedMetrics: [{
      key: 'answer-submission',
      attributes: {
        wasRetry: false,
        correct: true,
        responseTime: 12500
      }
    }]
  }
}]);`;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${tenant.color}20` }}
        >
          <Target className="w-6 h-6" style={{ color: tenant.color }} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Record Learning Outcome
        </h2>
        <p className="text-gray-600">
          Track when students complete problems so UpGrade can measure
          experiment effectiveness on actual learning.
        </p>
      </div>

      <div className="bg-gray-900 rounded-xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
          <span className="text-xs text-gray-400">TypeScript</span>
        </div>
        <pre className="p-4 text-sm text-gray-100 overflow-x-auto code-block whitespace-pre-wrap">
          {codeExample}
        </pre>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-medium text-gray-900 mb-4">Simulate Student Action</h3>

        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isMarked ? 'bg-green-100' : 'bg-gray-100'
            }`}
          >
            {isMarked ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <BookOpen className="w-5 h-5 text-gray-400" />
            )}
          </div>

          <div className="flex-1">
            <div className="font-medium text-gray-900">
              {isMarked ? 'Outcome Recorded!' : 'Waiting for completion...'}
            </div>
            <div className="text-sm text-gray-500">
              {isMarked
                ? isHintExperiment
                  ? 'Student completed the fraction problem'
                  : 'Student submitted answer and received feedback'
                : isHintExperiment
                ? 'Simulate student completing the problem'
                : 'Simulate student submitting their answer'}
            </div>
          </div>

          {!isMarked && (
            <button
              onClick={handleMark}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg text-white font-medium transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: tenant.color }}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isHintExperiment ? (
                'Complete Problem'
              ) : (
                'Submit Answer'
              )}
            </button>
          )}
        </div>
      </div>

      {isMarked && (
        <div className="space-y-4 animate-slide-in">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h4 className="font-medium text-green-800 mb-2">
              Learning event logged
            </h4>
            <p className="text-sm text-green-700">
              {isHintExperiment ? (
                <>
                  UpGrade recorded: problem completed with <strong>2 hints</strong> used,{' '}
                  <strong>3 attempts</strong>, <strong>45 seconds</strong> spent.
                  This data will be aggregated across all students to measure if
                  hints improve completion without hurting assessment scores.
                </>
              ) : (
                <>
                  UpGrade recorded: answer submitted, <strong>correct</strong>,{' '}
                  <strong>12.5 seconds</strong> response time.
                  This will help determine if immediate feedback encourages
                  productive persistence or just guessing.
                </>
              )}
            </p>
          </div>

          <button
            onClick={onContinue}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: tenant.color }}
          >
            View Experiment Results
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
