import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Tag, ChevronRight, X, Sparkles } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = ['🍔', '💆', '🎭', '🏋️', '🏨', '✈️', '📚', '🛍️', '🔧', '🐾', '🎓', '💻', '🚗', '💄', '🏥'];

function CategoryModal({ category, categories, onClose, onSave }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: category ? { nameAl: category.nameAl, nameEn: category.nameEn, icon: category.icon, parent: category.parent } : {},
  });
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-800 rounded-3xl p-6 max-w-md w-full border border-gray-700">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-100">{category ? 'Edito Kategorinë' : 'Krijo Kategori'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Emri Shqip *</label>
            <input {...register('nameAl', { required: true })} className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-500" placeholder="p.sh. Restorante" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Emri Anglisht</label>
            <input {...register('nameEn')} className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-500" placeholder="e.g. Restaurants" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Ikona</label>
            <div className="grid grid-cols-8 gap-2 mb-2">
              {CATEGORY_ICONS.map((icon) => (
                <label key={icon} className="relative">
                  <input type="radio" {...register('icon')} value={icon} className="sr-only peer" />
                  <div className="text-xl cursor-pointer text-center py-1.5 rounded-lg peer-checked:bg-brand-900/50 peer-checked:ring-2 peer-checked:ring-brand-500 hover:bg-gray-700 transition-all">{icon}</div>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Kategoria Prind (nëse nënkategori)</label>
            <select {...register('parent')} className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-500">
              <option value="">Kategori Kryesore</option>
              {categories?.filter((c) => !c.parent).map((c) => <option key={c._id} value={c._id}>{c.nameAl}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl py-2.5 text-sm font-medium transition-colors">Anulo</button>
            <button type="submit" className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">Ruaj</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminCategories() {
  const [modal, setModal] = useState(null);
  const qc = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => api.get('/categories?all=true').then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/admin/categories', data),
    onSuccess: () => { qc.invalidateQueries(['categories']); toast.success('Kategoria u krijua!'); setModal(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Ndodhi një gabim.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/admin/categories/${id}`, data),
    onSuccess: () => { qc.invalidateQueries(['categories']); toast.success('Kategoria u përditësua!'); setModal(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => { qc.invalidateQueries(['categories']); toast.success('Kategoria u fshi!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Nuk mund ta fshij — ka deal-e aktive.'),
  });

  const seedMutation = useMutation({
    mutationFn: () => api.post('/admin/categories/seed-defaults'),
    onSuccess: (res) => { qc.invalidateQueries(['categories']); toast.success(res.data.message || '20 kategori u shtuan!'); },
    onError: () => toast.error('Ndodhi një gabim.'),
  });

  const rootCategories = (categories || []).filter((c) => !c.parent);
  const getChildren = (parentId) => (categories || []).filter((c) => c.parent === parentId || c.parent?._id === parentId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Kategoritë</h1>
          <p className="text-gray-500 text-sm">{categories?.length || 0} kategori gjithsej</p>
        </div>
        <div className="flex gap-2">
          {(categories?.length || 0) === 0 && (
            <button
              onClick={() => { if (window.confirm('Shto 20 kategoritë standarde shqip?')) seedMutation.mutate(); }}
              disabled={seedMutation.isPending}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors text-sm"
            >
              <Sparkles size={16} />{seedMutation.isPending ? 'Duke shtuar...' : 'Shto 20 Kategori'}
            </button>
          )}
          <button onClick={() => setModal({ type: 'create' })} className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors text-sm">
            <Plus size={16} />Krijo Kategori
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-gray-800 skeleton rounded-2xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {rootCategories.map((cat) => {
            const children = getChildren(cat._id);
            return (
              <div key={cat._id} className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <div className="flex items-center gap-4 p-4 hover:bg-gray-700/30 transition-colors">
                  <div className="text-2xl">{cat.icon || '📦'}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-100">{cat.nameAl}</p>
                    <p className="text-xs text-gray-500">{cat.nameEn} · {cat.dealsCount || 0} deal · {children.length} nënkategori</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setModal({ type: 'sub', parent: cat })}
                      className="text-xs bg-gray-700 text-gray-300 hover:bg-gray-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                      <Plus size={12} />Nënkategori
                    </button>
                    <button onClick={() => setModal({ type: 'edit', category: cat })}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => { if (confirm('Jeni të sigurt?')) deleteMutation.mutate(cat._id); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {children.length > 0 && (
                  <div className="border-t border-gray-700 divide-y divide-gray-700/50">
                    {children.map((child) => (
                      <div key={child._id} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-700/20">
                        <ChevronRight size={14} className="text-gray-600 flex-shrink-0" />
                        <span className="text-sm">{child.icon}</span>
                        <div className="flex-1"><p className="text-sm text-gray-300">{child.nameAl}</p><p className="text-xs text-gray-600">{child.dealsCount || 0} deal</p></div>
                        <button onClick={() => setModal({ type: 'edit', category: child })} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-700"><Edit size={13} /></button>
                        <button onClick={() => { if (confirm('Jeni të sigurt?')) deleteMutation.mutate(child._id); }} className="w-7 h-7 flex items-center justify-center rounded-lg text-red-500/60 hover:text-red-400 hover:bg-red-900/20"><Trash2 size={13} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <CategoryModal
            category={modal.type === 'edit' ? modal.category : modal.type === 'sub' ? { parent: modal.parent?._id } : null}
            categories={categories}
            onClose={() => setModal(null)}
            onSave={(data) => {
              if (modal.type === 'sub') data.parent = modal.parent?._id;
              if (modal.type === 'edit') updateMutation.mutate({ id: modal.category._id, data });
              else createMutation.mutate(data);
            }} />
        )}
      </AnimatePresence>
    </div>
  );
}
