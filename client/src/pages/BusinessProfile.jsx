import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MapPin, Phone, Globe, Star, CheckCircle, Clock, Tag } from 'lucide-react';
import api from '../api/axios';
import DealCard from '../components/common/DealCard';
import { DealGridSkeleton } from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={14} className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
      ))}
    </div>
  );
}

export default function BusinessProfile() {
  const { slug } = useParams();
  const [activeTab, setActiveTab] = useState('deals');

  const { data: business, isLoading: bLoading } = useQuery({
    queryKey: ['business', 'public', slug],
    queryFn: () => api.get(`/businesses/${slug}`).then((r) => r.data.data),
  });

  const { data: dealsData } = useQuery({
    queryKey: ['business', 'deals', slug],
    queryFn: () => api.get(`/deals?business=${slug}&limit=12`).then((r) => r.data),
    enabled: !!slug,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['business', 'reviews', slug],
    queryFn: () => api.get(`/reviews/business/${slug}?limit=10`).then((r) => r.data),
    enabled: !!slug && activeTab === 'reviews',
  });

  if (bLoading) return (
    <div className="container-custom py-8 space-y-5">
      <div className="h-52 skeleton rounded-3xl" />
      <div className="h-32 skeleton rounded-3xl" />
    </div>
  );
  if (!business) return <div className="text-center py-24 text-gray-400">Biznesi nuk u gjet.</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Cover */}
      <div className="h-52 bg-brand-gradient relative overflow-hidden">
        {business.coverImage && <img src={business.coverImage} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="container-custom">
        {/* Business Info Card */}
        <div className="card p-6 -mt-10 relative mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <img src={business.logo || `https://ui-avatars.com/api/?name=${business.businessName}&background=e9fce8&color=16a34a&size=80`}
              alt="" className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-2xl font-black text-gray-900">{business.businessName}</h1>
                {business.verificationStatus === 'verified' && (
                  <span className="flex items-center gap-1 text-xs text-brand-600 font-bold bg-brand-50 px-2.5 py-1 rounded-full">
                    <CheckCircle size={13} />Verifikuar
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                {business.city && <span className="flex items-center gap-1"><MapPin size={14} />{business.city}</span>}
                {business.phone && <span className="flex items-center gap-1"><Phone size={14} />{business.phone}</span>}
                {business.website && <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand-600 hover:underline"><Globe size={14} />Website</a>}
              </div>
              {business.description && <p className="text-gray-600 text-sm line-clamp-2">{business.description}</p>}
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <StarRating rating={business.averageRating || 0} />
                <span className="font-bold text-gray-900">{(business.averageRating || 0).toFixed(1)}</span>
                <span className="text-gray-400 text-sm">({business.totalReviews || 0})</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center"><p className="font-bold text-gray-900">{dealsData?.pagination?.total || 0}</p><p className="text-gray-400 text-xs">Oferta</p></div>
                <div className="text-center"><p className="font-bold text-gray-900">{business.totalVouchersSold || 0}</p><p className="text-gray-400 text-xs">Voucher</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6 border-b border-gray-200">
          {[{ id: 'deals', label: `Oferta (${dealsData?.pagination?.total || 0})` }, { id: 'reviews', label: `Recensione (${business.totalReviews || 0})` }, { id: 'info', label: 'Info & Oraret' }].map(({ id, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-all ${activeTab === id ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'deals' && (
          <div className="pb-12">
            {dealsData?.data?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {dealsData.data.map((deal, i) => (
                  <motion.div key={deal._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <DealCard deal={deal} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400"><Tag size={48} className="mx-auto mb-4 opacity-30" /><p>Nuk ka oferta aktive</p></div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="pb-12 space-y-4">
            {reviewsData?.data?.map((review) => (
              <div key={review._id} className="card p-5">
                <div className="flex items-start gap-4">
                  <img src={review.user?.avatar || `https://ui-avatars.com/api/?name=${review.user?.firstName}&background=e9fce8&color=16a34a&size=40`}
                    alt="" className="w-10 h-10 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{review.user?.firstName} {review.user?.lastName}</span>
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{review.comment}</p>
                    {review.businessResponse && (
                      <div className="mt-3 bg-brand-50 border border-brand-100 rounded-xl p-3">
                        <p className="text-xs font-bold text-brand-700 mb-1">Përgjigja e Biznesit:</p>
                        <p className="text-sm text-gray-700">{review.businessResponse.message}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )) || <div className="text-center py-12 text-gray-400"><Star size={40} className="mx-auto mb-3 opacity-30" /><p>Nuk ka recensione akoma</p></div>}
          </div>
        )}

        {activeTab === 'info' && (
          <div className="pb-12 grid grid-cols-1 lg:grid-cols-2 gap-5">
            {business.businessHours && (
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Clock size={18} className="text-brand-600" />Oraret e Punës</h3>
                <div className="space-y-2">
                  {['E Hënë', 'E Martë', 'E Mërkurë', 'E Enjte', 'E Premte', 'E Shtunë', 'E Diel'].map((day, i) => {
                    const h = business.businessHours?.[i];
                    return (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="text-gray-500">{day}</span>
                        <span className={`font-medium ${h?.isOpen ? 'text-gray-900' : 'text-red-400'}`}>
                          {h?.isOpen ? `${h.open} - ${h.close}` : 'Mbyllur'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {business.address && (
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><MapPin size={18} className="text-brand-600" />Lokacioni</h3>
                <p className="text-gray-700 mb-4">{business.address}, {business.city}</p>
                <div className="h-40 bg-gray-100 rounded-xl flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Harta do të integrohet me React Leaflet</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
