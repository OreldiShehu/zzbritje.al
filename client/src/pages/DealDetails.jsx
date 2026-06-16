import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Star, MapPin, Share2, Clock, CheckCircle,
  Phone, Globe, ChevronLeft, ChevronRight, Shield, Zap,
  AlertCircle, Users, Eye, Instagram, Send, Banknote, CreditCard, X, Trash2,
} from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons, FUNDING } from '@paypal/react-paypal-js';
import { Helmet } from 'react-helmet-async';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { formatCurrency, formatCountdown, formatDate, getImageUrl } from '../utils/formatters';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DealCard from '../components/common/DealCard';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

function CountdownTimer({ endDate }) {
  const { t } = useTranslation();
  const [time, setTime] = useState(formatCountdown(endDate));
  useEffect(() => {
    const timer = setInterval(() => setTime(formatCountdown(endDate)), 1000);
    return () => clearInterval(timer);
  }, [endDate]);
  if (time.expired) return <span className="text-red-500 font-bold">{t('deal.expired')}</span>;
  return (
    <div className="flex items-center gap-2 text-gray-900">
      {[{ v: time.days, l: t('deal.days') }, { v: time.hours, l: t('deal.hours') }, { v: time.minutes, l: t('deal.min') }, { v: time.seconds, l: t('deal.sec') }].map(({ v, l }) => (
        <div key={l} className="text-center bg-gray-900 text-white rounded-lg px-3 py-2 min-w-[52px]">
          <p className="text-lg font-black tabular-nums">{String(v).padStart(2, '0')}</p>
          <p className="text-xs text-gray-400 uppercase">{l}</p>
        </div>
      ))}
    </div>
  );
}

function StarRating({ rating, reviews }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} size={16} className={star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'} fill={star <= Math.round(rating) ? 'currentColor' : 'currentColor'} />
        ))}
      </div>
      <span className="font-semibold text-gray-900">{rating?.toFixed(1) || '—'}</span>
      {reviews > 0 && <span className="text-gray-400 text-sm">({reviews} {reviews === 1 ? 'vlerësim' : 'vlerësime'})</span>}
    </div>
  );
}

