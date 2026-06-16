import { useState, useEffect, lazy, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Upload, Save, Building, MapPin, Clock, Camera, CheckCircle, AlertCircle, Instagram, ImagePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { CITIES } from '../../utils/constants';
import toast from 'react-hot-toast';
import ContractModal from '../../components/ContractModal';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const MapPicker = lazy(() => import('../../components/common/MapPicker'));

const DAYS_EN = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAYS_SQ = ['E Hënë', 'E Martë', 'E Mërkurë', 'E Enjte', 'E Premte', 'E Shtunë', 'E Diel'];
const DEFAULT_HOURS = DAYS_EN.map((day) => ({ day, open: '09:00', close: '17:00', isClosed: true }));

export default function BusinessProfile() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { user, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [hours, setHours] = useState(DEFAULT_HOURS);
  const [showContract, setShowContract] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  const { data: business, isLoading } = useQuery({
    queryKey: ['business', 'my'],
    queryFn: () => api.get('/businesses/my').then((r) => r.data.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data.data),
    staleTime: 10 * 60 * 1000,
  });

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { email: user?.email || '' },
  });

  useEffect(() => {
    if (business) {
      reset({
        name: business.name,
        description: business.description,
        phone: business.phone,
        email: business.email,
        website: business.website,
        city: business.city || 'Tiranë',
        address: business.address,
        category: business.category?._id || business.category || '',
        instagram: business.socialLinks?.instagram || '',
      });
      setLogoPreview(business.logo);
      setCoverPreview(business.coverImage);
      const coords = business.location?.coordinates;
      if (coords?.length === 2) setEditMapPos([coords[1], coords[0]]); // GeoJSON is [lng, lat]
      if (business.businessHours?.length > 0) {
        setHours(DAYS_EN.map((day) => {
          const existing = business.businessHours.find((h) => h.day === day);
          return existing
            ? { day, open: existing.open || '09:00', close: existing.close || '17:00', isClosed: existing.isClosed ?? false }
            : { day, open: '09:00', close: '17:00', isClosed: true };
        }));
      }
    }
  }, [business, reset]);

  const updateMutation = useMutation({
    mutationFn: (fd) => api.patch('/businesses/my', fd),
    onSuccess: () => {
      qc.invalidateQueries(['business', 'my']);
      toast.success(t('business.profile_updated'));
      navigate('/business-dashboard');
    },
    onError: () => toast.error(t('common.error')),
  });

  const docMutation = useMutation({
    mutationFn: (fd) => api.post('/businesses/my/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => { toast.success('Dokumenti u ngarkua!'); qc.invalidateQueries(['business', 'my']); },
    onError: () => toast.error(t('common.error')),
  });

  const hoursMutation = useMutation({
    mutationFn: (hoursData) => api.patch('/businesses/my', { businessHours: hoursData }),
    onSuccess: () => { qc.invalidateQueries(['business', 'my']); toast.success('Oraret u ruajtën me sukses!'); },
    onError: () => toast.error('Ndodhi një gabim. Provo përsëri.'),
  });

  const onSubmit = (data) => {
    const fd = new FormData();
    const { instagram, ...rest } = data;
    Object.entries(rest).forEach(([k, v]) => {
      if (v == null || v === '') return;
      fd.append(k, typeof v === 'object' ? v._id || JSON.stringify(v) : v);
    });
    if (instagram != null) fd.append('socialLinks.instagram', instagram);
    if (logoFile) fd.append('logo', logoFile);
    if (coverFile) fd.append('coverImage', coverFile);
    if (editMapPos) {
      fd.append('lat', editMapPos[0]);
      fd.append('lng', editMapPos[1]);
    }
    updateMutation.mutate(fd);
  };

  const STATUS_INFO = {
    pending: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', label: t('business.pending') },
    under_review: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', label: 'Nën shqyrtim nga ekipi ynë' },
    verified: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 border-green-200', label: `${t('business.verified')} ✓` },
    rejected: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 border-red-200', label: 'Aplikimi u refuzua' },
  };

  const status = business?.verificationStatus || 'pending';
  const sInfo = STATUS_INFO[status] || STATUS_INFO.pending;
  const SIcon = sInfo.icon;

  const [createLogoFile, setCreateLogoFile] = useState(null);
  const [createLogoPreview, setCreateLogoPreview] = useState(null);
  const [createMapPos, setCreateMapPos] = useState(null); // [lat, lng]
  const [editMapPos, setEditMapPos] = useState(null); // [lat, lng]

  const createMutation = useMutation({
    mutationFn: (data) => {
      const fd = new FormData();
      const { instagram, ...rest } = data;
      Object.entries(rest).forEach(([k, v]) => { if (v != null && v !== '') fd.append(k, v); });
      if (instagram) fd.append('socialLinks.instagram', instagram);
      if (createLogoFile) fd.append('logo', createLogoFile);
      if (createMapPos) {
        fd.append('lat', createMapPos[0]);
        fd.append('lng', createMapPos[1]);
      }
      fd.append('contractAgreed', 'true');
      return api.post('/businesses', fd);
    },
    onSuccess: () => {
      qc.invalidateQueries(['business', 'my']);
      toast.success(t('business.profile_created'));
      navigate('/business-dashboard/pending');
    },
    onError: (e) => toast.error(e.response?.data?.message || t('common.error')),
  });

  const handleCreateSubmit = (data) => {
    if (!createLogoFile) { toast.error('Foto e biznesit është e detyrueshme.'); return; }
    setPendingFormData(data);
    setShowContract(true);
  };

  const handleContractAccept = () => {
    setShowContract(false);
    createMutation.mutate(pendingFormData);
  };

  const handleSwitchToCustomer = async () => {
    try {
      const res = await api.patch('/auth/switch-to-customer');
      setAuth(res.data.data, null);
      toast.success('Mirë se vini si klient! Tani mund të gëzoni deal-et tona.');
      navigate('/');
    } catch {
      toast.error('Ndodhi një gabim. Provo përsëri.');
    }
  };

  if (isLoading) return <div className="h-64 card skeleton" />;

  if (!business) return (
    <div className="max-w-xl mx-auto">
      <div className="card p-8 text-center">
        <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building size={32} className="text-brand-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('business.create_profile')}</h2>
        <p className="text-gray-500 mb-6">{t('business.create_profile_subtitle')}</p>
        <form onSubmit={handleSubmit(handleCreateSubmit)} className="text-left space-y-4">

          {/* Logo upload — mandatory */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Foto / Logo e Biznesit *</label>
            <label className={`flex flex-col items-center justify-center gap-3 h-36 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${createLogoPreview ? 'border-brand-400 bg-brand-50' : 'border-gray-300 bg-gray-50 hover:border-brand-400 hover:bg-brand-50'}`}>
              {createLogoPreview ? (
                <img src={createLogoPreview} alt="logo preview" className="h-28 w-28 object-cover rounded-xl" />
              ) : (
                <>
                  <ImagePlus size={28} className="text-gray-400" />
                  <span className="text-sm text-gray-500">Kliko për të ngarkuar logon</span>
                  <span className="text-xs text-gray-400">PNG, JPG · max 2MB</span>
                </>
              )}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => {
                const f = e.target.files[0];
                if (f) { setCreateLogoFile(f); setCreateLogoPreview(URL.createObjectURL(f)); }
              }} />
            </label>
            {!createLogoPreview && <p className="text-xs text-red-500 mt-1">E detyrueshme — do të shfaqet kudo biznesi juaj</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('business.name')} *</label>
            <input {...register('name', { required: true })} className="input-field" placeholder="p.sh. Restorant Besa" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('business.description')} *</label>
            <textarea {...register('description', { required: true })} rows={3} className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('business.phone')} *</label>
              <input {...register('phone', { required: true })} className="input-field" placeholder="+355 6X XXX XXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('business.email')}</label>
              <input {...register('email')} type="email" className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('business.category')} *</label>
            <select {...register('category', { required: true })} className="input-field">
              <option value="">{t('business.select_category')}</option>
              {categories?.filter((c) => !c.parent).map((c) => (
                <option key={c._id} value={c._id}>{c.nameAl || c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('business.city')} *</label>
            <select {...register('city', { required: true })} className="input-field">
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('business.address')}</label>
            <input {...register('address')} className="input-field" placeholder="Rruga, nr. ndërtesës" />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
              <MapPin size={14} className="text-brand-500" /> Vendndodhja në hartë <span className="text-gray-400 font-normal text-xs ml-1">(opsionale)</span>
            </label>
            <p className="text-xs text-gray-400 mb-2">Kliko në hartë për të vendosur vendndodhjen e saktë të biznesit</p>
            <Suspense fallback={<div className="h-48 bg-gray-100 rounded-xl animate-pulse" />}>
              <MapPicker position={createMapPos} onChange={setCreateMapPos} height="190px" />
            </Suspense>
            {createMapPos && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle size={12} /> Vendndodhja u vendos: {createMapPos[0].toFixed(4)}, {createMapPos[1].toFixed(4)}
              </p>
            )}
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
              <Instagram size={14} className="text-pink-500" /> Instagram
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">instagram.com/</span>
              <input {...register('instagram')} className="input-field pl-28" placeholder="biznesijuaj" />
            </div>
          </div>
          <button type="submit" disabled={createMutation.isPending} className="btn-primary w-full">
            {createMutation.isPending ? t('business.creating') : t('business.create_btn')}
          </button>
        </form>
      </div>

      {showContract && (
        <ContractModal
          businessName={pendingFormData?.name || 'Biznesi juaj'}
          ownerName={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
          onAccept={handleContractAccept}
          onDecline={() => setShowContract(false)}
          onSwitchToCustomer={handleSwitchToCustomer}
        />
      )}
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('business.profile')}</h1>
        <p className="text-gray-500 text-sm">{t('business.create_profile_subtitle')}</p>
      </div>

      {/* Status Banner */}
      <div className={`rounded-2xl p-4 mb-6 border flex items-center gap-3 ${sInfo.bg}`}>
        <SIcon size={20} className={`${sInfo.color} flex-shrink-0`} />
        <div className="flex-1">
          <p className={`font-semibold text-sm ${sInfo.color}`}>{t('business.status_label')}: {sInfo.label}</p>
          {status === 'rejected' && business?.rejectionReason && <p className="text-xs text-red-500 mt-0.5">{business.rejectionReason}</p>}
        </div>
        {status !== 'verified' && <span className="text-xs text-gray-500">{t('business.upload_docs_note')}</span>}
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6 border-b border-gray-200">
        {[{ id: 'info', label: t('business.info_tab') }, { id: 'images', label: t('business.images_tab') }, { id: 'hours', label: 'Oraret' }].map(({ id, label }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-all ${activeTab === id ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="card p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('business.name')} *</label>
                <input {...register('name', { required: true })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('business.email')}</label>
                <input type="email" {...register('email')} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('business.phone')}</label>
                <input {...register('phone')} className="input-field" placeholder="+355 69 000 0000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('business.website')}</label>
                <input {...register('website')} className="input-field" placeholder="https://biznesijuaj.al" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('business.city')}</label>
                <select {...register('city')} className="input-field">
                  {CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('business.address')}</label>
                <input {...register('address')} className="input-field" placeholder="Rruga, nr. ndërtesës" />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                  <MapPin size={14} className="text-brand-500" /> Vendndodhja në hartë <span className="text-gray-400 font-normal text-xs ml-1">(opsionale — kliko për të ndryshuar)</span>
                </label>
                <Suspense fallback={<div className="h-48 bg-gray-100 rounded-xl animate-pulse" />}>
                  <MapPicker position={editMapPos} onChange={setEditMapPos} height="190px" />
                </Suspense>
                {editMapPos && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle size={12} /> {editMapPos[0].toFixed(4)}, {editMapPos[1].toFixed(4)}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                  <Instagram size={14} className="text-pink-500" /> Instagram
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">instagram.com/</span>
                  <input {...register('instagram')} className="input-field pl-28" placeholder="biznesijuaj" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('business.description')}</label>
              <textarea {...register('description')} rows={4} className="input-field resize-none" />
            </div>
            <button type="submit" disabled={updateMutation.isPending} className="btn-primary flex items-center gap-2">
              {updateMutation.isPending ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('business.saving')}</> : <><Save size={16} />{t('business.save_btn')}</>}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'hours' && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} className="text-brand-600" />
            <h3 className="font-bold text-gray-900">Oraret e Punës</h3>
          </div>
          <p className="text-sm text-gray-500 mb-5">Vendosni orarin e çdo dite. Klientët do ta shohin në profilin tuaj publik.</p>
          <div className="space-y-3">
            {hours.map((h, i) => (
              <div key={h.day} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <span className="w-24 text-sm font-medium text-gray-700 flex-shrink-0">{DAYS_SQ[i]}</span>
                <label className="flex items-center gap-1.5 cursor-pointer select-none flex-shrink-0">
                  <div
                    onClick={() => setHours((prev) => prev.map((d, idx) => idx === i ? { ...d, isClosed: !d.isClosed } : d))}
                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${!h.isClosed ? 'bg-brand-600' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${!h.isClosed ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className={`text-xs font-medium ${!h.isClosed ? 'text-brand-600' : 'text-gray-400'}`}>{!h.isClosed ? 'Hapur' : 'Mbyllur'}</span>
                </label>
                {!h.isClosed && (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time" value={h.open}
                      onChange={(e) => setHours((prev) => prev.map((d, idx) => idx === i ? { ...d, open: e.target.value } : d))}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-brand-500 w-28"
                    />
                    <span className="text-gray-400 text-sm">–</span>
                    <input
                      type="time" value={h.close}
                      onChange={(e) => setHours((prev) => prev.map((d, idx) => idx === i ? { ...d, close: e.target.value } : d))}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-brand-500 w-28"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => hoursMutation.mutate(hours)}
            disabled={hoursMutation.isPending}
            className="btn-primary flex items-center gap-2 mt-6"
          >
            {hoursMutation.isPending ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Duke ruajtur...</> : <><Save size={16} />Ruaj Oraret</>}
          </button>
        </div>
      )}

      {activeTab === 'images' && (
        <div className="space-y-5">
          {/* Cover Image */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4">{t('business.cover_image')}</h3>
            <div className="relative h-44 bg-gray-100 rounded-2xl overflow-hidden group cursor-pointer">
              {coverPreview ? <img src={coverPreview} alt="" className="w-full h-full object-cover" /> : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Upload size={32} /><p className="mt-2 text-sm">{t('business.upload_cover')}</p>
                </div>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <div className="bg-white rounded-xl px-4 py-2 text-sm font-medium text-gray-900 flex items-center gap-2"><Camera size={16} />{t('common.edit')}</div>
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); } }} className="sr-only" />
              </label>
            </div>
          </div>
          {/* Logo */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4">{t('business.logo_title')}</h3>
            <div className="flex items-center gap-6">
              <div className="relative w-28 h-28 bg-gray-100 rounded-2xl overflow-hidden group cursor-pointer flex-shrink-0">
                {logoPreview ? <img src={logoPreview} alt="" className="w-full h-full object-cover" /> : <div className="flex flex-col items-center justify-center h-full text-gray-400"><Building size={24} /></div>}
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera size={20} className="text-white" />
                  <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); } }} className="sr-only" />
                </label>
              </div>
              <div className="text-sm text-gray-500">
                <p className="font-medium text-gray-900 mb-1">{t('business.logo_requirements')}</p>
                <ul className="space-y-0.5 list-disc pl-4">
                  <li>PNG, JPG, SVG</li>
                  <li>Min 200×200px</li>
                </ul>
              </div>
            </div>
            {(logoFile || coverFile) && (
              <button onClick={handleSubmit(onSubmit)} className="mt-4 btn-primary text-sm py-2 px-4 flex items-center gap-2">
                <Save size={14} />{t('business.save_btn')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
