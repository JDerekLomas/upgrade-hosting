'use client';

import { useState, useEffect } from 'react';
import { Code, Check, Loader2, ArrowRight, User } from 'lucide-react';
import type { TenantContext } from '@/lib/types';
import { generateStudentContext, StudentContext } from '@/lib/types';

interface InitSdkStepProps {
  tenant: TenantContext;
  userId: string;
  onInit: () => Promise<void>;
  onContinue: () => void;
  isInitialized: boolean;
}

export function InitSdkStep({
  tenant,
  userId,
  onInit,
  onContinue,
  isInitialized,
}: InitSdkStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [student] = useState<StudentContext>(() => generateStudentContext());

  const handleInit = async () => {
    setIsLoading(true);
    setStatus('connecting');

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));
    await onInit();

    setStatus('connected');
    setIsLoading(false);
  };

  useEffect(() => {
    if (isInitialized) {
      setStatus('connected');
    }
  }, [isInitialized]);

  const codeExample = `import UpgradeClient from 'upgrade_client_lib/dist/browser';

const client = new UpgradeClient(
  '${student.userId}',
  'https://api.kiddom.com/upgrade/v1',
  'kiddom-math'
);

// Add district API key
client.setCustomHeaders({
  'X-API-Key': '${tenant.apiKey.slice(0, 20)}...'
});

// Initialize with student context
// UpGrade randomizes at class level to avoid contamination
await client.init({
  schoolId: '${student.school.toLowerCase().replace(/\s+/g, '-')}',
  classId: '${student.class.toLowerCase().replace(/\s+/g, '-')}',
  teacherId: '${student.teacher.toLowerCase().replace(/[\s.]+/g, '-')}',
  grade: ${student.grade}
});`;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${tenant.color}20` }}
        >
          <Code className="w-6 h-6" style={{ color: tenant.color }} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Initialize the SDK
        </h2>
        <p className="text-gray-600">
          Connect to UpGrade with student context. The SDK uses class-level
          randomization to avoid within-classroom contamination.
        </p>
      </div>

      <div className="bg-gray-900 rounded-xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
          <span className="text-xs text-gray-400">TypeScript</span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="w-3 h-3 rounded-full bg-green-500" />
          </div>
        </div>
        <pre className="p-4 text-sm text-gray-100 overflow-x-auto code-block">
          {codeExample}
        </pre>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-medium text-gray-900 mb-4">Student Context</h3>

        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              status === 'connected'
                ? 'bg-green-100'
                : status === 'connecting'
                ? 'bg-blue-100'
                : 'bg-gray-100'
            }`}
          >
            {status === 'connected' ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : status === 'connecting' ? (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            ) : (
              <User className="w-5 h-5 text-gray-400" />
            )}
          </div>

          <div className="flex-1">
            <div className="font-medium text-gray-900">
              {status === 'connected'
                ? 'Connected to UpGrade'
                : status === 'connecting'
                ? 'Connecting...'
                : 'Ready to connect'}
            </div>
            {status === 'connected' ? (
              <div className="text-sm text-gray-500">
                Student enrolled in experiment
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Click Initialize to enroll student
              </div>
            )}
          </div>

          {status !== 'connected' && (
            <button
              onClick={handleInit}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg text-white font-medium transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: tenant.color }}
            >
              {isLoading ? 'Initializing...' : 'Initialize'}
            </button>
          )}
        </div>

        {/* Student details */}
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Student:</span>{' '}
            <code className="bg-gray-100 px-1 rounded">{student.userId}</code>
          </div>
          <div>
            <span className="text-gray-500">Grade:</span>{' '}
            <span className="font-medium">{student.grade}</span>
          </div>
          <div>
            <span className="text-gray-500">School:</span>{' '}
            <span className="font-medium">{student.school}</span>
          </div>
          <div>
            <span className="text-gray-500">Class:</span>{' '}
            <span className="font-medium">{student.class}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">Teacher:</span>{' '}
            <span className="font-medium">{student.teacher}</span>
          </div>
        </div>
      </div>

      {status === 'connected' && (
        <button
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90 animate-slide-in"
          style={{ backgroundColor: tenant.color }}
        >
          Get Experiment Assignment
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
