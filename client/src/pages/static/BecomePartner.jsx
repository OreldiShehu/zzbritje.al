import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, TrendingUp, Users, Zap, Star, Shield, BarChart2, ArrowRight, Percent, Banknote, Store } from 'lucide-react';

const STEPS = [
  { num: '1', title: 'Regjistrohu Falas', desc: 'Krijo llogarinë tënde si biznes. Nuk nevojitet karta krediti.' },
  { num: '2', title: 'Krijo Ofertën', desc: 'Vendos çmimin tënd bazë dhe platforma shton automatikisht 7% markup.' },
  { num: '3', title: 'Merr Klientë', desc: 'Klientët blejnë voucher-in online dhe vijnë drejtpërdrejt tek ti.' },
  { num: '4', title: 'Mblidh të Ardhurat', desc: 'Merr cash direkt nga klienti. Ne faturojmë komisionin 10% mujor.' },
];

export default function BecomePartner() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-brand-gradient text-white py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="container-custom relative max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm font-medium mb-6">
            <Star size={16} className="text-amber-300" /> Falas për t'u bashkuar
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Rriti Biznesin Tënd me Zbritje.al</h1>
          <p className="text-xl text-blue-100 mb-8">Listoni ofertat tuaja, arrini mijëra klientë, dhe merrni paratë direkt. Pa abonime mujore.</p>
          <Link to="/register?role=business" className="bg-white text-brand-600 font-black px-8 py-4 rounded-2xl hover:bg-brand-50 transition-all shadow-xl text-lg inline-flex items-center gap-2">
            Filloni Falas Sot <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* How the money works */}
      <div className="container-custom py-16 max-w-4xl">
        <h2 className="text-3xl font-black text-gray-900 text-center mb-2">Si Funksionojnë Të Ardhurat</h2>
        <p className="text-gray-500 text-center mb-10">Transparent dhe i thjeshtë — pa surpriza</p>

        <div className="bg-gray-50 rounded-3xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Store size={24} className="text-brand-600" />
              </div>
              <p className="text-2xl font-black text-gray-900 mb-1">3,000 L</p>
              <p className="text-sm font-semibold text-gray-600">Çmimi juaj bazë</p>
              <p className="text-xs text-gray-400 mt-1">Ju vendosni këtë çmim</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-brand-200 text-center ring-2 ring-brand-500">
              <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Percent size={24} className="text-brand-600" />
              </div>
              <p className="text-2xl font-black text-brand-700 mb-1">3,210 L</p>
              <p className="text-sm font-semibold text-gray-600">Klienti paguan</p>
              <p className="text-xs text-gray-400 mt-1">Çmimi juaj + 7% markup</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-green-200 text-center">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Banknote size={24} className="text-green-600" />
              </div>
              <p className="text-2xl font-black text-green-700 mb-1">2,700 L</p>
              <p className="text-sm font-semibold text-gray-600">Ju fitoni neto</p>
              <p className="text-xs text-gray-400 mt-1">Pas komisionit 10%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-900">7% Markup nga Klienti</p>
                <p className="text-xs text-blue-700 mt-0.5">Platforma shton 7% mbi çmimin tuaj bazë. Klienti e paguan këtë — jo ju.</p>
              </div>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-900">10% Komision nga Biznesi</p>
                <p className="text-xs text-amber-700 mt-0.5">Faturojmë 10% të çmimit tuaj bazë mujor. Ju merrni cash direkt nga klienti.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="bg-gray-50 py-16">
        <div className="container-custom max-w-4xl">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-10">Si të Filloni</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s) => (
              <motion.div key={s.num} whileHover={{ y: -3 }} className="card p-6 text-center">
                <div className="w-12 h-12 bg-brand-gradient rounded-xl flex items-center justify-center mx-auto mb-4 text-white font-black text-lg">{s.num}</div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="container-custom py-16 max-w-5xl">
        <h2 className="text-3xl font-black text-gray-900 text-center mb-10">Pse Zbritje.al?</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {[
            { icon: Users, title: 'Klientë të Rinj', desc: 'Aksesoni menjëherë klientë shqiptarë që kërkojnë oferta aktivisht' },
            { icon: TrendingUp, title: 'Rritja e Shitjeve', desc: 'Bizneset partnere raportojnë rritje të ndjeshme të klientëve pas listimit' },
            { icon: BarChart2, title: 'Dashboard i Plotë', desc: 'Statistika të detajuara: voucher të shitura, të ardhura, vlerësime' },
            { icon: Zap, title: 'Setup i Shpejtë', desc: 'Postoni ofertën e parë brenda 10 minutave. Pa dokumentacion kompleks.' },
            { icon: Shield, title: 'Pa Abonime', desc: 'Zero kosto mujore. Paguani vetëm komisionin 10% kur shisni voucher.' },
            { icon: Star, title: 'Mbështetje', desc: 'Ekipi ynë është gjithmonë gati për t\'ju ndihmuar të rriteni' },
          ].map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} whileHover={{ y: -3 }} className="card p-6">
              <Icon size={28} className="text-brand-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-brand-gradient py-16 text-center text-white">
        <h2 className="text-3xl font-black mb-4">Gati të Filloni?</h2>
        <p className="text-blue-100 mb-6 max-w-xl mx-auto">Regjistrohu falas dhe postoni ofertën e parë. Zero kosto, zero abonime.</p>
        <Link to="/register?role=business" className="bg-white text-brand-600 font-black px-8 py-3.5 rounded-2xl hover:bg-brand-50 transition-all shadow-xl inline-flex items-center gap-2">
          Regjistrohu Falas <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
