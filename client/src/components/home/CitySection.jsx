import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const cities = [
  { name: 'Tiranë', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', deals: '1,200+' },
  { name: 'Durrës', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80', deals: '340+' },
  { name: 'Vlorë', img: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400&q=80', deals: '280+' },
  { name: 'Shkodër', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', deals: '150+' },
  { name: 'Sarandë', img: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=80', deals: '120+' },
  { name: 'Berat', img: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=400&q=80', deals: '95+' },
];

export default function CitySection() {
  const { t } = useTranslation();
  return (
    <section className="py-20 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-10">
          <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">📍 {t('home.cities_explore', 'Explore Albania')}</span>
          <h2 className="section-title mt-2">{t('home.cities_title')}</h2>
          <p className="section-subtitle mx-auto mt-3">{t('home.cities_subtitle', 'Find great deals everywhere in Albania')}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cities.map((city, i) => (
            <motion.div
              key={city.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to={`/city/${city.name.toLowerCase()}`}
                className="group block relative rounded-2xl overflow-hidden h-36 shadow-card hover:shadow-card-hover transition-all duration-300">
                <img src={city.img} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <p className="font-bold text-sm">{city.name}</p>
                  <p className="text-xs text-white/80">{city.deals} {t('home.city_deals', 'deals')}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
