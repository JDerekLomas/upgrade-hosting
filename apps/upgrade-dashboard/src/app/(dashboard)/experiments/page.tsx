import { auth } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import { Plus, FlaskConical, Play, Pause, StopCircle } from 'lucide-react';

export default async function ExperimentsPage() {
  const session = await auth();

  // For now, show empty state since we don't have the UpGrade connection yet
  const experiments: Experiment[] = [];

  return (
    <div>
      {/* Page Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Experiments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage A/B tests for your application
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/experiments/new"
            className="inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Plus className="h-4 w-4" />
            New Experiment
          </Link>
        </div>
      </div>

      {/* Experiments List */}
      <div className="mt-8">
        {experiments.length === 0 ? (
          <EmptyState />
        ) : (
          <ExperimentsList experiments={experiments} />
        )}
      </div>
    </div>
  );
}

interface Experiment {
  id: string;
  name: string;
  state: 'inactive' | 'enrolling' | 'enrollment_complete' | 'cancelled';
  createdAt: string;
  enrollmentCount: number;
}

function EmptyState() {
  return (
    <div className="text-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg">
      <FlaskConical className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">No experiments yet</h3>
      <p className="mt-2 text-sm text-gray-500">
        Get started by creating your first A/B test experiment.
      </p>
      <div className="mt-6">
        <Link
          href="/experiments/new"
          className="inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Create Experiment
        </Link>
      </div>
    </div>
  );
}

function ExperimentsList({ experiments }: { experiments: Experiment[] }) {
  return (
    <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              Name
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Status
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Enrolled
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Created
            </th>
            <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {experiments.map((experiment) => (
            <tr key={experiment.id}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                <Link
                  href={`/experiments/${experiment.id}`}
                  className="hover:text-blue-600"
                >
                  {experiment.name}
                </Link>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm">
                <StatusBadge state={experiment.state} />
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {experiment.enrollmentCount.toLocaleString()}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {new Date(experiment.createdAt).toLocaleDateString()}
              </td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <Link
                  href={`/experiments/${experiment.id}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ state }: { state: string }) {
  const config = {
    inactive: {
      label: 'Inactive',
      className: 'bg-gray-100 text-gray-700',
      icon: StopCircle,
    },
    enrolling: {
      label: 'Enrolling',
      className: 'bg-green-100 text-green-700',
      icon: Play,
    },
    enrollment_complete: {
      label: 'Complete',
      className: 'bg-blue-100 text-blue-700',
      icon: Pause,
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-red-100 text-red-700',
      icon: StopCircle,
    },
  }[state] || {
    label: state,
    className: 'bg-gray-100 text-gray-700',
    icon: StopCircle,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
