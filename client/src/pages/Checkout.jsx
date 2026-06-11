import { useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Shield, CheckCircle, ArrowLeft, Tag, Clock, Ticket } from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { formatCurrency, formatDate, getImageUrl } from '../utils/formatters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { t } = useTranslation();
  const { dealId: dealSlug } = useParams();
  const [searchParams] = useSearchParams();
  const qty = parseInt(searchParams.get('qty') || '1', 10);
  const dealId = searchParams.get('dealId');
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [agreed, setAgreed] = useState(false);

  const { data: deal, isLoading, error } = useQuery({
    queryKey: ['deal-checkout', dealSlug],
    queryFn: () => api.get(`/deals/${dealSlug}`).then((r) => r.data.data),
    retry: 1,
  });

  const purchase = useMutation({
    mutationFn: () => api.post('/vouchers/purchase', {
      dealId: dealId || deal?._id,
      quantity: qty,
      paymentMethod,
    }),
    onSuccess: () => {
      toast.success(t('checkout.success'));
      navigate('/dashboard/vouchers', { state: { newVoucher: true } });
    },
    onError: (e) => {
      toast.error(e.response?.data?.message || t('checkout.error'));
    },
  });

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner size="lg" text={t('common.loading')} />
    </div>
  );

  if (error || !deal) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Tag size={48} className="text-red-400" />
      <h2 className="text-xl font-bold text-gray-900">{t('deal.not_found')}</h2>
      <Link to="/search" className="btn-primary">{t('dashboard.browse_deals')}</Link>
    </div>
  );

  const subtotal = deal.discountedPrice * qty;
  const savings = deal.savingsAmount * qty;
  const image = deal.images?.[0]?.url;

  const paymentOptions = [
    { id: 'cash', label: t('checkout.cash'), desc: t('checkout.cash_desc') },
    { id: 'card', label: t('checkout.card'), desc: t('checkout.card_desc') },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container-custom max-w-4xl">
        {/* Back */}
        <Link to={`/deals/${deal.slug}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft size={16} />{t('checkout.back')}
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('checkout.title')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT: Deal summary + payment */}
          <div className="lg:col-span-3 space-y-4">
            {/* Deal card */}
            <div className="card p-5 flex gap-4">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {image ? (
                  <img src={getImageUrl(image, 200)} alt={deal.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-50 to-blue-50">
                    <p className="text-xl font-black text-brand-200">-{Math.round(deal.discountPercentage)}%</p>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-brand-600 font-medium mb-1">{deal.business?.name}</p>
                <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2">{deal.title}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock size={12} />
                  <span>{t('checkout.expires_label')} {formatDate(deal.endDate)}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <Ticket size={12} />
                  <span>{deal.remainingVouchers} {t('checkout.remaining_label')}</span>
                </div>
              </div>
            </div>

            {/* Order details */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">{t('checkout.deal_summary')}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{t('checkout.original_price')} × {qty}</span>
                  <span className="line-through text-gray-400">{formatCurrency(deal.originalPrice * qty)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t('checkout.discounted_price')} × {qty}</span>
                  <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-green-600 font-medium">
                  <span>{t('checkout.save')}</span>
                  <span>-{formatCurrency(savings)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-base font-bold text-gray-900">
                  <span>{t('checkout.total')}</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">{t('checkout.payment_method')}</h3>
              <div className="space-y-2">
                {paymentOptions.map(({ id, label, desc }) => (
                  <label key={id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'} ${id === 'card' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value={id}
                      checked={paymentMethod === id}
                      onChange={() => id !== 'card' && setPaymentMethod(id)}
                      disabled={id === 'card'}
                      className="accent-brand-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 accent-brand-600"
              />
              <span className="text-sm text-gray-600">
                {t('checkout.terms_agree')} <Link to="/terms" className="text-brand-600 hover:underline">{t('checkout.terms_link')}</Link> {t('checkout.terms_confirm')}
              </span>
            </label>
          </div>

          {/* RIGHT: Order summary + CTA */}
          <div className="lg:col-span-2">
            <div className="card p-5 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">{t('checkout.summary')}</h3>

              {/* Buyer info */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-700 font-bold text-sm">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex justify-between">
                  <span>{t('checkout.qty')}</span>
                  <span className="font-medium text-gray-900">{qty} voucher</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('checkout.discount')}</span>
                  <span className="font-medium text-red-500">-{Math.round(deal.discountPercentage)}%</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold text-gray-900">{t('checkout.total')}</span>
                  <span className="font-bold text-brand-700 text-lg">{formatCurrency(subtotal)}</span>
                </div>
              </div>

              <button
                onClick={() => purchase.mutate()}
                disabled={!agreed || purchase.isPending}
                className="btn-primary w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {purchase.isPending ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><ShoppingCart size={18} />{t('checkout.confirm_btn')}</>
                )}
              </button>

              <div className="mt-4 space-y-2 text-xs text-gray-400">
                <div className="flex items-center gap-2"><Shield size={12} className="text-brand-400" />{t('checkout.secure')}</div>
                <div className="flex items-center gap-2"><CheckCircle size={12} className="text-brand-400" />{t('checkout.guarantee')}</div>
                <div className="flex items-center gap-2"><Ticket size={12} className="text-brand-400" />{t('checkout.instant')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
