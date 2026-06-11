import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const defaultCategories = [
  { icon: '🍽️', slug: 'restorante', color: '#ff6b6b', deals: '240+' },
  { icon: '💅', slug: 'bukuri', color: '#f7a8d8', deals: '180+' },
  { icon: '🏨', slug: 'hotele', color: '#4ecdc4', deals: '95+' },
  { icon: '🎭', slug: 'aktivitete', color: '#45b7d1', deals: '120+' },
  { icon: '🦷', slug: 'shendet', color: '#96ceb4', deals: '85+' },
  { icon: '☕', slug: 'kafene', color: '#dda15e', deals: '160+' },
  { icon: '💪', slug: 'sport', color: '#52b69a', deals: '70+' },
  { icon: '🌙', slug: 'jete-nate', color: '#7209b7', deals: '45+' },
  { icon: '✈️', slug: 'udhetim', color: '#3a86ff', deals: '55+' },
  { icon: '🚗', slug: 'makinat', color: '#fb5607', deals: '30+' },
  { icon: '👶', slug: 'femije', color: '#ffbe0b', deals: '40+' },
  { icon: '📚', slug: 'arsim', color: '#8338ec', deals: '25+' },
];

export default function CategorySection({ categories = [] }) {
  const { t } = useTranslation();
  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-6 gap-3 md:gap-4">
      {displayCategories.slice(0, 12).map((cat, i) => (
        <motion.div
          key={cat.slug || cat._id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
        >
          <Link
            to={`/category/${cat.slug}`}
            className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-card-hover transition-all duration-200 text-center"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 duration-200 shadow-sm"
              style={{ backgroundColor: `${cat.color || '#1a3f8a'}20` }}
            >
              {cat.icon || '🎯'}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800 leading-tight">
                {t(`nav.categories_list.${cat.slug}`, cat.nameAl || cat.name || cat.slug)}
              </p>
              {cat.deals && <p className="text-xs text-gray-400 mt-0.5">{cat.deals} {t('home.city_deals')}</p>}
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
