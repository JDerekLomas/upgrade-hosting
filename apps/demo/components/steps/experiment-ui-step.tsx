'use client';

import { useState } from 'react';
import { Monitor, ArrowRight, Lightbulb, HelpCircle, CheckCircle, XCircle } from 'lucide-react';
import type { TenantContext, ExperimentAssignment } from '@/lib/types';

interface ExperimentUiStepProps {
  tenant: TenantContext;
  assignment: ExperimentAssignment | null;
  onContinue: () => void;
}

export function ExperimentUiStep({
  tenant,
  assignment,
  onContinue,
}: ExperimentUiStepProps) {
  const [showComparison, setShowComparison] = useState(false);

  const isHintExperiment = assignment?.target === 'hint-system';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${tenant.color}20` }}
        >
          <Monitor className="w-6 h-6" style={{ color: tenant.color }} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          The Experiment in Action
        </h2>
        <p className="text-gray-600">
          Here's what a student in the <strong>{assignment?.condition}</strong> condition sees
          during math practice.
        </p>
      </div>

      <div className="mb-6 flex justify-center">
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
        >
          {showComparison ? 'Hide Comparison' : 'Compare with Control'}
        </button>
      </div>

      <div className={`grid gap-6 ${showComparison ? 'grid-cols-2' : 'grid-cols-1 max-w-lg mx-auto'}`}>
        {/* Variant (Progressive Hints) */}
        <div className="animate-slide-in">
          <div className="text-center mb-2">
            <span
              className="inline-flex px-2 py-1 rounded text-xs font-medium"
              style={{ backgroundColor: `${tenant.color}15`, color: tenant.color }}
            >
              {assignment?.condition || 'progressive-hints'} (Assigned)
            </span>
          </div>
          {isHintExperiment ? (
            <MathProblemWithHints
              variant="progressive"
              highlight
              highlightColor={tenant.color}
            />
          ) : (
            <FeedbackDemo
              variant="immediate"
              highlight
              highlightColor={tenant.color}
            />
          )}
        </div>

        {/* Control */}
        {showComparison && (
          <div className="animate-slide-in">
            <div className="text-center mb-2">
              <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                control (no hints)
              </span>
            </div>
            {isHintExperiment ? (
              <MathProblemWithHints
                variant="control"
                highlight={false}
              />
            ) : (
              <FeedbackDemo
                variant="delayed"
                highlight={false}
              />
            )}
          </div>
        )}
      </div>

      {isHintExperiment && (
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="text-sm font-medium text-amber-900 mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Hypothesis Being Tested
          </h3>
          <p className="text-sm text-amber-800">
            {assignment?.hypothesis || 'Progressive hints improve problem completion without reducing learning'}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
            <div className="bg-white rounded-lg p-2">
              <div className="font-medium text-amber-900">Primary Metric</div>
              <div className="text-amber-700">Problem completion rate</div>
            </div>
            <div className="bg-white rounded-lg p-2">
              <div className="font-medium text-amber-900">Secondary Metric</div>
              <div className="text-amber-700">Unit assessment score</div>
            </div>
            <div className="bg-white rounded-lg p-2">
              <div className="font-medium text-amber-900">Guardrail</div>
              <div className="text-amber-700">No score decrease &gt;5%</div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onContinue}
        className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90"
        style={{ backgroundColor: tenant.color }}
      >
        Mark Learning Outcome
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function MathProblemWithHints({
  variant,
  highlight,
  highlightColor,
}: {
  variant: 'progressive' | 'control';
  highlight: boolean;
  highlightColor?: string;
}) {
  const [hintsShown, setHintsShown] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const hints = [
    { type: 'Conceptual', text: 'Think about what fraction of the whole each part represents.' },
    { type: 'Procedural', text: 'To add fractions, first find a common denominator.' },
    { type: 'Worked Example', text: '1/4 + 1/4 = 2/4 = 1/2. Now try with different denominators.' },
  ];

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setAnswered(true);
  };

  return (
    <div
      className={`bg-white rounded-xl border-2 p-5 transition-all ${
        highlight ? 'pulse-border' : 'border-gray-200'
      }`}
      style={highlight ? { borderColor: highlightColor } : undefined}
    >
      {/* Problem Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Grade 5 Math • Fractions
        </span>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
          Problem 3 of 10
        </span>
      </div>

      {/* Problem */}
      <div className="mb-6">
        <p className="text-gray-900 font-medium mb-4">
          Sarah ate 1/4 of a pizza. Her brother ate 1/3 of the same pizza.
          What fraction of the pizza did they eat together?
        </p>

        {/* Answer Choices */}
        <div className="grid grid-cols-2 gap-2">
          {['2/7', '7/12', '1/2', '5/12'].map((answer) => (
            <button
              key={answer}
              onClick={() => !answered && handleAnswer(answer)}
              disabled={answered}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                answered && answer === '7/12'
                  ? 'border-green-500 bg-green-50'
                  : answered && selectedAnswer === answer
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-mono text-lg">{answer}</span>
              {answered && answer === '7/12' && (
                <CheckCircle className="inline w-4 h-4 text-green-500 ml-2" />
              )}
              {answered && selectedAnswer === answer && answer !== '7/12' && (
                <XCircle className="inline w-4 h-4 text-red-500 ml-2" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Hint System - Only in variant */}
      {variant === 'progressive' && !answered && (
        <div className="border-t border-gray-100 pt-4">
          <button
            onClick={() => setHintsShown(Math.min(hintsShown + 1, 3))}
            disabled={hintsShown >= 3}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
          >
            <HelpCircle className="w-4 h-4" />
            {hintsShown === 0 ? 'Need a hint?' : hintsShown < 3 ? 'Show another hint' : 'All hints shown'}
          </button>

          {hintsShown > 0 && (
            <div className="mt-3 space-y-2">
              {hints.slice(0, hintsShown).map((hint, i) => (
                <div
                  key={i}
                  className="p-3 bg-amber-50 border border-amber-200 rounded-lg animate-slide-in"
                >
                  <div className="text-xs font-medium text-amber-700 mb-1">
                    Hint {i + 1}: {hint.type}
                  </div>
                  <div className="text-sm text-amber-900">{hint.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Control - No hints */}
      {variant === 'control' && !answered && (
        <div className="border-t border-gray-100 pt-4">
          <div className="text-sm text-gray-400 italic">
            No hints available in control condition
          </div>
        </div>
      )}

      {/* Answered State */}
      {answered && (
        <div className={`mt-4 p-3 rounded-lg ${
          selectedAnswer === '7/12' ? 'bg-green-50' : 'bg-amber-50'
        }`}>
          <div className={`text-sm font-medium ${
            selectedAnswer === '7/12' ? 'text-green-800' : 'text-amber-800'
          }`}>
            {selectedAnswer === '7/12'
              ? 'Correct! Great work!'
              : 'Not quite. The answer is 7/12. (1/4 = 3/12, 1/3 = 4/12, so 3/12 + 4/12 = 7/12)'}
          </div>
        </div>
      )}
    </div>
  );
}

function FeedbackDemo({
  variant,
  highlight,
  highlightColor,
}: {
  variant: 'immediate' | 'delayed';
  highlight: boolean;
  highlightColor?: string;
}) {
  const [answered, setAnswered] = useState(false);

  return (
    <div
      className={`bg-white rounded-xl border-2 p-5 transition-all ${
        highlight ? 'pulse-border' : 'border-gray-200'
      }`}
      style={highlight ? { borderColor: highlightColor } : undefined}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Assignment • Due Today
        </span>
      </div>

      <p className="text-gray-900 font-medium mb-4">
        What is 15% of 80?
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Your answer"
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
          disabled={answered}
          defaultValue={answered ? "12" : ""}
        />
        <button
          onClick={() => setAnswered(true)}
          disabled={answered}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          Submit
        </button>
      </div>

      {answered && variant === 'immediate' && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg animate-slide-in">
          <div className="flex items-center gap-2 text-green-800 font-medium">
            <CheckCircle className="w-4 h-4" />
            Correct!
          </div>
          <p className="text-sm text-green-700 mt-1">
            15% = 0.15, and 0.15 × 80 = 12
          </p>
        </div>
      )}

      {answered && variant === 'delayed' && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg animate-slide-in">
          <div className="text-gray-600 text-sm">
            Answer submitted. Feedback will be available after the assignment closes.
          </div>
        </div>
      )}
    </div>
  );
}
