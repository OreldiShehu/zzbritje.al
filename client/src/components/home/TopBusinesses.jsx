import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Star, MapPin, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import { getImageUrl } from '../../utils/formatters';

export default function TopBusinesses() {
  const { t } = useTranslation();
  const { data: businesses } = useQuery({
    queryKey: ['businesses', 'top'],
    queryFn: () => api.get('/businesses?verified=true&limit=8').then((r) => r.data.data),
    staleTime: 10 * 60 * 1000,
  });

  if (!businesses?.length) return null;

  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">{t('home.top_partners')}</span>
            <h2 className="section-title mt-1">{t('home.top_businesses')}</h2>
            <p className="text-gray-500 mt-2">{t('home.top_businesses_subtitle')}</p>
          </div>
          <Link to="/businesses" className="hidden md:flex btn-secondary text-sm py-2">{t('home.see_all')}</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {businesses.map((biz, i) => (
            <motion.div
              key={biz._id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
            >
              <Link to={`/business/${biz.slug}`} className="group block card p-4 hover:-translate-y-1 transition-all duration-200">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-3">
                    <img
                      src={biz.logo ? getImageUrl(biz.logo, 100) : `https://ui-avatars.com/api/?name=${biz.name}&background=1a3f8a&color=fff&size=80`}
                      alt={biz.name}
                      className="w-16 h-16 rounded-2xl object-cover shadow-card"
                      loading="lazy"
                    />
                    {biz.verificationStatus === 'verified' && (
                      <CheckCircle size={18} className="absolute -bottom-1 -right-1 text-brand-600 bg-white rounded-full" />
                    )}
                  </div>
                  <p className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-brand-700 transition-colors">{biz.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={12} className="text-amber-400" fill="currentColor" />
                    <span className="text-xs text-gray-600 font-medium">{biz.averageRating?.toFixed(1) || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin size={11} className="text-gray-400" />
                    <span className="text-xs text-gray-400">{biz.city}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
