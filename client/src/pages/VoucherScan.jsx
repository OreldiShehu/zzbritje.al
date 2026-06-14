import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Loader, LogIn, Info, ThumbsUp } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function VoucherScan() {
  const { code } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const [approved, setApproved] = useState(false);
  const [denied, setDenied] = useState(null);
  const [visitConfirmed, setVisitConfirmed] = useState(false);
  const [confirmingVisit, setConfirmingVisit] = useState(false);

  const isBusiness = isAuthenticated && user?.role === 'business';
  const isCustomer = isAuthenticated && user?.role === 'customer';

  const { data, isLoading, error } = useQuery({
    queryKey: ['voucher-public', code],
    queryFn: () => api.get(`/vouchers/info/${code}`).then((r) => r.data.data),
    enabled: !!code,
    retry: false,
  });

  const redeemMutation = useMutation({
    mutationFn: () => api.post('/vouchers/redeem', { code }),
    onSuccess: () => setApproved(true),
    onError: (err) => setDenied(err.response?.data?.message || 'Ndodhi një gabim'),
  });

  const confirmVisitMutation = useMutation({
    mutationFn: () => api.post(`/vouchers/${code}/confirm-visit`),
    onSuccess: () => setVisitConfirmed(true),
    onError: (err) => setDenied(err.response?.data?.message || 'Ndodhi një gabim'),
  });

  // Full-screen APROVUAR (business confirmed)
  if (approved) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="min-h-screen bg-green-500 flex flex-col items-center justify-center text-white p-8 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}>
          <CheckCircle size={110} strokeWidth={1.5} className="mb-6" />
        </motion.div>
        <h1 className="text-6xl font-black mb-3">Aprovuar</h1>
        {data?.voucher?.deal?.title && <p className="text-green-100 text-xl mb-1">{data.voucher.deal.title}</p>}
        {data?.customer?.name && <p className="text-green-200 mb-1">{data.customer.name}</p>}
        <p className="text-green-200 text-sm mb-10">{formatCurrency(data?.voucher?.paidPrice || 0)} · {code}</p>
        <p className="text-green-100 text-sm">Kuponi u shënua si i përdorur</p>
      </motion.div>
    );
  }

  // Full-screen VISIT CONFIRMED (customer confirmed)
  if (visitConfirmed) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="min-h-screen bg-brand-600 flex flex-col items-center justify-center text-white p-8 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}>
          <ThumbsUp size={90} strokeWidth={1.5} className="mb-6" />
        </motion.div>
        <h1 className="text-4xl font-black mb-3">Vizita u Konfirmua!</h1>
        <p className="text-blue-100 text-lg mb-2">Faleminderit që konfirmuat vizitën tuaj.</p>
        <p className="text-blue-200 text-sm">Kuponi është shënuar si i përdorur.</p>
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size={36} className="animate-spin text-brand-500 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Duke ngarkuar kuponin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const msg = error.response?.data?.message || 'Kuponi nuk u gjet';
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
          <p className="text-xs text-gray-400 font-mono">{code}</p>
        </div>
      </div>
    );
  }

  const voucher = data?.voucher;
  const customer = data?.customer;
  const status = data?.status;

  if (status === 'redeemed') {
    return (
      <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-8 text-center">
        <CheckCircle size={72} className="text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-blue-800 mb-2">Tashmë i Përdorur</h2>
        <p className="text-blue-600 text-sm mb-1">{voucher?.deal?.title}</p>
        <p className="text-xs text-gray-400 font-mono">{code}</p>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-8 text-center">
        <Clock size={72} className="text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-amber-800 mb-2">Ka Skaduar</h2>
        <p className="text-amber-600 text-sm mb-1">{voucher?.deal?.title}</p>
        <p className="text-xs text-gray-400 font-mono">{code}</p>
      </div>
    );
  }

  if (status === 'cancelled' || status === 'refunded') {
    return (
      <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-8 text-center">
        <XCircle size={72} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-red-800 mb-2">I Pavlefshëm</h2>
        <p className="text-red-600 text-sm mb-1">{voucher?.deal?.title}</p>
        <p className="text-xs text-gray-400 font-mono">{code}</p>
      </div>
    );
  }

  // ─── Valid voucher — render based on viewer identity ───────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="card w-full max-w-sm overflow-hidden">

        {/* Green header */}
        <div className="bg-green-500 p-6 text-center text-white">
          <CheckCircle size={48} className="mx-auto mb-2" strokeWidth={1.5} />
          <p className="font-bold text-lg">Kupon Valid</p>
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
            <span className="text-gray-400">Paguani pranë biznesit</span>
            <span className="font-bold text-brand-600">{formatCurrency(voucher?.paidPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Skadon</span>
            <span className="font-semibold text-gray-900">{formatDate(voucher?.expiresAt)}</span>
          </div>
        </div>

        {/* Actions — 3 states */}
        <div className="px-6 pb-6 space-y-3">

          {/* STATE B: Business logged in — primary use case (staff scanning) */}
          {isBusiness && (
            <div className="flex gap-3">
              <button
                onClick={() => redeemMutation.mutate()}
                disabled={redeemMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
                {redeemMutation.isPending
                  ? <Loader size={16} className="animate-spin" />
                  : <><CheckCircle size={16} /> Konfirmo & Shëno</>}
              </button>
              <button
                onClick={() => setDenied('Kuponi u refuzua nga biznesi.')}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm border border-red-200">
                <XCircle size={16} /> Refuzo
              </button>
            </div>
          )}

          {/* STATE A: Customer viewing their own kupon */}
          {isCustomer && (
            <>
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3">
                <Info size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  <span className="font-bold">Kuponi juaj është aktiv!</span> Tregojini këtë kamarierit ose stafit të biznesit — ata do ta konfirmojnë dhe do të merrni çmimin e zbritur.
                </p>
              </div>
              {!confirmingVisit ? (
                <button
                  onClick={() => setConfirmingVisit(true)}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl text-sm transition-colors">
                  ✓ Konfirmo Vizitën — mora zbritjen
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 text-center font-medium">Vizituat biznesin dhe morët zbritjen?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirmVisitMutation.mutate()}
                      disabled={confirmVisitMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5">
                      {confirmVisitMutation.isPending ? <Loader size={14} className="animate-spin" /> : 'Po, mora zbritjen'}
                    </button>
                    <button
                      onClick={() => setConfirmingVisit(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-sm transition-colors">
                      Jo, anulo
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* STATE C: Not logged in — show details read-only, subtle staff link */}
          {!isAuthenticated && (
            <div className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-xl p-3">
              <Info size={15} className="text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">
                Ky kupon është valid. Klienti duhet të paguajë <span className="font-bold">{formatCurrency(voucher?.paidPrice)}</span> pranë biznesit.
              </p>
            </div>
          )}
        </div>

        {/* Subtle staff login link — only for non-logged-in viewers */}
        {!isAuthenticated && (
          <div className="border-t border-gray-100 px-6 py-3 text-center">
            <Link to={`/login?redirect=/v/${code}`}
              className="text-xs text-gray-400 hover:text-brand-600 transition-colors flex items-center justify-center gap-1">
              <LogIn size={12} /> Jeni staf biznesi? Kyçuni për të konfirmuar
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
