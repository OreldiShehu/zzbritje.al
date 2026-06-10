import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Star, MapPin, Heart, Share2, Clock, ShoppingCart, CheckCircle,
  Phone, Globe, ChevronLeft, ChevronRight, Shield, Tag, Zap,
  AlertCircle, Users, Eye,
} from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { formatCurrency, formatCountdown, formatDate, getImageUrl } from '../utils/formatters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DealCard from '../components/common/DealCard';
import toast from 'react-hot-toast';

function CountdownTimer({ endDate }) {
  const [time, setTime] = useState(formatCountdown(endDate));
  useEffect(() => {
    const timer = setInterval(() => setTime(formatCountdown(endDate)), 1000);
    return () => clearInterval(timer);
  }, [endDate]);
  if (time.expired) return <span className="text-red-500 font-bold">Skaduar</span>;
  return (
    <div className="flex items-center gap-2 text-gray-900">
      {[{ v: time.days, l: 'Ditë' }, { v: time.hours, l: 'Orë' }, { v: time.minutes, l: 'Min' }, { v: time.seconds, l: 'Sek' }].map(({ v, l }) => (
        <div key={l} className="text-center bg-gray-900 text-white rounded-lg px-3 py-2 min-w-[52px]">
          <p className="text-lg font-black tabular-nums">{String(v).padStart(2, '0')}</p>
          <p className="text-xs text-gray-400 uppercase">{l}</p>
        </div>
      ))}
    </div>
  );
}

function StarRating({ rating, reviews }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} size={16} className={star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'} fill={star <= Math.round(rating) ? 'currentColor' : 'currentColor'} />
        ))}
      </div>
      <span className="font-semibold text-gray-900">{rating?.toFixed(1) || '—'}</span>
      {reviews > 0 && <span className="text-gray-400 text-sm">({reviews} vlerësime)</span>}
    </div>
  );
}

