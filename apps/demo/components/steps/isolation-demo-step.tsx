'use client';

import { Shield, CheckCircle2, XCircle, Database, School, Users } from 'lucide-react';
import type { TenantContext, ExperimentAssignment, DEMO_EXPERIMENTS } from '@/lib/types';

interface IsolationDemoStepProps {
  tenants: TenantContext[];
  experiments: typeof DEMO_EXPERIMENTS;
}

export function IsolationDemoStep({ tenants, experiments }: IsolationDemoStepProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 bg-purple-100">
          <Shield className="w-6 h-6 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          District Data Isolation
        </h2>
        <p className="text-gray-600">
          Each school district using Kiddom has completely isolated experiment data.
          LAUSD cannot see Chicago's experiments, students, or results - and vice versa.
        </p>
      </div>

      {/* Architecture Diagram */}
      <div className="bg-gray-900 rounded-xl p-6 mb-8 text-center">
        <pre className="text-xs text-gray-300 font-mono leading-relaxed">
{`┌─────────────────────────────────────────────────────────────┐
│                 Kiddom Platform (Vercel)                     │
│            Validates API Keys, Routes by District            │
└───────────────────────────┬─────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   LAUSD Branch  │ │  Chicago Branch │ │   NYCDOE Branch │
│  (Neon Database)│ │  (Neon Database)│ │  (Neon Database)│
│                 │ │                 │ │                 │
│ • 600K students │ │ • 340K students │ │ • 1.1M students │
│ • Hint System   │ │ • Feedback Test │ │ • Gamification  │
│   Experiment    │ │   Experiment    │ │   Experiment    │
└─────────────────┘ └─────────────────┘ └─────────────────┘`}
        </pre>
      </div>

      {/* District Comparison */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {tenants.map((tenant) => {
          const tenantExperiments = experiments[tenant.id] || [];

          return (
            <div
              key={tenant.id}
              className="bg-white rounded-xl border-2 p-6"
              style={{ borderColor: tenant.color }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${tenant.color}20` }}
                >
                  <School className="w-5 h-5" style={{ color: tenant.color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{tenant.name}</h3>
                  <p className="text-xs text-gray-500">{tenant.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Active Experiments ({tenantExperiments.length})
                </h4>

                {tenantExperiments.map((exp) => (
                  <div
                    key={exp.experimentId}
                    className="p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="font-medium text-gray-900 text-sm">
                      {exp.experimentName}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {exp.site}/{exp.target}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 italic">
                      {exp.hypothesis.slice(0, 60)}...
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{tenant.id === 'lausd' ? '~3,700' : '~2,500'} in experiments</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Isolation Verification */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Isolation Verification
        </h3>

        <div className="space-y-3">
          <VerificationRow
            description="LAUSD lists experiments"
            result="sees only Hint System experiment"
            success
          />
          <VerificationRow
            description="Chicago lists experiments"
            result="sees only Feedback experiment"
            success
          />
          <VerificationRow
            description="LAUSD tries to query Chicago student data"
            result="403 Forbidden - tenant mismatch"
            success={false}
          />
          <VerificationRow
            description="Chicago student appears in LAUSD results"
            result="No cross-contamination"
            success
          />
          <VerificationRow
            description="Experiment from LAUSD affects Chicago randomization"
            result="Completely independent"
            success
          />
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">
            Why This Matters
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>FERPA compliance:</strong> Student data stays within district boundaries</li>
            <li>• <strong>Research integrity:</strong> Experiments don't contaminate each other</li>
            <li>• <strong>Custom experiments:</strong> Each district can test what matters to them</li>
            <li>• <strong>Scalability:</strong> Add new districts without affecting existing ones</li>
          </ul>
        </div>
      </div>

      {/* Completion */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">Demo Complete!</span>
        </div>
        <p className="text-gray-500 mt-4 text-sm">
          You've seen how Kiddom runs rigorous A/B tests on learning features
          while keeping each district's data completely isolated.
        </p>
        <p className="text-gray-400 mt-2 text-xs">
          Powered by UpGrade from Carnegie Learning
        </p>
      </div>
    </div>
  );
}

function VerificationRow({
  description,
  result,
  success,
}: {
  description: string;
  result: string;
  success: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      {success ? (
        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
      )}
      <div className="flex-1">
        <span className="text-sm text-gray-900">{description}</span>
      </div>
      <span className={`text-xs font-medium px-2 py-1 rounded ${
        success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}>
        {result}
      </span>
    </div>
  );
}
