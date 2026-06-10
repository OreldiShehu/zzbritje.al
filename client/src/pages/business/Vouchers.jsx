import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Ticket, Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function BusinessVouchers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['business', 'vouchers', status, search, page],
    queryFn: () => api.get(`/vouchers/business?status=${status}&search=${search}&page=${page}&limit=20`).then((r) => r.data),
  });

  const redeemMutation = useMutation({
    mutationFn: (code) => api.post('/vouchers/redeem', { code }),
    onSuccess: () => { qc.invalidateQueries(['business', 'vouchers']); toast.success('Voucher-i u shënua si i përdorur!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Kodi i pavlefshëm'),
  });

  const vouchers = data?.data || [];

  const STATUS_MAP = {
    active: { icon: Clock, cls: 'text-amber-600 bg-amber-50', label: 'Aktiv' },
    redeemed: { icon: CheckCircle, cls: 'text-green-600 bg-green-50', label: 'Përdorur' },
    expired: { icon: AlertCircle, cls: 'text-gray-500 bg-gray-100', label: 'Skaduar' },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voucherët</h1>
          <p className="text-gray-500 text-sm">Menaxhoni shitjet dhe rilëshimet e voucher-ve</p>
        </div>
        <a href="/business/scanner" className="btn-primary flex items-center gap-2">
          <span className="text-lg">📷</span>Skano QR
        </a>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Kërko me kod voucher..." className="input-field pl-9" />
          </div>
          <div className="flex gap-2">
            {[{ v: '', l: 'Të gjitha' }, { v: 'active', l: 'Aktiv' }, { v: 'redeemed', l: 'Përdorur' }, { v: 'expired', l: 'Skaduar' }].map(({ v, l }) => (
              <button key={v} onClick={() => { setStatus(v); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${status === v ? 'bg-brand-600 text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[{ label: 'Total Voucher', value: data?.stats?.total || 0 }, { label: 'Aktiv', value: data?.stats?.active || 0 }, { label: 'Të Ardhura', value: formatCurrency(data?.stats?.revenue || 0) }].map(({ label, value }) => (
          <div key={label} className="card p-4 text-center">
            <p className="text-xl font-black text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 card skeleton" />)}</div>
      ) : vouchers.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-th">Kodi</th>
                <th className="table-th">Deal</th>
                <th className="table-th">Klient</th>
                <th className="table-th">Çmimi</th>
                <th className="table-th">Data Blerjes</th>
                <th className="table-th">Statusi</th>
                <th className="table-th">Veprime</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => {
                const s = STATUS_MAP[v.status] || STATUS_MAP.expired;
                const StatusIcon = s.icon;
                return (
                  <tr key={v._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="table-td font-mono text-xs font-bold text-brand-600">{v.code}</td>
                    <td className="table-td text-sm text-gray-700 max-w-[150px] truncate">{v.deal?.title}</td>
                    <td className="table-td text-sm text-gray-600">{v.user?.firstName} {v.user?.lastName}</td>
                    <td className="table-td font-semibold text-gray-900">{formatCurrency(v.paidPrice)}</td>
                    <td className="table-td text-sm text-gray-400">{formatDate(v.purchasedAt)}</td>
                    <td className="table-td">
                      <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${s.cls}`}>
                        <StatusIcon size={13} />{s.label}
                      </div>
                    </td>
                    <td className="table-td">
                      {v.status === 'active' && (
                        <button onClick={() => redeemMutation.mutate(v.code)}
                          className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-lg hover:bg-brand-700 transition-colors font-medium">
                          Shëno Përdorur
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data?.pagination?.pages > 1 && (
            <div className="flex justify-center gap-2 py-4 border-t border-gray-100">
              <button onClick={() => setPage((p) => p - 1)} disabled={!data.pagination.hasPrev} className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40">← Para</button>
              <span className="px-3 py-2 text-sm text-gray-600">{page} / {data.pagination.pages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={!data.pagination.hasNext} className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40">Pas →</button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 card">
          <Ticket size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700">Nuk ka voucher akoma</h3>
        </div>
      )}
    </div>
  );
}
