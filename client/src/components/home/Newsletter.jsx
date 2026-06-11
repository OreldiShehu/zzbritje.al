import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Check, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function Newsletter() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) { toast.error(t('common.error')); return; }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setDone(true);
      toast.success(t('home.newsletter_success'));
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-brand-gradient relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-900 rounded-full" />
      </div>

      <div className="container-custom relative">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail size={28} className="text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white font-display mb-4">
            {t('home.newsletter_title')}
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            {t('home.newsletter_subtitle')}
          </p>

          {done ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-4 text-white font-semibold text-lg"
            >
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Check size={20} className="text-brand-600" />
              </div>
              {t('home.newsletter_success')} 🎉
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('home.newsletter_placeholder')}
                required
                className="flex-1 px-5 py-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-green-100 focus:outline-none focus:ring-2 focus:ring-white/50 text-base transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-700 font-bold rounded-2xl hover:bg-brand-50 transition-colors whitespace-nowrap shadow-lg disabled:opacity-70"
              >
                {loading ? <span className="w-5 h-5 border-2 border-brand-300 border-t-brand-700 rounded-full animate-spin" /> : <><Gift size={20} /> {t('home.newsletter_btn')}</>}
              </button>
            </form>
          )}

          <p className="text-blue-100/70 text-sm mt-4">
            {t('home.newsletter_no_spam', 'No spam. Unsubscribe anytime. 🔒 GDPR compliant.')}
          </p>
        </div>
      </div>
    </section>
  );
}
