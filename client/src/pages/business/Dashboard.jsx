import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, Ticket, Eye, Star, ArrowRight, Plus,
  AlertCircle, CheckCircle, Clock, Banknote, Building2, Info, Crown,
} from 'lucide-react';

const WA_NUMBER = '355692866668';
const WA_MSG = encodeURIComponent('Përshëndetje, dua të kaloj në planin Pro (1,500 ALL/muaj) për biznesin tim në Zbritje.al');
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${WA_MSG}`;
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { formatCurrency } from '../../utils/formatters';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function StatCard({ icon: Icon, label, value, sub, color, bg, change }) {
  return (
    <div className="stat-card">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon size={22} className={color} />
      </div>
      <div className="flex-1">
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {change != null && (
        <div className={`text-xs font-bold px-2 py-1 rounded-full ${change >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
          {change >= 0 ? '+' : ''}{change}%
        </div>
      )}
    </div>
  );
}

function EarningsRow({ label, value, sub, highlight, deduct, info }) {
  return (
    <div className={`flex items-center justify-between py-3 ${highlight ? 'border-t-2 border-gray-200 mt-1 pt-4' : 'border-b border-gray-100'}`}>
      <div>
        <p className={`text-sm font-medium ${highlight ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{label}</p>
        {info && <p className="text-xs text-gray-400 mt-0.5">{info}</p>}
      </div>
      <p className={`font-bold text-base ${highlight ? 'text-xl text-green-600' : deduct ? 'text-red-500' : 'text-gray-900'}`}>
        {deduct ? '-' : ''}{value}
      </p>
    </div>
  );
}

export default function BusinessDashboard() {
  const { t } = useTranslation();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['business', 'stats'],
    queryFn: () => api.get('/businesses/my/stats').then((r) => r.data.data),
  });

  const { data: business } = useQuery({
    queryKey: ['business', 'my'],
    queryFn: () => api.get('/businesses/my').then((r) => r.data.data),
  });

  const isVerified = business?.verificationStatus === 'verified';
  const isPending = business?.verificationStatus === 'pending' || business?.verificationStatus === 'under_review';

  const MARKUP = stats?.markupRate || 0.07;
  const COMMISSION = stats?.commissionRate || 0.10;

  // Per-voucher example using top deal or generic
  const topDeal = stats?.topDeals?.[0];
  const exampleBusinessPrice = topDeal ? Math.round(topDeal.revenue / Math.max(1, topDeal.soldVouchers) / (1 - COMMISSION)) : 4500;
  const exampleCustomerPrice = Math.round(exampleBusinessPrice * (1 + MARKUP));
  const exampleMarkup = exampleCustomerPrice - exampleBusinessPrice;
  const exampleCommission = Math.round(exampleBusinessPrice * COMMISSION);
  const examplePlatformTotal = exampleMarkup + exampleCommission;
  const exampleBusinessNet = exampleBusinessPrice - exampleCommission;

  const revenue = stats?.revenue || {};
  const vouchersSold = revenue.vouchersSold || stats?.vouchers?.total || 0;

  return (
    <div className="space-y-6">
      {/* Free plan banner */}
      {isVerified && business?.plan === 'free' && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 bg-amber-50 border border-amber-200 flex items-center gap-4">
          <Crown size={20} className="text-amber-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-amber-800">Plan Falas — 2 deals, 10 vouchers max</p>
            <p className="text-xs text-amber-600 mt-0.5">Kaloni në Pro (1,500 ALL/muaj) për 20+ deals dhe vouchers të pakufizuara.</p>
          </div>
          <a href={WA_URL} target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Upgrade Pro
          </a>
        </motion.div>
      )}

      {/* Verification Banner */}
      {!isVerified && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-4 flex items-start gap-4 ${isPending ? 'bg-amber-50 border border-amber-200' : 'bg-red-50 border border-red-200'}`}>
          {isPending
            ? <Clock size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            : <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />}
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-sm ${isPending ? 'text-amber-800' : 'text-red-700'}`}>
              {isPending ? 'Profili juaj pret verifikimin' : t('business.not_verified_title')}
            </p>
            <p className={`text-xs mt-0.5 ${isPending ? 'text-amber-600' : 'text-red-500'}`}>
              {isPending
                ? 'Admini do ta shqyrtojë dhe aprovojë biznesin tuaj. Mund të na njoftoni në WhatsApp për t\'u procesuar më shpejt.'
                : t('business.not_verified_desc')}
            </p>
          </div>
          {isPending ? (
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Përshëndetje, biznesi im në Zbritje.al është gati dhe pret verifikimin. Ju lutem shqyrtojeni sa më shpejt. Faleminderit!')}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors whitespace-nowrap">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Na njoftoni
            </a>
          ) : (
            <Link to="/business-dashboard/profile" className="btn-primary text-xs py-2 px-4 flex-shrink-0">
              {t('business.complete_profile')}
            </Link>
          )}
        </motion.div>
      )}

      {/* Header banner */}
      {isVerified && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-brand-gradient rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={18} className="text-emerald-300" />
                <span className="text-blue-100 text-sm font-medium">{t('business.verified')}</span>
              </div>
              <h2 className="text-2xl font-black">{business?.name}</h2>
              <p className="text-blue-100 text-sm capitalize">{business?.plan || 'free'} Plan</p>
            </div>
            <Link to="/business-dashboard/deals/create"
              className="bg-white text-brand-600 font-bold px-5 py-3 rounded-xl hover:bg-brand-50 transition-all flex items-center gap-2 shadow-lg">
              <Plus size={18} />{t('business.create_deal_btn')}
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { label: 'Fitimi neto', value: formatCurrency(revenue.businessNet || 0) },
              { label: 'Voucher të shitura', value: vouchersSold },
              { label: 'Vizita', value: (stats?.views || 0).toLocaleString() },
              { label: 'Vlerësim', value: `${(business?.averageRating || 0).toFixed(1)} ⭐` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/15 rounded-xl p-3 text-center">
                <p className="font-black text-lg">{value}</p>
                <p className="text-blue-100 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Fitimi këtë muaj" value={formatCurrency(revenue.thisMonth || 0)} change={revenue.change} color="text-brand-600" bg="bg-brand-50" />
        <StatCard icon={Ticket} label={t('business.active_vouchers_label')} value={stats?.vouchers?.active || 0} sub={`${stats?.vouchers?.redeemed || 0} të përdorura`} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={Eye} label={t('business.total_views')} value={(stats?.views || 0).toLocaleString()} color="text-purple-600" bg="bg-purple-50" />
        <StatCard icon={Star} label={t('business.avg_rating')} value={`${(business?.averageRating || 0).toFixed(1)}/5`} sub={`${business?.totalReviews || 0} ${t('business.reviews_label')}`} color="text-amber-500" bg="bg-amber-50" />
      </div>

      {/* ====== EARNINGS BREAKDOWN ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Totals so far */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
              <Banknote size={18} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Totali i Fitimeve</h3>
              <p className="text-xs text-gray-500">{vouchersSold} voucher të shitura deri tani</p>
            </div>
          </div>

          <EarningsRow
            label="Klientët paguan (cash tek ti)"
            info="Çmimi që klientët paguan direkt tek biznesi juaj"
            value={formatCurrency(revenue.totalCollected || 0)}
          />
          <EarningsRow
            label="Platforma merr (markup 7%)"
            info="Shtesa 7% e çmimit tënd — i mbledhur nga klienti"
            value={formatCurrency((revenue.totalCollected || 0) - (revenue.commissionPaid || 0) - (revenue.businessNet || 0))}
            deduct
          />
          <EarningsRow
            label="Platforma merr (komision 10%)"
            info="10% e çmimit tuaj bazë — paguhet platformës"
            value={formatCurrency(revenue.commissionPaid || 0)}
            deduct
          />
          <EarningsRow
            label="Fitimi juaj neto"
            info="Shuma që ju mbetet pas të gjitha zbritjeve"
            value={formatCurrency(revenue.businessNet || 0)}
            highlight
          />

          <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 rounded-xl">
            <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              <strong>Si funksionon cash:</strong> Klienti paguan çmimin e plotë direkt tek biznesi juaj kur paraqet voucherin. Platforma lëshon faturë mujore për komisionin.
            </p>
          </div>
        </div>

        {/* Per-voucher math */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center">
              <Building2 size={18} className="text-brand-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Llogaritja për 1 Voucher</h3>
              <p className="text-xs text-gray-500">Shembull bazuar në çmimin tuaj</p>
            </div>
          </div>

          <EarningsRow
            label="Çmimi që vendos ti (bazë)"
            value={formatCurrency(exampleBusinessPrice)}
          />
          <EarningsRow
            label={`+ Markup platformës (${Math.round(MARKUP * 100)}%)`}
            info="Shtesa që platforma vendos — klient e paguan këtë"
            value={formatCurrency(exampleMarkup)}
          />
          <div className="py-2 px-3 bg-brand-50 rounded-xl my-2 flex justify-between items-center">
            <p className="text-sm font-bold text-brand-700">Klienti paguan</p>
            <p className="text-base font-black text-brand-700">{formatCurrency(exampleCustomerPrice)}</p>
          </div>
          <EarningsRow
            label={`− Komision platformës (${Math.round(COMMISSION * 100)}%)`}
            info="10% e çmimit tuaj bazë, i zbritur nga fitimi juaj"
            value={formatCurrency(exampleCommission)}
            deduct
          />
          <EarningsRow
            label="Ti fiton neto"
            value={formatCurrency(exampleBusinessNet)}
            highlight
          />

          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-xs text-red-500 font-medium">Platforma merr gjithsej</p>
              <p className="font-black text-red-600 text-lg">{formatCurrency(examplePlatformTotal)}</p>
              <p className="text-xs text-red-400">({exampleMarkup} markup + {exampleCommission} komision)</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-xs text-green-600 font-medium">Ti merr cash</p>
              <p className="font-black text-green-700 text-lg">{formatCurrency(exampleCustomerPrice)}</p>
              <p className="text-xs text-green-500">nga klienti direkt</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {stats?.chartData?.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900">{t('business.revenue_30d')}</h3>
            <Link to="/business-dashboard/analytics" className="text-sm text-brand-600 font-medium flex items-center gap-1">
              {t('business.view_analytics')} <ArrowRight size={14} />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.chartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a3f8a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1a3f8a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [formatCurrency(v), 'Fitim neto']} />
              <Area type="monotone" dataKey="revenue" stroke="#1a3f8a" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Deals */}
      {stats?.topDeals?.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">{t('business.top_deals')}</h3>
            <Link to="/business-dashboard/deals" className="text-sm text-brand-600 font-medium flex items-center gap-1">
              {t('business.see_all_btn')} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.topDeals.map((deal, i) => (
              <div key={deal._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-bold text-gray-400 w-5">#{i + 1}</span>
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {deal.images?.[0]?.url
                    ? <img src={deal.images[0].url} alt="" className="w-full h-full object-cover" />
                    : <Ticket size={16} className="text-brand-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{deal.title}</p>
                  <p className="text-xs text-gray-400">{deal.soldVouchers || 0} voucher të shitura</p>
                </div>
                <span className="text-sm font-bold text-brand-600">{formatCurrency(deal.revenue || 0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !stats?.topDeals?.length && !revenue.totalCollected && (
        <div className="card p-10 text-center">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={28} className="text-brand-400" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Ende nuk keni shitje</h3>
          <p className="text-gray-500 text-sm mb-5">Krijoni deal-in tuaj të parë dhe filloni të fitoni.</p>
          <Link to="/business-dashboard/deals/create" className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Krijo Deal
          </Link>
        </div>
      )}
    </div>
  );
}
