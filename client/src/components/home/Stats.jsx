import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Users, Store, Ticket, TrendingUp } from 'lucide-react';

const stats = [
  { icon: Users, value: 50000, suffix: '+', label: 'Klientë Aktivë', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Store, value: 1200, suffix: '+', label: 'Biznese Partnere', color: 'text-brand-600', bg: 'bg-brand-50' },
  { icon: Ticket, value: 80000, suffix: '+', label: 'Voucher të Shitur', color: 'text-purple-600', bg: 'bg-purple-50' },
  { icon: TrendingUp, value: 80, suffix: '%', label: 'Kursim Maksimal', color: 'text-orange-600', bg: 'bg-orange-50' },
];

function CountUp({ target, suffix, inView }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
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
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section ref={ref} className="py-20 bg-brand-gradient relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-900 rounded-full blur-3xl" />
      </div>
      <div className="container-custom relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white font-display">Numrat flasin</h2>
          <p className="text-green-100 mt-3">Platforma Nr.1 e zbritjeve në Shqipëri</p>
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
