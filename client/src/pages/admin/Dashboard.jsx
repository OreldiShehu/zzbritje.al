import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Building, Ticket, TrendingUp, AlertCircle, CheckCircle, Tag, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Link } from 'react-router-dom';

function KpiCard({ icon: Icon, label, value, sub, change, color, bg, to }) {
  const content = (
    <motion.div whileHover={{ y: -2 }} className="stat-card cursor-pointer">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}><Icon size={22} className={color} /></div>
      <div className="flex-1">
        <p className="text-2xl font-black text-gray-200">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
      {change != null && <div className={`text-xs font-bold px-2 py-1 rounded-full ${change >= 0 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>{change >= 0 ? '+' : ''}{change}%</div>}
    </motion.div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

export default function AdminDashboard() {
  const { t } = useTranslation();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get('/admin/dashboard').then((r) => r.data.data),
  });

  if (isLoading) return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 bg-gray-800 skeleton rounded-2xl" />)}</div>
      <div className="h-64 bg-gray-800 skeleton rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">{t('admin.dashboard')}</h1>
        <p className="text-gray-500 text-sm">{t('admin.platform_overview')}</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users} label={t('admin.total_users')} value={(stats?.summary?.totalUsers || 0).toLocaleString()} sub={`+${stats?.summary?.newUsersThisMonth || 0} ${t('dashboard.this_month', t('dashboard.earned'))}`} color="text-blue-400" bg="bg-blue-900/30" to="/admin/users" />
        <KpiCard icon={Building} label={t('admin.businesses_label')} value={(stats?.summary?.totalBusinesses || 0).toLocaleString()} sub={`${stats?.summary?.pendingBusinesses || 0} ${t('common.pending')}`} color="text-purple-400" bg="bg-purple-900/30" to="/admin/businesses" />
        <KpiCard icon={Tag} label={t('admin.active_deals')} value={(stats?.summary?.activeDeals || 0).toLocaleString()} sub={`${stats?.summary?.totalDeals || 0} total`} color="text-amber-400" bg="bg-amber-900/30" to="/admin/deals" />
        <KpiCard icon={Ticket} label={t('nav.my_vouchers')} value={(stats?.summary?.totalVouchers || 0).toLocaleString()} color="text-brand-400" bg="bg-brand-900/30" />
        <KpiCard icon={DollarSign} label={t('admin.revenue')} value={formatCurrency(stats?.summary?.platformRevenue || 0)} color="text-green-400" bg="bg-green-900/30" />
        <KpiCard icon={TrendingUp} label={t('business.revenue_label')} value={formatCurrency(stats?.summary?.platformRevenue || 0)} sub="total" color="text-emerald-400" bg="bg-emerald-900/30" to="/admin/payments" />
        <KpiCard icon={AlertCircle} label={t('admin.tickets')} value={stats?.summary?.openTickets || 0} color="text-red-400" bg="bg-red-900/30" to="/admin/support" />
        <KpiCard icon={CheckCircle} label={t('admin.verified')} value={(stats?.summary?.totalBusinesses || 0) - (stats?.summary?.pendingBusinesses || 0)} color="text-cyan-400" bg="bg-cyan-900/30" />
      </div>

      {/* Revenue Chart */}
      {stats?.charts?.dailyRevenue?.length > 0 && (
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="font-bold text-gray-100 mb-5">{t('business.revenue_30d')}</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={stats.charts.dailyRevenue}>
              <defs>
                <linearGradient id="adminRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a3f8a" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#1a3f8a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: '#f3f4f6' }} formatter={(v) => [formatCurrency(v), t('admin.revenue')]} />
              <Area type="monotone" dataKey="revenue" stroke="#1a3f8a" strokeWidth={2} fill="url(#adminRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pending Actions */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="font-bold text-gray-100 mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-400" />{t('admin.pending_actions')}
          </h3>
          <div className="space-y-3">
            {[
              { icon: Building, label: t('admin.businesses_label'), count: stats?.summary?.pendingBusinesses, to: '/admin/businesses', color: 'text-purple-400' },
              { icon: AlertCircle, label: t('admin.tickets'), count: stats?.summary?.openTickets, to: '/admin/support', color: 'text-red-400' },
            ].filter(({ count }) => count > 0).map(({ icon: Icon, label, count, to, color }) => (
              <Link key={to} to={to} className="flex items-center justify-between p-3 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors">
                <div className="flex items-center gap-3"><Icon size={16} className={color} /><span className="text-sm text-gray-200">{label}</span></div>
                <span className={`text-sm font-bold ${color}`}>{count}</span>
              </Link>
            ))}
            {!stats?.summary?.pendingBusinesses && !stats?.summary?.openTickets && (
              <div className="text-center py-6 text-gray-500 text-sm">
                <CheckCircle size={24} className="mx-auto mb-2 text-green-500" />{t('admin.no_pending')}
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="font-bold text-gray-100 mb-4">{t('admin.recent_transactions')}</h3>
          {stats?.recentTransactions?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentTransactions.slice(0, 5).map((tx) => (
                <div key={tx._id} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-brand-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                    <DollarSign size={14} className="text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{tx.user?.firstName} {tx.user?.lastName}</p>
                    <p className="text-xs text-gray-500 truncate">{tx.deal?.title}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-green-400">{formatCurrency(tx.commissionAmount || 0)}</p>
                    <p className="text-xs text-gray-500">{formatDate(tx.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">{t('admin.no_transactions')}</div>
          )}
        </div>
      </div>
    </div>
  );
}
