'use client';

import { Beaker, GraduationCap, Shield, ArrowRight, School } from 'lucide-react';

interface WelcomeStepProps {
  onContinue: () => void;
  tenantColor: string;
}

export function WelcomeStep({ onContinue, tenantColor }: WelcomeStepProps) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
        style={{ backgroundColor: `${tenantColor}20` }}
      >
        <Beaker className="w-8 h-8" style={{ color: tenantColor }} />
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        A/B Testing for Learning
      </h1>

      <p className="text-lg text-gray-600 mb-8">
        See how Kiddom uses UpGrade to run rigorous experiments that improve
        student outcomes. This demo walks through a real experiment testing
        whether progressive hints help students complete more problems
        without hurting learning.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <FeatureCard
          icon={<GraduationCap className="w-5 h-5" />}
          title="Learning Outcomes"
          description="Measure what matters: mastery, not just clicks"
          color={tenantColor}
        />
        <FeatureCard
          icon={<Shield className="w-5 h-5" />}
          title="Guardrails"
          description="Experiments automatically halt if learning is harmed"
          color={tenantColor}
        />
        <FeatureCard
          icon={<School className="w-5 h-5" />}
          title="District Isolation"
          description="Each district's experiments are completely separate"
          color={tenantColor}
        />
      </div>

      <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
        <h3 className="font-semibold text-gray-900 mb-3">
          Why EdTech Needs Specialized A/B Testing
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span><strong>Classroom-aware:</strong> Can't split a class - students talk, teachers get confused</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span><strong>Learning metrics:</strong> Success isn't "clicks" - it's assessment scores weeks later</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span><strong>Research-grade:</strong> Statistical rigor for publication and grant compliance</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span><strong>Ethical safeguards:</strong> Built-in guardrails to protect student learning</span>
          </li>
        </ul>
      </div>

      <button
        onClick={onContinue}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90"
        style={{ backgroundColor: tenantColor }}
      >
        Start Demo
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
