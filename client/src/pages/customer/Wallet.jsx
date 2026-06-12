import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, Ticket, ArrowDownCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import { formatCurrency, formatDate, getImageUrl } from '../../utils/formatters';

const STATUS_MAP = {
  completed: { label: 'Përfunduar', color: 'text-green-600 bg-green-50', Icon: CheckCircle },
  pending:   { label: 'Në pritje',  color: 'text-amber-600 bg-amber-50',  Icon: Clock },
  refunded:  { label: 'Rimbursuar', color: 'text-blue-600 bg-blue-50',    Icon: ArrowDownCircle },
  failed:    { label: 'Dështuar',   color: 'text-red-500 bg-red-50',      Icon: XCircle },
};

const METHOD_LABEL = { cash: 'Cash në biznes', paypal: 'PayPal', wallet: 'Portofol', card: 'Kartë' };

function TransactionRow({ tx }) {
  const s = STATUS_MAP[tx.paymentStatus] || STATUS_MAP.pending;
  const Icon = s.Icon;
  const image = tx.deal?.images?.[0]?.url;
  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-brand-50 flex-shrink-0 flex items-center justify-center">
        {image
          ? <img src={getImageUrl(image, 100)} alt="" className="w-full h-full object-cover" />
          : <Ticket size={18} className="text-brand-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{tx.deal?.title || 'Blerje voucher'}</p>
        <p className="text-xs text-gray-400">{tx.business?.name} · {formatDate(tx.createdAt)}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${s.color}`}>
            <Icon size={10} />{s.label}
          </span>
          <span className="text-xs text-gray-400">{METHOD_LABEL[tx.paymentMethod] || tx.paymentMethod}</span>
          <span className="text-xs text-gray-400">{tx.quantity} voucher</span>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-sm text-gray-900">{formatCurrency(tx.total)}</p>
        {tx.walletUsed > 0 && (
          <p className="text-xs text-brand-500">-{formatCurrency(tx.walletUsed)} portofol</p>
        )}
      </div>
    </div>
  );
}

export default function CustomerWallet() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['wallet', 'transactions'],
    queryFn: () => api.get('/payments/transactions').then((r) => r.data),
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Portofoli</h1>
        <p className="text-gray-500 text-sm">Menaxhoni balancën dhe transaksionet</p>
      </div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-brand-gradient rounded-3xl p-8 text-white mb-6 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full -translate-y-14 translate-x-14" />
        <div className="absolute -left-8 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-8" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <WalletIcon size={24} className="text-white" />
            </div>
            <div>
              <p className="text-blue-100 text-sm">Balanca Aktuale</p>
              <p className="font-bold text-3xl">{formatCurrency(user?.walletBalance || 0)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/15 rounded-xl p-4">
              <p className="text-blue-100 text-xs mb-1">Kursime Totale</p>
              <p className="font-bold text-xl">{formatCurrency(user?.totalSaved || 0)}</p>
            </div>
            <div className="bg-white/15 rounded-xl p-4">
              <p className="text-blue-100 text-xs mb-1">Blerje Totale</p>
              <p className="font-bold text-xl">{formatCurrency(user?.totalSpent || 0)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Info card */}
      <div className="card p-4 mb-6 bg-amber-50 border border-amber-200 flex items-start gap-3">
        <ArrowDownCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Si funksionon Portofoli?</p>
          <p className="text-xs text-amber-700 mt-0.5">Balanca e portofolit mund të përdoret si zbritje gjatë blerjes së voucher-ve. Fitohet nëpërmjet rimbursimeve dhe programit të referimeve.</p>
        </div>
      </div>

      {/* Transactions */}
      <div className="card p-6">
        <h3 className="font-bold text-gray-900 mb-4">Historia e Transaksioneve</h3>
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 skeleton rounded-xl" />)}</div>
        ) : data?.data?.length > 0 ? (
          <div>{data.data.map((tx) => <TransactionRow key={tx._id} tx={tx} />)}</div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <WalletIcon size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nuk ka transaksione akoma</p>
          </div>
        )}
      </div>
    </div>
  );
}
