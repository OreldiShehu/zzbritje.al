import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="text-8xl font-black text-transparent bg-brand-gradient bg-clip-text mb-2">404</div>
          <div className="text-6xl mb-4">🔍</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h1 className="text-2xl font-black text-gray-900 mb-3">{t('common.not_found_title')}</h1>
          <p className="text-gray-500 mb-8">{t('common.not_found_text')}</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/" className="btn-primary flex items-center gap-2">
              <Home size={18} />{t('common.go_home')}
            </Link>
            <Link to="/search" className="btn-secondary flex items-center gap-2">
              <Search size={18} />{t('common.search')}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
