import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, Mail, Lock, User, Gift, Building } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function Register() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const ref = params.get('ref') || '';

  const schema = z.object({
    firstName: z.string().min(2, t('common.error')).max(50),
    lastName: z.string().min(2, t('common.error')).max(50),
    businessName: z.string().optional(),
    email: z.string().email(t('common.error')),
    phone: z.string().optional(),
    password: z.string().min(8, t('common.error')),
    confirmPassword: z.string(),
    role: z.enum(['customer', 'business']),
    referralCode: z.string().optional(),
    terms: z.boolean().refine((v) => v === true, t('common.error')),
  }).refine((d) => d.password === d.confirmPassword, {
    message: t('common.error'),
    path: ['confirmPassword'],
  }).refine((d) => d.role !== 'business' || (d.businessName && d.businessName.length >= 2), {
    message: 'Emri i biznesit është i detyrueshëm',
    path: ['businessName'],
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'customer', referralCode: ref, terms: false },
  });

  const role = watch('role');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { confirmPassword, terms, ...submitData } = data;
      const res = await api.post('/auth/register', submitData);
      setAuth(res.data.user, res.data.accessToken);
      toast.success(t('auth.welcome_user', { name: res.data.user.firstName }) + ' 🎉');
      navigate(role === 'business' ? '/business-dashboard/profile' : '/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || t('common.error');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero-gradient items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-64 h-64 bg-brand-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-emerald-400 rounded-full blur-3xl" />
        </div>
        <div className="relative text-center text-white">
          <div className="w-20 h-20 bg-brand-gradient rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-brand-lg">
            <span className="font-black text-4xl">Z</span>
          </div>
          <h2 className="text-3xl font-black mb-4 font-display">{t('auth.register_title')}</h2>
          <p className="text-blue-100 mb-8">{t('auth.register_subtitle')}</p>
          <div className="space-y-3 text-left max-w-xs mx-auto">
            {[
              t('auth.feature_bonus', '200 L bonus in wallet after verification'),
              t('auth.feature_deals', 'Access to thousands of exclusive deals'),
              t('auth.feature_qr', 'Instant QR Code voucher'),
              t('auth.feature_loyalty', 'Loyalty program with points and rewards'),
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                <span className="text-brand-300">✓</span>
                <span className="text-sm text-white">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md py-8"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center"><span className="text-white font-black text-xl">Z</span></div>
            <span className="font-black text-2xl">Zbritje<span className="text-brand-600">.al</span></span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">{t('auth.register_title')}</h2>
          <p className="text-gray-500 mb-6">{t('auth.register_subtitle')}</p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'customer', emoji: '🛍️', label: t('auth.role_customer'), desc: t('auth.customer_desc') },
              { value: 'business', emoji: '🏢', label: t('auth.role_business'), desc: t('auth.business_desc') },
            ].map(({ value, emoji, label, desc }) => (
              <label key={value} className={`cursor-pointer flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all ${role === value ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <input type="radio" value={value} {...register('role')} className="sr-only" />
                <span className="text-lg">{emoji} {label}</span>
                <span className="text-xs text-gray-500">{desc}</span>
              </label>
            ))}
          </div>

          {/* Social login */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <a href={`${import.meta.env.VITE_API_URL || '/api/v1'}/auth/google`}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors shadow-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </a>
            <a href={`${import.meta.env.VITE_API_URL || '/api/v1'}/auth/facebook`}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors shadow-sm">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </a>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-gray-200" /><span className="text-gray-400 text-sm">{t('auth.or_email')}</span><div className="h-px flex-1 bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'firstName', label: t('auth.first_name'), icon: User, placeholder: 'Arta' },
                { name: 'lastName', label: t('auth.last_name'), icon: User, placeholder: 'Gashi' },
              ].map(({ name, label, icon: Icon, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <div className="relative">
                    <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input {...register(name)} placeholder={placeholder} className={`input-field pl-9 ${errors[name] ? 'input-error' : ''}`} />
                  </div>
                  {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
                </div>
              ))}
            </div>

            {role === 'business' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Emri i Biznesit *</label>
                <div className="relative">
                  <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input {...register('businessName')} placeholder="p.sh. Restorant Besa" className={`input-field pl-9 ${errors.businessName ? 'input-error' : ''}`} />
                </div>
                {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName.message}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.email')}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('email')} type="email" placeholder="ju@shembull.com" className={`input-field pl-9 ${errors.email ? 'input-error' : ''}`} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.password')}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Min. 8" className={`input-field pl-9 pr-10 ${errors.password ? 'input-error' : ''}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.confirm_password')}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('confirmPassword')} type="password" placeholder="••••••••" className={`input-field pl-9 ${errors.confirmPassword ? 'input-error' : ''}`} />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Gift size={14} className="inline mr-1 text-brand-500" />{t('auth.referral_code')}
              </label>
              <input {...register('referralCode')} placeholder="ABCD1234" className="input-field" />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" {...register('terms')} className="mt-1 w-4 h-4 rounded text-brand-600 border-gray-300 focus:ring-brand-500" />
              <span className="text-sm text-gray-600">
                {t('auth.terms_agree')} <Link to="/terms" className="text-brand-600 hover:underline">{t('auth.terms')}</Link> {t('auth.and')}{' '}
                <Link to="/privacy" className="text-brand-600 hover:underline">{t('auth.privacy')}</Link>
              </span>
            </label>
            {errors.terms && <p className="text-red-500 text-xs">{errors.terms.message}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><UserPlus size={20} /> {t('auth.register_free_btn')}</>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t('auth.have_account')}{' '}
            <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700">{t('auth.login_link_label')}</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
