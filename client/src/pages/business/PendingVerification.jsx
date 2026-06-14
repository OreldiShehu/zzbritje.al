import { motion } from 'framer-motion';
import { Clock, CheckCircle, MessageCircle, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

const WA_NUMBER = '355692866668';
const WA_MSG = encodeURIComponent('Përshëndetje, sapo regjistrova biznesin tim në Zbritje.al dhe dua të informoj ekipin tuaj. Ju lutem shqyrtojeni sa më shpejt. Faleminderit!');

const STEPS = [
  { icon: Store, label: 'Profili u krijua', done: true },
  { icon: Clock, label: 'Shqyrtim nga ekipi ynë', done: false, active: true },
  { icon: CheckCircle, label: 'Llogaria verifikohet', done: false },
];

export default function PendingVerification() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Clock size={40} className="text-amber-500" />
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-2">Profili juaj është nën shqyrtim</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Ekipi ynë do ta shqyrtojë aplikimin tuaj brenda <strong>24–48 orësh</strong>.
          Do të njoftoheni me email sapo llogaria të verifikohet.
        </p>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map(({ icon: Icon, label, done, active }, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${done ? 'bg-green-100' : active ? 'bg-amber-100' : 'bg-gray-100'}`}>
                  <Icon size={20} className={done ? 'text-green-600' : active ? 'text-amber-600' : 'text-gray-400'} />
                </div>
                <p className={`text-xs font-medium text-center max-w-[72px] leading-tight ${done ? 'text-green-600' : active ? 'text-amber-600' : 'text-gray-400'}`}>{label}</p>
              </div>
              {i < STEPS.length - 1 && <div className={`w-8 h-0.5 mb-5 flex-shrink-0 ${done ? 'bg-green-300' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="card p-5 text-left mb-6 space-y-3">
          <p className="text-sm font-semibold text-gray-900">Ndërkohë mund të:</p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2"><CheckCircle size={15} className="text-green-500 flex-shrink-0 mt-0.5" /> Plotësoni profilin tuaj (logo, adresë, orari)</li>
            <li className="flex items-start gap-2"><CheckCircle size={15} className="text-green-500 flex-shrink-0 mt-0.5" /> Shfletoni platformën dhe shikoni si duken deal-et e bizneseve të tjera</li>
            <li className="flex items-start gap-2"><CheckCircle size={15} className="text-green-500 flex-shrink-0 mt-0.5" /> Planifikoni dealin tuaj të parë gati për t'u publikuar</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <a
            href={`https://wa.me/${WA_NUMBER}?text=${WA_MSG}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-2xl transition-colors"
          >
            <MessageCircle size={18} />
            Na kontaktoni në WhatsApp
          </a>
          <Link to="/business-dashboard/profile" className="btn-secondary py-3">
            Shko te Profili
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