export default function DealDetails() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['deal', slug],
    queryFn: () => api.get(`/deals/${slug}`).then((r) => r.data.data),
    retry: 1,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', 'deal', data?._id],
    queryFn: () => api.get(`/reviews/deal/${data._id}?limit=5`).then((r) => r.data),
    enabled: !!data?._id,
  });

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" text="Duke ngarkuar..." /></div>;
  if (error || !data) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <AlertCircle size={48} className="text-red-400" />
      <h2 className="text-xl font-bold text-gray-900">Deal-i nuk u gjet</h2>
      <Link to="/search" className="btn-primary">Shfleto Oferta</Link>
    </div>
  );

  const deal = data;
  const images = deal.images?.length > 0 ? deal.images : [{ url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800' }];
  const soldPercent = Math.min(100, Math.round((deal.soldVouchers / deal.totalVouchers) * 100));

  const handleBuyNow = async () => {
    if (!isAuthenticated) { toast.error('Kyçuni për të blerë!'); navigate('/login?redirect=' + encodeURIComponent(`/deals/${slug}`)); return; }
    if (deal.status !== 'active') { toast.error('Ky deal nuk është aktiv.'); return; }
    navigate(`/checkout/${deal._id}?qty=${quantity}`);
  };

  const handleShare = () => {
    if (navigator.share) navigator.share({ title: deal.title, url: window.location.href });
    else { navigator.clipboard.writeText(window.location.href); toast.success('Linku u kopjua!'); }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container-custom py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-brand-600">Ballina</Link>
            <span>/</span>
            {deal.category && <Link to={`/category/${deal.category.slug}`} className="hover:text-brand-600">{deal.category.name}</Link>}
            <span>/</span>
            <span className="text-gray-900 truncate max-w-xs">{deal.title}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT — Images + Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="card overflow-hidden">
              <div className="relative bg-gray-100">
                <img
                  src={getImageUrl(images[currentImageIdx]?.url, 1200)}
                  alt={deal.title}
                  className="w-full h-80 md:h-96 object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setCurrentImageIdx((i) => (i - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => setCurrentImageIdx((i) => (i + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="badge bg-red-500 text-white font-bold text-sm">-{Math.round(deal.discountPercentage)}%</span>
                  {deal.dealType === 'flash' && <span className="badge bg-orange-500 text-white flex items-center gap-1"><Zap size={10} />Flash</span>}
                </div>
                <div className="absolute top-3 right-3 flex gap-2">
                  <button onClick={handleShare} className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white">
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setCurrentImageIdx(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === currentImageIdx ? 'border-brand-500' : 'border-transparent'}`}>
                      <img src={getImageUrl(img.url, 100)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Deal Info */}
            <div className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {deal.category && <span className="badge badge-green">{deal.category.name}</span>}
                    <span className={`badge ${deal.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                      {deal.status === 'active' ? 'Aktiv' : deal.status === 'sold_out' ? 'Shituar' : 'Skaduar'}
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-display leading-snug">{deal.title}</h1>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Eye size={14} />{deal.views?.toLocaleString()} shikime
                </div>
              </div>

              <StarRating rating={deal.averageRating} reviews={deal.totalReviews} />

              <div className="mt-6 prose prose-sm max-w-none text-gray-600 leading-relaxed">
                <p>{deal.description}</p>
              </div>
            </div>

            {/* Business Info */}
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Rreth Biznesit</h3>
              <div className="flex items-start gap-4">
                <img
                  src={deal.business?.logo ? getImageUrl(deal.business.logo, 80) : `https://ui-avatars.com/api/?name=${deal.business?.name}&background=16a34a&color=fff&size=60`}
                  alt={deal.business?.name}
                  className="w-16 h-16 rounded-2xl object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900">{deal.business?.name}</h4>
                    {deal.business?.verificationStatus === 'verified' && (
                      <CheckCircle size={18} className="text-brand-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1"><MapPin size={14} />{deal.business?.city}</div>
                    {deal.business?.averageRating > 0 && (
                      <div className="flex items-center gap-1"><Star size={14} className="text-amber-400" fill="currentColor" />{deal.business.averageRating.toFixed(1)}</div>
                    )}
                  </div>
                  <div className="flex gap-3 mt-3">
                    {deal.business?.phone && <a href={`tel:${deal.business.phone}`} className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700"><Phone size={14} />{deal.business.phone}</a>}
                    {deal.business?.website && <a href={deal.business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700"><Globe size={14} />Website</a>}
                  </div>
                </div>
                <Link to={`/business/${deal.business?.slug}`} className="btn-secondary text-xs py-2 px-3">Profili →</Link>
              </div>
            </div>

            {/* Terms */}
            {deal.termsAndConditions && (
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2"><Shield size={18} className="text-brand-600" />Kushtet & Udhëzimet</h3>
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{deal.termsAndConditions}</div>
                {deal.redemptionInstructions && (
                  <div className="mt-4 p-4 bg-brand-50 rounded-xl">
                    <p className="font-semibold text-brand-800 mb-2 flex items-center gap-2"><Tag size={16} />Udhëzimet e Shfrytëzimit</p>
                    <p className="text-sm text-brand-700">{deal.redemptionInstructions}</p>
                  </div>
                )}
              </div>
            )}

            {/* Reviews */}
            {reviews?.data?.length > 0 && (
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                  <Star size={18} className="text-amber-400" fill="currentColor" />
                  Vlerësimet e Klientëve ({reviews.pagination?.total})
                </h3>
                <div className="space-y-4">
                  {reviews.data.map((review) => (
                    <div key={review._id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <img src={review.user?.avatar || `https://ui-avatars.com/api/?name=${review.user?.firstName}&size=36&background=16a34a&color=fff`}
                          alt={review.user?.firstName} className="w-9 h-9 rounded-full" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{review.user?.firstName} {review.user?.lastName}</p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: review.rating }).map((_, i) => <Star key={i} size={12} className="text-amber-400" fill="currentColor" />)}
                          </div>
                        </div>
                        <span className="ml-auto text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-700">{review.body}</p>
                      {review.businessResponse && (
                        <div className="mt-3 pl-3 border-l-2 border-brand-200">
                          <p className="text-xs text-brand-700 font-semibold mb-1">Përgjigja e Biznesit:</p>
                          <p className="text-xs text-gray-600">{review.businessResponse.body}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Deals */}
            {deal.relatedDeals?.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-4">Oferta të Ngjashme</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {deal.relatedDeals.slice(0, 4).map((d) => <DealCard key={d._id} deal={d} />)}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Purchase Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="card p-6">
                {/* Countdown */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Clock size={12} />Skadon pas</p>
                  <CountdownTimer endDate={deal.endDate} />
                </div>

                {/* Pricing */}
                <div className="py-4 border-t border-b border-gray-100 mb-4">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-3xl font-black text-brand-700 font-display">{formatCurrency(deal.discountedPrice)}</span>
                    <span className="text-lg text-gray-400 line-through">{formatCurrency(deal.originalPrice)}</span>
                    <span className="badge bg-red-500 text-white font-bold">-{Math.round(deal.discountPercentage)}%</span>
                  </div>
                  <p className="text-green-600 font-medium text-sm">✓ Kurseni {formatCurrency(deal.savingsAmount)}</p>
                </div>

                {/* Availability */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{deal.soldVouchers} blerë</span>
                    <span>{deal.remainingVouchers} mbetur</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${soldPercent > 80 ? 'bg-red-500' : soldPercent > 50 ? 'bg-orange-400' : 'bg-brand-500'}`}
                      style={{ width: `${soldPercent}%` }} />
                  </div>
                  {soldPercent > 70 && <p className="text-orange-600 text-xs mt-1 font-medium">🔥 Shpejto! Po mbaron.</p>}
                </div>

                {/* Quantity */}
                {deal.maxPerCustomer > 1 && (
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm font-medium text-gray-700">Sasia:</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">-</button>
                      <span className="w-8 text-center font-bold">{quantity}</span>
                      <button onClick={() => setQuantity((q) => Math.min(deal.maxPerCustomer, q + 1))} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">+</button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBuyNow}
                  disabled={deal.status !== 'active' || purchasing}
                  className="btn-primary w-full py-4 text-base disabled:opacity-50"
                >
                  {purchasing ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :
                    <><ShoppingCart size={20} />Bli Tani — {formatCurrency(deal.discountedPrice * quantity)}</>}
                </button>

                {/* Trust badges */}
                <div className="mt-4 space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2"><CheckCircle size={14} className="text-brand-500" />Garanci kthimi 14 ditë</div>
                  <div className="flex items-center gap-2"><Shield size={14} className="text-brand-500" />Pagesë e sigurt 256-bit SSL</div>
                  <div className="flex items-center gap-2"><Users size={14} className="text-brand-500" />+{deal.soldVouchers} njerëz e kanë blerë</div>
                </div>
              </div>

              {/* Business quick card */}
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={deal.business?.logo ? getImageUrl(deal.business.logo, 60) : `https://ui-avatars.com/api/?name=${deal.business?.name}&size=48&background=dcfce7&color=16a34a`}
                    className="w-12 h-12 rounded-xl object-cover"
                    alt={deal.business?.name}
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{deal.business?.name}</p>
                    <p className="text-xs text-gray-400">{deal.business?.city}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm"><Star size={14} className="text-amber-400" fill="currentColor" /><span className="font-medium">{deal.business?.averageRating?.toFixed(1) || '—'}</span><span className="text-gray-400">({deal.business?.totalReviews || 0})</span></div>
                  <Link to={`/business/${deal.business?.slug}`} className="text-xs text-brand-600 hover:text-brand-700 font-medium">Shiko Profilin →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
