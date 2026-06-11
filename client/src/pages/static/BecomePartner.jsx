import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, TrendingUp, Users, Zap, Star, Shield, BarChart2 } from 'lucide-react';

const PLANS = [
  { name: 'Starter', price: 0, period: 'Falas', deals: 2, commission: '22%', features: ['2 oferta aktive', 'Dashboard bazë', 'Statistika bazë', 'Support email'], cta: 'Regjistrohu Falas', highlight: false },
  { name: 'Growth', price: 99, period: '/muaj', deals: 10, commission: '20%', features: ['10 oferta aktive', 'Analytics i plotë', 'Deal Featured x1/muaj', 'Support prioritar', 'Reduktim komisioni 2%'], cta: 'Fillo Tani', highlight: true },
  { name: 'Premium', price: 199, period: '/muaj', deals: 30, commission: '18%', features: ['30 oferta aktive', 'Analytics premium', 'Deal Featured x4/muaj', 'Menaxher llogarie', 'API integrim', 'Reduktim komisioni 4%'], cta: 'Zgjidhni Premium', highlight: false },
  { name: 'Enterprise', price: 299, period: '/muaj', deals: -1, commission: '15%', features: ['Oferta të pakufizuara', 'Dashboard të dedikuar', 'Featured i pakufizuar', 'Account Manager 24/7', 'Integrimi i personalizuar', 'Komision minimal 15%'], cta: 'Kontakto Sales', highlight: false },
];

export default function BecomePartner() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-brand-gradient text-white py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="container-custom relative max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm font-medium mb-6">
            <Star size={16} className="text-amber-300" />Bashkohuni me 1000+ biznese partnere
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Rriti Biznesin Tuaj me Zbritje.al</h1>
          <p className="text-xl text-blue-100 mb-8">Arrini mijëra klientë të rinj, rritni shitjet, dhe menaxhoni ofertat tuaja lehtë nga dashboardi ynë intuitiv.</p>
          <Link to="/register?role=business" className="bg-white text-brand-600 font-black px-8 py-4 rounded-2xl hover:bg-brand-50 transition-all shadow-xl text-lg inline-block">
            Filloni Falas Sot →
          </Link>
        </div>
      </div>

      {/* Benefits */}
      <div className="container-custom py-16 max-w-5xl">
        <h2 className="text-3xl font-black text-gray-900 text-center mb-10">Pse Zbritje.al?</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {[
            { icon: Users, title: '100K+ Klientë Aktivë', desc: 'Aksesoni menjëherë një bazë massive klientësh shqiptarë' },
            { icon: TrendingUp, title: 'Rritja e Shitjeve', desc: 'Bizneset partnere raportojnë rritje 40-80% të shitjeve pas listimit' },
            { icon: BarChart2, title: 'Analytics i Detajuar', desc: 'Kuptoni klientët tuaj me raporte dhe statistika të thelluara' },
            { icon: Zap, title: 'Setup i Shpejtë', desc: 'Konfiguroni llogarinë dhe postoni ofertën e parë brenda 10 minutave' },
            { icon: Shield, title: 'Siguri & Mbrojtje', desc: 'Sistemet tona sigurojnë pagesa të sigurta dhe komisione transparente' },
            { icon: Star, title: 'Mbështetje 24/7', desc: 'Ekipi ynë është gjithmonë gati për t\'ju ndihmuar të rriteni' },
          ].map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} whileHover={{ y: -3 }} className="card p-6">
              <Icon size={28} className="text-brand-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-gray-50 py-16">
        <div className="container-custom max-w-5xl">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-2">Planet & Çmimet</h2>
          <p className="text-gray-500 text-center mb-10">Zgjidhni planin e duhur për biznesin tuaj</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`card p-6 flex flex-col ${plan.highlight ? 'ring-2 ring-brand-500 relative' : ''}`}>
                {plan.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full">Më Popullar</div>}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-500 mb-1">{plan.name}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-black text-gray-900">{plan.price === 0 ? 'Falas' : `€${plan.price}`}</span>
                    {plan.price > 0 && <span className="text-gray-400 text-sm mb-1">{plan.period}</span>}
                  </div>
                  <p className="text-xs text-brand-600 font-medium mt-1">Komision: {plan.commission}</p>
                </div>
                <ul className="space-y-2 flex-1 mb-5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle size={15} className="text-brand-500 flex-shrink-0 mt-0.5" />{f}
                    </li>
                  ))}
                </ul>
                <Link to="/register?role=business" className={`block text-center py-2.5 rounded-xl font-bold text-sm transition-all ${plan.highlight ? 'btn-primary' : 'btn-secondary'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-brand-gradient py-16 text-center text-white">
        <h2 className="text-3xl font-black mb-4">Gati të Filloni?</h2>
        <p className="text-blue-100 mb-6 max-w-xl mx-auto">Regjistrohu falas sot dhe postoni ofertën tuaj të parë. Nuk nevojitet karta krediti.</p>
        <Link to="/register?role=business" className="bg-white text-brand-600 font-black px-8 py-3.5 rounded-2xl hover:bg-brand-50 transition-all shadow-xl inline-block">
          Regjistrohu Falas →
        </Link>
      </div>
    </div>
  );
}
