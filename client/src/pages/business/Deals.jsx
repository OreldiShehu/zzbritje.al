import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, Tag, Lock, Zap } from 'lucide-react';
import api from '../../api/axios';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const WA_ADMIN = '447444842624';
const FREE_DEAL_LIMIT = 2;

const STATUS_BADGE = {
  active: 'badge-green',
  pending_review: 'bg-amber-100 text-amber-700',
  draft: 'bg-gray-100 text-gray-600',
  expired: 'badge-gray',
  rejected: 'bg-red-100 text-red-600',
  sold_out: 'bg-purple-100 text-purple-700',
};
const STATUS_LABEL = { active: 'Aktiv', pending_review: 'Në Shqyrtim', draft: 'Draft', expired: 'Skaduar', rejected: 'Refuzuar', sold_out: 'Shitur' };

export default function BusinessDeals() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const qc = useQueryClient();

  const { data: business } = useQuery({
    queryKey: ['my-business'],
    queryFn: () => api.get('/business/my').then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['business', 'deals', status, page],
    queryFn: () => api.get(`/deals/business/my?status=${status}&page=${page}&limit=12`).then((r) => r.data),
  });

  const { data: activeDealsData } = useQuery({
    queryKey: ['business', 'active-deals-count'],
    queryFn: () => api.get('/deals/business/my?status=active&limit=5').then((r) => r.data),
    enabled: !!business && business.plan === 'free',
    staleTime: 2 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/deals/${id}`),
    onSuccess: () => { qc.invalidateQueries(['business', 'deals']); toast.success('Deal-i u fshi!'); },
    onError: () => toast.error('Nuk mund ta fshij deal-in aktiv.'),
  });

  const deals = data?.data || [];
  const activeCount = activeDealsData?.pagination?.total || 0;
  const atFreeLimit = business?.plan === 'free' && activeCount >= FREE_DEAL_LIMIT;
  const waUpgradeUrl = `https://wa.me/${WA_ADMIN}?text=${encodeURIComponent(`Përshëndetje! Biznesi "${business?.name}" ka arritur limitin e planit Falas dhe dëshiron të kalojë në Pro.`)}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deal-et e Mi</h1>
          <p className="text-gray-500 text-sm">{data?.pagination?.total || 0} deal gjithsej</p>
        </div>
        {atFreeLimit ? (
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              {activeCount}/{FREE_DEAL_LIMIT} deals aktive
            </span>
            <button disabled className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed">
              <Lock size={15} /> Krijo Deal
            </button>
          </div>
        ) : (
          <Link to="/business-dashboard/deals/create" className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Krijo Deal
          </Link>
        )}
      </div>

      {atFreeLimit && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Zap size={20} className="text-amber-500 flex-shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-amber-800 text-sm">Keni arritur limitin e planit Falas</p>
            <p className="text-amber-700 text-xs mt-0.5">
              Plani Falas lejon maksimumi <strong>{FREE_DEAL_LIMIT} deals aktive</strong> dhe <strong>10 vouchers/deal</strong>.
              Kaloni në <strong>Pro</strong> për deals dhe vouchers të pakufizuara.
            </p>
          </div>
          <a href={waUpgradeUrl} target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap">
            ⬆ Kalon në Pro
          </a>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        {[{ v: '', l: 'Të gjitha' }, { v: 'active', l: 'Aktiv' }, { v: 'pending_review', l: 'Në Shqyrtim' }, { v: 'expired', l: 'Skaduar' }, { v: 'rejected', l: 'Refuzuar' }].map(({ v, l }) => (
          <button key={v} onClick={() => { setStatus(v); setPage(1); }}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${status === v ? 'bg-brand-600 text-white shadow-brand' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}>
            {l}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-52 card skeleton" />)}</div>
      ) : deals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {deals.map((deal, i) => (
            <motion.div key={deal._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="card overflow-hidden hover:shadow-card-hover transition-shadow">
              <div className="relative">
                <img src={deal.images?.[0]?.url || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400'} alt={deal.title}
                  className="w-full h-36 object-cover" />
                <span className={`absolute top-2 left-2 badge text-xs ${STATUS_BADGE[deal.status] || 'badge-gray'}`}>
                  {STATUS_LABEL[deal.status] || deal.status}
                </span>
                {deal.isFeatured && <span className="absolute top-2 right-2 badge bg-amber-400 text-amber-900 text-xs">⭐ Featured</span>}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">{deal.title}</h3>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-brand-600 font-bold">{formatCurrency(deal.discountedPrice)}</span>
                    <span className="text-gray-400 line-through text-xs ml-2">{formatCurrency(deal.originalPrice)}</span>
                  </div>
                  <span className="text-xs bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-full">{deal.dealType === 'fixed_discount' ? 'Fikse' : `-${deal.discountPercentage}%`}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                  <span><Eye size={12} className="inline mr-1" />{deal.views || 0} shikime</span>
                  <span><Tag size={12} className="inline mr-1" />{deal.vouchersSold || 0}/{deal.totalVouchers} voucher</span>
                </div>
                <div className="flex gap-2">
                  <Link to={`/business-dashboard/deals/edit/${deal._id}`} className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-1.5">
                    <Edit size={13} />Edito
                  </Link>
                  <button onClick={() => { if (confirm('Jeni të sigurt?')) deleteMutation.mutate(deal._id); }}
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 card">
          <Tag size={56} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">Nuk keni deal-e akoma</h3>
          <p className="text-gray-400 mb-6">Krijoni deal-in tuaj të parë dhe filloni të fitoni!</p>
          <Link to="/business-dashboard/deals/create" className="btn-primary">+ Krijo Deal-in e Parë</Link>
        </div>
      )}

      {data?.pagination?.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button onClick={() => setPage((p) => p - 1)} disabled={!data.pagination.hasPrev} className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40">← Para</button>
          <span className="px-3 py-2 text-sm text-gray-600">{page} / {data.pagination.pages}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={!data.pagination.hasNext} className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40">Pas →</button>
        </div>
      )}
    </div>
  );
}
