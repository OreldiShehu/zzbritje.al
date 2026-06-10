import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, ToggleLeft, ToggleRight, MoreVertical, Tag } from 'lucide-react';
import api from '../../api/axios';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

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

  const { data, isLoading } = useQuery({
    queryKey: ['business', 'deals', status, page],
    queryFn: () => api.get(`/deals/business/my?status=${status}&page=${page}&limit=12`).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/deals/${id}`),
    onSuccess: () => { qc.invalidateQueries(['business', 'deals']); toast.success('Deal-i u fshi!'); },
    onError: () => toast.error('Nuk mund ta fshij deal-in aktiv.'),
  });

  const deals = data?.data || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deal-et e Mi</h1>
          <p className="text-gray-500 text-sm">{data?.pagination?.total || 0} deal gjithsej</p>
        </div>
        <Link to="/business/create-deal" className="btn-primary flex items-center gap-2">
          <Plus size={18} />Krijo Deal
        </Link>
      </div>

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
                  <span className="text-xs bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-full">-{deal.discountPercentage}%</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                  <span><Eye size={12} className="inline mr-1" />{deal.views || 0} shikime</span>
                  <span><Tag size={12} className="inline mr-1" />{deal.vouchersSold || 0}/{deal.totalVouchers} voucher</span>
                </div>
                <div className="flex gap-2">
                  <Link to={`/business/deals/${deal._id}/edit`} className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-1.5">
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
          <Link to="/business/create-deal" className="btn-primary">+ Krijo Deal-in e Parë</Link>
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
