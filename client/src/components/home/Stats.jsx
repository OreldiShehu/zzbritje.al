import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Users, Store, Ticket, TrendingUp } from 'lucide-react';
import api from '../../api/axios';

function CountUp({ target, suffix, inView }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView || !target) { setCount(target); return; }
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span>{count.toLocaleString('sq-AL')}{suffix}</span>;
}

export default function Stats() {
  const { t } = useTranslation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  const { data } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: () => api.get('/stats').then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const stats = [
    { icon: Users, value: data?.users || 0, suffix: '+', label: t('home.stats_users'), color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Store, value: data?.businesses || 0, suffix: '+', label: t('home.stats_businesses'), color: 'text-brand-600', bg: 'bg-brand-50' },
    { icon: Ticket, value: data?.vouchers || 0, suffix: '+', label: t('home.stats_vouchers'), color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: TrendingUp, value: 80, suffix: '%', label: t('home.stats_savings'), color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <section ref={ref} className="py-20 bg-brand-gradient relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-900 rounded-full blur-3xl" />
      </div>
      <div className="container-custom relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white font-display">{t('home.stats_title')}</h2>
          <p className="text-blue-100 mt-3">{t('home.stats_subtitle')}</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(({ icon: Icon, value, suffix, label, color, bg }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15 }}
              className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 text-center shadow-xl"
            >
              <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <Icon size={26} className={color} />
              </div>
              <p className={`text-3xl md:text-4xl font-black font-display ${color}`}>
                <CountUp target={value} suffix={suffix} inView={inView} />
              </p>
              <p className="text-gray-600 text-sm font-medium mt-1">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
