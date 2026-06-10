import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, Search, Filter, AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import api from '../../api/axios';
import { formatDate } from '../../utils/formatters';

const SEVERITY_MAP = {
  low: { label: 'Low', cls: 'bg-gray-700 text-gray-400' },
  medium: { label: 'Medium', cls: 'bg-blue-900/50 text-blue-400' },
  high: { label: 'High', cls: 'bg-amber-900/50 text-amber-400' },
  critical: { label: 'Critical', cls: 'bg-red-900/50 text-red-400' },
};

export default function AdminAuditLogs() {
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'audit-logs', search, severity, page],
    queryFn: () => api.get(`/admin/audit-logs?search=${search}&severity=${severity}&page=${page}&limit=30`).then((r) => r.data),
  });

  const logs = data?.data || [];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-900/30 rounded-xl flex items-center justify-center">
          <Shield size={20} className="text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Audit Logs</h1>
          <p className="text-gray-500 text-sm">Regjistri i sigurisë dhe veprimeve kritike</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-2xl p-4 mb-5 border border-gray-700 flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Kërko veprim, aktor, IP..."
            className="w-full bg-gray-700 border border-gray-600 rounded-xl pl-9 pr-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500" />
        </div>
        <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-500">
          <option value="">Çdo nivel</option>
          {Object.entries(SEVERITY_MAP).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-14 bg-gray-800 skeleton rounded-xl" />)}</div>
      ) : (
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                {['Koha', 'Aktori', 'Veprimi', 'Burimi', 'IP', 'Niveli'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const sv = SEVERITY_MAP[log.severity] || SEVERITY_MAP.low;
                return (
                  <tr key={log._id} className={`border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors ${log.severity === 'critical' ? 'bg-red-900/10' : ''}`}>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-gray-200">{log.actor?.firstName} {log.actor?.lastName}</p>
                        <p className="text-xs text-gray-600 capitalize">{log.actor?.role}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-brand-400">{log.action}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{log.resource?.type} {log.endpoint && <span className="text-gray-600">· {log.endpoint}</span>}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{log.ipAddress}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${sv.cls}`}>{sv.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data?.pagination?.pages > 1 && (
            <div className="flex justify-center gap-2 py-4 border-t border-gray-700">
              <button onClick={() => setPage((p) => p - 1)} disabled={!data.pagination.hasPrev} className="px-4 py-2 rounded-xl border border-gray-600 text-sm text-gray-300 disabled:opacity-40">← Para</button>
              <span className="px-3 py-2 text-sm text-gray-500">{page} / {data.pagination.pages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={!data.pagination.hasNext} className="px-4 py-2 rounded-xl border border-gray-600 text-sm text-gray-300 disabled:opacity-40">Pas →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
