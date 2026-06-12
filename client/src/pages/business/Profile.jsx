import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Upload, Save, Building, MapPin, Clock, Camera, CheckCircle, AlertCircle, Instagram } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { CITIES } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function BusinessProfile() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('info');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const { data: business, isLoading } = useQuery({
    queryKey: ['business', 'my'],
    queryFn: () => api.get('/businesses/my').then((r) => r.data.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data.data),
    staleTime: 10 * 60 * 1000,
  });

  const { register, handleSubmit, reset } = useForm();

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
    }
  }, [business, reset]);

  const updateMutation = useMutation({
    mutationFn: (fd) => api.patch('/businesses/my', fd),
    onSuccess: () => { qc.invalidateQueries(['business', 'my']); toast.success(t('business.profile_updated')); },
    onError: () => toast.error(t('common.error')),
  });

  const docMutation = useMutation({
    mutationFn: (fd) => api.post('/businesses/my/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => { toast.success('Dokumenti u ngarkua!'); qc.invalidateQueries(['business', 'my']); },
    onError: () => toast.error(t('common.error')),
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

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/businesses', data),
    onSuccess: () => { qc.invalidateQueries(['business', 'my']); toast.success(t('business.profile_created')); },
    onError: (e) => toast.error(e.response?.data?.message || t('common.error')),
  });

  if (isLoading) return <div className="h-64 card skeleton" />;

  if (!business) return (
    <div className="max-w-xl mx-auto">
      <div className="card p-8 text-center">
        <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building size={32} className="text-brand-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('business.create_profile')}</h2>
        <p className="text-gray-500 mb-6">{t('business.create_profile_subtitle')}</p>
        <form onSubmit={handleSubmit((d) => {
          const { instagram, ...rest } = d;
          createMutation.mutate({ ...rest, ...(instagram ? { socialLinks: { instagram } } : {}) });
        })} className="text-left space-y-4">
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
        {[{ id: 'info', label: t('business.info_tab') }, { id: 'images', label: t('business.images_tab') }].map(({ id, label }) => (
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
