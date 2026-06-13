import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Camera, Save, Phone, Lock, Trash2, CheckCircle, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import { CITIES } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function CustomerProfile() {
  const { user, updateUser } = useAuthStore();
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const qc = useQueryClient();

  const { register, handleSubmit, formState: { isDirty } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      city: user?.city || 'Tiranë',
      address: user?.address || '',
    },
  });

  const { register: pwdRegister, handleSubmit: pwdSubmit, reset: pwdReset, formState: { errors: pwdErrors } } = useForm();

  const updateMutation = useMutation({
    mutationFn: (formData) => api.patch('/users/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: (res) => { updateUser(res.data.data); toast.success('Profili u përditësua!'); qc.invalidateQueries(['user']); },
    onError: () => toast.error('Ndodhi një gabim.'),
  });

  const pwdMutation = useMutation({
    mutationFn: (data) => api.patch('/auth/change-password', data),
    onSuccess: () => { toast.success('Fjalëkalimi u ndryshua!'); pwdReset(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Ndodhi një gabim.'),
  });

  const handleSendOtp = async () => {
    setOtpLoading(true);
    try {
      await api.post('/auth/send-phone-otp');
      setOtpSent(true);
      toast.success('Kodi OTP u dërgua në telefonin tuaj!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Dërgimi dështoi.');
    } finally { setOtpLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) { toast.error('Kodi duhet të jetë 6 shifra.'); return; }
    setOtpLoading(true);
    try {
      await api.post('/auth/verify-phone-otp', { otp: otpValue });
      updateUser({ ...user, isPhoneVerified: true });
      setOtpSent(false);
      setOtpValue('');
      toast.success('Numri i telefonit u verifikua! ✓');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kodi i pasaktë.');
    } finally { setOtpLoading(false); }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => { if (v) formData.append(k, v); });
    if (avatarFile) formData.append('avatar', avatarFile);
    updateMutation.mutate(formData);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profili Im</h1>
        <p className="text-gray-500 text-sm">Menaxhoni informacionet e llogarisë</p>
      </div>

      <div className="flex gap-3 mb-6 border-b border-gray-200">
        {[{ id: 'profile', label: 'Profili' }, { id: 'password', label: 'Fjalëkalimi' }, { id: 'delete', label: 'Fshij Llogarinë' }].map(({ id, label }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-all ${activeTab === id ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar */}
          <div className="card p-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <img
                src={avatarPreview || user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&size=120&background=1a3f8a&color=fff`}
                alt={user?.firstName}
                className="w-28 h-28 rounded-full object-cover border-4 border-brand-100"
              />
              <label className="absolute bottom-0 right-0 w-9 h-9 bg-brand-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-700 transition-colors shadow-md">
                <Camera size={16} className="text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
              </label>
            </div>
            <h3 className="font-bold text-gray-900">{user?.firstName} {user?.lastName}</h3>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <div className="mt-3 px-3 py-1 bg-brand-50 rounded-full text-brand-700 text-xs font-semibold capitalize">
              {user?.loyaltyLevel} Member
            </div>
            <div className="mt-4 w-full space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Anëtarësi</span><span className="font-medium">Falas</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Pikë</span><span className="font-medium">{user?.loyaltyPoints?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Kode Referimi</span><span className="font-mono font-bold text-brand-600">{user?.referralCode}</span></div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 card p-6">
            <h3 className="font-bold text-gray-900 mb-5">Informacionet Personale</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[{ name: 'firstName', label: 'Emri' }, { name: 'lastName', label: 'Mbiemri' }].map(({ name, label }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                    <input {...register(name)} className="input-field" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Telefon
                  {user?.isPhoneVerified && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                      <CheckCircle size={11} /> Verifikuar
                    </span>
                  )}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input {...register('phone')} className="input-field pl-9" placeholder="+355 69 000 0000" />
                  </div>
                  {!user?.isPhoneVerified && user?.phone && (
                    <button type="button" onClick={handleSendOtp} disabled={otpLoading}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-60">
                      <ShieldCheck size={15} />{otpSent ? 'Ridërgo' : 'Verifiko'}
                    </button>
                  )}
                </div>
                {otpSent && !user?.isPhoneVerified && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-4 bg-brand-50 border border-brand-200 rounded-xl">
                    <p className="text-sm text-brand-700 font-medium mb-2">Shkruaj kodin 6-shifror të dërguar në {user?.phone}:</p>
                    <div className="flex gap-2">
                      <input
                        type="text" inputMode="numeric" maxLength={6} value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="input-field flex-1 tracking-[0.4em] text-center font-mono font-bold text-lg"
                      />
                      <button type="button" onClick={handleVerifyOtp} disabled={otpLoading || otpValue.length !== 6}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50">
                        {otpLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> : 'Konfirmo'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">Kodi skadon pas 10 minutash</p>
                  </motion.div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Qyteti</label>
                <select {...register('city')} className="input-field">
                  {CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresa</label>
                <input {...register('address')} className="input-field" placeholder="Rruga e Kavajës, 123" />
              </div>
              <button type="submit" disabled={updateMutation.isPending} className="btn-primary">
                {updateMutation.isPending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={16} />Ruaj Ndryshimet</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="card p-6 max-w-md">
          <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><Lock size={18} className="text-brand-600" />Ndrysho Fjalëkalimin</h3>
          <form onSubmit={pwdSubmit((d) => pwdMutation.mutate(d))} className="space-y-4">
            {[{ name: 'currentPassword', label: 'Fjalëkalimi Aktual' }, { name: 'newPassword', label: 'Fjalëkalimi i Ri (min. 8 karaktere)' }, { name: 'confirmPassword', label: 'Konfirmo Fjalëkalimin' }].map(({ name, label }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                <input type="password" {...pwdRegister(name, { required: true, minLength: name !== 'currentPassword' ? 8 : 1 })}
                  className={`input-field ${pwdErrors[name] ? 'input-error' : ''}`} />
              </div>
            ))}
            <button type="submit" disabled={pwdMutation.isPending} className="btn-primary">
              {pwdMutation.isPending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Ndrysho Fjalëkalimin →'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'delete' && (
        <div className="card p-6 max-w-md border-2 border-red-100">
          <h3 className="font-bold text-red-700 mb-3 flex items-center gap-2"><Trash2 size={18} />Fshij Llogarinë</h3>
          <p className="text-gray-600 text-sm mb-4">Kjo veprim është e pakthyeshme. Të gjitha të dhënat tuaja do fshihen përgjithmonë.</p>
          <button className="btn-danger py-3 px-6">Fshij Llogarinë Përgjithmonë</button>
        </div>
      )}
    </div>
  );
}
