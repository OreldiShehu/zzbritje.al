import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ticket, Bell, ArrowRight, QrCode, MapPin, Phone, Calendar, Info } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import { formatCurrency, formatDate, getImageUrl } from '../../utils/formatters';

function VoucherCard({ v }) {
  const isActive = v.status === 'active';
  const isRedeemed = v.status === 'redeemed';

  return (
    <div className={`rounded-2xl border overflow-hidden ${isActive ? 'border-brand-200 bg-white' : 'border-gray-200 bg-gray-50'}`}>
      <div className="flex gap-4 p-4">
        {/* Deal image */}
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-brand-50 flex-shrink-0">
          {v.deal?.images?.[0]?.url
            ? <img src={getImageUrl(v.deal.images[0].url, 120)} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><Ticket size={20} className="text-brand-300" /></div>}
        </div>

        {/* Deal info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-bold text-gray-900 text-sm leading-tight">{v.deal?.title}</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
              isActive ? 'bg-green-100 text-green-700' :
              isRedeemed ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'
            }`}>
              {isActive ? 'Valid' : isRedeemed ? 'Përdorur' : 'Skaduar'}
            </span>
          </div>

          <p className="text-xs text-gray-500 mt-1">{v.business?.name}</p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar size={11} />
              Skadon: {formatDate(v.expiresAt)}
            </div>
            {v.business?.address && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin size={11} />
                {[v.business.address, v.business.city].filter(Boolean).join(', ')}
              </div>
            )}
            {v.business?.phone && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Phone size={11} />
                {v.business.phone}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* One per table notice */}
      {v.deal?.onePerTable && (
        <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 text-xs text-amber-700 font-medium flex items-center gap-2">
          <span>⚠️</span> 1 kupon / vizitë
        </div>
      )}

      {/* Code + QR */}
      <div className={`flex items-center justify-between gap-4 px-4 py-3 border-t ${isActive ? 'border-brand-100 bg-brand-50/50' : 'border-gray-200'}`}>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Kodi i Kuponit</p>
          <p className="font-mono font-bold text-brand-700 text-sm tracking-widest">{v.code}</p>
          <p className="text-xs text-gray-400 mt-1">Paguani pranë biznesit: <span className="font-semibold text-brand-600">{formatCurrency(v.paidPrice)}</span></p>
        </div>
        {v.qrCodeImage && isActive && (
          <img src={v.qrCodeImage} alt="QR" className="w-16 h-16 rounded-lg border border-brand-200" />
        )}
        {!v.qrCodeImage && isActive && (
          <div className="w-16 h-16 rounded-lg border border-brand-200 bg-white flex items-center justify-center">
            <QrCode size={24} className="text-brand-300" />
          </div>
        )}
      </div>

      {/* Redemption instructions */}
      {isActive && (
        <div className="border-t border-blue-100 bg-blue-50 px-4 py-2.5 flex items-start gap-2">
          <Info size={13} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            <span className="font-semibold">Si ta përdorni:</span> Tregojini kuponin kamarierit/stafit · Ata e konfirmojnë · Paguani <span className="font-semibold">{formatCurrency(v.paidPrice)}</span> pranë tyre
          </p>
        </div>
      )}
    </div>
  );
}

export default function CustomerDashboard() {
  const { user } = useAuthStore();

  const { data: vouchers, isLoading: vouchersLoading } = useQuery({
    queryKey: ['vouchers', 'my'],
    queryFn: () => api.get('/vouchers/my?limit=20').then((r) => r.data.data),
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: () => api.get('/users/notifications?limit=5').then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand-gradient rounded-3xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
        <div className="relative flex items-center gap-4">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}&background=fff&color=1a3f8a&size=48`}
            alt="" className="w-14 h-14 rounded-full border-2 border-white/30 flex-shrink-0"
          />
          <div>
            <p className="font-bold text-xl">Mirë se erdhe, {user?.firstName}!</p>
            <p className="text-blue-100 text-sm mt-0.5">Këtu gjeni të gjitha kupona-t tuaja</p>
          </div>
        </div>
      </motion.div>

      {/* Vouchers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900 text-lg">Kupona-t e Mia</h2>
          <Link to="/dashboard/vouchers" className="text-sm text-brand-600 font-medium flex items-center gap-1">
            Të gjitha <ArrowRight size={14} />
          </Link>
        </div>

        {vouchersLoading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 skeleton rounded-2xl" />)}</div>
        ) : vouchers?.length > 0 ? (
          <div className="space-y-3">
            {vouchers.map((v) => <VoucherCard key={v._id} v={v} />)}
          </div>
        ) : (
          <div className="card p-10 text-center text-gray-400">
            <Ticket size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium text-gray-500">Nuk keni blerë asnjë kupon akoma</p>
            <Link to="/search" className="btn-primary text-sm py-2 px-5 mt-4 inline-flex">Shfleto oferta</Link>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900 text-lg">Njoftimet</h2>
          <Link to="/dashboard/notifications" className="text-sm text-brand-600 font-medium flex items-center gap-1">
            Të gjitha <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card p-4 space-y-3">
          {notifications?.data?.length > 0 ? notifications.data.map((n) => (
            <div key={n._id} className={`flex gap-3 p-3 rounded-xl ${n.isRead ? 'bg-gray-50' : 'bg-brand-50 border border-brand-100'}`}>
              <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bell size={16} className="text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
              </div>
              {!n.isRead && <span className="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0 mt-1.5" />}
            </div>
          )) : (
            <div className="text-center py-6 text-gray-400">
              <Bell size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nuk ka njoftime</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
