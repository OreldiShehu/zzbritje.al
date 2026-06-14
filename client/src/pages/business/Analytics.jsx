import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, Ticket, Eye, Star, Users } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../../api/axios';
import { formatCurrency } from '../../utils/formatters';

const PERIODS = [{ v: '7d', l: '7 Ditë' }, { v: '30d', l: '30 Ditë' }, { v: '90d', l: '3 Muaj' }, { v: '1y', l: '1 Vit' }];
const COLORS = ['#1a3f8a', '#10b981', '#6ee7b7', '#d1fae5'];

export default function BusinessAnalytics() {
  const [period, setPeriod] = useState('30d');

  const { data, isLoading } = useQuery({
    queryKey: ['business', 'analytics', period],
    queryFn: () => api.get(`/analytics/business?period=${period}`).then((r) => r.data.data),
  });

  if (isLoading) return (
    <div className="space-y-4">
      <div className="h-8 w-48 skeleton rounded-xl" />
      <div className="grid grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}</div>
      <div className="h-64 skeleton rounded-2xl" />
    </div>
  );

  const stats = data?.summary || {};
  const chartData = data?.chartData || [];
  const dealBreakdown = data?.dealBreakdown || [];
  const conversionData = data?.conversion || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analizat</h1>
          <p className="text-gray-500 text-sm">Statistikat e performancës së biznesit</p>
        </div>
        <div className="flex gap-2">
          {PERIODS.map(({ v, l }) => (
            <button key={v} onClick={() => setPeriod(v)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${period === v ? 'bg-brand-600 text-white shadow-brand' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>{l}</button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: 'Të Ardhura', value: formatCurrency(stats.revenue || 0), change: stats.revenueChange, color: 'text-brand-600', bg: 'bg-brand-50' },
          { icon: Ticket, label: 'Kupon Shitje', value: stats.vouchersSold || 0, change: stats.vouchersChange, color: 'text-blue-600', bg: 'bg-blue-50' },
          { icon: Eye, label: 'Shikime', value: (stats.views || 0).toLocaleString(), change: stats.viewsChange, color: 'text-purple-600', bg: 'bg-purple-50' },
          { icon: Star, label: 'Vlerësim Mesatar', value: `${(stats.rating || 0).toFixed(1)}/5`, sub: `${stats.reviews || 0} recensione`, color: 'text-amber-500', bg: 'bg-amber-50' },
        ].map(({ icon: Icon, label, value, change, color, bg, sub }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
            <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">{value}</p>
              <p className="text-sm text-gray-600">{label}</p>
              {change != null && <span className={`text-xs font-bold ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>{change >= 0 ? '+' : ''}{change}%</span>}
              {sub && <p className="text-xs text-gray-400">{sub}</p>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="card p-6">
        <h3 className="font-bold text-gray-900 mb-5">Të Ardhurat & Kupona</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1a3f8a" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1a3f8a" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="vchr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v, n) => [n === 'revenue' ? formatCurrency(v) : v, n === 'revenue' ? 'Të Ardhura' : 'Kupon']} />
            <Legend />
            <Area yAxisId="left" type="monotone" dataKey="revenue" name="Të Ardhura" stroke="#1a3f8a" strokeWidth={2} fill="url(#rev)" />
            <Area yAxisId="right" type="monotone" dataKey="vouchers" name="Kupon" stroke="#10b981" strokeWidth={2} fill="url(#vchr)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deal Breakdown */}
        {dealBreakdown.length > 0 && (
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-5">Top Deal-et (Shitje)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dealBreakdown.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="title" width={120} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="sold" name="Voucher" fill="#1a3f8a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Conversion */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-5">Konvertimi</h3>
          <div className="space-y-4">
            {[
              { label: 'Shikime → Klikime', rate: conversionData.clickRate || 0, color: 'bg-blue-500' },
              { label: 'Klikime → Blerje', rate: conversionData.purchaseRate || 0, color: 'bg-brand-600' },
              { label: 'Klientë që Kthehen', rate: conversionData.returnRate || 0, color: 'bg-purple-600' },
            ].map(({ label, rate, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-bold text-gray-900">{rate.toFixed(1)}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${rate}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full ${color} rounded-full`} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-black text-brand-600">{(conversionData.avgOrderValue || 0).toLocaleString()} L</p>
              <p className="text-xs text-gray-500">Shitje Mesatare</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-purple-600">{conversionData.repeatCustomers || 0}%</p>
              <p className="text-xs text-gray-500">Klientë Besnik</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
