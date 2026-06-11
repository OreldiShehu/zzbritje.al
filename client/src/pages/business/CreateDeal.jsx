import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, X, Image, Plus, ChevronRight, Info } from 'lucide-react';
import api from '../../api/axios';
import { DEAL_TYPES, CITIES } from '../../utils/constants';
import toast from 'react-hot-toast';

const STEPS = ['Detajet Bazë', 'Çmimi & Zbritja', 'Imazhet', 'Rishikim'];

export default function CreateDeal() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data.data),
    staleTime: 10 * 60 * 1000,
  });

  const { register, handleSubmit, watch, control, trigger, formState: { errors } } = useForm({
    defaultValues: {
      dealType: 'percentage_discount',
      currency: 'ALL',
      city: 'Tiranë',
      maxVouchersPerCustomer: 1,
      totalVouchers: 100,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v != null && v !== '') fd.append(k, typeof v === 'object' ? JSON.stringify(v) : v); });
      images.forEach((img) => fd.append('images', img));
      return api.post('/deals', fd);
    },
    onSuccess: () => {
      qc.invalidateQueries(['business', 'deals']);
      toast.success('Deal-i u krijua dhe u dërgua për rishikim!');
      navigate('/business-dashboard/deals');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Ndodhi një gabim.'),
  });

  const values = watch();

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...images, ...files].slice(0, 5);
    setImages(newImages);
    setImagePreviews(newImages.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (i) => {
    const ni = images.filter((_, idx) => idx !== i);
    setImages(ni);
    setImagePreviews(ni.map((f) => URL.createObjectURL(f)));
  };

  const nextStep = async () => {
    const fieldsPerStep = [
      ['title', 'description', 'dealType', 'category', 'city', 'startDate', 'endDate'],
      ['originalPrice', 'discountedPrice'],
      [],
    ];
    const valid = await trigger(fieldsPerStep[step]);
    if (valid) setStep((s) => s + 1);
  };

  const savings = values.originalPrice && values.discountedPrice
    ? ((values.originalPrice - values.discountedPrice) / values.originalPrice * 100).toFixed(0)
    : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Krijo Deal të Ri</h1>
        <p className="text-gray-500 text-sm">Mbushni informacionet dhe publikoni ofertën tuaj</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <button onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 text-sm font-medium transition-all ${i === step ? 'text-brand-600' : i < step ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${i === step ? 'border-brand-600 bg-brand-600 text-white' : i < step ? 'border-brand-600 bg-brand-600 text-white' : 'border-gray-300 text-gray-400'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className="hidden md:block">{s}</span>
            </button>
            {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 mx-2 ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit((d) => createMutation.mutate(d))}>
        {/* Step 0: Basic Info */}
        {step === 0 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-5">Informacionet Bazë</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Titulli i Deal-it *</label>
                  <input {...register('title', { required: 'Titulli është i detyrueshëm', minLength: { value: 10, message: 'Min. 10 karaktere' } })}
                    className={`input-field ${errors.title ? 'input-error' : ''}`} placeholder="p.sh. 50% zbritje për Spa & Masazh" />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Përshkrimi *</label>
                  <textarea {...register('description', { required: true, minLength: 20 })}
                    rows={4} className={`input-field resize-none ${errors.description ? 'input-error' : ''}`}
                    placeholder="Përshkruani ofertën, kushtet, dhe çfarë përfshihet..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Lloji i Deal-it *</label>
                    <select {...register('dealType')} className="input-field">
                      {DEAL_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategoria *</label>
                    <select {...register('category', { required: true })} className={`input-field ${errors.category ? 'input-error' : ''}`}>
                      <option value="">Zgjidh kategorinë</option>
                      {categories?.filter((c) => !c.parent).map((c) => <option key={c._id} value={c._id}>{c.nameAl || c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Qyteti *</label>
                    <select {...register('city')} className="input-field">
                      {CITIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresa</label>
                    <input {...register('address')} className="input-field" placeholder="Rruga, Nr." />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Data e Fillimit *</label>
                    <input type="datetime-local" {...register('startDate', { required: true })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Data e Mbarimit *</label>
                    <input type="datetime-local" {...register('endDate', { required: true })} className="input-field" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={nextStep} className="btn-primary">Hapi Tjetër <ChevronRight size={18} /></button>
            </div>
          </motion.div>
        )}

        {/* Step 1: Pricing */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-5">Çmimi & Zbritja</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Çmimi Origjinal (ALL) *</label>
                    <input type="number" {...register('originalPrice', { required: true, min: 1, valueAsNumber: true })}
                      className={`input-field ${errors.originalPrice ? 'input-error' : ''}`} placeholder="5000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Çmimi me Zbritje (ALL) *</label>
                    <input type="number" {...register('discountedPrice', { required: true, min: 1, valueAsNumber: true })}
                      className={`input-field ${errors.discountedPrice ? 'input-error' : ''}`} placeholder="2500" />
                  </div>
                </div>

                {savings > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-12 h-12 bg-brand-600 text-white rounded-xl flex items-center justify-center font-black text-lg">
                      {savings}%
                    </div>
                    <div>
                      <p className="font-bold text-green-800">Kursim: {savings}%</p>
                      <p className="text-sm text-green-600">Klientët do të kursejnë {(values.originalPrice - values.discountedPrice).toLocaleString()} ALL</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Voucher</label>
                    <input type="number" {...register('totalVouchers', { min: 1, valueAsNumber: true })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Max. per Klient</label>
                    <input type="number" {...register('maxVouchersPerCustomer', { min: 1, max: 10, valueAsNumber: true })} className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kushtet (opsionale)</label>
                  <textarea {...register('termsAndConditions')} rows={3} className="input-field resize-none"
                    placeholder="p.sh. I vlefshëm çdo ditë të javës, rezervim i domosdoshëm..." />
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(0)} className="btn-secondary">← Mbrapa</button>
              <button type="button" onClick={nextStep} className="btn-primary">Hapi Tjetër <ChevronRight size={18} /></button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Images */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-2">Imazhet</h3>
              <p className="text-sm text-gray-500 mb-5">Shtoni deri në 5 imazhe. Imazhi i parë do të jetë i kryesori. (min 800×600px)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    {i === 0 && <span className="absolute top-2 left-2 bg-brand-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">Kryesor</span>}
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {imagePreviews.length < 5 && (
                  <label className="aspect-video rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-all">
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-400">Shto imazh</p>
                    <input type="file" accept="image/*" multiple onChange={handleImageAdd} className="sr-only" />
                  </label>
                )}
              </div>
              {imagePreviews.length === 0 && (
                <div className="flex items-start gap-3 mt-4 bg-amber-50 p-3 rounded-xl">
                  <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">Deal-et me imazhe të mira marrin 3x më shumë klikime. Rekomandojmë të paktën 3 imazhe.</p>
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary">← Mbrapa</button>
              <button type="button" onClick={() => setStep(3)} className="btn-primary">Rishikim <ChevronRight size={18} /></button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-5">Rishikim Final</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Titulli', value: values.title },
                  { label: 'Qyteti', value: values.city },
                  { label: 'Çmimi Origjinal', value: `${(values.originalPrice || 0).toLocaleString()} ALL` },
                  { label: 'Çmimi Zbritur', value: `${(values.discountedPrice || 0).toLocaleString()} ALL` },
                  { label: 'Zbritja', value: `${savings}%` },
                  { label: 'Total Voucher', value: values.totalVouchers },
                  { label: 'Max./Klient', value: values.maxVouchersPerCustomer },
                  { label: 'Imazhe', value: `${imagePreviews.length} të ngarkuara` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-semibold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-blue-800 mb-1">ℹ️ Deal-i do të shqyrtohet</p>
                <p className="text-xs text-blue-600">Pasi ta dorëzoni, ekipi ynë do ta shqyrtojë deal-in brenda 24 orësh. Do të njoftoheni me email.</p>
              </div>
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary">← Mbrapa</button>
              <button type="submit" disabled={createMutation.isPending} className="btn-primary">
                {createMutation.isPending ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Publiko Deal-in →'}
              </button>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  );
}
