import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Clock, AlertCircle, CheckCircle, User, X, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import toast from 'react-hot-toast';

const PRIORITY_BADGE = {
  urgent: 'bg-red-900/50 text-red-400',
  high: 'bg-orange-900/50 text-orange-400',
  medium: 'bg-amber-900/50 text-amber-400',
  low: 'bg-gray-700 text-gray-400',
};

const STATUS_BADGE = {
  open: 'bg-blue-900/50 text-blue-400',
  in_progress: 'bg-amber-900/50 text-amber-400',
  resolved: 'bg-green-900/50 text-green-400',
  closed: 'bg-gray-700 text-gray-400',
};

function TicketModal({ ticket, onClose }) {
  const qc = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const replyMutation = useMutation({
    mutationFn: ({ id, message }) => api.post(`/admin/tickets/${id}/reply`, { message }),
    onSuccess: () => { qc.invalidateQueries(['admin', 'tickets']); toast.success('Mesazhi u dërgua!'); reset(); },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/admin/tickets/${id}`, { status }),
    onSuccess: () => { qc.invalidateQueries(['admin', 'tickets']); toast.success('Statusi u ndryshua!'); },
  });

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-800 rounded-3xl border border-gray-700 max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <div>
            <h3 className="font-bold text-gray-100">{ticket.subject}</h3>
            <p className="text-xs text-gray-500">{ticket.user?.firstName} {ticket.user?.lastName} · {ticket.ticketNumber}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300"><X size={18} /></button>
        </div>

        <div className="p-4 flex gap-2 border-b border-gray-700">
          {['open', 'in_progress', 'resolved', 'closed'].map((s) => (
            <button key={s} onClick={() => statusMutation.mutate({ id: ticket._id, status: s })}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${ticket.status === s ? STATUS_BADGE[s] + ' ring-1 ring-current' : 'border border-gray-600 text-gray-400 hover:bg-gray-700'}`}>
              {s}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {ticket.messages?.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.sender?.role === 'admin' || msg.sender?.role === 'superadmin' ? 'flex-row-reverse' : ''}`}>
              <img src={msg.sender?.avatar || `https://ui-avatars.com/api/?name=${msg.sender?.firstName}&size=32&background=1f2937&color=1a3f8a`}
                alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className={`max-w-sm ${msg.sender?.role === 'admin' || msg.sender?.role === 'superadmin' ? 'items-end' : ''} flex flex-col`}>
                <div className={`rounded-2xl px-4 py-3 text-sm ${msg.sender?.role === 'admin' || msg.sender?.role === 'superadmin' ? 'bg-brand-600 text-white rounded-tr-sm' : 'bg-gray-700 text-gray-200 rounded-tl-sm'}`}>
                  {msg.message}
                </div>
                <p className="text-xs text-gray-600 mt-1">{formatRelativeTime(msg.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>

        {ticket.status !== 'closed' && (
          <form onSubmit={handleSubmit(({ message }) => replyMutation.mutate({ id: ticket._id, message }))} className="p-4 border-t border-gray-700 flex gap-2">
            <input {...register('message', { required: true })} placeholder="Shkruani përgjigjen..." className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500" />
            <button type="submit" disabled={replyMutation.isPending} className="w-10 h-10 bg-brand-600 hover:bg-brand-700 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
              <Send size={16} />
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default function AdminSupport() {
  const [status, setStatus] = useState('open');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'tickets', status, priority, page],
    queryFn: () => api.get(`/admin/tickets?status=${status}&priority=${priority}&page=${page}&limit=20`).then((r) => r.data),
  });

  const tickets = data?.data || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Support Tickets</h1>
          <p className="text-gray-500 text-sm">{data?.pagination?.total || 0} ticket gjithsej</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[{ l: 'Hapur', v: 'open', count: data?.stats?.open || 0, color: 'text-blue-400' }, { l: 'Urgent', v: 'urgent', count: data?.stats?.urgent || 0, color: 'text-red-400' }, { l: 'Në Progres', v: 'in_progress', count: data?.stats?.inProgress || 0, color: 'text-amber-400' }, { l: 'Zgjidhur', v: 'resolved', count: data?.stats?.resolved || 0, color: 'text-green-400' }].map(({ l, v, count, color }) => (
          <div key={v} className="bg-gray-800 rounded-2xl p-4 border border-gray-700 text-center">
            <p className={`text-2xl font-black ${color}`}>{count}</p>
            <p className="text-xs text-gray-500">{l}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-2xl p-4 mb-5 border border-gray-700 flex gap-3 flex-wrap">
        <div className="flex gap-2">
          {[{ v: 'open', l: 'Hapur' }, { v: 'in_progress', l: 'Progres' }, { v: 'resolved', l: 'Zgjidhur' }, { v: 'closed', l: 'Mbyllur' }, { v: '', l: 'Të gjitha' }].map(({ v, l }) => (
            <button key={v} onClick={() => setStatus(v)} className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${status === v ? 'bg-brand-600 text-white' : 'border border-gray-600 text-gray-300 hover:bg-gray-700'}`}>{l}</button>
          ))}
        </div>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-brand-500">
          <option value="">Çdo prioritet</option>
          {['urgent', 'high', 'medium', 'low'].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 bg-gray-800 skeleton rounded-2xl" />)}</div>
      ) : tickets.length > 0 ? (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div key={t._id} className="bg-gray-800 rounded-2xl p-4 border border-gray-700 hover:border-gray-600 transition-all cursor-pointer" onClick={() => setSelected(t)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={16} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-medium text-gray-100 text-sm">{t.subject}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_BADGE[t.priority]}`}>{t.priority}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[t.status]}`}>{t.status}</span>
                    </div>
                    <p className="text-xs text-gray-500">{t.user?.firstName} {t.user?.lastName} · {t.ticketNumber} · {formatRelativeTime(t.createdAt)}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">{t.messages?.length || 0} mesazhe</span>
              </div>
            </div>
          ))}
          {data?.pagination?.pages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button onClick={() => setPage((p) => p - 1)} disabled={!data.pagination.hasPrev} className="px-4 py-2 rounded-xl border border-gray-600 text-sm text-gray-300 disabled:opacity-40">← Para</button>
              <span className="px-3 py-2 text-sm text-gray-500">{page} / {data.pagination.pages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={!data.pagination.hasNext} className="px-4 py-2 rounded-xl border border-gray-600 text-sm text-gray-300 disabled:opacity-40">Pas →</button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-800 rounded-2xl border border-gray-700">
          <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
          <p className="text-gray-400">Asnjë ticket i hapur!</p>
        </div>
      )}

      <AnimatePresence>
        {selected && <TicketModal ticket={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
