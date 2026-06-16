import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, DollarSign, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../api/axios';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const STATUS_MAP = {
  completed: { label: 'Kompletuar', cls: 'bg-green-900/50 text-green-400' },
  pending: { label: 'Pending', cls: 'bg-amber-900/50 text-amber-400' },
  processing: { label: 'Duke procesuar', cls: 'bg-blue-900/50 text-blue-400' },
  failed: { label: 'Dështuar', cls: 'bg-red-900/50 text-red-400' },
  refunded: { label: 'Rimbursuar', cls: 'bg-purple-900/50 text-purple-400' },
  partially_refunded: { label: 'Rimbursim Pjesor', cls: 'bg-orange-900/50 text-orange-400' },
  disputed: { label: 'Kontestuar', cls: 'bg-red-900/50 text-red-400' },
};

export default function AdminPayments() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'transactions', search, status, page],
    queryFn: () => api.get(`/payments/admin?search=${encodeURIComponent(search)}&status=${status}&page=${page}&limit=25`).then((r) => r.data),
  });

  const refundMutation = useMutation({
    mutationFn: ({ id, reason }) => api.post(`/payments/${id}/refund`, { reason }),
    onSuccess: () => { qc.invalidateQueries(['admin', 'transactions']); toast.success('Rimbursimi u krye!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Ndodhi një gabim.'),
  });

  const transactions = data?.data || [];
  const summary = data?.summary || {};

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Pagesat & Transaksionet</h1>
          <p className="text-gray-500 text-sm">Menaxhimi i të gjitha pagesave të platformës</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Të Ardhura Totale', value: formatCurrency(summary.total || 0), icon: DollarSign, color: 'text-green-400', bg: 'bg-green-900/20' },
          { label: 'Markup Platformës (9%)', value: formatCurrency(summary.commission || 0), icon: DollarSign, color: 'text-brand-400', bg: 'bg-brand-900/20' },
          { label: 'Rimbursimet', value: formatCurrency(summary.refunds || 0), icon: RefreshCw, color: 'text-red-400', bg: 'bg-red-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} border border-gray-700 rounded-2xl p-4 flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-gray-600 ${bg}`}><Icon size={18} className={color} /></div>
            <div><p className="font-black text-gray-100">{value}</p><p className="text-xs text-gray-500">{label}</p></div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-2xl p-4 mb-5 border border-gray-700 flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Kërko me invoice # ose email..."
            className="w-full bg-gray-700 border border-gray-600 rounded-xl pl-9 pr-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-500">
          <option value="">Të gjitha</option>
          {Object.entries(STATUS_MAP).map(([v, { label }]) => (
            <option key={v} value={v}>{label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-14 bg-gray-800 skeleton rounded-xl" />)}</div>
      ) : (
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-700">
                  {['Invoice', 'Klienti', 'Deal', 'Shuma', 'Markup (9%)', 'Metoda', 'Data', 'Statusi', 'Veprime'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const s = STATUS_MAP[tx.paymentStatus] || STATUS_MAP.pending;
                  return (
                    <tr key={tx._id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-brand-400">{tx.invoiceNumber || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{tx.user?.firstName} {tx.user?.lastName}</td>
                      <td className="px-4 py-3 text-sm text-gray-400 max-w-[120px] truncate">{tx.deal?.title}</td>
                      <td className="px-4 py-3 font-bold text-gray-100">{formatCurrency(tx.total || 0)}</td>
                      <td className="px-4 py-3 text-sm text-green-400">{formatCurrency(tx.platformMarkup || 0)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 capitalize">{tx.paymentMethod || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDate(tx.createdAt)}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${s.cls}`}>{s.label}</span></td>
                      <td className="px-4 py-3">
                        {tx.paymentStatus === 'completed' && (
                          <button onClick={() => { const r = prompt('Arsyeja e rimbursimit:'); if (r) refundMutation.mutate({ id: tx._id, reason: r }); }}
                            className="text-xs bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 px-2 py-1.5 rounded-lg flex items-center gap-1">
                            <RefreshCw size={12} />Rimburso
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