export default function DealDetails() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const isBusiness = user?.role === 'business';
  const navigate = useNavigate();
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutPayment, setCheckoutPayment] = useState('cash');
  const [cashPending, setCashPending] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [giftEmail, setGiftEmail] = useState('');
  const [giftMessage, setGiftMessage] = useState('');

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

  const qc = useQueryClient();
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewBody, setReviewBody] = useState('');

  const { data: myVouchers } = useQuery({
    queryKey: ['vouchers', 'my', data?._id],
    queryFn: () => api.get('/vouchers/my').then((r) => r.data.data),
    enabled: !!data?._id && isAuthenticated,
  });

  const myVoucherForDeal = myVouchers?.find(
    (v) => (v.deal?._id || v.deal)?.toString() === data?._id?.toString()
  );
  const canReview = myVoucherForDeal && !myVoucherForDeal.hasReview;

  const reviewMutation = useMutation({
    mutationFn: () => api.post('/reviews', {
      voucherId: myVoucherForDeal._id,
      rating: reviewRating,
      body: reviewBody,
    }),
    onSuccess: () => {
      toast.success('Vlerësimi u dërgua!');
      setReviewBody('');
      setReviewRating(5);
      qc.invalidateQueries(['reviews', 'deal', data?._id]);
      qc.invalidateQueries(['vouchers', 'my', data?._id]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Ndodhi një gabim.'),
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId) => api.delete(`/reviews/${reviewId}`),
    onSuccess: () => {
      toast.success('Vlerësimi u fshi.');
      qc.invalidateQueries(['reviews', 'deal', data?._id]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Ndodhi një gabim.'),
  });

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" text={t('common.loading')} /></div>;
  if (error || !data) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <AlertCircle size={48} className="text-red-400" />
      <h2 className="text-xl font-bold text-gray-900">{t('deal.not_found')}</h2>
      <Link to="/search" className="btn-primary">{t('dashboard.browse_deals')}</Link>
    </div>
  );

  const deal = data;
  const images = deal.images?.length > 0 ? deal.images : [{ url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800' }];
  const soldPercent = Math.min(100, Math.round((deal.soldVouchers / deal.totalVouchers) * 100));

  const statusLabel = deal.status === 'active' ? 'Aktive' : deal.status === 'sold_out' ? 'Shitur' : 'Skaduar';

  const handleBuyNow = () => {
    if (!isAuthenticated) { toast.error(t('deal.login_to_buy')); navigate('/login?redirect=' + encodeURIComponent(`/deals/${slug}`)); return; }
    if (isBusiness) { toast.error('Llogaritë e biznesit nuk mund të blejnë kupon.'); return; }
    if (deal.status !== 'active') { toast.error(t('deal.not_active')); return; }
    setShowCheckout(true);
  };

  const handleCashPurchase = async () => {
    if (isGift && !giftEmail.trim()) { toast.error('Shkruaj email-in e marrësit'); return; }
    setCashPending(true);
    try {
      await api.post('/vouchers/purchase', {
        dealId: deal._id, quantity, paymentMethod: 'cash',
        ...(isGift && { isGift: true, giftRecipientEmail: giftEmail.trim(), giftMessage: giftMessage.trim() }),
      });
      toast.success(isGift ? 'Dhurata u dërgua me sukses!' : t('checkout.success'));
      setShowCheckout(false);
      navigate('/dashboard/vouchers', { state: { newVoucher: true } });
    } catch (e) {
      toast.error(e.response?.data?.message || t('checkout.error'));
    } finally {
      setCashPending(false);
    }
  };

  const createPayPalOrder = async () => {
    const res = await api.post('/payments/paypal/create-order', { dealId: deal._id, quantity });
    return res.data.orderId;
  };

  const onPayPalApprove = async (data) => {
    try {
      await api.post(`/payments/paypal/capture-order/${data.orderID}`, { dealId: deal._id, quantity });
      toast.success(t('checkout.success'));
      setShowCheckout(false);
      navigate('/dashboard/vouchers', { state: { newVoucher: true } });
    } catch (e) {
      toast.error(e.response?.data?.message || t('checkout.error'));
    }
  };

  const handleShare = () => {
    if (navigator.share) navigator.share({ title: deal.title, url: window.location.href });
    else { navigator.clipboard.writeText(window.location.href); toast.success('✓ Link copied!'); }
  };

  const ogImage = deal.images?.[0]?.url ? getImageUrl(deal.images[0].url, 1200) : 'https://zbritje.al/og-image.jpg';
  const pageTitle = `${deal.title} — ${Math.round(deal.discountPercentage)}% Zbritje | Zbritje.al`;
  const pageDesc = `${deal.description?.slice(0, 150) || deal.title}. Çmimi: ${deal.discountedPrice} ALL (prej ${deal.originalPrice} ALL).`;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={`https://zbritje.al/deals/${deal.slug}`} />
        <meta property="og:type" content="product" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:image" content={ogImage} />
        <link rel="canonical" href={`https://zbritje.al/deals/${deal.slug}`} />
      </Helmet>
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container-custom py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-brand-600">{t('common.home')}</Link>
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
                  <span className="badge bg-red-500 text-white font-bold text-sm">{deal.dealType === 'fixed_discount' ? 'Fikse' : `-${Math.round(deal.discountPercentage)}%`}</span>
                  {deal.dealType === 'flash' && <span className="badge bg-orange-500 text-white flex items-center gap-1"><Zap size={10} />{t('deal.flash')}</span>}
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
                    <span className={`badge ${deal.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{statusLabel}</span>
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
                  src={deal.business?.logo ? getImageUrl(deal.business.logo, 80) : `https://ui-avatars.com/api/?name=${deal.business?.name}&background=1a3f8a&color=fff&size=60`}
                  alt={deal.business?.name}
                  className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-bold text-gray-900">{deal.business?.name}</h4>
                    {deal.business?.verificationStatus === 'verified' && (
                      <CheckCircle size={18} className="text-brand-600 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1"><MapPin size={14} />{[deal.business?.address, deal.business?.city].filter(Boolean).join(', ')}</div>
                    {deal.business?.averageRating > 0 && (
                      <div className="flex items-center gap-1"><Star size={14} className="text-amber-400" fill="currentColor" />{deal.business.averageRating.toFixed(1)}</div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {deal.business?.phone && <a href={`tel:${deal.business.phone}`} className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700"><Phone size={14} />{deal.business.phone}</a>}
                    {deal.business?.website && <a href={deal.business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700"><Globe size={14} />{deal.business.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</a>}
                    {deal.business?.socialLinks?.instagram && <a href={`https://instagram.com/${deal.business.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-pink-600 hover:text-pink-700"><Instagram size={14} />@{deal.business.socialLinks.instagram}</a>}
                    {(deal.business?.address || deal.business?.city) && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([deal.business?.address, deal.business?.city].filter(Boolean).join(', '))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <MapPin size={14} />Hap në Google Maps
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <Link to={`/business/${deal.business?.slug}`} className="btn-secondary text-xs py-2 px-4 mt-4 inline-flex whitespace-nowrap">Shiko Biznesin →</Link>
            </div>

            {/* One per table */}
            {deal.onePerTable && (
              <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-semibold">
                <span className="text-lg">⚠️</span>
                <span>1 kupon / vizitë — biznesi e kontrollon gjatë skanimit të QR</span>
              </div>
            )}

            {/* Terms */}
            {deal.termsAndConditions && (
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2"><Shield size={18} className="text-brand-600" />{t('deal.terms')}</h3>
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{deal.termsAndConditions}</div>
                {deal.redemptionInstructions && (
                  <div className="mt-4 p-4 bg-brand-50 rounded-xl">
                    <p className="font-semibold text-brand-800 mb-2 flex items-center gap-2"><Tag size={16} />{t('deal.redemption')}</p>
                    <p className="text-sm text-brand-700">{deal.redemptionInstructions}</p>
                  </div>
                )}
              </div>
            )}

            {/* Write a review */}
            {canReview && (
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                  <Star size={18} className="text-amber-400" fill="currentColor" />
                  Lër një vlerësim
                </h3>
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setReviewHover(star)}
                      onMouseLeave={() => setReviewHover(0)}
                      className="p-0.5 transition-transform hover:scale-110"
                    >
                      <Star
                        size={28}
                        className={(reviewHover || reviewRating) >= star ? 'text-amber-400' : 'text-gray-200'}
                        fill="currentColor"
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-500">{['', 'Shumë keq', 'Keq', 'Mesatar', 'Mirë', 'Shkëlqyeshëm'][reviewHover || reviewRating]}</span>
                </div>
                <textarea
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  rows={3}
                  placeholder="Shkruaj përvojën tënde me këtë deal..."
                  className="input-field resize-none mb-1"
                />
                <p className={`text-xs mb-3 ${reviewBody.trim().length < 5 ? 'text-red-400' : 'text-gray-400'}`}>
                  {reviewBody.trim().length}/5 karaktere minimum
                </p>
                <button
                  onClick={() => reviewMutation.mutate()}
                  disabled={reviewBody.trim().length < 5 || reviewMutation.isPending}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  {reviewMutation.isPending
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><Send size={14} />Dërgo vlerësimin</>}
                </button>
              </div>
            )}

            {/* Reviews */}
            {reviews?.data?.length > 0 && (
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                  <Star size={18} className="text-amber-400" fill="currentColor" />
                  {t('deal.reviews')} {t('deal.reviews_count', { count: reviews.pagination?.total })}
                </h3>
                <div className="space-y-4">
                  {reviews.data.map((review) => (
                    <div key={review._id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <img src={review.user?.avatar || `https://ui-avatars.com/api/?name=${review.user?.firstName}&size=36&background=1a3f8a&color=fff`}
                          alt={review.user?.firstName} className="w-9 h-9 rounded-full" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{review.user?.firstName} {review.user?.lastName}</p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: review.rating }).map((_, i) => <Star key={i} size={12} className="text-amber-400" fill="currentColor" />)}
                          </div>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                          {isBusiness && (
                            <button
                              onClick={() => { if (window.confirm('Fshi këtë vlerësim?')) deleteReviewMutation.mutate(review._id); }}
                              disabled={deleteReviewMutation.isPending}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Fshi vlerësimin"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{review.body}</p>
                      {review.businessResponse && (
                        <div className="mt-3 pl-3 border-l-2 border-brand-200">
                          <p className="text-xs text-brand-700 font-semibold mb-1">{t('deal.business_response')}</p>
                          <p className="text-xs text-gray-600">{review.businessResponse.body}</p>
                        </div>
                      )}
                    </div>
                  ))}
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
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Clock size={12} />{t('deal.expires_in')}</p>
                  <CountdownTimer endDate={deal.endDate} />
                </div>

                {/* Pricing */}
                <div className="py-4 border-t border-b border-gray-100 mb-4">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-3xl font-black text-brand-700 font-display">{formatCurrency(deal.discountedPrice)}</span>
                    {deal.dealType !== 'fixed_discount' && <span className="text-lg text-gray-400 line-through">{formatCurrency(deal.originalPrice)}</span>}
                    <span className="badge bg-red-500 text-white font-bold">{deal.dealType === 'fixed_discount' ? 'Fikse' : `-${Math.round(deal.discountPercentage)}%`}</span>
                  </div>
                  <p className="text-green-600 font-medium text-sm">✓ {t('deal.save')} {formatCurrency(deal.savingsAmount)}</p>
                </div>

                {/* Availability */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{deal.soldVouchers} {t('deal.bought')}</span>
                    <span>{deal.remainingVouchers} {t('deal.remaining')}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${soldPercent > 80 ? 'bg-red-500' : soldPercent > 50 ? 'bg-orange-400' : 'bg-brand-500'}`}
                      style={{ width: `${soldPercent}%` }} />
                  </div>
                  {soldPercent > 70 && <p className="text-orange-600 text-xs mt-1 font-medium">{t('deal.hurry')}</p>}
                </div>

                {/* Quantity */}
                {deal.maxPerCustomer > 1 && (
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm font-medium text-gray-700">{t('deal.quantity')}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">-</button>
                      <span className="w-8 text-center font-bold">{quantity}</span>
                      <button onClick={() => setQuantity((q) => Math.min(deal.maxPerCustomer, q + 1))} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">+</button>
                    </div>
                  </div>
                )}

                {isBusiness ? (
                  <div className="w-full py-4 text-center text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl font-medium">
                    Llogaritë e biznesit nuk mund të blejnë voucher
                  </div>
                ) : (
                  <button
                    onClick={handleBuyNow}
                    disabled={deal.status !== 'active' || purchasing}
                    className="btn-primary w-full py-4 text-base font-bold disabled:opacity-50"
                  >
                    {purchasing
                      ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : `${t('deal.buy_now')} — ${formatCurrency(deal.discountedPrice * quantity)}`}
                  </button>
                )}

                {/* Trust badges */}
                <div className="mt-4 space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2"><CheckCircle size={14} className="text-brand-500" />{t('deal.trust_return')}</div>
                  <div className="flex items-center gap-2"><Shield size={14} className="text-brand-500" />{t('deal.trust_secure')}</div>
                  <div className="flex items-center gap-2"><Users size={14} className="text-brand-500" />+{deal.soldVouchers} {t('deal.trust_buyers')}</div>
                </div>
              </div>

              {/* Business quick card */}
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={deal.business?.logo ? getImageUrl(deal.business.logo, 60) : `https://ui-avatars.com/api/?name=${deal.business?.name}&size=48&background=dcfce7&color=1a3f8a`}
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
                  <Link to={`/business/${deal.business?.slug}`} className="text-xs text-brand-600 hover:text-brand-700 font-medium whitespace-nowrap">Shiko →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Deals — below the full grid */}
        {deal.relatedDeals?.length > 0 && (
          <div className="mt-12">
            <h3 className="font-bold text-gray-900 text-xl mb-5">{t('deal.related')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {deal.relatedDeals.slice(0, 4).map((d) => <DealCard key={d._id} deal={d} />)}
            </div>
          </div>
        )}
      </div>

      {/* Checkout Drawer */}
      <AnimatePresence>
        {showCheckout && deal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowCheckout(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              <div className="px-5 pb-8 pt-2">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-gray-900">{t('checkout.title')}</h2>
                  <button onClick={() => setShowCheckout(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                    <X size={18} />
                  </button>
                </div>

                {/* Deal summary */}
                <div className="flex gap-3 p-4 bg-gray-50 rounded-2xl mb-5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                    {deal.images?.[0]?.url
                      ? <img src={getImageUrl(deal.images[0].url, 150)} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-brand-300 font-black text-lg">-{Math.round(deal.discountPercentage)}%</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-brand-600 font-medium">{deal.business?.name}</p>
                    <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{deal.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-black text-brand-700">{formatCurrency(deal.discountedPrice * quantity)}</span>
                      <span className="text-sm text-gray-400 line-through">{formatCurrency(deal.originalPrice * quantity)}</span>
                    </div>
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="space-y-2 text-sm mb-5 px-1">
                  <div className="flex justify-between text-gray-500">
                    <span>{quantity} × voucher</span>
                    <span>{formatCurrency(deal.discountedPrice * quantity)}</span>
                  </div>
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>{t('checkout.save')}</span>
                    <span>-{formatCurrency(deal.savingsAmount * quantity)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 border-t pt-2">
                    <span>{t('checkout.total')}</span>
                    <span className="text-brand-700">{formatCurrency(deal.discountedPrice * quantity)}</span>
                  </div>
                </div>

                {/* Gift option */}
                <label className="flex items-center gap-3 p-3.5 rounded-2xl border-2 border-gray-200 cursor-pointer hover:bg-gray-50 transition-all mb-3">
                  <input type="checkbox" checked={isGift} onChange={(e) => setIsGift(e.target.checked)} className="w-5 h-5 rounded accent-brand-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">🎁 Dërgoje si Dhuratë</p>
                    <p className="text-xs text-gray-400">Voucher-i do t'i dërgohet një personi tjetër</p>
                  </div>
                </label>
                {isGift && (
                  <div className="space-y-2 mb-3 p-3 bg-pink-50 rounded-2xl border border-pink-200">
                    <input
                      type="email"
                      value={giftEmail}
                      onChange={(e) => setGiftEmail(e.target.value)}
                      placeholder="Email-i i marrësit *"
                      className="input-field text-sm"
                    />
                    <textarea
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      placeholder="Mesazh personal (opsional)..."
                      rows={2}
                      className="input-field text-sm resize-none"
                    />
                  </div>
                )}

                {/* Payment method */}
                <div className="space-y-2 mb-5">
                  {[
                    { id: 'cash', label: t('checkout.cash', 'Paguaj në Biznes'), desc: t('checkout.cash_desc', 'Paraqite voucherin dhe paguaj kur vizitoni biznesin'), Icon: Banknote },
                    { id: 'online', label: 'PayPal / Apple Pay', desc: 'Paguaj me siguri online', Icon: CreditCard, disabled: !PAYPAL_CLIENT_ID },
                  ].map(({ id, label, desc, Icon, disabled }) => (
                    <label key={id} className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${disabled ? 'opacity-40 cursor-not-allowed border-gray-200' : checkoutPayment === id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 cursor-pointer'}`}>
                      <input type="radio" name="drawer-payment" value={id} checked={checkoutPayment === id} onChange={() => !disabled && setCheckoutPayment(id)} disabled={disabled} className="accent-brand-600" />
                      <Icon size={18} className="text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Cash confirm */}
                {checkoutPayment === 'cash' && (
                  <button
                    onClick={handleCashPurchase}
                    disabled={cashPending}
                    className="btn-primary w-full py-4 text-base font-bold disabled:opacity-50"
                  >
                    {cashPending
                      ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto block" />
                      : t('checkout.confirm_btn')}
                  </button>
                )}

                {/* PayPal */}
                {checkoutPayment === 'online' && PAYPAL_CLIENT_ID && (
                  <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'EUR', intent: 'capture', 'enable-funding': 'applepay,paylater', 'disable-funding': 'venmo,card' }}>
                    <PayPalButtons fundingSource={FUNDING.PAYPAL} style={{ layout: 'horizontal', height: 48, tagline: false }} createOrder={createPayPalOrder} onApprove={onPayPalApprove} onError={() => toast.error(t('checkout.error'))} />
                    <PayPalButtons fundingSource={FUNDING.APPLE_PAY} style={{ layout: 'horizontal', height: 48, tagline: false }} createOrder={createPayPalOrder} onApprove={onPayPalApprove} onError={() => toast.error(t('checkout.error'))} />
                  </PayPalScriptProvider>
                )}

                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Shield size={12} className="text-brand-400" />{t('checkout.secure')}</span>
                  <span className="flex items-center gap-1"><CheckCircle size={12} className="text-brand-400" />{t('checkout.guarantee')}</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
