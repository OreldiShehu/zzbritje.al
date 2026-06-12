import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, TrendingUp, Users, Zap, Star, Shield, BarChart2, ArrowRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const STEPS = [
  { num: '1', title: 'Regjistrohu Falas', desc: 'Krijo llogarinë tënde si biznes. Nuk nevojitet karta krediti dhe nuk ka kosto fillestare.' },
  { num: '2', title: 'Krijo Ofertën', desc: 'Vendos çmimin tënd bazë dhe publikoni dealin tuaj. Setup i shpejtë në pak minuta.' },
  { num: '3', title: 'Merr Klientë', desc: 'Klientët blejnë voucher-in online dhe vijnë fizikisht tek biznesi juaj.' },
  { num: '4', title: 'Mblidh të Ardhurat', desc: 'Klienti paguan direkt tek ju. Komisioni faturohet mujor — thjeshtë dhe transparent.' },
];

const FAQS = [
  {
    q: 'Sa kushton listimi i biznesit?',
    a: 'Regjistrimi dhe listimi janë plotësisht falas. Nuk ka abonime mujore. Paguani vetëm komisionin 10% bazuar në voucher-et e shitura.',
  },
  {
    q: 'Si funksionon komisioni?',
    a: 'Platforma shton 7% mbi çmimin tuaj bazë — këtë e paguan klienti, jo ju. Nga çmimi juaj bazë, platforma mban 10% si komision, i cili faturohel mujor.',
  },
  {
    q: 'Kur marr paratë?',
    a: 'Klienti paguan direkt tek ju kur vjen të përdorë voucher-in. Nuk ka pritje — cash direkt në biznesin tuaj.',
  },
  {
    q: 'Mund të vendos çmimin që dua?',
    a: 'Po, ju vendosni çmimin bazë. Platforma shton automatikisht 7% dhe klienti e sheh çmimin final përpara blerjes.',
  },
  {
    q: 'Sa kohë duhet për t\'u verifikuar?',
    a: 'Ekipi ynë shqyrton çdo biznes brenda 24-48 orësh. Do të merrni njoftim sapo llogaria juaj të verifikohet.',
  },
  {
    q: 'Mund të vendos rregulla si "1 voucher për tavolinë"?',
    a: 'Po. Gjatë krijimit të dealit mund të aktivizoni opsionin "1 voucher për tavolinë" dhe klientët e shohin këtë kufizim para blerjes.',
  },
];

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-gray-50 transition-colors">
        <span className="font-semibold text-gray-900 text-sm">{q}</span>
        <ChevronDown size={18} className={`text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimateHeight open={open}>
        <p className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{a}</p>
      </AnimateHeight>
    </div>
  );
}

function AnimateHeight({ open, children }) {
  return (
    <motion.div
      initial={false}
      animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      {children}
    </motion.div>
  );
}

export default function BecomePartner() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-brand-gradient text-white py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="container-custom relative max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm font-medium mb-6">
            <Star size={16} className="text-amber-300" /> Falas për t'u bashkuar
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-5 leading-tight">Rriti Biznesin Tënd me Zbritje.al</h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">Listoni ofertat tuaja, arrini mijëra klientë aktivë, dhe merrni paratë direkt. Pa abonime mujore.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=business" className="bg-white text-brand-600 font-black px-8 py-4 rounded-2xl hover:bg-brand-50 transition-all shadow-xl text-lg inline-flex items-center justify-center gap-2">
              Filloni Falas Sot <ArrowRight size={20} />
            </Link>
            <a href="#how-it-works" className="border border-white/40 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all text-lg inline-flex items-center justify-center gap-2">
              Si funksionon?
            </a>
          </div>
        </div>
      </div>

      {/* Commission info — clean, no fake numbers */}
      <div className="container-custom py-16 max-w-4xl">
        <h2 className="text-3xl font-black text-gray-900 text-center mb-2">Model Transparent & i Thjeshtë</h2>
        <p className="text-gray-500 text-center mb-10">Pa surpriza. Pa abonime. Paguani vetëm kur shisni.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-gray-200 p-7 text-center">
            <div className="text-4xl font-black text-gray-900 mb-2">0 L</div>
            <p className="font-bold text-gray-700 mb-1">Kosto Fillestare</p>
            <p className="text-sm text-gray-400">Regjistrim falas, pa abonime, pa dokumentacion.</p>
          </div>
          <div className="rounded-2xl border-2 border-brand-500 bg-brand-50 p-7 text-center relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full">Nga Klienti</div>
            <div className="text-4xl font-black text-brand-700 mb-2">+7%</div>
            <p className="font-bold text-gray-700 mb-1">Markup Platformës</p>
            <p className="text-sm text-gray-500">Platforma shton 7% mbi çmimin tuaj bazë. Këtë e paguan klienti, jo ju.</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-7 text-center">
            <div className="text-4xl font-black text-amber-700 mb-2">10%</div>
            <p className="font-bold text-gray-700 mb-1">Komision Mujor</p>
            <p className="text-sm text-gray-500">10% e çmimit tuaj bazë, faturuar mujor vetëm nga voucher-et e shitura.</p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div id="how-it-works" className="bg-gray-50 py-16">
        <div className="container-custom max-w-4xl">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-2">Si të Filloni</h2>
          <p className="text-gray-500 text-center mb-10">4 hapa dhe jeni live</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s) => (
              <motion.div key={s.num} whileHover={{ y: -4 }} className="card p-6 text-center">
                <div className="w-12 h-12 bg-brand-gradient rounded-xl flex items-center justify-center mx-auto mb-4 text-white font-black text-lg">{s.num}</div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
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
            { icon: Users, title: 'Klientë të Rinj', desc: 'Aksesoni menjëherë klientë shqiptarë që kërkojnë oferta aktivisht çdo ditë.' },
            { icon: TrendingUp, title: 'Rritja e Vizitorëve', desc: 'Bizneset partnere shënojnë rritje të dukshme të klientëve të rinj pas listimit.' },
            { icon: BarChart2, title: 'Dashboard i Plotë', desc: 'Statistika të detajuara: voucher të shitura, të ardhura, vlerësime klientësh.' },
            { icon: Zap, title: 'Setup i Shpejtë', desc: 'Postoni dealin e parë brenda 10 minutave. Pa dokumentacion kompleks.' },
            { icon: Shield, title: 'Pa Rrezik Financiar', desc: 'Zero kosto fillestare. Komisioni vlen vetëm kur ju fitoni — asnjë kosto tjetër.' },
            { icon: Star, title: 'Mbështetje e Dedikuar', desc: 'Ekipi ynë është gjithmonë gati për t\'ju ndihmuar të maksimizoni ofertat.' },
          ].map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} whileHover={{ y: -3 }} className="card p-6">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center mb-3">
                <Icon size={22} className="text-brand-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* What's included checklist */}
      <div className="bg-brand-50 py-16">
        <div className="container-custom max-w-3xl">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-10">Çfarë Përfshihet</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Dashboard i dedikuar për biznesin tuaj',
              'Skaner QR për verifikim të shpejtë',
              'Statistika dhe analitika në kohë reale',
              'Fotografi dhe galeri imazhesh për dealin',
              'Opsion "1 voucher për tavolinë"',
              'Sistemi i vlerësimeve nga klientët',
              'Njoftimet kur shiten voucher-et',
              'Mbështetje teknike nga ekipi ynë',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-brand-100">
                <CheckCircle size={18} className="text-brand-600 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="container-custom py-16 max-w-3xl">
        <h2 className="text-3xl font-black text-gray-900 text-center mb-10">Pyetjet e Shpeshta</h2>
        <div className="space-y-3">
          {FAQS.map((faq) => <FAQ key={faq.q} {...faq} />)}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-brand-gradient py-20 text-center text-white">
        <h2 className="text-3xl font-black mb-4">Gati të Filloni?</h2>
        <p className="text-blue-100 mb-8 max-w-xl mx-auto text-lg">Regjistrohu falas sot. Nuk nevojitet karta krediti.</p>
        <Link to="/register?role=business" className="bg-white text-brand-600 font-black px-10 py-4 rounded-2xl hover:bg-brand-50 transition-all shadow-xl text-lg inline-flex items-center gap-2">
          Regjistrohu Falas <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  );
}
