import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Heart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import DealCard from '../../components/common/DealCard';
import { DealGridSkeleton } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function CustomerFavorites() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['user', 'wishlist'],
    queryFn: () => api.get('/users/wishlist').then((r) => r.data),
  });

  const clearMutation = useMutation({
    mutationFn: () => api.delete('/users/wishlist'),
    onSuccess: () => { qc.invalidateQueries(['user', 'wishlist']); toast.success('Lista u pastrua!'); },
  });

  const deals = data?.data || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Të Preferuarat</h1>
          <p className="text-gray-500 text-sm">{deals.length} oferta të ruajtura</p>
        </div>
        {deals.length > 0 && (
          <button onClick={() => clearMutation.mutate()} className="btn-ghost text-red-500 hover:text-red-700 flex items-center gap-1.5 text-sm">
            <Trash2 size={16} />Pastro Listën
          </button>
        )}
      </div>

      {isLoading ? (
        <DealGridSkeleton count={8} />
      ) : deals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {deals.map((deal, i) => (
            <motion.div key={deal._id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <DealCard deal={deal} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 card">
          <Heart size={56} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">Lista juaj është bosh</h3>
          <p className="text-gray-400 mb-6">Shtoni oferta te preferuara duke klikuar zemrën në deal card</p>
          <Link to="/search" className="btn-primary">Shfleto Ofertat →</Link>
        </div>
      )}
    </div>
  );
}
