import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, ArrowRight, Play, TrendingUp, Shield, Star } from 'lucide-react';
import { CITIES } from '../../utils/constants';

const heroSlides = [
  {
    title: 'Discover Albania\'s Best Deals',
    titleAl: 'Zbuloni Ofertat Më të Mira në Shqipëri',
    subtitle: 'Save up to 80% on restaurants, hotels, spa, activities and more.',
    subtitleAl: 'Kurseni deri 80% në restorante, hotele, spa, aktivitete dhe shumë më tepër.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80',
    accent: 'Restorante',
    cta: '🍽️ Shfleto Restorantet',
  },
  {
    title: 'Luxury Spa & Beauty',
    titleAl: 'Bukuri & Relaksim me Çmime të Paprecedentë',
    subtitle: 'Pamper yourself for less with premium beauty treatments.',
    subtitleAl: 'Shijojeni kujdesin premium me çmimet më të ulëta.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80',
    accent: 'Bukuri & Spa',
    cta: '💅 Shfleto Spa',
  },
  {
    title: 'Unforgettable Hotel Stays',
    titleAl: 'Qëndroni në Hotelet Më të Mira',
    subtitle: 'Book your next getaway at unbeatable prices.',
    subtitleAl: 'Rezervoni pushimet tuaja me çmimet best-in-class.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80',
    accent: 'Hotele & Resorte',
    cta: '🏨 Shfleto Hotelet',
  },
];

const badges = [
  { icon: TrendingUp, label: '50,000+ Voucher të Shitur', color: 'text-brand-300' },
  { icon: Shield, label: 'Platforma e Besuar', color: 'text-blue-400' },
  { icon: Star, label: '4.9 ⭐ Vlerësim', color: 'text-amber-400' },
];

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Tiranë');
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setActiveSlide((prev) => (prev + 1) % heroSlides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCity) params.set('city', selectedCity);
    navigate(`/search?${params.toString()}`);
  };

  const slide = heroSlides[activeSlide];

  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-dark">
      {/* Background images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img src={slide.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative container-custom py-20">
        <div className="max-w-3xl">
          {/* Accent badge */}
          <motion.div
            key={`badge-${activeSlide}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-600/30 backdrop-blur-sm border border-brand-400/40 text-brand-300 text-sm font-medium mb-6"
          >
            <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
            {slide.accent}
          </motion.div>

          {/* Headline */}
          <motion.h1
            key={`title-${activeSlide}`}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white font-display leading-tight mb-4"
          >
            {slide.titleAl}
          </motion.h1>

          <motion.p
            key={`sub-${activeSlide}`}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl leading-relaxed"
          >
            {slide.subtitleAl}
          </motion.p>

          {/* Search bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-2 mb-8"
          >
            <div className="relative flex-1">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kërko oferta, restorante, spa..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xl text-base"
              />
            </div>
            <div className="relative sm:w-44">
              <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full h-full pl-9 pr-4 py-4 rounded-2xl bg-white/95 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xl text-base appearance-none cursor-pointer"
              >
                <option value="">Të gjitha</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button type="submit" className="flex items-center justify-center gap-2 px-8 py-4 bg-brand-gradient text-white font-bold rounded-2xl shadow-brand-lg hover:shadow-brand hover:-translate-y-0.5 transition-all text-base">
              <Search size={20} /> Kërko
            </button>
          </motion.form>

          {/* Quick links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-3 mb-10"
          >
            <span className="text-gray-400 text-sm">Popullorë:</span>
            {['Restorante', 'Spa & Bukuri', 'Hotele', 'Dentisti', 'Palestër'].map((tag) => (
              <button
                key={tag}
                onClick={() => navigate(`/search?q=${tag}`)}
                className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs hover:bg-white/20 transition-colors"
              >
                {tag}
              </button>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3">
            <motion.button
              onClick={() => navigate('/search')}
              className="btn-primary text-base px-8 py-3.5"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            >
              Eksploro Deal-et <ArrowRight size={18} />
            </motion.button>
            <motion.a
              href="/become-partner"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-all backdrop-blur-sm"
              whileHover={{ scale: 1.02 }}
            >
              <Play size={18} /> Bëhu Partner
            </motion.a>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveSlide(i)}
            className={`rounded-full transition-all duration-300 ${i === activeSlide ? 'w-8 h-2 bg-brand-500' : 'w-2 h-2 bg-white/40'}`}
          />
        ))}
      </div>

      {/* Trust badges */}
      <div className="absolute bottom-8 right-8 hidden lg:flex flex-col gap-3">
        {badges.map(({ icon: Icon, label, color }) => (
          <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10">
            <Icon size={16} className={color} />
            <span className="text-white text-xs font-medium">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
