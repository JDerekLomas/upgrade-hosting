'use client';

import { BarChart3, ArrowRight, TrendingUp, Users, BookOpen, Brain, AlertTriangle } from 'lucide-react';
import type { TenantContext, ExperimentAssignment } from '@/lib/types';

interface ResultsStepProps {
  tenant: TenantContext;
  assignment: ExperimentAssignment | null;
  onContinue: () => void;
}

export function ResultsStep({ tenant, assignment, onContinue }: ResultsStepProps) {
  const isHintExperiment = assignment?.target === 'hint-system';

  // Mock results data for hint experiment
  const hintResults = {
    control: {
      students: 1847,
      problemsCompleted: 67.2,
      hintsUsed: 0,
      assessmentScore: 78.4,
      timePerProblem: 145,
    },
    variant: {
      students: 1853,
      problemsCompleted: 84.7,
      hintsUsed: 2.1,
      assessmentScore: 76.8,
      timePerProblem: 168,
    },
    completionImprovement: 26.0,
    assessmentDelta: -2.0,
    significance: 99.2,
    guardrailPassed: true,
  };

  // Mock results for feedback experiment
  const feedbackResults = {
    control: {
      students: 1234,
      completionRate: 71.3,
      retryRate: 12.4,
      assessmentScore: 74.2,
    },
    variant: {
      students: 1241,
      completionRate: 89.1,
      retryRate: 34.7,
      assessmentScore: 72.8,
    },
    completionImprovement: 24.9,
    retryImprovement: 179.8,
    significance: 97.8,
  };

  const results = isHintExperiment ? hintResults : feedbackResults;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${tenant.color}20` }}
        >
          <BarChart3 className="w-6 h-6" style={{ color: tenant.color }} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Experiment Results
        </h2>
        <p className="text-gray-600">
          Learning outcomes from {((results as typeof hintResults).control?.students || 0) + ((results as typeof hintResults).variant?.students || 0)} students over 3 weeks
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
            <Users className="w-3.5 h-3.5" />
            Students
          </div>
          <div className="text-xl font-bold text-gray-900">
            {((results as typeof hintResults).control?.students || 0) + ((results as typeof hintResults).variant?.students || 0)}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            {isHintExperiment ? 'Completion' : 'Completion'}
          </div>
          <div className="text-xl font-bold text-green-600">
            +{isHintExperiment ? hintResults.completionImprovement : feedbackResults.completionImprovement}%
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
            <Brain className="w-3.5 h-3.5" />
            Assessment
          </div>
          <div className={`text-xl font-bold ${
            isHintExperiment && hintResults.assessmentDelta < 0 ? 'text-amber-600' : 'text-gray-900'
          }`}>
            {isHintExperiment ? `${hintResults.assessmentDelta}%` : '-1.9%'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Significance
          </div>
          <div className="text-xl font-bold text-gray-900">
            {isHintExperiment ? hintResults.significance : feedbackResults.significance}%
          </div>
        </div>
      </div>

      {/* Detailed Comparison */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-medium text-gray-900 mb-6">
          {isHintExperiment ? 'Problem Completion Rate' : 'Assignment Completion Rate'}
        </h3>

        <div className="space-y-6">
          {/* Control */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                control (no hints)
              </span>
              <span className="text-sm text-gray-500">
                {isHintExperiment
                  ? `${hintResults.control.problemsCompleted}% completion`
                  : `${feedbackResults.control.completionRate}% completion`}
              </span>
            </div>
            <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="h-full bg-gray-400 rounded-lg transition-all duration-1000"
                style={{
                  width: `${isHintExperiment
                    ? hintResults.control.problemsCompleted
                    : feedbackResults.control.completionRate}%`
                }}
              />
            </div>
          </div>

          {/* Variant */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {assignment?.condition || 'progressive-hints'}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ backgroundColor: `${tenant.color}15`, color: tenant.color }}
                >
                  WINNER
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {isHintExperiment
                  ? `${hintResults.variant.problemsCompleted}% completion`
                  : `${feedbackResults.variant.completionRate}% completion`}
              </span>
            </div>
            <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="h-full rounded-lg transition-all duration-1000"
                style={{
                  width: `${isHintExperiment
                    ? hintResults.variant.problemsCompleted
                    : feedbackResults.variant.completionRate}%`,
                  backgroundColor: tenant.color,
                }}
              />
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        {isHintExperiment && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Secondary Metrics</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Avg hints used</div>
                <div className="font-medium">
                  {hintResults.control.hintsUsed} → {hintResults.variant.hintsUsed}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Time per problem</div>
                <div className="font-medium">
                  {hintResults.control.timePerProblem}s → {hintResults.variant.timePerProblem}s
                </div>
              </div>
              <div>
                <div className="text-gray-500">Unit assessment</div>
                <div className="font-medium text-amber-600">
                  {hintResults.control.assessmentScore}% → {hintResults.variant.assessmentScore}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Guardrail Check */}
      {isHintExperiment && (
        <div className={`rounded-xl p-4 mb-6 ${
          hintResults.guardrailPassed
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start gap-3">
            {hintResults.guardrailPassed ? (
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
            )}
            <div>
              <h4 className={`font-medium ${
                hintResults.guardrailPassed ? 'text-green-800' : 'text-red-800'
              }`}>
                Guardrail: Assessment scores must not decrease &gt;5%
              </h4>
              <p className={`text-sm mt-1 ${
                hintResults.guardrailPassed ? 'text-green-700' : 'text-red-700'
              }`}>
                {hintResults.guardrailPassed
                  ? `Passed. Assessment scores decreased by only ${Math.abs(hintResults.assessmentDelta)}%, within acceptable range.`
                  : 'Failed. Assessment scores decreased beyond acceptable threshold.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendation */}
      <div
        className="rounded-xl p-4 mb-6"
        style={{ backgroundColor: `${tenant.color}10`, borderColor: tenant.color, borderWidth: 1 }}
      >
        <h4 className="font-medium mb-2" style={{ color: tenant.color }}>
          Recommendation
        </h4>
        <p className="text-sm text-gray-700">
          {isHintExperiment ? (
            <>
              The <strong>progressive hints</strong> condition significantly improved problem
              completion (+26%) while keeping assessment scores within the acceptable guardrail
              (-2%, threshold was -5%). Students using hints spent slightly more time per problem
              but completed more work overall. <strong>Recommend rollout to all students.</strong>
            </>
          ) : (
            <>
              <strong>Immediate feedback</strong> dramatically increased retry behavior (+180%)
              and completion rates (+25%). The small decrease in assessment scores (-1.9%)
              suggests students may be learning through trial-and-error rather than reflection.
              <strong> Consider A/B testing with delayed hints after wrong answers.</strong>
            </>
          )}
        </p>
      </div>

      <button
        onClick={onContinue}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90"
        style={{ backgroundColor: tenant.color }}
      >
        See District Isolation Demo
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
