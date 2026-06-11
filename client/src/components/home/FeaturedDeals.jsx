import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import DealCard from '../common/DealCard';
import { DealGridSkeleton } from '../common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';

export default function FeaturedDeals({ deals = [], isLoading = false }) {
  const { t } = useTranslation();
  if (isLoading) return <DealGridSkeleton count={8} />;

  if (!deals.length) {
    return (
      <div className="text-center py-20">
        <SearchX size={48} className="text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">{t('home.no_deals')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {deals.map((deal, i) => (
        <motion.div
          key={deal._id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ delay: (i % 4) * 0.08 }}
        >
          <DealCard deal={deal} />
        </motion.div>
      ))}
    </div>
  );
}
