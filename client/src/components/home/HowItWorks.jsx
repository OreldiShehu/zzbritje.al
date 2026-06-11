import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search, CreditCard, QrCode, Sparkles } from 'lucide-react';

const stepIcons = [Search, CreditCard, QrCode, Sparkles];
const stepColors = ['bg-blue-500', 'bg-brand-600', 'bg-purple-600', 'bg-orange-500'];
const stepNums = ['01', '02', '03', '04'];

export default function HowItWorks() {
  const { t } = useTranslation();
  const rawSteps = t('home.how_steps', { returnObjects: true });
  const steps = Array.isArray(rawSteps) ? rawSteps : [];

  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">{t('home.how_label')}</span>
          <h2 className="section-title mt-2">{t('home.how_title')}</h2>
          <p className="section-subtitle mx-auto mt-3">{t('home.how_subtitle')}</p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-brand-200 to-orange-200 z-0 mx-24" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, i) => {
              const Icon = stepIcons[i];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative mb-6">
                    <div className={`w-16 h-16 ${stepColors[i]} rounded-2xl flex items-center justify-center shadow-lg mb-2`}>
                      <Icon size={28} className="text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-gray-900 rounded-full text-white text-xs font-bold flex items-center justify-center">
                      {stepNums[i]}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a href="/search" className="btn-primary text-base px-8 py-4">
            {t('home.how_cta')}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
