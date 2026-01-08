'use client';

import { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import type { ApiLogEntry } from '@/lib/types';

interface ApiLogPanelProps {
  logs: ApiLogEntry[];
  expanded?: boolean;
}

export function ApiLogPanel({ logs, expanded = false }: ApiLogPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className={clsx(
      'bg-gray-900 text-gray-100 rounded-lg overflow-hidden',
      expanded ? 'h-full' : 'h-48'
    )}>
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          API Log
        </span>
        <span className="text-xs text-gray-500">
          {logs.length} requests
        </span>
      </div>

      <div
        ref={scrollRef}
        className="overflow-y-auto code-block p-3 space-y-2"
        style={{ height: expanded ? 'calc(100% - 36px)' : '156px' }}
      >
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            No API calls yet. Start the demo to see requests.
          </div>
        ) : (
          logs.map((log) => (
            <LogEntry key={log.id} log={log} />
          ))
        )}
      </div>
    </div>
  );
}

function LogEntry({ log }: { log: ApiLogEntry }) {
  const statusColor = log.status >= 200 && log.status < 300
    ? 'text-green-400'
    : log.status >= 400
    ? 'text-red-400'
    : 'text-yellow-400';

  return (
    <div className="animate-slide-in">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-500">
          {log.timestamp.toLocaleTimeString()}
        </span>
        <span className={clsx(
          'px-1.5 py-0.5 rounded text-xs font-medium',
          log.method === 'POST' ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-300'
        )}>
          {log.method}
        </span>
        <span className="text-gray-300 flex-1 truncate">
          {log.endpoint}
        </span>
        <span className={statusColor}>
          {log.status}
        </span>
        <span className="text-gray-500">
          {log.duration}ms
        </span>
      </div>

      {log.response && (
        <div className="mt-1 pl-4 text-xs text-gray-500 truncate">
          → {JSON.stringify(log.response).slice(0, 80)}...
        </div>
      )}
    </div>
  );
}
