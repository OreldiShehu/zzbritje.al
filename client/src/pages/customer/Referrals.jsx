import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Gift, Copy, Users, TrendingUp, Share2, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function CustomerReferrals() {
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const { data } = useQuery({
    queryKey: ['user', 'referrals'],
    queryFn: () => api.get('/users/referrals').then((r) => r.data),
  });

  const referralLink = `${window.location.origin}/register?ref=${user?.referralCode}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Linku u kopjua!');
    setTimeout(() => setCopied(false), 3000);
  };

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: 'Zbritje.al - Kurseni Tani!', text: 'Regjistrohu me kodin tim referimi dhe merr 200 ALL bonus!', url: referralLink });
    } else copyLink();
  };

  const referrals = data?.data || [];
  const stats = data?.stats || {};

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Programi i Referimeve</h1>
        <p className="text-gray-500 text-sm">Ftoni miq dhe fitoni së bashku</p>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-brand-gradient rounded-3xl p-8 text-white mb-6 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="relative">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-black mb-2">Ftoni & Fitoni 200 ALL</h2>
          <p className="text-blue-100 mb-6">Për çdo mik që regjistrohet me kodin tuaj, ju dhe ai merrni 200 ALL bonus në portofol!</p>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/15 rounded-xl p-3">
              <p className="font-black text-2xl">{stats.totalReferrals || 0}</p>
              <p className="text-blue-100 text-xs">Referime</p>
            </div>
            <div className="bg-white/15 rounded-xl p-3">
              <p className="font-black text-2xl">{stats.qualified || 0}</p>
              <p className="text-blue-100 text-xs">Aktive</p>
            </div>
            <div className="bg-white/15 rounded-xl p-3">
              <p className="font-black text-2xl">{formatCurrency(stats.totalEarned || 0)}</p>
              <p className="text-blue-100 text-xs">Fituar</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Share card */}
      <div className="card p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-4">Kodi & Linku i Referimit</h3>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-400 mb-1">Kodi Juaj</p>
            <p className="font-mono font-bold text-xl tracking-widest text-brand-600">{user?.referralCode}</p>
          </div>
          <button onClick={copyLink} className={`btn-primary px-6 py-3 flex items-center gap-2 ${copied ? 'bg-green-700' : ''}`}>
            {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
            {copied ? 'Kopjuar!' : 'Kopjo'}
          </button>
        </div>
        <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3 mb-4">
          <span className="text-gray-400 text-xs truncate flex-1">{referralLink}</span>
          <button onClick={copyLink} className="text-brand-600 hover:text-brand-700">
            <Copy size={15} />
          </button>
        </div>
        <button onClick={share} className="btn-secondary w-full flex items-center justify-center gap-2">
          <Share2 size={18} />Ndaj Linku
        </button>
      </div>

      {/* Steps */}
      <div className="card p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-4">Si Funksionon?</h3>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Ndani kodin', desc: 'Ndani kodin ose linkun tuaj me miqtë tuaj' },
            { step: '2', title: 'Miku regjistrohet', desc: 'Miku regjistrohet me kodin tuaj dhe bën blerjen e parë' },
            { step: '3', title: 'Fitoni 200 ALL', desc: 'Ju dhe miku merrni secili 200 ALL bonus në portofol' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex items-start gap-4">
              <div className="w-9 h-9 bg-brand-600 text-white rounded-full flex items-center justify-center font-black text-sm flex-shrink-0">{step}</div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{title}</p>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Referrals list */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users size={18} className="text-brand-600" />
          <h3 className="font-bold text-gray-900">Miqtë e Ftuar ({referrals.length})</h3>
        </div>
        {referrals.length > 0 ? (
          <div className="space-y-3">
            {referrals.map((r) => (
              <div key={r._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <img src={r.referredUser?.avatar || `https://ui-avatars.com/api/?name=${r.referredUser?.firstName}&background=e9fce8&color=1a3f8a&size=36`}
                  alt="" className="w-9 h-9 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{r.referredUser?.firstName} {r.referredUser?.lastName}</p>
                  <p className="text-xs text-gray-400">{formatDate(r.createdAt)}</p>
                </div>
                <span className={`badge text-xs ${r.status === 'qualified' ? 'badge-green' : r.status === 'rewarded' ? 'badge-blue' : 'badge-gray'}`}>
                  {r.status === 'qualified' ? 'Aktiv' : r.status === 'rewarded' ? '✓ Shpërblyer' : 'Pending'}
                </span>
                {r.status === 'rewarded' && <span className="text-green-600 font-bold text-sm">+200 L</span>}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Users size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nuk keni ftuar asnjë mik akoma</p>
          </div>
        )}
      </div>
    </div>
  );
}
