import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Email-i nuk është valid'),
  password: z.string().min(1, 'Fjalëkalimi është i detyrueshëm'),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/dashboard';

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      setAuth(res.data.user, res.data.accessToken);
      toast.success(`Mirë se erdhe, ${res.data.user.firstName}!`);
      navigate(redirect, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Ndodhi një gabim. Provo përsëri.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero-gradient items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 bg-brand-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-emerald-400 rounded-full blur-3xl" />
        </div>
        <div className="relative text-center">
          <div className="w-20 h-20 bg-brand-gradient rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-brand-lg">
            <span className="text-white font-black text-4xl">Z</span>
          </div>
          <h1 className="text-4xl font-black text-white font-display mb-4">Zbritje.al</h1>
          <p className="text-green-100 text-lg mb-8 max-w-sm">Albania's #1 Discount & Voucher Marketplace</p>
          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            {[['80%', 'Kursim Max'], ['50K+', 'Klientë'], ['1200+', 'Biznese'], ['4.9⭐', 'Vlerësim']].map(([val, lab]) => (
              <div key={lab} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
                <p className="text-xl font-black text-white">{val}</p>
                <p className="text-green-200 text-xs mt-1">{lab}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center shadow-brand">
              <span className="text-white font-black text-xl">Z</span>
            </div>
            <span className="font-black text-2xl text-gray-900">Zbritje<span className="text-brand-600">.al</span></span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Mirë se u kthyet!</h2>
          <p className="text-gray-500 mb-8">Kyçuni në llogarinë tuaj</p>

          {/* Social login */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <a href={`${import.meta.env.VITE_API_URL || '/api/v1'}/auth/google`}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </a>
            <a href={`${import.meta.env.VITE_API_URL || '/api/v1'}/auth/facebook`}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors shadow-sm">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </a>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-gray-400 text-sm">ose me email</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('email')} type="email" placeholder="ju@shembull.com" autoComplete="email"
                  className={`input-field pl-10 ${errors.email ? 'input-error' : ''}`} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-gray-700">Fjalëkalimi</label>
                <Link to="/forgot-password" className="text-xs text-brand-600 hover:text-brand-700">Harruat fjalëkalimin?</Link>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'input-error' : ''}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogIn size={20} /> Kyçu</>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Nuk keni llogari?{' '}
            <Link to="/register" className="text-brand-600 font-semibold hover:text-brand-700">Regjistrohu falas →</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
