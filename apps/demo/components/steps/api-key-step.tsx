'use client';

import { useState } from 'react';
import { Key, Copy, Check, ArrowRight, Eye, EyeOff } from 'lucide-react';
import type { TenantContext } from '@/lib/types';

interface ApiKeyStepProps {
  tenant: TenantContext;
  onContinue: () => void;
}

export function ApiKeyStep({ tenant, onContinue }: ApiKeyStepProps) {
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(tenant.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maskedKey = tenant.apiKey.slice(0, 12) + '••••••••••••••••';

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${tenant.color}20` }}
        >
          <Key className="w-6 h-6" style={{ color: tenant.color }} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your API Key
        </h2>
        <p className="text-gray-600">
          This key authenticates your application with the UpGrade platform.
          Keep it secret - it identifies your tenant.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500">
            {tenant.name} - Live Key
          </span>
          <span
            className="px-2 py-1 rounded text-xs font-medium"
            style={{ backgroundColor: `${tenant.color}15`, color: tenant.color }}
          >
            LIVE
          </span>
        </div>

        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg font-mono text-sm">
          <span className="flex-1 truncate">
            {showKey ? tenant.apiKey : maskedKey}
          </span>
          <button
            onClick={() => setShowKey(!showKey)}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title={showKey ? 'Hide key' : 'Show key'}
          >
            {showKey ? (
              <EyeOff className="w-4 h-4 text-gray-500" />
            ) : (
              <Eye className="w-4 h-4 text-gray-500" />
            )}
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          In production, you would generate this key from the UpGrade Dashboard
          and store it securely as an environment variable.
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          Key Format
        </h3>
        <div className="code-block text-xs text-gray-600">
          <span className="text-purple-600">upg_</span>
          <span className="text-blue-600">{'{'}</span>
          <span className="text-gray-500">environment</span>
          <span className="text-blue-600">{'}'}</span>
          <span className="text-purple-600">_</span>
          <span className="text-blue-600">{'{'}</span>
          <span className="text-gray-500">random</span>
          <span className="text-blue-600">{'}'}</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Keys start with <code className="bg-gray-200 px-1 rounded">upg_live_</code> for
          production or <code className="bg-gray-200 px-1 rounded">upg_test_</code> for testing.
        </p>
      </div>

      <button
        onClick={onContinue}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90"
        style={{ backgroundColor: tenant.color }}
      >
        Continue to SDK Setup
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
