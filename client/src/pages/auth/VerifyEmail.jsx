import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const { updateUser } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { setStatus('invalid'); return; }

    api.post('/auth/verify-email', { token })
      .then((res) => {
        if (res.data.data?.user) updateUser(res.data.data.user);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-10 max-w-md w-full text-center"
      >
        {status === 'loading' && (
          <>
            <Loader size={48} className="text-brand-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold text-gray-900">Duke verifikuar emailin...</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
              <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
            </motion.div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Email-i u verifikua!</h2>
            <p className="text-gray-500 mb-2">Llogaria juaj tani është aktive.</p>
            <p className="text-brand-600 font-bold mb-6">+200 ALL u shtuan në portofolin tuaj! 🎉</p>
            <Link to="/dashboard" className="btn-primary w-full justify-center">
              Shko te Dashboard →
            </Link>
          </>
        )}

        {(status === 'error' || status === 'invalid') && (
          <>
            <XCircle size={64} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-gray-900 mb-2">Lidhja nuk është e vlefshme</h2>
            <p className="text-gray-500 mb-6">Ky link verifikimi ka skaduar ose është i pavlefshëm.</p>
            <Link to="/dashboard" className="btn-secondary w-full justify-center">
              Kthehu te Dashboard
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
