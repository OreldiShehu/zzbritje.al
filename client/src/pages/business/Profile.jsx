import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Upload, Save, Building, MapPin, Clock, Camera, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import { CITIES } from '../../utils/constants';
import toast from 'react-hot-toast';

const DAYS = ['E Hënë', 'E Martë', 'E Mërkurë', 'E Enjte', 'E Premte', 'E Shtunë', 'E Diel'];

export default function BusinessProfile() {
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

  const { register, handleSubmit, reset, watch } = useForm();

  useEffect(() => {
    if (business) {
      reset({
        businessName: business.businessName,
        description: business.description,
        phone: business.phone,
        email: business.email,
        website: business.website,
        city: business.city || 'Tiranë',
        address: business.address,
        category: business.category,
      });
      setLogoPreview(business.logo);
      setCoverPreview(business.coverImage);
    }
  }, [business, reset]);

  const updateMutation = useMutation({
    mutationFn: (fd) => api.patch('/businesses/my', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => { qc.invalidateQueries(['business', 'my']); toast.success('Profili u përditësua!'); },
    onError: () => toast.error('Ndodhi një gabim.'),
  });

  const docMutation = useMutation({
    mutationFn: (fd) => api.post('/businesses/my/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => { toast.success('Dokumenti u ngarkua!'); qc.invalidateQueries(['business', 'my']); },
    onError: () => toast.error('Ndodhi një gabim gjatë ngarkimit.'),
  });

  const onSubmit = (data) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => { if (v != null) fd.append(k, v); });
    if (logoFile) fd.append('logo', logoFile);
    if (coverFile) fd.append('coverImage', coverFile);
    updateMutation.mutate(fd);
  };

  const handleDocUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('document', file);
    fd.append('type', 'business_license');
    docMutation.mutate(fd);
  };

  const STATUS_INFO = {
    pending: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', label: 'Në pritje të verifikimit' },
    under_review: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', label: 'Nën shqyrtim nga ekipi ynë' },
    verified: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 border-green-200', label: 'Biznes i Verifikuar ✓' },
    rejected: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 border-red-200', label: 'Aplikimi u refuzua' },
  };

  const status = business?.verificationStatus || 'pending';
  const sInfo = STATUS_INFO[status] || STATUS_INFO.pending;
  const SIcon = sInfo.icon;

  if (isLoading) return <div className="h-64 card skeleton" />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profili i Biznesit</h1>
        <p className="text-gray-500 text-sm">Menaxhoni informacionet dhe dokumentet e biznesit</p>
      </div>

      {/* Status Banner */}
      <div className={`rounded-2xl p-4 mb-6 border flex items-center gap-3 ${sInfo.bg}`}>
        <SIcon size={20} className={`${sInfo.color} flex-shrink-0`} />
        <div className="flex-1">
          <p className={`font-semibold text-sm ${sInfo.color}`}>Statusi: {sInfo.label}</p>
          {status === 'rejected' && business?.rejectionReason && <p className="text-xs text-red-500 mt-0.5">{business.rejectionReason}</p>}
        </div>
        {status !== 'verified' && <span className="text-xs text-gray-500">Ngarkoni dokumentet e kërkuara për verifikim</span>}
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6 border-b border-gray-200">
        {[{ id: 'info', label: 'Informacionet' }, { id: 'images', label: 'Imazhet' }, { id: 'documents', label: 'Dokumentet' }].map(({ id, label }) => (
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Emri i Biznesit *</label>
                <input {...register('businessName', { required: true })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" {...register('email')} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefon</label>
                <input {...register('phone')} className="input-field" placeholder="+355 69 000 0000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
                <input {...register('website')} className="input-field" placeholder="https://biznesijuaj.al" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Qyteti</label>
                <select {...register('city')} className="input-field">
                  {CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresa</label>
                <input {...register('address')} className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Përshkrimi i Biznesit</label>
              <textarea {...register('description')} rows={4} className="input-field resize-none" placeholder="Tregoni rreth biznesit tuaj, shërbimeve dhe ofertave..." />
            </div>
            <button type="submit" disabled={updateMutation.isPending} className="btn-primary flex items-center gap-2">
              {updateMutation.isPending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={16} />Ruaj Ndryshimet</>}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'images' && (
        <div className="space-y-5">
          {/* Cover Image */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Imazhi Kryesor (Cover)</h3>
            <div className="relative h-44 bg-gray-100 rounded-2xl overflow-hidden group cursor-pointer">
              {coverPreview ? <img src={coverPreview} alt="" className="w-full h-full object-cover" /> : <div className="flex flex-col items-center justify-center h-full text-gray-400"><Upload size={32} /><p className="mt-2 text-sm">Ngarko imazhin kryesor</p></div>}
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <div className="bg-white rounded-xl px-4 py-2 text-sm font-medium text-gray-900 flex items-center gap-2"><Camera size={16} />Ndrysho</div>
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); } }} className="sr-only" />
              </label>
            </div>
          </div>
          {/* Logo */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Logo e Biznesit</h3>
            <div className="flex items-center gap-6">
              <div className="relative w-28 h-28 bg-gray-100 rounded-2xl overflow-hidden group cursor-pointer flex-shrink-0">
                {logoPreview ? <img src={logoPreview} alt="" className="w-full h-full object-cover" /> : <div className="flex flex-col items-center justify-center h-full text-gray-400"><Building size={24} /></div>}
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera size={20} className="text-white" />
                  <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); } }} className="sr-only" />
                </label>
              </div>
              <div className="text-sm text-gray-500"><p className="font-medium text-gray-900 mb-1">Kërkesat e logos</p><ul className="space-y-0.5 list-disc pl-4"><li>Formati: PNG, JPG, SVG</li><li>Madhësia minimale: 200×200px</li><li>Sfond transparent rekomandohet</li></ul></div>
            </div>
            {(logoFile || coverFile) && <button onClick={handleSubmit(onSubmit)} className="mt-4 btn-primary text-sm py-2 px-4 flex items-center gap-2"><Save size={14} />Ruaj Imazhet</button>}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-2">Dokumentet Ligjore</h3>
          <p className="text-sm text-gray-500 mb-5">Ngarkoni dokumentet e mëposhtme për verifikimin e biznesit</p>
          <div className="space-y-4">
            {[{ type: 'business_license', label: 'Licenca e Biznesit', desc: 'NIPT / Ekstrakti tregtar' }, { type: 'id_document', label: 'Dokument Identiteti', desc: 'Kartë ID ose Pasaportë e pronarit' }, { type: 'bank_statement', label: 'Deklaratë Bankare', desc: 'Opsionale: Raporti bankar' }].map(({ type, label, desc }) => {
              const doc = business?.documents?.find((d) => d.type === type);
              return (
                <div key={type} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className={doc ? 'text-brand-600' : 'text-gray-400'} />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{label}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {doc ? <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle size={14} />Ngarkuar</span> : <span className="text-xs text-gray-400">Mungon</span>}
                    <label className="btn-secondary text-xs py-1.5 px-3 cursor-pointer flex items-center gap-1">
                      <Upload size={13} />{doc ? 'Ridërgoni' : 'Ngarko'}
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleDocUpload} className="sr-only" />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
