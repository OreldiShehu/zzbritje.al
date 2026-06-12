import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, TrendingUp, Shield, Star, Users } from 'lucide-react';
import { CITIES } from '../../utils/constants';

const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80',
    accent: 'Restorante',
  },
  {
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80',
    accent: 'Bukuri & Spa',
  },
  {
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80',
    accent: 'Hotele & Resorte',
  },
];

const getBadges = (t) => [
  { icon: TrendingUp, label: t('hero.badges.vouchers'), color: 'text-brand-300' },
  { icon: Shield, label: t('hero.badges.trusted'), color: 'text-blue-400' },
  { icon: Star, label: t('hero.badges.rating'), color: 'text-amber-400' },
];

/* ── iPhone-style slide button ── */
function SlideBtn({ label, icon: Icon, onComplete, accent = false }) {
  const trackRef = useRef(null);
  const [maxDrag, setMaxDrag] = useState(220);
  const [done, setDone] = useState(false);
  const x = useMotionValue(0);

  const textOpacity = useTransform(x, [0, maxDrag * 0.45], [1, 0]);
  const trackFill = useTransform(
    x,
    [0, maxDrag],
    accent
      ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.22)']
      : ['rgba(26,63,138,0.25)', 'rgba(26,63,138,0.7)']
  );

  useEffect(() => {
    const measure = () => {
      if (trackRef.current) {
        setMaxDrag(trackRef.current.offsetWidth - 56 - 8);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const handleDragEnd = () => {
    if (x.get() >= maxDrag * 0.70) {
      animate(x, maxDrag, { duration: 0.15 });
      setDone(true);
      setTimeout(onComplete, 380);
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 });
    }
  };

  return (
    <motion.div
      ref={trackRef}
      style={{ background: trackFill }}
      className="relative h-14 w-full rounded-full border border-white/25 backdrop-blur-sm overflow-hidden select-none touch-none"
    >
      <motion.span
        style={{ opacity: textOpacity }}
        className="absolute inset-0 flex items-center justify-center gap-2 text-white text-sm font-semibold tracking-wide pointer-events-none shimmer-text"
      >
        {done ? '✓' : label}
      </motion.span>

      <motion.div
        drag={done ? false : 'x'}
        style={{ x }}
        dragConstraints={{ left: 0, right: maxDrag }}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        className={`absolute top-1 left-1 w-12 h-12 rounded-full flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing z-10 ${accent ? 'bg-white/20 border border-white/40' : 'bg-brand-600'}`}
        whileTap={{ scale: 0.92 }}
      >
        <Icon size={20} className="text-white" />
      </motion.div>
    </motion.div>
  );
}

export default function HeroSection() {
  const { t } = useTranslation();
  const badges = getBadges(t);
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

  const slides = t('hero.slides', { returnObjects: true });
  const slide = { ...heroSlides[activeSlide], ...slides[activeSlide] };

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
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative container-custom py-20 w-full">
        {/* Content — centered on mobile, left-aligned on md+ */}
        <div className="max-w-2xl mx-auto md:mx-0 text-center md:text-left">

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
            {slide.title}
          </motion.h1>

          <motion.p
            key={`sub-${activeSlide}`}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed"
          >
            {slide.subtitle}
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
                placeholder={t('hero.search_placeholder')}
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
                <option value="">{t('hero.all_cities')}</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-brand-gradient text-white font-bold rounded-2xl shadow-brand-lg hover:shadow-brand hover:-translate-y-0.5 transition-all text-base"
            >
              <Search size={20} /> {t('hero.search_btn')}
            </button>
          </motion.form>

          {/* Two slide buttons — centered on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-3 items-center justify-center md:justify-start"
          >
            <div className="w-full sm:w-64">
              <SlideBtn
                label={t('hero.explore_btn', 'Eksplorо Deale-t')}
                icon={() => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>}
                onComplete={() => navigate('/search')}
                accent={false}
              />
            </div>
            <div className="w-full sm:w-64">
              <SlideBtn
                label={t('hero.partner_btn', 'Bëhu Partner')}
                icon={Users}
                onComplete={() => navigate('/become-partner')}
                accent={true}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Slide indicators — centered */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveSlide(i)}
            className={`rounded-full transition-all duration-300 ${i === activeSlide ? 'w-8 h-2 bg-brand-500' : 'w-2 h-2 bg-white/40'}`}
          />
        ))}
      </div>

      {/* Trust badges — desktop only */}
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
