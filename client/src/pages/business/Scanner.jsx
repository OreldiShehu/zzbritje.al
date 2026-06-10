import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Keyboard, CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '../../api/axios';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function BusinessScanner() {
  const [mode, setMode] = useState('manual');
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  const validateMutation = useMutation({
    mutationFn: (c) => api.post('/vouchers/validate', { code: c }).then((r) => r.data.data),
    onSuccess: (data) => setResult({ type: 'valid', data }),
    onError: (err) => setResult({ type: 'invalid', message: err.response?.data?.message || 'Voucher-i nuk është valid' }),
  });

  const redeemMutation = useMutation({
    mutationFn: (c) => api.post('/vouchers/redeem', { code: c }),
    onSuccess: () => {
      toast.success('Voucher-i u shënua si i përdorur!');
      setResult(null); setCode('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Ndodhi një gabim'),
  });

  const handleValidate = () => {
    if (!code.trim()) return;
    setResult(null);
    validateMutation.mutate(code.trim().toUpperCase());
  };

  const reset = () => { setResult(null); setCode(''); inputRef.current?.focus(); };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Skaner Voucher</h1>
        <p className="text-gray-500 text-sm">Verifikoni dhe shënoni voucher-ët si të përdorur</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => setMode('manual')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all border-2 ${mode === 'manual' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          <Keyboard size={18} />Fut Kodin
        </button>
        <button onClick={() => setMode('qr')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all border-2 ${mode === 'qr' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          <QrCode size={18} />Skano QR
        </button>
      </div>

      {/* Manual Input */}
      {mode === 'manual' && (
        <div className="card p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Kodi i Voucher-it</label>
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
              placeholder="ZBR-XXXXXXXXXX-YYYY"
              className="input-field flex-1 font-mono text-lg tracking-widest"
              autoFocus
            />
            <button onClick={handleValidate} disabled={validateMutation.isPending || !code}
              className="btn-primary px-6 flex items-center gap-2">
              {validateMutation.isPending ? <Loader size={18} className="animate-spin" /> : 'Verifiko'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Tastoni kodin e voucher-it dhe shtypni Enter ose "Verifiko"</p>
        </div>
      )}

      {/* QR Camera Mode */}
      {mode === 'qr' && (
        <div className="card p-6 mb-6 text-center">
          <div className="w-full aspect-video max-w-sm mx-auto bg-gray-900 rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden">
            <div className="text-white/60 text-sm">Camera mund të integrohet me bibliotekën react-qr-reader</div>
            <div className="absolute inset-6 border-2 border-brand-400 rounded-xl">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-brand-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-brand-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-brand-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-brand-400 rounded-br-lg" />
              <motion.div animate={{ top: ['10%', '90%', '10%'] }} transition={{ duration: 2, repeat: Infinity }}
                className="absolute left-0 right-0 h-0.5 bg-brand-400 opacity-70" />
            </div>
          </div>
          <p className="text-gray-500 text-sm">Drejtoni kamerën drejt QR Code-it të voucher-it</p>
          <button onClick={() => setMode('manual')} className="btn-secondary mt-3 text-sm py-2 px-4">
            Fut kodin manualisht
          </button>
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className={`card p-6 border-2 ${result.type === 'valid' ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
            <div className="flex items-start gap-4">
              {result.type === 'valid' ? <CheckCircle size={32} className="text-green-600 flex-shrink-0" /> : <XCircle size={32} className="text-red-500 flex-shrink-0" />}
              <div className="flex-1">
                {result.type === 'valid' ? (
                  <>
                    <h3 className="font-bold text-green-800 mb-1">✓ Voucher Valid!</h3>
                    <div className="space-y-1.5 text-sm mb-4">
                      <p><span className="text-gray-500">Deal:</span> <strong>{result.data?.deal?.title}</strong></p>
                      <p><span className="text-gray-500">Klient:</span> <strong>{result.data?.user?.firstName} {result.data?.user?.lastName}</strong></p>
                      <p><span className="text-gray-500">Çmimi:</span> <strong className="text-brand-600">{formatCurrency(result.data?.paidPrice)}</strong></p>
                      <p><span className="text-gray-500">Skadon:</span> <strong>{formatDate(result.data?.expiresAt)}</strong></p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => redeemMutation.mutate(code)} disabled={redeemMutation.isPending} className="btn-primary flex-1">
                        {redeemMutation.isPending ? <Loader size={16} className="animate-spin" /> : '✓ Shëno si Të Përdorur'}
                      </button>
                      <button onClick={reset} className="btn-secondary px-6">Anulo</button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-bold text-red-700 mb-1">✗ Voucher Invalid</h3>
                    <p className="text-sm text-red-600 mb-4">{result.message}</p>
                    <button onClick={reset} className="btn-secondary">Provo Sërisht</button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="card p-5 mt-6 bg-gray-50">
        <h3 className="font-semibold text-gray-700 mb-3 text-sm">Si të skanoni voucher-in</h3>
        <div className="space-y-2 text-xs text-gray-500">
          {['Klientit i kërkoni ta shfaqë voucher-in nga aplikacioni ose email-i', 'Futni kodin manualisht ose skanoni QR Code-in', 'Verifikoni detajet e voucher-it', 'Shtypni "Shëno si Të Përdorur" pas ofrimit të shërbimit'].map((s, i) => (
            <div key={i} className="flex gap-2">
              <span className="w-5 h-5 bg-brand-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
