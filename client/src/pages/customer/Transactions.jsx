import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Receipt, Download, ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../api/axios';
import { formatCurrency, formatDate } from '../../utils/formatters';

const STATUS_MAP = {
  completed: { label: 'Kompletuar', icon: CheckCircle, cls: 'text-green-600 bg-green-50' },
  pending: { label: 'Në pritje', icon: Clock, cls: 'text-amber-600 bg-amber-50' },
  failed: { label: 'Dështuar', icon: XCircle, cls: 'text-red-500 bg-red-50' },
  refunded: { label: 'Rimbursuar', icon: Receipt, cls: 'text-blue-600 bg-blue-50' },
};

export default function CustomerTransactions() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', 'my', page],
    queryFn: () => api.get(`/payments/transactions?page=${page}&limit=15`).then((r) => r.data),
  });

  const transactions = data?.data || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transaksionet</h1>
        <p className="text-gray-500 text-sm">Historia e blerjeve dhe pagesave</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 card skeleton" />)}</div>
      ) : transactions.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="divide-y divide-gray-100">
            {transactions.map((tx, i) => {
              const status = STATUS_MAP[tx.status] || STATUS_MAP.pending;
              const StatusIcon = status.icon;
              return (
                <motion.div key={tx._id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${status.cls}`}>
                    <StatusIcon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{tx.deal?.title || 'Transaksion'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{tx.invoiceNumber}</span>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-gray-400">{formatDate(tx.createdAt)}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900">{formatCurrency(tx.amount)}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.cls}`}>{status.label}</span>
                  </div>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors" title="Shkarko faturën">
                    <Download size={16} />
                  </button>
                </motion.div>
              );
            })}
          </div>
          {data?.pagination?.pages > 1 && (
            <div className="flex justify-center gap-2 py-4 border-t border-gray-100">
              <button onClick={() => setPage((p) => p - 1)} disabled={!data.pagination.hasPrev} className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40">← Para</button>
              <span className="px-3 py-2 text-sm text-gray-600">{page} / {data.pagination.pages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={!data.pagination.hasNext} className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40">Pas →</button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-24 card">
          <Receipt size={56} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">Nuk ka transaksione</h3>
          <p className="text-gray-400">Blerjet tuaja do të shfaqen këtu</p>
        </div>
      )}
    </div>
  );
}
