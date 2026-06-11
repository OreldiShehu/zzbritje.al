import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import api from '../api/axios';
import DealCard from '../components/common/DealCard';
import { DealGridSkeleton } from '../components/common/LoadingSpinner';
import { SORT_OPTIONS } from '../utils/constants';

export default function City() {
  const { city } = useParams();
  const cityName = decodeURIComponent(city);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('newest');

  const { data, isLoading } = useQuery({
    queryKey: ['deals', 'city', cityName, sort, page],
    queryFn: () => api.get(`/deals?city=${encodeURIComponent(cityName)}&sort=${sort}&page=${page}&limit=20`).then((r) => r.data),
    enabled: !!cityName,
  });

  const deals = data?.data || [];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* City Header */}
      <div className="bg-brand-gradient text-white py-12">
        <div className="container-custom text-center">
          <MapPin size={36} className="mx-auto mb-3 text-green-200" />
          <h1 className="text-3xl font-black mb-2">Oferta në {cityName}</h1>
          <p className="text-blue-100">{data?.pagination?.total || 0} oferta ekskluzive</p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">{isLoading ? 'Duke ngarkuar...' : `${data?.pagination?.total || 0} oferta`}</p>
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
            <MapPin size={48} className="text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Nuk ka oferta në {cityName}</h3>
            <p className="text-gray-400">Bizneset lokale do të shtohen shpejt!</p>
          </div>
        )}
      </div>
    </div>
  );
}
