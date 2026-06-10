import { motion } from 'framer-motion';
import { Search, CreditCard, QrCode, Sparkles } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: Search,
    title: 'Kërko & Zbulo',
    description: 'Shfletoni qindra oferta nga bizneset më të mira në qytetin tuaj. Filtroni sipas kategorisë, çmimit dhe zbritjes.',
    color: 'bg-blue-500',
  },
  {
    step: '02',
    icon: CreditCard,
    title: 'Blej me Siguri',
    description: 'Blini voucherin me pagesa të sigurta. Pranojmë Stripe, PayPal dhe kartë. Garanci kthimi 14 ditë.',
    color: 'bg-brand-600',
  },
  {
    step: '03',
    icon: QrCode,
    title: 'Merr QR Code',
    description: 'Merrni voucherin me kod unik dhe QR Code direkt në email dhe dashboard tuaj personal.',
    color: 'bg-purple-600',
  },
  {
    step: '04',
    icon: Sparkles,
    title: 'Shijoje & Kurseje',
    description: 'Paraqitni QR Code-in te biznesi dhe shijojeni shërbimin me çmimin e zbritur. Kaq e thjeshtë!',
    color: 'bg-orange-500',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">Si Funksionon</span>
          <h2 className="section-title mt-2">Kurseje me 4 Hapa të Thjeshtë</h2>
          <p className="section-subtitle mx-auto mt-3">
            Procesi i blerjes dhe shfrytëzimit të voucherit është shumë i lehtë dhe i sigurt
          </p>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-brand-200 to-orange-200 z-0 mx-24" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map(({ step, icon: Icon, title, description, color }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center text-center"
              >
                <div className="relative mb-6">
                  <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center shadow-lg mb-2`}>
                    <Icon size={28} className="text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-gray-900 rounded-full text-white text-xs font-bold flex items-center justify-center">
                    {step}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a href="/search" className="btn-primary text-base px-8 py-4">
            Filloni të Kurseni Tani →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
