import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { PageLoader } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const { setAuth, fetchMe } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      setAuth(null, token);
      fetchMe().then(() => {
        const { user } = useAuthStore.getState();
        toast.success(`Mirë se erdhe, ${user?.firstName || 'Miku'}!`);
        navigate(user?.role === 'business' ? '/business-dashboard' : '/dashboard', { replace: true });
      });
    } else {
      toast.error('Hyrja me rrjete sociale dështoi.');
      navigate('/login', { replace: true });
    }
  }, []);

  return <PageLoader />;
}
