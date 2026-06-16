import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Ban, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const ROLE_BADGE = { customer: 'bg-gray-700 text-gray-300', business: 'bg-purple-900/50 text-purple-400', admin: 'bg-red-900/50 text-red-400', superadmin: 'bg-amber-900/50 text-amber-400' };

export default function AdminUsers() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', search, role, page],
    queryFn: () => api.get(`/admin/users?search=${search}&role=${role}&page=${page}&limit=20`).then((r) => r.data),
  });

  const blockMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.patch(`/admin/users/${id}/block`, { isActive }),
    onSuccess: () => { qc.invalidateQueries(['admin', 'users']); toast.success(t('admin_ui.status_changed')); },
    onError: () => toast.error(t('common.error')),
  });

  const users = data?.data || [];

  const COLS = [
    t('admin_ui.col_user'),
    t('admin_ui.col_email'),
    t('admin_ui.col_role'),
    t('admin_ui.col_member_since'),
    t('admin_ui.col_status'),
    t('admin_ui.col_actions'),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">{t('admin_ui.manage_users')}</h1>
          <p className="text-gray-500 text-sm">{(data?.pagination?.total || 0).toLocaleString()} përdorues gjithsej</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-2xl p-4 mb-5 border border-gray-700 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Kërko me emër ose email..." className="w-full bg-gray-700 border border-gray-600 rounded-xl pl-9 pr-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500" />
        </div>
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}
          className="bg-gray-700 border border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-500">
          <option value="">Të gjitha rolet</option>
          {[{ v: 'customer', l: 'Klient' }, { v: 'business', l: 'Biznes' }, { v: 'admin', l: 'Admin' }, { v: 'superadmin', l: 'Superadmin' }].map(({ v, l }) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-14 bg-gray-800 skeleton rounded-xl" />)}</div>
      ) : (
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-700">
                {COLS.map((h, i) => (
                  <th key={h} className={`text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 ${i === 1 || i === 3 ? 'hidden sm:table-cell' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.firstName}&background=1f2937&color=1a3f8a&size=32`} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-200">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-gray-500 capitalize">{u.loyaltyLevel}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-gray-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${ROLE_BADGE[u.role] || 'bg-gray-700 text-gray-400'}`}>{u.role}</span>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-gray-500">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1 text-xs font-medium w-fit px-2 py-1 rounded-full ${u.isActive ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                      {u.isActive ? <><CheckCircle size={12} />{t('admin_ui.active')}</> : <><Ban size={12} />{t('admin_ui.blocked')}</>}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => blockMutation.mutate({ id: u._id, isActive: !u.isActive })}
                      disabled={u.role === 'superadmin'}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all disabled:opacity-30 ${u.isActive ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-green-900/30 text-green-400 hover:bg-green-900/50'}`}>
                      {u.isActive ? t('admin_ui.block') : t('admin_ui.unblock')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {data?.pagination?.pages > 1 && (
            <div className="flex justify-center gap-2 py-4 border-t border-gray-700">
              <button onClick={() => setPage((p) => p - 1)} disabled={!data.pagination.hasPrev} className="px-4 py-2 rounded-xl border border-gray-600 text-sm text-gray-300 disabled:opacity-40">{t('search.prev')}</button>
              <span className="px-3 py-2 text-sm text-gray-500">{page} / {data.pagination.pages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={!data.pagination.hasNext} className="px-4 py-2 rounded-xl border border-gray-600 text-sm text-gray-300 disabled:opacity-40">{t('search.next')}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
