import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Building, CheckCircle, XCircle, Eye, ExternalLink, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  pending: 'bg-amber-900/50 text-amber-400',
  under_review: 'bg-blue-900/50 text-blue-400',
  verified: 'bg-green-900/50 text-green-400',
  rejected: 'bg-red-900/50 text-red-400',
};

function ReviewModal({ business, onClose, onVerify, onReject, onPlanChange }) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [mode, setMode] = useState(null);
  const isPro = business.plan === 'pro';

  const fields = [
    [t('admin_ui.category'), business.category?.name],
    [t('admin_ui.city'), business.city],
    [t('admin_ui.email'), business.owner?.email],
    [t('admin_ui.phone'), business.phone],
    ['Website', business.website],
    [t('admin_ui.plan'), business.subscriptionPlan],
  ];

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-800 rounded-3xl p-6 max-w-lg w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-100">{business.businessName}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl">✕</button>
        </div>

        {business.logo && <img src={business.logo} alt="" className="w-20 h-20 rounded-xl object-cover mb-4 border border-gray-700" />}

        <div className="space-y-2 text-sm mb-5">
          {fields.map(([k, v]) => v && (
            <div key={k} className="flex gap-3"><span className="text-gray-500 w-24 flex-shrink-0">{k}</span><span className="text-gray-200">{v}</span></div>
          ))}
          {business.description && (
            <div className="flex gap-3">
              <span className="text-gray-500 w-24 flex-shrink-0">{t('admin_ui.description')}</span>
              <span className="text-gray-300 text-xs">{business.description}</span>
            </div>
          )}
        </div>

        {business.documents?.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{t('admin_ui.documents')}</p>
            <div className="space-y-2">
              {business.documents.map((d) => (
                <a key={d._id} href={d.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-brand-400 hover:text-brand-300 bg-gray-700 rounded-xl px-3 py-2">
                  <ExternalLink size={13} />{d.type} — {formatDate(d.uploadedAt)}
                </a>
              ))}
            </div>
          </div>
        )}

        {mode === 'reject' && (
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-1.5">{t('admin_ui.rejection_reason')}</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-200 resize-none focus:outline-none focus:border-red-500"
              placeholder={t('admin_ui.rejection_placeholder')} />
          </div>
        )}

        {/* Plan toggle */}
        <div className="mb-4 flex items-center justify-between p-3 bg-gray-700/50 rounded-xl">
          <div className="flex items-center gap-2">
            <Crown size={16} className={isPro ? 'text-amber-400' : 'text-gray-500'} />
            <span className="text-sm font-semibold text-gray-200">
              Plan: <span className={isPro ? 'text-amber-400' : 'text-gray-400'}>{isPro ? 'Pro' : 'Falas'}</span>
            </span>
          </div>
          <button
            onClick={() => onPlanChange(business._id, isPro ? 'free' : 'pro')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isPro ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}>
            {isPro ? 'Ktheje Falas' : '⬆ Aktivo Pro'}
          </button>
        </div>

        <div className="flex gap-3">
          <button onClick={() => onVerify(business._id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <CheckCircle size={16} />{t('admin_ui.verify_btn')}
          </button>
          {mode !== 'reject' ? (
            <button onClick={() => setMode('reject')} className="flex-1 bg-red-900/40 hover:bg-red-900/60 text-red-400 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <XCircle size={16} />{t('admin_ui.reject_btn')}
            </button>
          ) : (
            <button onClick={() => reason && onReject(business._id, reason)} disabled={!reason} className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl transition-colors">
              {t('admin_ui.confirm_reject')}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminBusinesses() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'businesses', search, status, page],
    queryFn: () => api.get(`/admin/businesses?search=${search}&status=${status}&page=${page}&limit=20`).then((r) => r.data),
  });

  const verifyMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/businesses/${id}/verify`),
    onSuccess: () => { qc.invalidateQueries(['admin', 'businesses']); toast.success(t('admin_ui.business_verified')); setSelected(null); },
    onError: () => toast.error(t('common.error')),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => api.patch(`/admin/businesses/${id}/reject`, { reason }),
    onSuccess: () => { qc.invalidateQueries(['admin', 'businesses']); toast.success(t('admin_ui.business_rejected')); setSelected(null); },
    onError: () => toast.error(t('common.error')),
  });

  const planMutation = useMutation({
    mutationFn: ({ id, plan }) => api.patch(`/admin/businesses/${id}/plan`, { plan }),
    onSuccess: (res) => {
      qc.invalidateQueries(['admin', 'businesses']);
      toast.success(`Plani u ndryshua në ${res.data.plan === 'pro' ? 'Pro ⭐' : 'Falas'}`);
      setSelected((prev) => prev ? { ...prev, plan: res.data.plan } : null);
    },
    onError: () => toast.error(t('common.error')),
  });

  const businesses = data?.data || [];

  const STATUS_LABEL = {
    pending: t('admin_ui.status_pending'),
    under_review: t('admin_ui.status_under_review'),
    verified: t('admin_ui.status_verified'),
    rejected: t('admin_ui.status_rejected'),
  };

  const STATUS_FILTERS = [
    { v: '', l: t('admin_ui.all_statuses') },
    { v: 'pending', l: t('admin_ui.status_pending') },
    { v: 'under_review', l: t('admin_ui.status_review') },
    { v: 'verified', l: t('admin_ui.status_verified') },
    { v: 'rejected', l: t('admin_ui.status_rejected') },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">{t('admin_ui.manage_businesses')}</h1>
          <p className="text-gray-500 text-sm">{t('admin_ui.businesses_total', { count: data?.pagination?.total || 0 })}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-2xl p-4 mb-5 border border-gray-700 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('admin_ui.search_business')}
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
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 bg-gray-800 skeleton rounded-2xl" />)}</div>
      ) : businesses.length > 0 ? (
        <div className="space-y-3">
          {businesses.map((b) => (
            <div key={b._id} className="bg-gray-800 rounded-2xl p-4 border border-gray-700 flex items-center gap-4 hover:border-gray-600 transition-all">
              {b.logo ? <img src={b.logo} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" /> : (
                <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0"><Building size={20} className="text-gray-500" /></div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-gray-100 truncate">{b.businessName}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_BADGE[b.verificationStatus] || 'bg-gray-700 text-gray-400'}`}>{STATUS_LABEL[b.verificationStatus] || b.verificationStatus}</span>
                </div>
                <p className="text-xs text-gray-500">{b.city} · {b.owner?.email} · {formatDate(b.createdAt)}</p>
              </div>
              <button onClick={() => setSelected(b)} className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 bg-brand-900/20 hover:bg-brand-900/40 px-3 py-2 rounded-xl transition-all flex-shrink-0">
                <Eye size={14} />{t('admin_ui.review_btn')}
              </button>
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
          <Building size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">{t('admin_ui.no_businesses')}</p>
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <ReviewModal business={selected} onClose={() => setSelected(null)}
            onVerify={(id) => verifyMutation.mutate(id)}
            onReject={(id, reason) => rejectMutation.mutate({ id, reason })}
            onPlanChange={(id, plan) => planMutation.mutate({ id, plan })} />
        )}
      </AnimatePresence>
    </div>
  );
}
