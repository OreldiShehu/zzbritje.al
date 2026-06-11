import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Ticket, Eye, Star, ArrowRight, Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import { formatCurrency, formatDate } from '../../utils/formatters';
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

export default function BusinessDashboard() {
  const { user } = useAuthStore();

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

  return (
    <div className="space-y-6">
      {/* Verification Banner */}
      {!isVerified && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-4 flex items-start gap-4 ${isPending ? 'bg-amber-50 border border-amber-200' : 'bg-red-50 border border-red-200'}`}>
          {isPending ? <Clock size={20} className="text-amber-600 flex-shrink-0 mt-0.5" /> : <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />}
          <div className="flex-1">
            <p className={`font-bold text-sm ${isPending ? 'text-amber-800' : 'text-red-700'}`}>
              {isPending ? 'Biznesi juaj është nën shqyrtim' : 'Biznesi juaj nuk është verifikuar'}
            </p>
            <p className={`text-xs mt-0.5 ${isPending ? 'text-amber-600' : 'text-red-500'}`}>
              {isPending ? 'Ekipi ynë do të shqyrtojë aplikimet tuaja brenda 24-48 orësh.' : 'Plotësoni profilin e biznesit dhe ngarkoni dokumentet e nevojshme.'}
            </p>
          </div>
          {!isPending && <Link to="/business-dashboard/profile" className="btn-primary text-xs py-2 px-4 flex-shrink-0">Plotëso Profilin</Link>}
        </motion.div>
      )}

      {isVerified && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-brand-gradient rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={18} className="text-emerald-300" />
                <span className="text-green-100 text-sm font-medium">Biznes i Verifikuar</span>
              </div>
              <h2 className="text-2xl font-black">{business?.businessName}</h2>
              <p className="text-green-100 text-sm capitalize">{business?.subscriptionPlan} Plan</p>
            </div>
            <Link to="/business-dashboard/deals/create" className="bg-white text-brand-600 font-bold px-5 py-3 rounded-xl hover:bg-green-50 transition-all flex items-center gap-2 shadow-lg">
              <Plus size={18} />Krijo Deal
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-3 mt-6">
            {[{ label: 'Të Ardhura', value: formatCurrency(stats?.revenue?.total || 0) }, { label: 'Voucher', value: stats?.vouchers?.total || 0 }, { label: 'Shikime', value: (stats?.views || 0).toLocaleString() }, { label: 'Vlerësim', value: `${(business?.averageRating || 0).toFixed(1)} ⭐` }].map(({ label, value }) => (
              <div key={label} className="bg-white/15 rounded-xl p-3 text-center">
                <p className="font-black text-lg">{value}</p>
                <p className="text-green-100 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Të Ardhura (Muaj)" value={formatCurrency(stats?.revenue?.thisMonth || 0)} change={stats?.revenue?.change} color="text-brand-600" bg="bg-brand-50" />
        <StatCard icon={Ticket} label="Voucher Aktiv" value={stats?.vouchers?.active || 0} sub={`${stats?.vouchers?.redeemed || 0} përdorur`} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={Eye} label="Shikime Totale" value={(stats?.views || 0).toLocaleString()} color="text-purple-600" bg="bg-purple-50" />
        <StatCard icon={Star} label="Vlerësim Mesatar" value={`${(business?.averageRating || 0).toFixed(1)}/5`} sub={`${business?.totalReviews || 0} recensione`} color="text-amber-500" bg="bg-amber-50" />
      </div>

      {/* Chart */}
      {stats?.chartData?.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900">Të Ardhurat (30 Ditë)</h3>
            <Link to="/business-dashboard/analytics" className="text-sm text-brand-600 font-medium flex items-center gap-1">
              Shiko Analizat <ArrowRight size={14} />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.chartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [formatCurrency(v), 'Të Ardhura']} />
              <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Deals */}
      {stats?.topDeals?.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Deal-et Top</h3>
            <Link to="/business-dashboard/deals" className="text-sm text-brand-600 font-medium flex items-center gap-1">Të gjitha <ArrowRight size={14} /></Link>
          </div>
          <div className="space-y-3">
            {stats.topDeals.map((deal, i) => (
              <div key={deal._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-bold text-gray-400 w-5">#{i + 1}</span>
                <img src={deal.images?.[0]?.url || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{deal.title}</p>
                  <p className="text-xs text-gray-400">{deal.vouchersSold || 0} voucher shitje</p>
                </div>
                <span className="text-sm font-bold text-brand-600">{formatCurrency(deal.revenue || 0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
