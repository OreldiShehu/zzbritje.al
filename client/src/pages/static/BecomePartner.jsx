// v3
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, TrendingUp, Users, Zap, Star, Shield, BarChart2, ArrowRight, ChevronDown, Banknote, MapPin, QrCode, Crown, X } from 'lucide-react';
import { useState } from 'react';

const STEPS = [
  { num: '1', title: 'Regjistrohu Falas', desc: 'Krijo llogarinë tënde si biznes. Nuk nevojitet karta krediti dhe nuk ka kosto fillestare.' },
  { num: '2', title: 'Krijo Ofertën', desc: 'Vendos çmimin tënd dhe publiko dealin. Setup i shpejtë brenda pak minutave.' },
  { num: '3', title: 'Merr Klientë', desc: 'Klientët blejnë voucher-in online dhe vijnë fizikisht tek biznesi juaj.' },
  { num: '4', title: 'Mblidh të Ardhurat', desc: 'Klienti paguan direkt tek ju kur paraqet voucher-in. Thjeshtë dhe pa ndërmjetës.' },
];

const FAQS = [
  {
    q: 'Sa kushton listimi i biznesit?',
    a: 'Regjistrimi është plotësisht falas dhe përfshin deri në 2 deals aktive dhe 10 vouchers/deal. Plani Pro kushton 1,500 ALL/muaj dhe ju jep 20+ deals mujore, vouchers të pakufizuara dhe prioritet në kërkime.',
  },
  {
    q: 'Kur marr paratë nga voucher-et?',
    a: 'Klienti paguan direkt tek ju kur vjen të përdorë voucher-in fizikisht. Nuk ka pritje dhe nuk ka para që kalojnë nëpër platformë.',
  },
  {
    q: 'Mund të vendos çmimin dhe kushtet që dua?',
    a: 'Po, ju keni kontroll të plotë mbi çmimin bazë, numrin e voucher-eve, datat e vlefshmërisë dhe kushtet e veçanta të dealit.',
  },
  {
    q: 'Si e verifikoj voucher-in e klientit?',
    a: 'Platforma ju ofron një skaner QR të integruar në dashboard. Skanoni kodin e klientit dhe sistemi konfirmon menjëherë nëse voucher-i është i vlefshëm.',
  },
  {
    q: 'Sa kohë duhet për t\'u verifikuar?',
    a: 'Pasi të krijoni profilin, llogaria juaj verifikohet nga ekipi ynë. Do të merrni një njoftim me të gjitha informacionet e nevojshme sapo të verifikohet.',
  },
  {
    q: 'Mund të vendos "1 voucher max"?',
    a: 'Po. Gjatë krijimit të dealit mund të aktivizoni opsionin "1 voucher max" dhe klientët e shohin këtë kufizim para blerjes. Ju e kontrolloni gjatë skanimit.',
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
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{a}</p>
      </motion.div>
    </div>
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
          <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
            <span className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm font-medium">
              <Star size={16} className="text-amber-300" /> Falas për të filluar
            </span>
            <span className="inline-flex items-center gap-2 bg-amber-500/30 border border-amber-400/40 rounded-full px-4 py-2 text-sm font-bold text-amber-200">
              <Crown size={14} /> Pro — 1,500 ALL/muaj
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-5 leading-tight">Rriti Biznesin Tënd me Zbritje.al</h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">Listoni ofertat tuaja, arrini mijëra klientë aktivë, dhe merrni paratë direkt. Filloni falas ose kaloni në Pro.</p>
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

      {/* Pricing */}
      <div className="container-custom py-16 max-w-3xl">
        <h2 className="text-3xl font-black text-gray-900 text-center mb-2">Zgjidhni Planin Tuaj</h2>
        <p className="text-gray-500 text-center mb-10">Filloni falas ose kaloni në Pro për kapacitet të plotë</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free plan */}
          <div className="rounded-2xl border-2 border-gray-200 p-8 flex flex-col">
            <div className="mb-6">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Falas</span>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-4xl font-black text-gray-900">0</span>
                <span className="text-gray-500 mb-1">ALL / muaj</span>
              </div>
              <p className="text-gray-500 text-sm mt-2">Ideal për të filluar dhe testuar platformën</p>
            </div>
            <ul className="space-y-3 flex-1">
              {[
                { text: 'Deri në 2 deals aktive', ok: true },
                { text: 'Deri në 10 vouchers/deal', ok: true },
                { text: 'Dashboard dhe statistika bazë', ok: true },
                { text: 'Skaner QR', ok: true },
                { text: 'Komision 10%', ok: true },
                { text: 'Deals të pakufizuara', ok: false },
                { text: 'Vouchers të pakufizuara', ok: false },
                { text: 'Prioritet në kërkime', ok: false },
              ].map(({ text, ok }) => (
                <li key={text} className="flex items-center gap-3 text-sm">
                  {ok
                    ? <CheckCircle size={16} className="text-brand-500 flex-shrink-0" />
                    : <X size={16} className="text-gray-300 flex-shrink-0" />}
                  <span className={ok ? 'text-gray-700' : 'text-gray-400'}>{text}</span>
                </li>
              ))}
            </ul>
            <Link to="/register?role=business" className="mt-8 btn-secondary w-full py-3 text-center text-sm font-bold">
              Fillo Falas
            </Link>
          </div>

          {/* Pro plan */}
          <motion.div whileHover={{ y: -4 }} className="rounded-2xl border-2 border-brand-500 bg-brand-50 p-8 flex flex-col relative overflow-hidden">
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              <Crown size={11} /> PRO
            </div>
            <div className="mb-6">
              <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Pro</span>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-4xl font-black text-gray-900">1,500</span>
                <span className="text-gray-500 mb-1">ALL / muaj</span>
              </div>
              <p className="text-gray-500 text-sm mt-2">Për biznese që duan rritje të shpejtë</p>
            </div>
            <ul className="space-y-3 flex-1">
              {[
                '20+ deals aktive çdo muaj',
                'Vouchers të pakufizuara',
                'Prioritet në rezultatet e kërkimit',
                'Dashboard i avancuar me analitika',
                'Skaner QR i dedikuar',
                'Komision i reduktuar',
                'Mbështetje prioritare 24/7',
                'Badge "Biznes i Verifikuar" ✓',
              ].map((text) => (
                <li key={text} className="flex items-center gap-3 text-sm">
                  <CheckCircle size={16} className="text-brand-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{text}</span>
                </li>
              ))}
            </ul>
            <Link to="/register?role=business" className="mt-8 w-full py-3 text-center text-sm font-bold rounded-2xl bg-brand-600 hover:bg-brand-700 text-white transition-colors flex items-center justify-center gap-2">
              Fillo Tani <ArrowRight size={16} />
            </Link>
            <p className="mt-3 text-xs text-center text-gray-400">Pas regjistrimit, kaloni në Pro direkt nga dashboardi juaj</p>
          </motion.div>
        </div>
      </div>

      {/* 3 value props */}
      <div className="container-custom py-16 max-w-4xl">
        <h2 className="text-3xl font-black text-gray-900 text-center mb-2">Pa Rrezik. Filloni Falas.</h2>
        <p className="text-gray-500 text-center mb-10">Ju fokusoheni te biznesi — ne kujdesemi për pjesën tjetër</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-gray-200 p-7 text-center">
            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Banknote size={28} className="text-brand-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Zero Kosto Fillestare</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Regjistrohuni falas dhe filloni të shisni. Paguani vetëm kur fitoni.</p>
          </div>
          <div className="rounded-2xl border-2 border-brand-400 bg-brand-50 p-7 text-center">
            <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin size={28} className="text-brand-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Cash Direkt Tek Ju</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Klienti paguan fizikisht kur vjen. Nuk ka para që presin apo transferohen.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 p-7 text-center">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <QrCode size={28} className="text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Kontroll i Plotë</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Vendosni çmimin, kufizimet dhe datat. Skanoni voucher-et me QR scanner.</p>
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
            { icon: Shield, title: 'Pa Rrezik Financiar', desc: 'Zero kosto fillestare. Paguani vetëm kur fitoni — asnjë kosto tjetër.' },
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

      {/* What's included */}
      <div className="bg-brand-50 py-16">
        <div className="container-custom max-w-3xl">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-10">Çfarë Përfshihet</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Dashboard i dedikuar për biznesin tuaj',
              'Skaner QR për verifikim të shpejtë',
              'Statistika dhe analitika në kohë reale',
              'Galeri imazhesh për dealin tuaj',
              'Opsion "1 voucher për tavolinë"',
              'Sistemi i vlerësimeve nga klientët',
              'Njoftime kur shiten voucher-et',
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
