import { useParams, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import api from '../api/axios';
import DealCard from '../components/common/DealCard';
import { DealGridSkeleton } from '../components/common/LoadingSpinner';
import { SORT_OPTIONS } from '../utils/constants';

export default function Category() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('newest');

  const { data: category } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => api.get(`/categories/${slug}`).then((r) => r.data.data),
    staleTime: 10 * 60 * 1000,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['deals', 'category', slug, sort, page],
    queryFn: () => api.get(`/deals?category=${slug}&sort=${sort}&page=${page}&limit=20`).then((r) => r.data),
    enabled: !!slug,
  });

  const deals = data?.data || [];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Category Header */}
      <div className="bg-white border-b">
        <div className="container-custom py-8">
          <div className="flex items-center gap-4">
            {category?.icon && <div className="text-4xl">{category.icon}</div>}
            <div>
              <h1 className="text-2xl font-black text-gray-900">{category?.nameAl || slug}</h1>
              <p className="text-gray-500">{data?.pagination?.total || 0} oferta disponibile</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Sort Bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {isLoading ? 'Duke ngarkuar...' : `${data?.pagination?.total || 0} oferta`}
          </p>
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="input-field w-48">
            {SORT_OPTIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>

        {isLoading ? <DealGridSkeleton count={20} /> : deals.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {deals.map((deal, i) => (
                <motion.div key={deal._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: (i % 8) * 0.05 }}>
                  <DealCard deal={deal} />
                </motion.div>
              ))}
            </div>
            {data?.pagination?.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!data.pagination.hasPrev} className="px-4 py-2 rounded-xl border border-gray-200 disabled:opacity-40">← Para</button>
                <span className="px-4 py-2 text-sm text-gray-600">{page} / {data.pagination.pages}</span>
                <button onClick={() => setPage((p) => p + 1)} disabled={!data.pagination.hasNext} className="px-4 py-2 rounded-xl border border-gray-200 disabled:opacity-40">Pas →</button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">{category?.icon || '📦'}</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Nuk ka oferta në këtë kategori</h3>
            <p className="text-gray-400">Oferta të reja shtohen çdo ditë. Kthehuni shpejt!</p>
          </div>
        )}
      </div>
    </div>
  );
}
