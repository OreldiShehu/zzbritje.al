import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { QrCode, Download, Info } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { formatCurrency, formatDate, formatCountdown } from '../../utils/formatters';

function VoucherCard({ voucher }) {
  const { t } = useTranslation();
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef(null);

  const handleDownload = () => {
    const buildAndOpen = () => {
      const svgEl = qrRef.current?.querySelector('svg');
      const qrSvg = svgEl ? svgEl.outerHTML : '';
      const dealImg = voucher.deal?.images?.[0]?.url || '';
      const businessName = voucher.deal?.business?.name || '';
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Kupon ${voucher.code}</title><style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:Arial,Helvetica,sans-serif;background:#f3f4f6;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}
        .v{background:#fff;border-radius:20px;overflow:hidden;width:380px;box-shadow:0 8px 32px rgba(0,0,0,.15)}
        .header{background:linear-gradient(135deg,#1a3f8a,#2563eb);padding:24px;text-align:center;color:#fff}
        .logo{font-size:28px;font-weight:900;letter-spacing:-1px;margin-bottom:4px}
        .logo span{color:#93c5fd}
        .badge{background:rgba(255,255,255,.2);border-radius:20px;padding:4px 14px;font-size:12px;display:inline-block;margin-top:4px}
        .img{width:100%;height:160px;object-fit:cover}
        .body{padding:20px}
        .title{font-size:17px;font-weight:700;color:#111;margin-bottom:4px}
        .biz{font-size:13px;color:#6b7280;margin-bottom:16px}
        .row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px}
        .row:last-child{border:none}
        .label{color:#9ca3af}
        .val{font-weight:600;color:#111}
        .val.green{color:#16a34a}
        .code-box{background:#f8fafc;border:2px dashed #e2e8f0;border-radius:12px;padding:12px;text-align:center;margin:16px 0}
        .code{font-family:monospace;font-size:18px;font-weight:700;letter-spacing:2px;color:#1a3f8a}
        .qr{display:flex;justify-content:center;margin:12px 0}
        .qr svg{border-radius:8px;padding:8px;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.1)}
        .how{background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:14px;margin:16px 0;font-size:12px;color:#1e40af}
        .how-title{font-weight:700;margin-bottom:6px}
        .how ol{padding-left:16px;line-height:1.8}
        .footer{background:#f8fafc;padding:12px 20px;text-align:center;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb}
        @media print{body{background:#fff;padding:0}@page{margin:10mm}.v{box-shadow:none}}
      </style></head><body>
      <div class="v">
        <div class="header">
          <div class="logo">Zbritje<span>.al</span></div>
          <div class="badge">Kupon Zyrtar</div>
        </div>
        ${dealImg ? `<img class="img" src="${dealImg}" alt="" crossorigin="anonymous" />` : ''}
        <div class="body">
          <div class="title">${voucher.deal?.title || ''}</div>
          <div class="biz">${businessName}</div>
          <div class="row"><span class="label">Paguani pranë biznesit</span><span class="val green">${formatCurrency(voucher.paidPrice)}</span></div>
          <div class="row"><span class="label">Skadon më</span><span class="val">${formatDate(voucher.expiresAt)}</span></div>
          <div class="row"><span class="label">Statusi</span><span class="val">${voucher.status === 'active' ? '✓ Aktiv' : voucher.status === 'redeemed' ? 'Përdorur' : 'Skaduar'}</span></div>
          <div class="code-box"><div class="code">${voucher.code}</div><div style="font-size:11px;color:#9ca3af;margin-top:4px">Kodi i Kuponit</div></div>
          <div class="qr">${qrSvg}</div>
          <div class="how">
            <div class="how-title">📋 Si ta përdorni:</div>
            <ol>
              <li>Shkoni fizikisht tek biznesi</li>
              <li>Tregojini këtë kupon kamarierit ose stafit</li>
              <li>Stafi e konfirmon dhe ju merrni çmimin e zbritur</li>
              <li>Paguani <strong>${formatCurrency(voucher.paidPrice)}</strong> direkt pranë biznesit</li>
            </ol>
          </div>
        </div>
        <div class="footer">Kupon zyrtar i Zbritje.al · Mos e ndani me të tjerë</div>
      </div>
      <script>window.onload=()=>{window.print();}</script>
      </body></html>`;

      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (win) { win.onload = () => URL.revokeObjectURL(url); }
      else { URL.revokeObjectURL(url); }
    };

    if (!showQR) {
      setShowQR(true);
      setTimeout(buildAndOpen, 150);
    } else {
      buildAndOpen();
    }
  };

  const countdown = voucher.status === 'active' ? formatCountdown(voucher.expiresAt) : null;
  const daysLeft = countdown && !countdown.expired ? countdown.days : null;
  const isExpiringSoon = daysLeft !== null && daysLeft <= 3;
  const isActive = voucher.status === 'active';

  const statusLabel = voucher.status === 'active'
    ? t('dashboard.voucher_valid')
    : voucher.status === 'redeemed'
      ? t('dashboard.voucher_used')
      : t('dashboard.voucher_expired');

  return (
    <div className={`card overflow-hidden ${isExpiringSoon ? 'ring-2 ring-orange-400' : ''}`}>
      <div className="flex">
        <img
          src={voucher.deal?.images?.[0]?.url || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200'}
          alt={voucher.deal?.title}
          className="w-28 h-full object-cover flex-shrink-0"
        />
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{voucher.deal?.title}</h3>
            <span className={`badge flex-shrink-0 ${voucher.status === 'active' ? 'badge-green' : voucher.status === 'redeemed' ? 'badge-blue' : 'badge-gray'}`}>
              {statusLabel}
            </span>
          </div>
          <div className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg inline-block mb-2">{voucher.code}</div>
          <div className="text-xs text-gray-500 space-y-1">
            <div>{t('dashboard.price_label')}: <span className="font-semibold text-brand-600">{formatCurrency(voucher.paidPrice)}</span></div>
            <div>{t('dashboard.expires_label')}: <span className={`font-medium ${isExpiringSoon ? 'text-orange-600' : ''}`}>{formatDate(voucher.expiresAt)}</span></div>
            {daysLeft !== null && (
              <div className={`${isExpiringSoon ? 'text-orange-600 font-semibold' : 'text-gray-400'}`}>
                {isExpiringSoon ? `⚠️ ${daysLeft} ${t('dashboard.days_left_urgent')}` : `${daysLeft} ${t('dashboard.days_left')}`}
              </div>
            )}
          </div>
          {isActive && (
            <div className="flex items-center gap-2 mt-3">
              <button onClick={() => setShowQR(!showQR)}
                className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium">
                <QrCode size={14} />{showQR ? t('dashboard.hide_qr') : t('dashboard.show_qr')}
              </button>
              <span className="text-gray-200">·</span>
              <button onClick={handleDownload}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium">
                <Download size={14} />{t('dashboard.download_voucher')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Redemption instructions — always visible for active kupona */}
      {isActive && (
        <div className="border-t border-blue-100 bg-blue-50 px-4 py-3 flex items-start gap-2">
          <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            <span className="font-semibold">Si ta përdorni:</span> Shkoni tek biznesi · Tregojini kuponin (kodin ose QR) kamarierit/stafit · Ata e konfirmojnë · Paguani <span className="font-semibold">{formatCurrency(voucher.paidPrice)}</span> direkt pranë tyre
          </p>
        </div>
      )}

      {showQR && isActive && (
        <motion.div
          initial={{ height: 0 }} animate={{ height: 'auto' }}
          className="border-t border-gray-100 p-6 flex flex-col items-center gap-4"
        >
          <div ref={qrRef} className="p-4 bg-white rounded-2xl shadow-lg">
            <QRCode value={voucher.qrCodeData || voucher.code} size={160} />
          </div>
          <div className="text-center">
            <p className="font-mono text-lg font-bold tracking-widest text-gray-900">{voucher.code}</p>
            <p className="text-xs text-gray-400 mt-1">{t('dashboard.show_to_business')}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function CustomerVouchers() {
  const { t } = useTranslation();
  const [activeStatus, setActiveStatus] = useState('');
  const [page, setPage] = useState(1);

  const STATUS_TABS = [
    { value: '', label: t('dashboard.all_tab') },
    { value: 'active', label: `✓ ${t('dashboard.active_tab')}` },
    { value: 'redeemed', label: `📤 ${t('dashboard.used_tab')}` },
    { value: 'expired', label: `⏰ ${t('dashboard.expired_tab')}` },
  ];

  const { data, isLoading } = useQuery({
    queryKey: ['vouchers', 'my', activeStatus, page],
    queryFn: () => api.get(`/vouchers/my?status=${activeStatus}&page=${page}&limit=10`).then((r) => r.data),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.vouchers_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('dashboard.vouchers_subtitle')}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        {STATUS_TABS.map(({ value, label }) => (
          <button key={value} onClick={() => { setActiveStatus(value); setPage(1); }}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeStatus === value ? 'bg-brand-600 text-white shadow-brand' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}>
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-28 skeleton" />)}</div>
      ) : data?.data?.length > 0 ? (
        <div className="space-y-4">
          {data.data.map((v) => <VoucherCard key={v._id} voucher={v} />)}
          {data.pagination?.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button onClick={() => setPage((p) => p - 1)} disabled={!data.pagination.hasPrev} className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40">{t('search.prev')}</button>
              <span className="px-4 py-2 text-sm text-gray-600">{page} / {data.pagination.pages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={!data.pagination.hasNext} className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40">{t('search.next')}</button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 card">
          <QrCode size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">{t('dashboard.no_vouchers_type')}</h3>
          <p className="text-gray-400 mb-6">{t('dashboard.buy_first_cta')}</p>
          <a href="/search" className="btn-primary">{t('dashboard.browse_offers')} →</a>
        </div>
      )}
    </div>
  );
}
