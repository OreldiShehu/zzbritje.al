import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ticket, Heart, Wallet, TrendingUp, Gift, Bell, ArrowRight, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { LOYALTY_LEVELS } from '../../utils/constants';

function StatCard({ icon: Icon, label, value, sub, color, bg, to }) {
  const content = (
    <div className="stat-card hover:-translate-y-0.5 transition-transform">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon size={22} className={color} />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
  return to ? <Link to={to} className="block">{content}</Link> : content;
}

export default function CustomerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const { data: stats } = useQuery({
    queryKey: ['user', 'stats'],
    queryFn: () => api.get('/users/stats').then((r) => r.data.data),
  });

  const { data: recentVouchers } = useQuery({
    queryKey: ['vouchers', 'recent'],
    queryFn: () => api.get('/vouchers/my?limit=5').then((r) => r.data.data),
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: () => api.get('/users/notifications?limit=5').then((r) => r.data),
  });

  const loyalty = LOYALTY_LEVELS[user?.loyaltyLevel || 'bronze'];
  const nextLevel = Object.entries(LOYALTY_LEVELS).find(([, v]) => v.min > (user?.loyaltyPoints || 0));
  const progressToNext = nextLevel ? Math.min(100, ((user?.loyaltyPoints || 0) - loyalty.min) / (nextLevel[1].min - loyalty.min) * 100) : 100;

  const voucherStatusLabel = (status) => {
    if (status === 'active') return t('dashboard.voucher_valid');
    if (status === 'redeemed') return t('dashboard.voucher_used');
    return t('dashboard.voucher_expired');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand-gradient rounded-3xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}&background=fff&color=1a3f8a&size=48`}
              alt="" className="w-12 h-12 rounded-full border-2 border-white/30" />
            <div>
              <p className="font-bold text-lg">{t('dashboard.greeting', { name: user?.firstName })}</p>
              <p className="text-blue-100 text-sm">{loyalty.icon} {loyalty.label} Member</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <p className="text-xl font-black">{formatCurrency(user?.walletBalance || 0)}</p>
              <p className="text-blue-100 text-xs">{t('dashboard.wallet_label')}</p>
            </div>
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <p className="text-xl font-black">{(user?.loyaltyPoints || 0).toLocaleString()}</p>
              <p className="text-blue-100 text-xs">{t('dashboard.loyalty_points')}</p>
            </div>
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <p className="text-xl font-black">{formatCurrency(user?.totalSaved || 0)}</p>
              <p className="text-blue-100 text-xs">{t('dashboard.total_saved')}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Ticket} label={t('dashboard.active_vouchers_label')} value={stats?.vouchers?.active || 0} color="text-brand-600" bg="bg-brand-50" to="/dashboard/vouchers" />
        <StatCard icon={ShoppingBag} label={t('dashboard.used_vouchers_label')} value={stats?.vouchers?.redeemed || 0} sub="total" color="text-blue-600" bg="bg-blue-50" to="/dashboard/vouchers" />
        <StatCard icon={Heart} label={t('dashboard.favorites_label')} value={stats?.favorites || 0} color="text-red-500" bg="bg-red-50" to="/dashboard/favorites" />
        <StatCard icon={Gift} label={t('dashboard.referrals_label')} value={stats?.referrals?.count || 0} sub={`${formatCurrency(stats?.referrals?.earnings || 0)} ${t('dashboard.earned')}`} color="text-purple-600" bg="bg-purple-50" to="/dashboard/referrals" />
      </div>

      {/* Loyalty Progress */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">{t('dashboard.loyalty_progress')}</h3>
          <span className="badge badge-green">{loyalty.icon} {loyalty.label}</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressToNext}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-brand-gradient rounded-full"
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{user?.loyaltyPoints?.toLocaleString() || 0} {t('dashboard.loyalty_points').toLowerCase()}</span>
          {nextLevel && <span>{nextLevel[1].min.toLocaleString()} → {nextLevel[1].label} {nextLevel[1].icon}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Vouchers */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">{t('dashboard.recent_vouchers')}</h3>
            <Link to="/dashboard/vouchers" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
              {t('dashboard.see_all')} <ArrowRight size={14} />
            </Link>
          </div>
          {recentVouchers?.length > 0 ? (
            <div className="space-y-3">
              {recentVouchers.slice(0, 4).map((v) => (
                <div key={v._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <img src={v.deal?.images?.[0]?.url || 'https://via.placeholder.com/48'} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{v.deal?.title}</p>
                    <p className="text-xs text-gray-400">{formatDate(v.purchasedAt)}</p>
                  </div>
                  <span className={`badge text-xs ${v.status === 'active' ? 'badge-green' : v.status === 'redeemed' ? 'badge-blue' : 'badge-gray'}`}>
                    {voucherStatusLabel(v.status)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Ticket size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">{t('dashboard.no_vouchers_yet')}</p>
              <Link to="/search" className="btn-primary text-xs py-2 px-4 mt-3 inline-flex">{t('dashboard.browse_offers')}</Link>
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">{t('dashboard.recent_notifications')}</h3>
            <Link to="/dashboard/notifications" className="text-sm text-brand-600 font-medium flex items-center gap-1">{t('dashboard.see_all')} <ArrowRight size={14} /></Link>
          </div>
          {notifications?.data?.length > 0 ? (
            <div className="space-y-3">
              {notifications.data.map((n) => (
                <div key={n._id} className={`flex gap-3 p-3 rounded-xl transition-colors ${n.isRead ? 'bg-gray-50' : 'bg-brand-50 border border-brand-100'}`}>
                  <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bell size={16} className="text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                    <p className="text-xs text-gray-500 truncate">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <span className="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0 mt-1" />}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Bell size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">{t('dashboard.no_notifications')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
