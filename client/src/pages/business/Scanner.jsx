import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Keyboard, CheckCircle, XCircle, Loader, RotateCcw } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../api/axios';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function BusinessScanner() {
  const [mode, setMode] = useState('camera');
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null); // { type: 'valid'|'invalid', data?, message? }
  const [approved, setApproved] = useState(false);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const inputRef = useRef(null);

  // Start/stop camera scanner
  useEffect(() => {
    if (mode !== 'camera' || result || approved) return;

    const html5Qrcode = new Html5Qrcode('qr-reader');
    scannerRef.current = html5Qrcode;
    setScanning(true);

    html5Qrcode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        // Extract code from URL if scanned from QR image
        const code = decodedText.includes('/') ? decodedText.split('/').pop() : decodedText;
        html5Qrcode.stop().catch(() => {});
        setScanning(false);
        validateMutation.mutate(code.trim().toUpperCase());
      },
      () => {}
    ).catch(() => setScanning(false));

    return () => {
      html5Qrcode.stop().catch(() => {});
    };
  }, [mode, result, approved]);

  const validateMutation = useMutation({
    mutationFn: (c) => api.get(`/vouchers/validate/${c}`).then((r) => r.data.data),
    onSuccess: (data) => {
      setCode(data.voucher?.code || '');
      setResult({ type: 'valid', data });
    },
    onError: (err) => setResult({ type: 'invalid', message: err.response?.data?.message || 'Kuponi nuk është valid' }),
  });

  const redeemMutation = useMutation({
    mutationFn: (c) => api.post('/vouchers/redeem', { code: c }),
    onSuccess: () => setApproved(true),
    onError: (err) => setResult({ type: 'invalid', message: err.response?.data?.message || 'Ndodhi një gabim' }),
  });

  const reset = () => {
    setResult(null);
    setApproved(false);
    setCode('');
    setScanning(false);
  };

  const handleManualValidate = () => {
    if (!code.trim()) return;
    setResult(null);
    validateMutation.mutate(code.trim().toUpperCase());
  };

  // Full-screen APROVUAR screen
  if (approved) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-green-500 flex flex-col items-center justify-center z-50 text-white p-8"
      >
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}>
          <CheckCircle size={100} className="mb-6" strokeWidth={1.5} />
        </motion.div>
        <h1 className="text-5xl font-black mb-3">Aprovuar</h1>
        <p className="text-green-100 text-lg mb-2">{result?.data?.voucher?.deal?.title}</p>
        <p className="text-green-200 text-sm mb-10">
          {result?.data?.customer?.name} · {formatCurrency(result?.data?.voucher?.paidPrice || 0)}
        </p>
        <button onClick={reset} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold px-8 py-3 rounded-2xl transition-colors">
          <RotateCcw size={18} /> Skano tjetrin
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Skaner Kupon</h1>
        <p className="text-gray-500 text-sm">Skanoni QR ose futni kodin manualisht</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => { setMode('camera'); reset(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm border-2 transition-all ${mode === 'camera' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
          <QrCode size={16} /> Kamera
        </button>
        <button onClick={() => { setMode('manual'); reset(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm border-2 transition-all ${mode === 'manual' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
          <Keyboard size={16} /> Kodi Manual
        </button>
      </div>

      {/* Camera */}
      {mode === 'camera' && !result && (
        <div className="card overflow-hidden mb-5">
          <div id="qr-reader" className="w-full" />
          {scanning && (
            <div className="p-4 text-center text-sm text-gray-500">
              Drejtoni kamerën drejt QR Code-it të voucher-it...
            </div>
          )}
          {!scanning && !validateMutation.isPending && (
            <div className="p-4 text-center">
              <Loader size={20} className="animate-spin text-brand-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Duke aktivizuar kamerën...</p>
            </div>
          )}
          {validateMutation.isPending && (
            <div className="p-4 text-center">
              <Loader size={20} className="animate-spin text-brand-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Duke verifikuar...</p>
            </div>
          )}
        </div>
      )}

      {/* Manual input */}
      {mode === 'manual' && !result && (
        <div className="card p-5 mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Kodi i Voucher-it</label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleManualValidate()}
              placeholder="ZBR-XXXXXXXXXX"
              className="input-field flex-1 font-mono tracking-widest"
              autoFocus
            />
            <button onClick={handleManualValidate} disabled={validateMutation.isPending || !code}
              className="btn-primary px-5">
              {validateMutation.isPending ? <Loader size={16} className="animate-spin" /> : 'Verifiko'}
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {result.type === 'valid' ? (
              <div className="card border-2 border-green-300 bg-green-50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle size={28} className="text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-green-800">Voucher Valid</p>
                    <p className="text-xs text-green-600">Konfirmoni pas ofrimit të shërbimit</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm mb-5 bg-white rounded-xl p-4 border border-green-200">
                  <p><span className="text-gray-400">Deal:</span> <strong className="text-gray-800">{result.data?.voucher?.deal?.title}</strong></p>
                  <p><span className="text-gray-400">Klienti:</span> <strong className="text-gray-800">{result.data?.customer?.name}</strong></p>
                  <p><span className="text-gray-400">Çmimi i paguar:</span> <strong className="text-brand-600">{formatCurrency(result.data?.voucher?.paidPrice)}</strong></p>
                  <p><span className="text-gray-400">Skadon:</span> <strong className="text-gray-800">{formatDate(result.data?.voucher?.expiresAt)}</strong></p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => redeemMutation.mutate(result.data?.voucher?.code)}
                    disabled={redeemMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    {redeemMutation.isPending ? <Loader size={16} className="animate-spin" /> : <><CheckCircle size={18} /> Konfirmo Shërbimin</>}
                  </button>
                  <button onClick={reset} className="btn-secondary px-4">Anulo</button>
                </div>
              </div>
            ) : (
              <div className="card border-2 border-red-300 bg-red-50 p-6 text-center">
                <XCircle size={40} className="text-red-500 mx-auto mb-3" />
                <p className="font-bold text-red-700 mb-1">Voucher Invalid</p>
                <p className="text-sm text-red-600 mb-4">{result.message}</p>
                <button onClick={reset} className="btn-secondary">Provo Sërisht</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
