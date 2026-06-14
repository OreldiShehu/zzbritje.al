import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Tag, CheckCircle, XCircle, Star, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function AdminDeals() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('pending_review');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'deals', search, status, page],
    queryFn: () => api.get(`/admin/deals?search=${search}&status=${status}&page=${page}&limit=20`).then((r) => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/deals/${id}/approve`),
    onSuccess: () => { qc.invalidateQueries(['admin', 'deals']); toast.success(t('admin_ui.status_changed')); },
    onError: () => toast.error(t('common.error')),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => api.patch(`/admin/deals/${id}/reject`, { reason }),
    onSuccess: () => { qc.invalidateQueries(['admin', 'deals']); toast.success(t('admin_ui.business_rejected')); },
    onError: () => toast.error(t('common.error')),
  });

  const featuredMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/deals/${id}/featured`),
    onSuccess: () => { qc.invalidateQueries(['admin', 'deals']); toast.success(t('admin_ui.status_changed')); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/deals/${id}`),
    onSuccess: () => { qc.invalidateQueries(['admin', 'deals']); toast.success('Deal-i u fshi!'); },
    onError: () => toast.error(t('common.error')),
  });

  const deals = data?.data || [];

  const STATUS_BADGE = {
    active: 'bg-green-900/50 text-green-400',
    pending_review: 'bg-amber-900/50 text-amber-400',
    rejected: 'bg-red-900/50 text-red-400',
    expired: 'bg-gray-700 text-gray-400',
    sold_out: 'bg-purple-900/50 text-purple-400',
  };

  const STATUS_FILTERS = [
    { v: '', l: t('admin_ui.all_statuses') },
    { v: 'pending_review', l: t('admin_ui.status_review') },
    { v: 'active', l: t('admin_ui.status_verified') },
    { v: 'rejected', l: t('admin_ui.status_rejected') },
    { v: 'expired', l: t('deal.status_expired') },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">{t('admin.deals')}</h1>
          <p className="text-gray-500 text-sm">{t('admin_ui.deals_total', { count: data?.pagination?.total || 0 })}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-2xl p-4 mb-5 border border-gray-700 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('common.search')}
            className="w-full bg-gray-700 border border-gray-600 rounded-xl pl-9 pr-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(({ v, l }) => (
            <button key={v} onClick={() => { setStatus(v); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${status === v ? 'bg-brand-600 text-white' : 'border border-gray-600 text-gray-300 hover:bg-gray-700'}`}>{l}</button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 bg-gray-800 skeleton rounded-2xl" />)}</div>
      ) : deals.length > 0 ? (
        <div className="space-y-3">
          {deals.map((deal) => (
            <div key={deal._id} className="bg-gray-800 rounded-2xl p-4 border border-gray-700 hover:border-gray-600 transition-all">
              <div className="flex items-center gap-4">
                <img src={deal.images?.[0]?.url || 'https://via.placeholder.com/60'} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-gray-100 truncate">{deal.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[deal.status] || 'bg-gray-700 text-gray-400'}`}>{deal.status}</span>
                    {deal.isFeatured && <span className="text-xs bg-amber-900/50 text-amber-400 px-2 py-0.5 rounded-full">⭐ Featured</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                    <span>{deal.business?.businessName}</span>
                    <span>{formatCurrency(deal.discountedPrice)} (-{deal.discountPercentage}%)</span>
                    <span className="hidden sm:inline">{formatDate(deal.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                  <button onClick={() => featuredMutation.mutate(deal._id)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${deal.isFeatured ? 'bg-amber-900/40 text-amber-400' : 'bg-gray-700 text-gray-500 hover:text-amber-400'}`} title="Toggle Featured">
                    <Star size={15} />
                  </button>
                  {deal.status === 'pending_review' && (
                    <>
                      <button onClick={() => approveMutation.mutate(deal._id)}
                        className="flex items-center gap-1.5 text-xs bg-green-900/40 text-green-400 hover:bg-green-900/60 px-3 py-2 rounded-xl transition-all">
                        <CheckCircle size={14} />{t('common.approve')}
                      </button>
                      <button onClick={() => { const r = window.prompt(t('admin_ui.rejection_reason')); if (r) rejectMutation.mutate({ id: deal._id, reason: r }); }}
                        className="flex items-center gap-1.5 text-xs bg-red-900/30 text-red-400 hover:bg-red-900/50 px-3 py-2 rounded-xl transition-all">
                        <XCircle size={14} />{t('common.reject')}
                      </button>
                    </>
                  )}
                  <button onClick={() => { if (window.confirm(`Fshi deal-in "${deal.title}"? Kjo veprim nuk mund të anulohet.`)) deleteMutation.mutate(deal._id); }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-700 text-gray-500 hover:bg-red-900/40 hover:text-red-400 transition-colors" title="Fshi Deal-in">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {data?.pagination?.pages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button onClick={() => setPage((p) => p - 1)} disabled={!data.pagination.hasPrev} className="px-4 py-2 rounded-xl border border-gray-600 text-sm text-gray-300 disabled:opacity-40">{t('search.prev')}</button>
              <span className="px-3 py-2 text-sm text-gray-500">{page} / {data.pagination.pages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={!data.pagination.hasNext} className="px-4 py-2 rounded-xl border border-gray-600 text-sm text-gray-300 disabled:opacity-40">{t('search.next')}</button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-800 rounded-2xl border border-gray-700">
          <Tag size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">{t('admin_ui.no_deals')}</p>
        </div>
      )}
    </div>
  );
}
