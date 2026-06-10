import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building, Search, Star, MapPin, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import { CITIES } from '../utils/constants';

function BusinessCard({ business }) {
  return (
    <Link to={`/businesses/${business.slug || business._id}`}
      className="card overflow-hidden group hover:shadow-card-hover transition-all duration-300">
      <div className="relative h-36 bg-gray-100 overflow-hidden">
        {business.coverImage
          ? <img src={business.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full bg-brand-gradient" />}
        {business.verificationStatus === 'verified' && (
          <span className="absolute top-2 right-2 bg-white/90 text-brand-600 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <CheckCircle size={12} />Verifikuar
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3 -mt-8 relative">
          <img src={business.logo || `https://ui-avatars.com/api/?name=${business.businessName}&background=e9fce8&color=16a34a&size=52`}
            alt="" className="w-14 h-14 rounded-xl border-3 border-white shadow-md object-cover flex-shrink-0" />
          <div className="mt-8 flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 truncate">{business.businessName}</h3>
            {business.city && <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={11} />{business.city}</p>}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="font-medium">{business.averageRating?.toFixed(1) || '—'}</span>
            <span className="text-gray-400">({business.totalReviews || 0})</span>
          </div>
          <span className="text-xs text-brand-600 font-medium">{business.activeDealsCount || 0} oferta aktive</span>
        </div>
      </div>
    </Link>
  );
}

export default function Businesses() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['businesses', 'public', search, city, page],
    queryFn: () => api.get(`/businesses?search=${search}&city=${city}&page=${page}&limit=24`).then((r) => r.data),
  });

  const businesses = data?.data || [];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b sticky top-16 z-20">
        <div className="container-custom py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Kërko biznese..." className="input-field pl-11" />
            </div>
            <select value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }} className="input-field sm:w-40">
              <option value="">Çdo Qytet</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-gray-900">Bizneset Partnere</h1>
          <p className="text-sm text-gray-500">{data?.pagination?.total || 0} biznese</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-52 skeleton rounded-2xl" />)}
          </div>
        ) : businesses.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {businesses.map((b, i) => (
              <motion.div key={b._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <BusinessCard business={b} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <Building size={56} className="text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700">Nuk u gjetën biznese</h3>
          </div>
        )}

        {data?.pagination?.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button onClick={() => setPage((p) => p - 1)} disabled={!data.pagination.hasPrev} className="px-4 py-2 rounded-xl border disabled:opacity-40">← Para</button>
            <span className="px-4 py-2 text-sm">{page} / {data.pagination.pages}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={!data.pagination.hasNext} className="px-4 py-2 rounded-xl border disabled:opacity-40">Pas →</button>
          </div>
        )}
      </div>
    </div>
  );
}
