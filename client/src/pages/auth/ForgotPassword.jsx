import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Check } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ndodhi një gabim.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 text-sm">
          <ArrowLeft size={16} /> Kthehu te Kyçja
        </Link>

        <div className="card p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={28} className="text-brand-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Email-i u Dërgua!</h2>
              <p className="text-gray-500 text-sm mb-6">Kontrollo <strong>{email}</strong> dhe kliko linkun për të rivendosur fjalëkalimin. Skadon pas 1 ore.</p>
              <Link to="/login" className="btn-primary w-full">Kthehu te Kyçja</Link>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-4">
                <Mail size={26} className="text-brand-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Harruat Fjalëkalimin?</h2>
              <p className="text-gray-500 text-sm mb-6">Shkruani email-in tuaj dhe do t'ju dërgojmë udhëzimet.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="ju@shembull.com" required className="input-field"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Dërgo Linkun →'}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
