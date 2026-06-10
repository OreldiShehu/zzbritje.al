import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { CITIES, DEAL_TYPES } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function EditDeal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: deal, isLoading } = useQuery({
    queryKey: ['deal', id],
    queryFn: () => api.get(`/deals/${id}`).then((r) => r.data.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data.data),
    staleTime: 10 * 60 * 1000,
  });

  const { register, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm();

  useEffect(() => {
    if (deal) {
      reset({
        title: deal.title,
        description: deal.description,
        termsAndConditions: deal.termsAndConditions,
        dealType: deal.dealType,
        category: deal.category?._id || deal.category,
        city: deal.city || 'Tiranë',
        address: deal.address,
        originalPrice: deal.originalPrice,
        discountedPrice: deal.discountedPrice,
        totalVouchers: deal.totalVouchers,
        maxVouchersPerCustomer: deal.maxVouchersPerCustomer,
        startDate: deal.startDate ? deal.startDate.slice(0, 16) : '',
        endDate: deal.endDate ? deal.endDate.slice(0, 16) : '',
      });
    }
  }, [deal, reset]);

  const updateMutation = useMutation({
    mutationFn: (data) => api.patch(`/deals/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries(['business', 'deals']);
      qc.invalidateQueries(['deal', id]);
      toast.success('Deal-i u përditësua!');
      navigate('/business/deals');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Ndodhi një gabim.'),
  });

  const values = watch();
  const savings = values.originalPrice && values.discountedPrice
    ? ((values.originalPrice - values.discountedPrice) / values.originalPrice * 100).toFixed(0)
    : deal?.discountPercentage || 0;

  const isActive = deal?.status === 'active';

  if (isLoading) return <div className="h-64 card skeleton" />;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/business/deals" className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50"><ArrowLeft size={18} /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edito Deal-in</h1>
          <p className="text-gray-500 text-sm truncate max-w-md">{deal?.title}</p>
        </div>
      </div>

      {isActive && (
        <div className="card p-4 mb-6 bg-amber-50 border border-amber-200 text-sm text-amber-700">
          <strong>⚠️ Deal aktiv:</strong> Ndryshimet në çmim dhe quota kufizojnë modifikimin. Fushat kryesore janë të bllokuara.
        </div>
      )}

      <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-5">
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-gray-900">Detajet Bazë</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Titulli *</label>
            <input {...register('title', { required: true })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Përshkrimi</label>
            <textarea {...register('description')} rows={4} className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Lloji</label>
              <select {...register('dealType')} className="input-field" disabled={isActive}>
                {DEAL_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategoria</label>
              <select {...register('category')} className="input-field">
                <option value="">Zgjidh kategorinë</option>
                {categories?.filter((c) => !c.parent).map((c) => <option key={c._id} value={c._id}>{c.nameAl || c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Qyteti</label>
              <select {...register('city')} className="input-field"><option value="">Zgjidh</option>{CITIES.map((c) => <option key={c}>{c}</option>)}</select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresa</label>
              <input {...register('address')} className="input-field" />
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-gray-900">Çmimi</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Çmimi Origjinal (ALL)</label>
              <input type="number" {...register('originalPrice', { min: 1, valueAsNumber: true })} className="input-field" disabled={isActive} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Çmimi Zbritur (ALL)</label>
              <input type="number" {...register('discountedPrice', { min: 1, valueAsNumber: true })} className="input-field" disabled={isActive} />
            </div>
          </div>
          {savings > 0 && <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">Zbritja: {savings}%</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Voucher</label>
              <input type="number" {...register('totalVouchers', { min: 1, valueAsNumber: true })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Max./Klient</label>
              <input type="number" {...register('maxVouchersPerCustomer', { min: 1, max: 10, valueAsNumber: true })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Data Fillimit</label>
              <input type="datetime-local" {...register('startDate')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Data Mbarimit</label>
              <input type="datetime-local" {...register('endDate')} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Kushtet</label>
            <textarea {...register('termsAndConditions')} rows={3} className="input-field resize-none" />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link to="/business/deals" className="btn-secondary">Anulo</Link>
          <button type="submit" disabled={updateMutation.isPending || !isDirty} className="btn-primary flex items-center gap-2">
            {updateMutation.isPending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={16} />Ruaj Ndryshimet</>}
          </button>
        </div>
      </form>
    </div>
  );
}
