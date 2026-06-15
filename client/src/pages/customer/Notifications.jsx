import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { formatRelativeTime } from '../../utils/formatters';
import toast from 'react-hot-toast';

const NOTIF_ICONS = {
  voucher_purchased: '🎫',
  voucher_redeemed: '✅',
  deal_approved: '🚀',
  deal_rejected: '❌',
  deal_expiring: '⏰',
  review_received: '⭐',
  referral_signup: '🎁',
  loyalty_level_up: '🏆',
  wallet_credit: '💰',
  welcome: '👋',
  business_verified: '✅',
  business_rejected: '❌',
  system: '🔔',
  admin_message: '📢',
};

export default function CustomerNotifications() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => api.get(`/users/notifications?page=${page}&limit=20`).then((r) => r.data),
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.patch('/users/notifications/read-all'),
    onSuccess: () => { qc.invalidateQueries(['notifications']); toast.success('Të gjitha u shënuan si lexuar!'); },
  });

  const markMutation = useMutation({
    mutationFn: (id) => api.patch(`/users/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries(['notifications']),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/notifications/${id}`),
    onSuccess: () => { qc.invalidateQueries(['notifications']); toast.success('Njoftimi u fshi!'); },
  });

  const notifications = data?.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Njoftimet</h1>
          {unreadCount > 0 && <p className="text-sm text-brand-600 font-medium">{unreadCount} të palexuara</p>}
        </div>
        {unreadCount > 0 && (
          <button onClick={() => markAllMutation.mutate()} className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium">
            <CheckCheck size={16} />Shëno të gjitha si lexuar
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 card skeleton" />)}</div>
      ) : notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((n, i) => (
            <motion.div key={n._id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              onClick={() => {
                if (!n.isRead) markMutation.mutate(n._id);
                if (n.actionUrl) navigate(n.actionUrl);
              }}
              className={`card p-4 flex items-start gap-4 transition-all ${!n.isRead ? 'border-brand-200 bg-brand-50/40' : 'hover:bg-gray-50'} ${n.actionUrl ? 'cursor-pointer' : ''}`}>
              <div className="w-11 h-11 bg-white rounded-full border border-gray-200 flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                {NOTIF_ICONS[n.type] || '🔔'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${!n.isRead ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                  {!n.isRead && <span className="w-2.5 h-2.5 bg-brand-500 rounded-full flex-shrink-0 mt-1" />}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!n.isRead && (
                  <button onClick={() => markMutation.mutate(n._id)}
                    className="w-8 h-8 rounded-lg hover:bg-brand-50 text-gray-400 hover:text-brand-600 flex items-center justify-center transition-colors" title="Shëno si lexuar">
                    <Check size={16} />
                  </button>
                )}
                <button onClick={() => deleteMutation.mutate(n._id)}
                  className="w-8 h-8 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors" title="Fshi">
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}

          {data?.pagination?.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => setPage((p) => p - 1)} disabled={!data.pagination.hasPrev} className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40">← Para</button>
              <span className="px-3 py-2 text-sm text-gray-600">{page} / {data.pagination.pages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={!data.pagination.hasNext} className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40">Pas →</button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-24 card">
          <Bell size={56} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">Nuk ka njoftime</h3>
          <p className="text-gray-400">Do të njoftoheni për voucher, oferta dhe aktivitete të llogarisë</p>
        </div>
      )}
    </div>
  );
}
