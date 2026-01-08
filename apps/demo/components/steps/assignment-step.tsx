'use client';

import { useState } from 'react';
import { Shuffle, ArrowRight, Loader2 } from 'lucide-react';
import type { TenantContext, ExperimentAssignment } from '@/lib/types';

interface AssignmentStepProps {
  tenant: TenantContext;
  assignment: ExperimentAssignment | null;
  onGetAssignment: () => Promise<void>;
  onContinue: () => void;
}

export function AssignmentStep({
  tenant,
  assignment,
  onGetAssignment,
  onContinue,
}: AssignmentStepProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGetAssignment = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    await onGetAssignment();
    setIsLoading(false);
  };

  const codeExample = `// Get assignment for a decision point
const assignment = await client.getDecisionPointAssignment(
  '${assignment?.site || 'pricing'}',     // site
  '${assignment?.target || 'hero-cta'}'   // target
);

// Returns:
${assignment ? JSON.stringify({
  experimentId: assignment.experimentId,
  condition: assignment.condition,
  payload: assignment.payload,
}, null, 2) : '// { experimentId, condition, payload }'}`;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${tenant.color}20` }}
        >
          <Shuffle className="w-6 h-6" style={{ color: tenant.color }} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Get Experiment Assignment
        </h2>
        <p className="text-gray-600">
          Request which experiment variant this user should see.
          UpGrade uses your experiment rules to determine the assignment.
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

      {!assignment ? (
        <button
          onClick={handleGetAssignment}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: tenant.color }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Getting Assignment...
            </>
          ) : (
            <>
              <Shuffle className="w-4 h-4" />
              Get Assignment
            </>
          )}
        </button>
      ) : (
        <div className="space-y-4 animate-slide-in">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Assignment Result</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Experiment
                </div>
                <div className="font-medium text-gray-900">
                  {assignment.experimentName}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Condition
                </div>
                <span
                  className="inline-flex px-2 py-1 rounded text-sm font-medium"
                  style={{ backgroundColor: `${tenant.color}15`, color: tenant.color }}
                >
                  {assignment.condition}
                </span>
              </div>

              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Decision Point
                </div>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {assignment.site}/{assignment.target}
                </code>
              </div>

              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Has Payload
                </div>
                <span className="text-sm text-gray-700">
                  {assignment.payload ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onContinue}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: tenant.color }}
          >
            See It In Action
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
