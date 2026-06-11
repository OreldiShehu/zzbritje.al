import { motion } from 'framer-motion';
import { Search, ShoppingCart, QrCode, Star, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const STEPS_CUSTOMER = [
  { icon: Search, step: '01', title: 'Gjeni Ofertën', desc: 'Shfletoni qindra oferta nga restorante, spa, hotele dhe shumë biznese të tjera pranë jush.' },
  { icon: ShoppingCart, step: '02', title: 'Blini Voucher', desc: 'Bëni pagesën e sigurt me kartë ose Stripe. Marrin automatikisht voucher elektronik me QR Code.' },
  { icon: QrCode, step: '03', title: 'Prezantoni QR', desc: 'Shkoni te biznesi dhe prezantoni QR Code-in nga aplikacioni ose email-i. Biznesi e skanon dhe shërbimi ndodh!' },
  { icon: Star, step: '04', title: 'Lini Recension', desc: 'Ndani eksperiencën tuaj me komunitetin. Çdo recension ju sjell pikë besnikërie për shpërblime të ardhshme.' },
];

const STEPS_BUSINESS = [
  { step: '01', title: 'Regjistrohu Falas', desc: 'Krijoni llogarinë e biznesit tuaj pa asnjë kosto fillestare. Setup i shpejtë — 10 minuta.' },
  { step: '02', title: 'Verifikohuni', desc: 'Ngarkoni dokumentet ligjore. Ekipi ynë verifikon brenda 24-48 orësh.' },
  { step: '03', title: 'Krijoni Ofertën', desc: 'Publikoni ofertën tuaj me çmime, imazhe dhe kushte. Aprovim brenda 24 orësh.' },
  { step: '04', title: 'Fitoni', desc: 'Marrin pagesa automatike. Klientë të rinj çdo ditë. Rriteni biznesin tuaj!' },
];

export default function HowItWorks() {
  return (
    <div className="bg-white">
      <div className="bg-brand-gradient text-white py-16 text-center">
        <h1 className="text-4xl font-black mb-3">Si Funksionon Zbritje.al</h1>
        <p className="text-blue-100 text-lg max-w-2xl mx-auto">Procesi i thjeshtë dhe i shpejtë — si për klientët ashtu edhe për bizneset</p>
      </div>

      {/* For Customers */}
      <div className="container-custom py-16 max-w-4xl">
        <div className="text-center mb-10">
          <span className="badge badge-green mb-3">Për Klientët</span>
          <h2 className="text-3xl font-black text-gray-900">Blerja e Voucher-it — 4 Hapa</h2>
        </div>
        <div className="relative">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {STEPS_CUSTOMER.map(({ icon: Icon, step, title, desc }, i) => (
              <motion.div key={step}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="relative card p-6 text-center">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center text-xs font-black">{step}</div>
                <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4 mt-2">
                  <Icon size={24} className="text-brand-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="text-center mt-8">
          <Link to="/search" className="btn-primary">Shfleto Ofertat Tani →</Link>
        </div>
      </div>

      {/* For Businesses */}
      <div className="bg-gray-50 py-16">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-10">
            <span className="badge bg-purple-100 text-purple-700 mb-3">Për Bizneset</span>
            <h2 className="text-3xl font-black text-gray-900">Filloni të Fitoni — 4 Hapa</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {STEPS_BUSINESS.map(({ step, title, desc }, i) => (
              <motion.div key={step}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className="card p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0">{step}</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-gray-500 text-sm">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/become-partner" className="btn-primary">Bashkohuni si Partner →</Link>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="container-custom py-16 max-w-3xl">
        <h2 className="text-3xl font-black text-gray-900 text-center mb-10">Pyetje të Shpeshta</h2>
        <div className="space-y-3">
          {[
            { q: 'A mund ta kthej voucher-in nëse ndërroj mendje?', a: 'Po! Keni 14 ditë nga blerja për të kërkuar rimbursim, nëse voucher-i nuk është përdorur akoma.' },
            { q: 'Si e di se biznesi është i besuar?', a: 'Çdo biznes kalon procesin tonë të verifikimit të dokumenteve dhe identitetit. Shihni insignën "Verifikuar" pranë emrit.' },
            { q: 'A funksionon edhe pa internet?', a: 'Voucher-i mund të shkarkohet si PDF para se të vizitoni biznesin. Biznesi e skanon QR Code-in offline.' },
            { q: 'Sa kursej mesatarisht?', a: 'Klientët tanë kursejnë mesatarisht 45% krahasuar me çmimin e plotë. Disa oferta arrijnë deri në 80% zbritje!' },
            { q: 'Mund ta ndaj voucher-in me dikë tjetër?', a: 'Jo, voucher-et janë personale dhe lidhen me llogarinë tuaj. Por mund të blini si dhuratë nëse biznesi e lejon.' },
          ].map(({ q, a }) => (
            <details key={q} className="card group">
              <summary className="p-5 cursor-pointer font-semibold text-gray-900 list-none flex items-center justify-between hover:text-brand-700">
                {q}<ChevronRight size={18} className="text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0" />
              </summary>
              <div className="px-5 pb-5 text-gray-600 text-sm border-t border-gray-100 pt-3">{a}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
