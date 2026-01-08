'use client';

import { ChevronDown, School } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import type { TenantContext } from '@/lib/types';

interface TenantSwitcherProps {
  currentTenant: TenantContext;
  tenants: TenantContext[];
  onSwitch: (tenant: TenantContext) => void;
  splitView: boolean;
  onToggleSplitView: () => void;
}

export function TenantSwitcher({
  currentTenant,
  tenants,
  onSwitch,
  splitView,
  onToggleSplitView,
}: TenantSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: currentTenant.color }}
          />
          <School className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-900">{currentTenant.name}</span>
          <ChevronDown className={clsx(
            'w-4 h-4 text-gray-400 transition-transform',
            isOpen && 'rotate-180'
          )} />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
              {tenants.map((tenant) => (
                <button
                  key={tenant.id}
                  onClick={() => {
                    onSwitch(tenant);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    'w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50',
                    tenant.id === currentTenant.id && 'bg-gray-50'
                  )}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tenant.color }}
                  />
                  <span className="text-sm text-gray-900">{tenant.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <button
        onClick={onToggleSplitView}
        className={clsx(
          'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          splitView
            ? 'bg-purple-100 text-purple-700'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        )}
      >
        {splitView ? 'Single View' : 'Split View'}
      </button>
    </div>
  );
}
