import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Users, Building, Ticket, DollarSign } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../../api/axios';
import { formatCurrency } from '../../utils/formatters';

const PERIODS = [{ v: '7d', l: '7 Ditë' }, { v: '30d', l: '30 Ditë' }, { v: '90d', l: '3 Muaj' }, { v: '1y', l: '1 Vit' }];
const PIE_COLORS = ['#1a3f8a', '#10b981', '#6ee7b7', '#a7f3d0', '#d1fae5'];

export default function AdminAnalytics() {
  const [period, setPeriod] = useState('30d');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'analytics', period],
    queryFn: () => api.get(`/analytics/admin?period=${period}`).then((r) => r.data.data),
  });

  const summary = data?.summary || {};
  const chartData = data?.chartData || [];
  const cityData = data?.cityBreakdown || [];
  const categoryData = data?.categoryBreakdown || [];
  const cohortData = data?.userCohorts || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Analizat e Platformës</h1>
          <p className="text-gray-500 text-sm">Statistikat globale të Zbritje.al</p>
        </div>
        <div className="flex gap-2">
          {PERIODS.map(({ v, l }) => (
            <button key={v} onClick={() => setPeriod(v)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${period === v ? 'bg-brand-600 text-white' : 'border border-gray-600 text-gray-300 hover:bg-gray-700'}`}>{l}</button>
          ))}
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: DollarSign, label: 'Të Ardhura Totale', value: formatCurrency(summary.totalRevenue || 0), color: 'text-green-400', bg: 'bg-green-900/20' },
          { icon: TrendingUp, label: 'Komisione', value: formatCurrency(summary.commission || 0), color: 'text-brand-400', bg: 'bg-brand-900/20' },
          { icon: Users, label: 'Përdorues Aktiv', value: (summary.activeUsers || 0).toLocaleString(), color: 'text-blue-400', bg: 'bg-blue-900/20' },
          { icon: Building, label: 'Biznese Aktive', value: (summary.activeBusinesses || 0).toLocaleString(), color: 'text-purple-400', bg: 'bg-purple-900/20' },
          { icon: Ticket, label: 'Voucher Shitje', value: (summary.vouchersSold || 0).toLocaleString(), color: 'text-amber-400', bg: 'bg-amber-900/20' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className={`${bg} border border-gray-700 rounded-2xl p-4 flex items-center gap-3`}>
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-600`}><Icon size={18} className={color} /></div>
            <div><p className="font-black text-gray-100 text-lg">{value}</p><p className="text-xs text-gray-500">{label}</p></div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <h3 className="font-bold text-gray-100 mb-5">Të Ardhurat & Regjistrimet</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gr1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1a3f8a" stopOpacity={0.3} /><stop offset="95%" stopColor="#1a3f8a" stopOpacity={0} /></linearGradient>
              <linearGradient id="gr2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#6b7280' }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#6b7280' }} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: '#f3f4f6' }} />
            <Legend wrapperStyle={{ color: '#9ca3af' }} />
            <Area yAxisId="left" type="monotone" dataKey="revenue" name="Të Ardhura" stroke="#1a3f8a" strokeWidth={2} fill="url(#gr1)" />
            <Area yAxisId="right" type="monotone" dataKey="registrations" name="Regjistrime" stroke="#3b82f6" strokeWidth={2} fill="url(#gr2)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* City Breakdown */}
        {cityData.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h3 className="font-bold text-gray-100 mb-5">Shitjet sipas Qytetit</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={cityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="city" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: '#f3f4f6' }} />
                <Bar dataKey="revenue" name="Të Ardhura" fill="#1a3f8a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category Pie */}
        {categoryData.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h3 className="font-bold text-gray-100 mb-5">Shitjet sipas Kategorisë</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} dataKey="revenue" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#4b5563' }}>
                  {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: '#f3f4f6' }} formatter={(v) => [formatCurrency(v)]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
