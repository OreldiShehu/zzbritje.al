import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, AlertTriangle, Loader, RotateCcw } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function VoucherScan() {
  const { code } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [approved, setApproved] = useState(false);
  const [denied, setDenied] = useState(null); // message string

  const isBusiness = isAuthenticated && user?.role === 'business';

  const { data, isLoading, error } = useQuery({
    queryKey: ['voucher-scan', code],
    queryFn: () => api.get(`/vouchers/validate/${code}`).then((r) => r.data.data),
    enabled: !!code && isBusiness,
    retry: false,
  });

  const redeemMutation = useMutation({
    mutationFn: () => api.post('/vouchers/redeem', { code }),
    onSuccess: () => setApproved(true),
    onError: (err) => setDenied(err.response?.data?.message || 'Ndodhi një gabim'),
  });

  // Full-screen APROVUAR
  if (approved) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="min-h-screen bg-green-500 flex flex-col items-center justify-center text-white p-8 text-center"
      >
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}>
          <CheckCircle size={110} strokeWidth={1.5} className="mb-6" />
        </motion.div>
        <h1 className="text-6xl font-black mb-3">Aprovuar</h1>
        {data?.voucher?.deal?.title && (
          <p className="text-green-100 text-xl mb-1">{data.voucher.deal.title}</p>
        )}
        {data?.customer?.name && (
          <p className="text-green-200 mb-1">{data.customer.name}</p>
        )}
        <p className="text-green-200 text-sm mb-10">{formatCurrency(data?.voucher?.paidPrice || 0)} · {code}</p>
        <p className="text-green-100 text-sm">Voucher-i u shënua si i përdorur</p>
      </motion.div>
    );
  }

  // Full-screen DENIED
  if (denied) {
    return (
      <div className="min-h-screen bg-red-500 flex flex-col items-center justify-center text-white p-8 text-center">
        <XCircle size={80} strokeWidth={1.5} className="mb-6" />
        <h1 className="text-4xl font-black mb-3">I Pavlefshëm</h1>
        <p className="text-red-100 mb-8">{denied}</p>
        <button onClick={() => window.history.back()} className="bg-white/20 hover:bg-white/30 text-white font-bold px-8 py-3 rounded-2xl">
          Kthehu
        </button>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="card p-8 max-w-sm w-full">
          <AlertTriangle size={40} className="text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Kyçuni si Biznes</h2>
          <p className="text-gray-500 text-sm mb-6">Duhet të kyçeni si biznes për të verifikuar këtë voucher.</p>
          <Link
            to={`/login?redirect=/v/${code}`}
            className="btn-primary w-full block text-center"
          >
            Kyçu tani
          </Link>
        </div>
      </div>
    );
  }

  // Logged in but not a business
  if (!isBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="card p-8 max-w-sm w-full">
          <AlertTriangle size={40} className="text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Vetëm për Biznese</h2>
          <p className="text-gray-500 text-sm">Vetëm llogaritë e bizneseve mund të verifikojnë voucher-ët.</p>
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size={36} className="animate-spin text-brand-500 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Duke verifikuar voucher-in...</p>
        </div>
      </div>
    );
  }

  // Error / invalid
  if (error) {
    const msg = error.response?.data?.message || 'Voucher-i nuk u gjet';
    const isExpired = msg.toLowerCase().includes('expir') || msg.toLowerCase().includes('skadu');
    const isRedeemed = msg.toLowerCase().includes('redeem') || msg.toLowerCase().includes('përdorur');

    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-8 text-center ${isExpired ? 'bg-amber-50' : isRedeemed ? 'bg-blue-50' : 'bg-red-50'}`}>
        <div className="max-w-sm w-full">
          {isRedeemed
            ? <CheckCircle size={64} className="text-blue-500 mx-auto mb-4" />
            : isExpired
              ? <Clock size={64} className="text-amber-500 mx-auto mb-4" />
              : <XCircle size={64} className="text-red-500 mx-auto mb-4" />}
          <h2 className={`text-2xl font-black mb-2 ${isRedeemed ? 'text-blue-800' : isExpired ? 'text-amber-800' : 'text-red-800'}`}>
            {isRedeemed ? 'Tashmë i Përdorur' : isExpired ? 'Ka Skaduar' : 'I Pavlefshëm'}
          </h2>
          <p className={`text-sm mb-2 ${isRedeemed ? 'text-blue-600' : isExpired ? 'text-amber-600' : 'text-red-600'}`}>{msg}</p>
          <p className="text-xs text-gray-400 font-mono mb-6">{code}</p>
          <button onClick={() => navigate('/business-dashboard/scanner')} className="btn-secondary text-sm">
            <RotateCcw size={14} /> Skano tjetrin
          </button>
        </div>
      </div>
    );
  }

  const voucher = data?.voucher;
  const customer = data?.customer;

  // Valid — show confirm screen
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="card w-full max-w-sm overflow-hidden">
        {/* Green header */}
        <div className="bg-green-500 p-6 text-center text-white">
          <CheckCircle size={48} className="mx-auto mb-2" strokeWidth={1.5} />
          <p className="font-bold text-lg">Voucher Valid</p>
          <p className="text-green-100 text-xs mt-1 font-mono">{code}</p>
        </div>

        {/* Details */}
        <div className="p-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Deal</span>
            <span className="font-semibold text-gray-900 text-right max-w-[200px]">{voucher?.deal?.title}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Klienti</span>
            <span className="font-semibold text-gray-900">{customer?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Çmimi i paguar</span>
            <span className="font-bold text-brand-600">{formatCurrency(voucher?.paidPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Skadon</span>
            <span className="font-semibold text-gray-900">{formatDate(voucher?.expiresAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={() => redeemMutation.mutate()}
            disabled={redeemMutation.isPending}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
          >
            {redeemMutation.isPending
              ? <Loader size={16} className="animate-spin" />
              : <><CheckCircle size={16} /> Konfirmo</>}
          </button>
          <button
            onClick={() => setDenied('Voucher-i u refuzua nga biznesi.')}
            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm border border-red-200"
          >
            <XCircle size={16} /> Refuzo
          </button>
        </div>
      </div>
    </div>
  );
}
