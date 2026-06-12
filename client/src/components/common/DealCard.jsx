import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Star, MapPin, Clock, ShoppingCart, Flame, Zap } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatCountdown, getImageUrl } from '../../utils/formatters';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function DealCard({ deal, featured = false }) {
  const { t } = useTranslation();
  const [isWishlisted, setIsWishlisted] = useState(deal.isWishlisted || false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const countdown = formatCountdown(deal.endDate);
  const timeLeft = countdown.expired ? null : (countdown.days > 0 ? `${countdown.days}d` : countdown.hours > 0 ? `${countdown.hours}h ${countdown.minutes}m` : `${countdown.minutes}m`);
  const isEndingSoon = !countdown.expired && countdown.days < 1;
  const soldPercent = Math.min(100, Math.round((deal.soldVouchers / deal.totalVouchers) * 100));

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error(t('deal.login_to_buy')); return; }
    setWishlistLoading(true);
    try {
      const res = await api.post(`/deals/${deal._id}/wishlist`);
      setIsWishlisted(res.data.isWishlisted);
      toast.success(res.data.message);
    } catch { toast.error('Ndodhi një gabim.'); }
    finally { setWishlistLoading(false); }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`deal-card relative ${featured ? 'ring-2 ring-brand-300' : ''}`}
    >
      <Link to={`/deals/${deal.slug}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden h-48 bg-gray-100">
          {deal.images?.[0]?.url ? (
            <img
              src={getImageUrl(deal.images[0].url, 600)}
              alt={deal.title}
              className="w-full h-full object-cover transition-transform duration-500"
              loading="lazy"
            />
          ) : deal.business?.logo ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-blue-50 to-purple-50">
              <img
                src={getImageUrl(deal.business.logo, 400)}
                alt={deal.business.name}
                className="w-24 h-24 object-contain rounded-2xl"
                loading="lazy"
              />
              <span className="mt-2 text-xs font-semibold text-brand-400 uppercase tracking-wide">{deal.category?.name || 'Ofertë'}</span>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-blue-50 to-purple-50">
              <p className="text-5xl font-black text-brand-200 leading-none">-{Math.round(deal.discountPercentage)}%</p>
              <p className="text-brand-400 text-xs font-semibold mt-2 uppercase tracking-wide">{deal.category?.name || deal.city || 'Ofertë'}</p>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <span className="badge bg-red-500 text-white font-bold text-sm shadow-sm">
              -{Math.round(deal.discountPercentage)}%
            </span>
            {deal.dealType === 'flash' && (
              <span className="badge bg-orange-500 text-white flex items-center gap-1"><Zap size={10} /> {t('deal.flash')}</span>
            )}
            {deal.isNew && (
              <span className="badge bg-blue-500 text-white">{t('deal.new')}</span>
            )}
            {featured && (
              <span className="badge bg-brand-600 text-white flex items-center gap-1"><Flame size={10} /> {t('deal.featured')}</span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white/90 backdrop-blur-sm text-gray-500 hover:text-red-500'}`}
          >
            <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>

          {/* Time remaining */}
          {timeLeft && (
            <div className={`absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-sm ${isEndingSoon ? 'bg-orange-500 animate-pulse' : 'bg-black/70 backdrop-blur-sm'}`}>
              <Clock size={12} />
              {isEndingSoon ? `${t('deal.expires_today')} ${timeLeft}` : `${t('deal.expires')} ${timeLeft}`}
            </div>
          )}

          {/* Sold out overlay */}
          {deal.status === 'sold_out' && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-bold text-lg">{t('deal.sold_out')}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Business & Category */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="font-medium text-brand-700 truncate max-w-[120px]">
                {deal.business?.name}
              </span>
              {deal.business?.verificationStatus === 'verified' && (
                <span className="text-brand-500" title="Biznes i Verifikuar">✓</span>
              )}
            </div>
            <div className="flex items-center gap-0.5 text-xs text-amber-500">
              <Star size={12} fill="currentColor" />
              <span className="font-medium text-gray-700">{deal.averageRating?.toFixed(1) || '—'}</span>
              {deal.totalReviews > 0 && <span className="text-gray-400">({deal.totalReviews})</span>}
            </div>
          </div>

          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-2 group-hover:text-brand-700 transition-colors">
            {deal.title}
          </h3>

          {/* Location */}
          {deal.business?.city && (
            <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
              <MapPin size={12} />
              <span>{deal.business.city}</span>
              {deal.category && <><span>·</span><span>{deal.category.name}</span></>}
            </div>
          )}

          {/* Progress bar */}
          {deal.totalVouchers > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{deal.soldVouchers} {t('deal.bought')}</span>
                <span>{deal.remainingVouchers} {t('deal.remaining')}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${soldPercent > 80 ? 'bg-red-500' : soldPercent > 50 ? 'bg-orange-400' : 'bg-brand-500'}`}
                  style={{ width: `${soldPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-400 line-through">{formatCurrency(deal.originalPrice)}</p>
              <p className="text-xl font-black text-brand-700">{formatCurrency(deal.discountedPrice)}</p>
              <p className="text-xs text-green-600 font-medium">{t('deal.save')} {formatCurrency(deal.savingsAmount)}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <ShoppingCart size={12} />
              <span>{deal.soldVouchers} {t('deal.bought')}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
