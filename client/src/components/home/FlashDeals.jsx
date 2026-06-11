import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Zap, Clock } from 'lucide-react';
import DealCard from '../common/DealCard';
import { formatCountdown } from '../../utils/formatters';

function FlashCountdown({ endDate }) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(formatCountdown(endDate));

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(formatCountdown(endDate)), 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  if (timeLeft.expired) return <span className="text-red-400">{t('deal.expired')}</span>;

  return (
    <div className="flex items-center gap-2 text-white font-mono">
      <Clock size={16} className="text-orange-400" />
      {[
        { val: timeLeft.hours, label: t('deal.hours') },
        { val: timeLeft.minutes, label: t('deal.min') },
        { val: timeLeft.seconds, label: t('deal.sec') },
      ].map(({ val, label }, i) => (
        <span key={label}>
          <span className="bg-black/40 px-2 py-1 rounded-lg text-lg font-bold tabular-nums">
            {String(val).padStart(2, '0')}
          </span>
          <span className="text-xs text-white/60 ml-1">{label}</span>
          {i < 2 && <span className="text-orange-400 font-bold ml-1">:</span>}
        </span>
      ))}
    </div>
  );
}

export default function FlashDeals({ deals = [] }) {
  const { t } = useTranslation();
  if (!deals.length) return null;
  const firstFlashEnd = deals[0]?.flashEndsAt;

  return (
    <section className="py-16 bg-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500 rounded-full blur-3xl animate-pulse animation-delay-400" />
      </div>

      <div className="container-custom relative">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Zap size={28} className="text-white" fill="white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl md:text-3xl font-black text-white font-display">{t('home.flash_title')}</h2>
                <span className="badge bg-orange-500 text-white animate-pulse">LIVE</span>
              </div>
              <p className="text-gray-400 text-sm">{t('home.flash_subtitle')}</p>
            </div>
          </div>

          {firstFlashEnd && (
            <div className="text-center">
              <p className="text-gray-400 text-xs mb-2 uppercase tracking-wider">{t('home.flash_expires_in')}</p>
              <FlashCountdown endDate={firstFlashEnd} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {deals.map((deal, i) => (
            <motion.div
              key={deal._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <DealCard deal={deal} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
