import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Building, Ticket, TrendingUp, AlertCircle, Clock, CheckCircle, Tag, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
        <h1 className="text-2xl font-bold text-gray-100">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm">Pasqyra e plotë e platformës Zbritje.al</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Total Përdorues" value={(stats?.users?.total || 0).toLocaleString()} sub={`+${stats?.users?.new || 0} sot`} change={stats?.users?.change} color="text-blue-400" bg="bg-blue-900/30" to="/admin/users" />
        <KpiCard icon={Building} label="Biznese" value={(stats?.businesses?.total || 0).toLocaleString()} sub={`${stats?.businesses?.pending || 0} në pritje`} color="text-purple-400" bg="bg-purple-900/30" to="/admin/businesses" />
        <KpiCard icon={Tag} label="Deal Aktiv" value={(stats?.deals?.active || 0).toLocaleString()} sub={`${stats?.deals?.pending || 0} shqyrtim`} color="text-amber-400" bg="bg-amber-900/30" to="/admin/deals" />
        <KpiCard icon={Ticket} label="Voucher Sot" value={(stats?.vouchers?.today || 0).toLocaleString()} sub={`${stats?.vouchers?.total || 0} total`} color="text-brand-400" bg="bg-brand-900/30" />
        <KpiCard icon={DollarSign} label="Të Ardhura (Muaj)" value={formatCurrency(stats?.revenue?.thisMonth || 0)} change={stats?.revenue?.change} color="text-green-400" bg="bg-green-900/30" />
        <KpiCard icon={TrendingUp} label="Komisione" value={formatCurrency(stats?.revenue?.commission || 0)} sub="muaji ky" color="text-emerald-400" bg="bg-emerald-900/30" to="/admin/payments" />
        <KpiCard icon={AlertCircle} label="Tickets Hapur" value={stats?.tickets?.open || 0} sub={`${stats?.tickets?.urgent || 0} urgent`} color="text-red-400" bg="bg-red-900/30" to="/admin/support" />
        <KpiCard icon={CheckCircle} label="Rate Konvertimi" value={`${(stats?.conversion || 0).toFixed(1)}%`} color="text-cyan-400" bg="bg-cyan-900/30" />
      </div>

      {/* Revenue Chart */}
      {stats?.chartData?.length > 0 && (
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="font-bold text-gray-100 mb-5">Të Ardhurat (30 Ditë)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={stats.chartData}>
              <defs>
                <linearGradient id="adminRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a3f8a" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#1a3f8a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: '#f3f4f6' }} formatter={(v) => [formatCurrency(v), 'Të Ardhura']} />
              <Area type="monotone" dataKey="revenue" stroke="#1a3f8a" strokeWidth={2} fill="url(#adminRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pending Actions */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="font-bold text-gray-100 mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-400" />Veprime të Nevojshme
          </h3>
          <div className="space-y-3">
            {[
              { icon: Building, label: 'Biznese në pritje verifikimi', count: stats?.businesses?.pending, to: '/admin/businesses', color: 'text-purple-400' },
              { icon: Tag, label: 'Deal-e në shqyrtim', count: stats?.deals?.pending, to: '/admin/deals', color: 'text-amber-400' },
              { icon: AlertCircle, label: 'Ticket-e Urgent', count: stats?.tickets?.urgent, to: '/admin/support', color: 'text-red-400' },
            ].filter(({ count }) => count > 0).map(({ icon: Icon, label, count, to, color }) => (
              <Link key={to} to={to} className="flex items-center justify-between p-3 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors">
                <div className="flex items-center gap-3"><Icon size={16} className={color} /><span className="text-sm text-gray-200">{label}</span></div>
                <span className={`text-sm font-bold ${color}`}>{count}</span>
              </Link>
            ))}
            {!stats?.businesses?.pending && !stats?.deals?.pending && !stats?.tickets?.urgent && (
              <div className="text-center py-6 text-gray-500 text-sm">
                <CheckCircle size={24} className="mx-auto mb-2 text-green-500" />Asgjë ne pritje!
              </div>
            )}
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="font-bold text-gray-100 mb-4">Regjistrime të Fundit</h3>
          {stats?.recentUsers?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentUsers.slice(0, 5).map((u) => (
                <div key={u._id} className="flex items-center gap-3">
                  <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.firstName}&background=1f2937&color=1a3f8a&size=36`} alt="" className="w-9 h-9 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-gray-500">{formatDate(u.createdAt)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'business' ? 'bg-purple-900/50 text-purple-400' : 'bg-gray-700 text-gray-400'}`}>{u.role}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">Nuk ka regjistrime sot</div>
          )}
        </div>
      </div>
    </div>
  );
}
