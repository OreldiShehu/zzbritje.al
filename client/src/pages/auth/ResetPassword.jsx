import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) { toast.error('Fjalëkalimi duhet të ketë të paktën 8 karaktere.'); return; }
    if (password !== confirm) { toast.error('Fjalëkalimet nuk përputhen.'); return; }
    setLoading(true);
    try {
      const res = await api.post(`/auth/reset-password/${token}`, { password });
      setAuth(res.data.user, res.data.accessToken);
      setDone(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Linku ka skaduar. Provo përsëri.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card p-8">
          {done ? (
            <div className="text-center">
              <CheckCircle size={48} className="text-brand-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Fjalëkalimi u Ndryshua!</h2>
              <p className="text-gray-500 text-sm">Duke ju ridrejtuar tek dashboard...</p>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-4"><Lock size={26} className="text-brand-600" /></div>
              <h2 className="text-2xl font-bold mb-2">Vendosni Fjalëkalim të Ri</h2>
              <p className="text-gray-500 text-sm mb-6">Fjalëkalimi i ri duhet të jetë i paktën 8 karaktere.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Fjalëkalimi i Ri</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type={showPwd ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 karaktere" required className="input-field pl-9 pr-10" />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Konfirmo Fjalëkalimin</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Rivendos fjalëkalimin" required className="input-field pl-9" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Ndrysho Fjalëkalimin →'}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
