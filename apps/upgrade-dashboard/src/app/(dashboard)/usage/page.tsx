import { auth } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';
import { Activity, TrendingUp, Users, Zap } from 'lucide-react';

export default async function UsagePage() {
  const session = await auth();

  if (!session?.user?.tenantId) {
    return <div>Not authorized</div>;
  }

  const sql = neon(process.env.PLATFORM_DATABASE_URL!);

  // Get current month's usage
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const usageData = await sql`
    SELECT
      COALESCE(SUM(api_calls), 0) as total_api_calls,
      COALESCE(SUM(assignment_calls), 0) as assignment_calls,
      COALESCE(SUM(log_calls), 0) as log_calls,
      COALESCE(SUM(unique_users), 0) as unique_users
    FROM usage_records
    WHERE tenant_id = ${session.user.tenantId}
      AND bucket_hour >= ${startOfMonth.toISOString()}
  `;

  const tenantData = await sql`
    SELECT plan, max_monthly_api_calls
    FROM tenants
    WHERE id = ${session.user.tenantId}
  `;

  const usage = usageData[0] || {
    total_api_calls: 0,
    assignment_calls: 0,
    log_calls: 0,
    unique_users: 0,
  };

  const tenant = tenantData[0] || {
    plan: 'free',
    max_monthly_api_calls: 10000,
  };

  const usagePercent = Math.min(
    100,
    (Number(usage.total_api_calls) / tenant.max_monthly_api_calls) * 100
  );

  return (
    <div>
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Usage</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor your API usage and plan limits
        </p>
      </div>

      {/* Plan Status */}
      <div className="mt-8 rounded-lg bg-white p-6 shadow ring-1 ring-black ring-opacity-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Current Plan: <span className="capitalize">{tenant.plan}</span>
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {Number(usage.total_api_calls).toLocaleString()} /{' '}
              {tenant.max_monthly_api_calls.toLocaleString()} API calls this month
            </p>
          </div>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
            Upgrade Plan
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full rounded-full ${
                usagePercent > 90
                  ? 'bg-red-500'
                  : usagePercent > 70
                  ? 'bg-yellow-500'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {usagePercent.toFixed(1)}% of monthly limit used
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total API Calls"
          value={Number(usage.total_api_calls).toLocaleString()}
          icon={Activity}
          description="This month"
        />
        <StatCard
          title="Assignment Calls"
          value={Number(usage.assignment_calls).toLocaleString()}
          icon={Zap}
          description="Experiment assignments"
        />
        <StatCard
          title="Log Calls"
          value={Number(usage.log_calls).toLocaleString()}
          icon={TrendingUp}
          description="Metrics logged"
        />
        <StatCard
          title="Unique Users"
          value={Number(usage.unique_users).toLocaleString()}
          icon={Users}
          description="Distinct users"
        />
      </div>

      {/* Plan Comparison */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Available Plans</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <PlanCard
            name="Free"
            price="$0"
            features={['10,000 API calls/month', '3 experiments', '100 users']}
            current={tenant.plan === 'free'}
          />
          <PlanCard
            name="Starter"
            price="$29"
            features={['100,000 API calls/month', '10 experiments', '1,000 users']}
            current={tenant.plan === 'starter'}
          />
          <PlanCard
            name="Growth"
            price="$99"
            features={[
              '1,000,000 API calls/month',
              '50 experiments',
              '10,000 users',
            ]}
            current={tenant.plan === 'growth'}
            highlighted
          />
          <PlanCard
            name="Enterprise"
            price="Custom"
            features={['Unlimited API calls', 'Unlimited experiments', 'SLA']}
            current={tenant.plan === 'enterprise'}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  description: string;
}) {
  return (
    <div className="rounded-lg bg-white p-6 shadow ring-1 ring-black ring-opacity-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-6 w-6 text-gray-400" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          <p className="mt-1 text-xs text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

function PlanCard({
  name,
  price,
  features,
  current,
  highlighted,
}: {
  name: string;
  price: string;
  features: string[];
  current?: boolean;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-6 ${
        highlighted
          ? 'bg-blue-600 text-white ring-2 ring-blue-600'
          : 'bg-white ring-1 ring-black ring-opacity-5'
      }`}
    >
      <h3 className={`text-lg font-medium ${highlighted ? 'text-white' : 'text-gray-900'}`}>
        {name}
      </h3>
      <p className={`mt-2 text-3xl font-bold ${highlighted ? 'text-white' : 'text-gray-900'}`}>
        {price}
        {price !== 'Custom' && <span className="text-sm font-normal">/month</span>}
      </p>
      <ul className="mt-4 space-y-2">
        {features.map((feature) => (
          <li
            key={feature}
            className={`text-sm ${highlighted ? 'text-blue-100' : 'text-gray-500'}`}
          >
            {feature}
          </li>
        ))}
      </ul>
      {current ? (
        <p className={`mt-4 text-sm font-medium ${highlighted ? 'text-blue-100' : 'text-gray-500'}`}>
          Current plan
        </p>
      ) : (
        <button
          className={`mt-4 w-full rounded-md px-3 py-2 text-sm font-semibold ${
            highlighted
              ? 'bg-white text-blue-600 hover:bg-blue-50'
              : 'bg-blue-600 text-white hover:bg-blue-500'
          }`}
        >
          {name === 'Enterprise' ? 'Contact Sales' : 'Upgrade'}
        </button>
      )}
    </div>
  );
}
