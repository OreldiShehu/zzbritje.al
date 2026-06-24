import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, X, Image, Plus, ChevronRight, Info, Crown, Clock } from 'lucide-react';
import api from '../../api/axios';
import { DEAL_TYPES, CITIES } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

const WA_NUMBER = '447444842624';
const WA_MSG = encodeURIComponent('Përshëndetje, dua të kaloj në planin Pro (1,500 ALL/muaj) për biznesin tim në Zbritje.al');
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${WA_MSG}`;

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

  const { data: business } = useQuery({
    queryKey: ['my-business'],
    queryFn: () => api.get('/businesses/my').then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const isFreePlan = business?.plan === 'free';

  const { data: activeDealsData } = useQuery({
    queryKey: ['business', 'active-deals-count'],
    queryFn: () => api.get('/deals/business/my?status=active&limit=1').then((r) => r.data),
    enabled: !!business && isFreePlan,
    staleTime: 2 * 60 * 1000,
  });

  const activeDealsCount = activeDealsData?.pagination?.total || 0;

  useEffect(() => {
    if (business && isFreePlan && activeDealsCount >= 2) {
      setPlanLimitError('Keni arritur limitin e planit falas (2 deals aktive). Kaloni në Pro për deals dhe kupon të pakufizuara.');
    }
  }, [business, isFreePlan, activeDealsCount]);

  const { register, handleSubmit, watch, control, trigger, formState: { errors } } = useForm({
    defaultValues: {
      dealType: 'percentage_discount',
      currency: 'ALL',
      city: 'Tiranë',
      maxPerCustomer: 1,
      totalVouchers: 10,
    },
  });

  const [planLimitError, setPlanLimitError] = useState(null);
  const [notVerified, setNotVerified] = useState(false);

  const WA_VERIFY_MSG = encodeURIComponent('Përshëndetje, biznesi im në Zbritje.al është gati dhe pret verifikimin. Ju lutem shqyrtojeni sa më shpejt. Faleminderit!');
  const WA_VERIFY_URL = `https://wa.me/${WA_NUMBER}?text=${WA_VERIFY_MSG}`;

  const createMutation = useMutation({
    mutationFn: (data) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v != null && v !== '') fd.append(k, typeof v === 'object' ? JSON.stringify(v) : v); });
      images.forEach((img) => fd.append('images', img));
      return api.post('/deals', fd);
    },
    onSuccess: () => {
      qc.invalidateQueries(['business', 'deals']);
      toast.success('Deal-i u aktivizua — është live tani!');
      navigate('/business-dashboard/deals');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || '';
      if (msg.startsWith('PLAN_LIMIT_')) {
        setPlanLimitError(msg.replace(/^PLAN_LIMIT_\w+:/, ''));
      } else if (msg.startsWith('BUSINESS_NOT_VERIFIED')) {
        setNotVerified(true);
      } else {
        toast.error(msg || 'Ndodhi një gabim.');
      }
    },
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
    const isFixedDiscount = values.dealType === 'fixed_discount';
    const fieldsPerStep = [
      ['title', 'description', 'dealType', 'category', 'city', 'startDate', 'endDate'],
      isFixedDiscount ? ['businessPrice'] : ['originalPrice', 'businessPrice'],
      [],
    ];
    const valid = await trigger(fieldsPerStep[step]);
    if (!valid) return;

    if (step === 1) {
      // A5: Price comparison — customer must pay less than original price
      if (!isFixedDiscount && values.originalPrice && customerPrice >= values.originalPrice) {
        toast.error('Çmimi i klientit duhet të jetë më i ulët se çmimi origjinal. Rishikoni çmimet.');
        return;
      }
      // A4: Free plan — max 10 vouchers per deal
      if (isFreePlan && (values.totalVouchers || 0) > 10) {
        toast.error('Plani Falas lejon maksimumi 10 kupon për deal. Uleni numrin ose kaloni në Pro.');
        return;
      }
    }

    setStep((s) => s + 1);
  };

  const MARKUP_RATE = 0.15;
  const businessPrice = Number(values.businessPrice) || 0;
  const customerPrice = businessPrice ? Math.round(businessPrice * (1 + MARKUP_RATE)) : 0;
  const platformMarkup = customerPrice - businessPrice;
  const businessEarning = businessPrice; // business keeps full price, pays 0% commission
  const platformTotal = platformMarkup; // platform earns only from customer markup
  const savings = values.originalPrice && customerPrice
    ? ((values.originalPrice - customerPrice) / values.originalPrice * 100).toFixed(0)
    : 0;

  if (notVerified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
          <Clock size={32} className="text-amber-600" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Biznesi nuk është verifikuar</h2>
        <p className="text-gray-500 mb-6 max-w-sm">Biznesi juaj është në pritje të verifikimit nga admini. Pasi të aprovohet, mund të krijoni deals.</p>
        <a href={WA_VERIFY_URL} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-2xl transition-colors text-sm">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Njoftoni adminin në WhatsApp
        </a>
      </div>
    );
  }

  if (planLimitError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
          <Crown size={32} className="text-amber-600" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Limit i Planit Falas</h2>
        <p className="text-gray-500 mb-6 max-w-sm">{planLimitError}</p>
        <a href={WA_URL} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-2xl transition-colors text-sm">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Kontaktoni për Plan Pro — 1,500 ALL/muaj
        </a>
        <button onClick={() => setPlanLimitError(null)} className="mt-4 text-sm text-gray-400 hover:text-gray-600">
          ← Kthehu
        </button>
      </div>
    );
  }

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

      <form onSubmit={handleSubmit((d) => {
        if (d.dealType === 'fixed_discount') d.originalPrice = d.businessPrice;
        createMutation.mutate(d);
      })}>
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
                <div className={`grid ${values.dealType !== 'fixed_discount' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                  {values.dealType !== 'fixed_discount' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Çmimi Origjinal (ALL) *</label>
                      <input type="number" {...register('originalPrice', { required: values.dealType !== 'fixed_discount', min: 1, valueAsNumber: true })}
                        className={`input-field ${errors.originalPrice ? 'input-error' : ''}`} placeholder="9000" />
                      <p className="text-xs text-gray-400 mt-1">Çmimi i plotë pa zbritje</p>
                      {values.originalPrice && customerPrice >= values.originalPrice && (
                        <p className="text-red-500 text-xs mt-1">⚠ Klienti paguan {customerPrice} L — duhet të jetë nën çmimin origjinal</p>
                      )}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {values.dealType === 'fixed_discount' ? 'Çmimi i Deal-it (ALL) *' : 'Çmimi juaj i Deal-it (ALL) *'}
                    </label>
                    <input type="number" {...register('businessPrice', { required: true, min: 1, valueAsNumber: true })}
                      className={`input-field ${errors.businessPrice ? 'input-error' : ''}`} placeholder="4500" />
                    <p className="text-xs text-gray-400 mt-1">Çmimi që dëshironi — platforma shton 15% markup</p>
                  </div>
                </div>

                {businessPrice > 0 && (
                  <div className="rounded-xl border-2 border-brand-200 bg-brand-50 p-4 space-y-3">
                    <p className="text-sm font-bold text-brand-800">Ndarja e çmimit automatike</p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-white rounded-lg p-3 border border-brand-100">
                        <p className="text-xs text-gray-500 mb-1">Klienti paguan</p>
                        <p className="font-black text-lg text-gray-900">{formatCurrency(customerPrice)}</p>
                        <p className="text-xs text-gray-400">({formatCurrency(businessPrice)} + 15% markup)</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-green-200">
                        <p className="text-xs text-gray-500 mb-1">Ju fitoni</p>
                        <p className="font-black text-lg text-green-700">{formatCurrency(businessEarning)}</p>
                        <p className="text-xs text-gray-400">çmimi juaj i plotë — 0% komision</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-amber-200">
                        <p className="text-xs text-gray-500 mb-1">Platforma merr</p>
                        <p className="font-black text-lg text-amber-700">{formatCurrency(platformTotal)}</p>
                        <p className="text-xs text-gray-400">15% nga klienti</p>
                      </div>
                    </div>
                    {savings > 0 && (
                      <p className="text-xs text-center text-brand-700 font-medium">
                        Klienti kursen {savings}% nga çmimi origjinal
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Numri i Kuponëve</label>
                    <input type="number" {...register('totalVouchers', { min: 1, valueAsNumber: true })} className="input-field" />
                    {isFreePlan && (values.totalVouchers || 0) > 10 && (
                      <p className="text-amber-600 text-xs mt-1">⚠ Plani Falas lejon maks. 10 kupon. Uleni ose kalonin Pro.</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Max. per Klient</label>
                    <input type="number" {...register('maxPerCustomer', { min: 1, max: 10, valueAsNumber: true })} className="input-field" />
                  </div>
                </div>
                <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" {...register('onePerTable')} className="w-5 h-5 rounded accent-brand-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">1 kupon për vizitë</p>
                    <p className="text-xs text-gray-400">Çdo vizitë mund të përdorë vetëm 1 kupon — kontrollohet gjatë skanimit</p>
                  </div>
                </label>
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
                  ...(values.dealType !== 'fixed_discount' ? [{ label: 'Çmimi Origjinal', value: formatCurrency(values.originalPrice || 0) }] : []),
                  { label: 'Çmimi juaj i Deal-it', value: formatCurrency(businessPrice || 0) },
                  { label: 'Klienti paguan', value: formatCurrency(customerPrice) },
                  { label: 'Ju fitoni / kupon', value: formatCurrency(businessEarning) },
                  ...(values.dealType !== 'fixed_discount' ? [{ label: 'Zbritja (klientit)', value: `${savings}%` }] : []),
                  { label: 'Numri i Kuponëve', value: values.totalVouchers },
                  { label: 'Max./Klient', value: values.maxPerCustomer },
                  { label: 'Imazhe', value: `${imagePreviews.length} të ngarkuara` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-semibold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-green-800 mb-1">✅ Deal-i aktivizohet menjëherë</p>
                <p className="text-xs text-green-600">Si biznes i verifikuar, deal-i juaj do të bëhet live menjëherë pas dorëzimit dhe do të jetë i dukshëm për klientët.</p>
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
