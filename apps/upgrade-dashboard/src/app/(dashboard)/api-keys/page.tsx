import { auth } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';
import { Key, Plus, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import { CreateApiKeyButton } from './create-key-button';

export default async function ApiKeysPage() {
  const session = await auth();

  if (!session?.user?.tenantId) {
    return <div>Not authorized</div>;
  }

  const sql = neon(process.env.PLATFORM_DATABASE_URL!);

  const apiKeys = await sql`
    SELECT
      id,
      key_prefix,
      name,
      scopes,
      rate_limit_per_minute,
      is_active,
      last_used_at,
      expires_at,
      created_at
    FROM api_keys
    WHERE tenant_id = ${session.user.tenantId}
    ORDER BY created_at DESC
  `;

  return (
    <div>
      {/* Page Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">API Keys</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage API keys for your SDK integrations
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <CreateApiKeyButton />
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 rounded-md bg-yellow-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Keep your API keys secure
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              API keys grant access to your experiments and data. Never share them
              publicly or commit them to version control.
            </p>
          </div>
        </div>
      </div>

      {/* API Keys List */}
      <div className="mt-8">
        {apiKeys.length === 0 ? (
          <EmptyState />
        ) : (
          <ApiKeysList apiKeys={apiKeys} />
        )}
      </div>

      {/* Usage Example */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Quick Start</h2>
        <div className="mt-4 rounded-lg bg-gray-900 p-4">
          <pre className="text-sm text-gray-100 overflow-x-auto">
            <code>{`import UpgradeClient from 'upgrade_client_lib/dist/browser';

const client = new UpgradeClient(
  userId,
  'https://api.upgrade.io/v1',
  'my-app'
);

// Add your API key
client.setCustomHeaders({
  'X-API-Key': 'upg_live_xxxx...'
});

await client.init(groupData);
const assignment = await client.getDecisionPointAssignment('feature');`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg">
      <Key className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">No API keys</h3>
      <p className="mt-2 text-sm text-gray-500">
        Create an API key to start integrating UpGrade into your application.
      </p>
      <div className="mt-6">
        <CreateApiKeyButton />
      </div>
    </div>
  );
}

interface ApiKeyData {
  id: string;
  key_prefix: string;
  name: string;
  scopes: string[];
  rate_limit_per_minute: number;
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

function ApiKeysList({ apiKeys }: { apiKeys: ApiKeyData[] }) {
  return (
    <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              Name
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Key
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Scopes
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Last Used
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Status
            </th>
            <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {apiKeys.map((key) => (
            <tr key={key.id}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                {key.name}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-mono">
                {key.key_prefix}...
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <div className="flex gap-1">
                  {key.scopes.slice(0, 2).map((scope) => (
                    <span
                      key={scope}
                      className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                    >
                      {scope}
                    </span>
                  ))}
                  {key.scopes.length > 2 && (
                    <span className="text-xs text-gray-400">
                      +{key.scopes.length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {key.last_used_at
                  ? new Date(key.last_used_at).toLocaleDateString()
                  : 'Never'}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm">
                {key.is_active ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                    Revoked
                  </span>
                )}
              </td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <button className="text-red-600 hover:text-red-900">
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
