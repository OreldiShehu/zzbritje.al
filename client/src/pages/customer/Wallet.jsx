import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, TrendingUp, TrendingDown, ArrowDownCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import { formatCurrency, formatDate } from '../../utils/formatters';

function TransactionRow({ tx }) {
  const isCredit = ['wallet_credit', 'refund', 'referral_reward', 'welcome_bonus'].includes(tx.type);
  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isCredit ? 'bg-green-50' : 'bg-red-50'}`}>
        {isCredit ? <TrendingUp size={18} className="text-green-600" /> : <TrendingDown size={18} className="text-red-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{tx.description || (isCredit ? 'Rimbursim' : 'Blerje')}</p>
        <p className="text-xs text-gray-400">{formatDate(tx.createdAt)}</p>
      </div>
      <span className={`font-bold text-sm ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
        {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
      </span>
    </div>
  );
}

export default function CustomerWallet() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['wallet', 'transactions'],
    queryFn: () => api.get('/users/wallet-transactions').then((r) => r.data),
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
              <p className="text-green-100 text-sm">Balanca Aktuale</p>
              <p className="font-bold text-3xl">{formatCurrency(user?.walletBalance || 0)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/15 rounded-xl p-4">
              <p className="text-green-100 text-xs mb-1">Kursime Totale</p>
              <p className="font-bold text-xl">{formatCurrency(user?.totalSaved || 0)}</p>
            </div>
            <div className="bg-white/15 rounded-xl p-4">
              <p className="text-green-100 text-xs mb-1">Blerje Totale</p>
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
