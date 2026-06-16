import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Banknote, Download, ChevronRight, X, Loader, Building2, RefreshCw } from 'lucide-react';
import api from '../../api/axios';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

function formatReceiptDate() {
  return new Date().toLocaleDateString('sq-AL', { year: 'numeric', month: 'long', day: 'numeric' });
}

function downloadReceipt(biz) {
  const { business, summary, dealBreakdown } = biz;
  const rows = dealBreakdown.map((d) =>
    `<tr><td>${d.dealTitle}</td><td style="text-align:center">${d.soldCount}</td><td style="text-align:right">${formatCurrency(d.totalPaidPrice)}</td><td style="text-align:right">${formatCurrency(d.totalCommission)}</td></tr>`
  ).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Faturë — ${business.name}</title><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,Helvetica,sans-serif;background:#f3f4f6;padding:20px;color:#111}
    .page{background:#fff;max-width:700px;margin:0 auto;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.1)}
    .header{background:linear-gradient(135deg,#1a3f8a,#2563eb);color:#fff;padding:28px 32px;display:flex;justify-content:space-between;align-items:flex-start}
    .logo{font-size:26px;font-weight:900;letter-spacing:-1px}.logo span{color:#93c5fd}
    .header-right{text-align:right;font-size:13px;color:#bfdbfe}
    .body{padding:28px 32px}
    h2{font-size:18px;font-weight:700;color:#1a3f8a;margin-bottom:16px;border-bottom:2px solid #e5e7eb;padding-bottom:8px}
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;background:#f8fafc;border-radius:10px;padding:16px}
    .info-item label{font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.5px}
    .info-item p{font-size:14px;font-weight:600;color:#111;margin-top:2px}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th{background:#f1f5f9;padding:10px 12px;text-align:left;color:#374151;font-weight:700;font-size:12px;text-transform:uppercase}
    td{padding:10px 12px;border-bottom:1px solid #f3f4f6}
    .totals{margin-top:20px;background:#f8fafc;border-radius:10px;padding:16px}
    .total-row{display:flex;justify-content:space-between;padding:6px 0;font-size:14px}
    .total-row.final{font-size:17px;font-weight:800;color:#1a3f8a;border-top:2px solid #e5e7eb;margin-top:8px;padding-top:12px}
    .footer{background:#f8fafc;padding:16px 32px;text-align:center;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb}
    @media print{body{background:#fff;padding:0}@page{margin:10mm}.page{box-shadow:none}}
  </style></head><body>
  <div class="page">
    <div class="header">
      <div>
        <div class="logo">Zbritje<span>.al</span></div>
        <div style="font-size:12px;color:#bfdbfe;margin-top:4px">NIPT: L91234567C</div>
        <div style="font-size:12px;color:#bfdbfe">Tiranë, Shqipëri</div>
      </div>
      <div class="header-right">
        <div style="font-size:16px;font-weight:700;color:#fff">RAPORT SHITJESH</div>
        <div style="margin-top:6px">Data: ${formatReceiptDate()}</div>
        <div>Plan: ${business.plan?.toUpperCase() || 'FREE'}</div>
      </div>
    </div>
    <div class="body">
      <h2>Informacioni i Biznesit</h2>
      <div class="info-grid">
        <div class="info-item"><label>Biznesi</label><p>${business.name}</p></div>
        <div class="info-item"><label>Qyteti</label><p>${business.city || '—'}</p></div>
        <div class="info-item"><label>Telefon</label><p>${business.phone || '—'}</p></div>
        <div class="info-item"><label>Email</label><p>${business.email || '—'}</p></div>
        <div class="info-item"><label>Tarifa platformës</label><p>9% markup nga klienti (biznesi 0%)</p></div>
        <div class="info-item"><label>Kupona të shitura</label><p>${summary.vouchersSold}</p></div>
      </div>

      <h2>Detajet sipas Deal-eve</h2>
      <table>
        <thead><tr><th>Deal</th><th style="text-align:center">Kupona</th><th style="text-align:right">Total nga Klienti</th><th style="text-align:right">Markup (9%)</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>

      <div class="totals">
        <div class="total-row"><span>Kupona të shitura:</span><span>${summary.vouchersSold}</span></div>
        <div class="total-row"><span>Kupona të konfirmuara:</span><span>${summary.vouchersRedeemed}</span></div>
        <div class="total-row"><span>Markup i platformës (9%):</span><span>${formatCurrency(summary.commissionFromSales)}</span></div>
        <div class="total-row"><span>Total paguar nga klientët:</span><span>${formatCurrency(summary.totalRevenue || 0)}</span></div>
        <div class="total-row final"><span>MARKUP TOTAL I PLATFORMËS:</span><span>${formatCurrency(summary.commissionFromSales)}</span></div>
      </div>
    </div>
    <div class="footer">
      Zbritje.al · NIPT: L91234567C · zbritje.al · Kjo faturë u gjenerua automatikisht nga sistemi
    </div>
  </div>
  <script>window.onload=()=>{window.print();}</script>
  </body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) { win.onload = () => URL.revokeObjectURL(url); }
  else { URL.revokeObjectURL(url); }
}

function BusinessModal({ businessId, onClose }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-finances', businessId],
    queryFn: () => api.get(`/admin/finances/${businessId}`).then((r) => r.data.data),
    enabled: !!businessId,
  });

  const collectMutation = useMutation({
    mutationFn: () => api.patch(`/admin/businesses/${businessId}/collect`),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries({ queryKey: ['admin-finances'] });
      queryClient.invalidateQueries({ queryKey: ['admin-commission-tracker'] });
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Gabim'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Detajet Financiare</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-16"><Loader size={32} className="animate-spin text-brand-500" /></div>
        ) : data ? (
          <div className="p-6 space-y-6">
            {/* Business info */}
            <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4">
              <div><p className="text-xs text-gray-400">Biznesi</p><p className="font-bold">{data.business.name}</p></div>
              <div><p className="text-xs text-gray-400">Qyteti</p><p className="font-semibold">{data.business.city || '—'}</p></div>
              <div><p className="text-xs text-gray-400">Telefon</p><p className="font-semibold">{data.business.phone || '—'}</p></div>
              <div><p className="text-xs text-gray-400">Plan</p><p className={`font-bold ${data.business.plan === 'pro' ? 'text-brand-600' : 'text-gray-500'}`}>{data.business.plan?.toUpperCase()}</p></div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                <p className="text-xs text-blue-500 mb-1">Kupona të Shitura</p>
                <p className="text-2xl font-black text-blue-800">{data.summary.vouchersSold}</p>
                <p className="text-xs text-blue-400 mt-0.5">{data.summary.vouchersRedeemed} konfirmuar</p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                <p className="text-xs text-green-500 mb-1">Markup i Platformës (9%)</p>
                <p className="text-2xl font-black text-green-800">{formatCurrency(data.summary.commissionFromSales)}</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">Total nga Klientët</p>
                <p className="text-xl font-black text-gray-700">{formatCurrency(data.summary.totalRevenue || 0)}</p>
              </div>
              <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-center">
                <p className="text-xs text-brand-500 mb-1">Kupona të Konfirmuara</p>
                <p className="text-xl font-black text-brand-700">{data.summary.vouchersRedeemed}</p>
              </div>
            </div>

            {/* Deal breakdown */}
            {data.dealBreakdown.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Detaje sipas deal-eve</h3>
                <div className="space-y-2">
                  {data.dealBreakdown.map((d) => (
                    <div key={d.dealId} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{d.dealTitle}</p>
                        <p className="text-xs text-gray-400">
                          {d.soldCount} kupona · {d.activeCount} aktive · {d.redeemedCount} konfirmuar
                        </p>
                        <p className="text-xs text-gray-400">{formatCurrency(d.totalPaidPrice)} total paguar</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-brand-600">{formatCurrency(d.totalCommission)}</p>
                        <p className="text-xs text-gray-400">9% markup nga klienti</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => downloadReceipt(data)}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors text-sm">
                <Download size={16} /> Shkarko Raportin
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function AdminFinances() {
  const [selectedId, setSelectedId] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-commission-tracker'],
    queryFn: () => api.get('/admin/finances').then((r) => r.data),
  });

  const resetRatesMutation = useMutation({
    mutationFn: () => api.post('/admin/reset-commission-rates'),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries({ queryKey: ['admin-commission-tracker'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Gabim'),
  });

  const backfillMutation = useMutation({
    mutationFn: () => api.post('/admin/backfill-deal-prices'),
    onSuccess: (res) => { toast.success(res.data.message); queryClient.invalidateQueries({ queryKey: ['admin-commission-tracker'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Gabim'),
  });

  const backfillTxMutation = useMutation({
    mutationFn: () => api.post('/admin/backfill-transactions'),
    onSuccess: (res) => { toast.success(res.data.message); queryClient.invalidateQueries({ queryKey: ['admin-commission-tracker'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Gabim'),
  });

  const businesses = data?.data || [];
  const totals = data?.totals || {};

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financat</h1>
          <p className="text-gray-500 text-sm mt-1">Markup i platformës nga çdo shitje — biznesi paguan 0%, 9% shtohet mbi çmimin e klientit</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { if (window.confirm('Korrekto 9% markup-in për të GJITHA transaksionet e vjetra? Kjo rregullon shifrat 0 L.')) backfillTxMutation.mutate(); }}
            disabled={backfillTxMutation.isPending}
            className="flex items-center gap-2 text-xs bg-green-50 hover:bg-green-100 text-green-700 font-semibold px-3 py-2 rounded-xl transition-colors border border-green-200">
            {backfillTxMutation.isPending ? <Loader size={14} className="animate-spin" /> : <Banknote size={14} />}
            Fix Transaksionet (9%)
          </button>
          <button
            onClick={() => { if (window.confirm('Rikalkulo çmimet (9% markup) për të gjithë deal-et?')) backfillMutation.mutate(); }}
            disabled={backfillMutation.isPending}
            className="flex items-center gap-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-3 py-2 rounded-xl transition-colors">
            {backfillMutation.isPending ? <Loader size={14} className="animate-spin" /> : <Banknote size={14} />}
            Fix Deal Çmimet
          </button>
          <button
            onClick={() => { if (window.confirm('Vendosni të gjithë bizneset: 0% komision, 9% markup?')) resetRatesMutation.mutate(); }}
            disabled={resetRatesMutation.isPending}
            className="flex items-center gap-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold px-3 py-2 rounded-xl transition-colors">
            {resetRatesMutation.isPending ? <Loader size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Reset 0%/7%
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5 text-center">
          <p className="text-xs text-gray-400 mb-1">Markup i Fituar</p>
          <p className="text-2xl font-black text-brand-600">{formatCurrency(totals.commissionFromSales || 0)}</p>
          <p className="text-xs text-gray-400 mt-1">9% nga çmimi i klientit</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-xs text-gray-400 mb-1">Komision nga Bizneset</p>
          <p className="text-2xl font-black text-green-600">0 L</p>
          <p className="text-xs text-gray-400 mt-1">Biznesi paguan 0%</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-xs text-gray-400 mb-1">Total i Fituar</p>
          <p className="text-2xl font-black text-brand-600">{formatCurrency(totals.commissionFromSales || 0)}</p>
          <p className="text-xs text-gray-400 mt-1">vetëm markup 9%</p>
        </div>
      </div>

      {/* Business list */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Bizneset</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader size={28} className="animate-spin text-brand-500" /></div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Building2 size={40} className="mx-auto mb-3 opacity-30" />
            <p>Nuk ka biznes me veprimtari financiare</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {businesses.map((b) => (
              <button
                key={b._id}
                onClick={() => setSelectedId(b._id)}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left">
                {b.logo
                  ? <img src={b.logo} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-gray-200" />
                  : <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0"><Building2 size={18} className="text-brand-600" /></div>}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{b.name}</p>
                  <p className="text-xs text-gray-400">
                    {b.city} · {b.vouchersSold} shitura · {b.vouchersRedeemed} konfirmuar · 9% markup
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-brand-600">{formatCurrency(b.commissionFromSales)}</p>
                  <p className="text-xs text-gray-400">markup i fituar</p>
                </div>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedId && (
        <BusinessModal businessId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
