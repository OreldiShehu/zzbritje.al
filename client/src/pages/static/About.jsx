import { motion } from 'framer-motion';
import { Target, Heart, Zap, Users, Globe, TrendingUp } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-brand-gradient text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="container-custom text-center relative">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Rreth Zbritje.al</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">Platforma nr. 1 e zbritjeve dhe voucherëve në Shqipëri</p>
        </div>
      </div>

      {/* Mission */}
      <div className="container-custom py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-gray-900 mb-4">Misioni Ynë</h2>
          <p className="text-lg text-gray-600">Zbritje.al u krijua me një qëllim të qartë: t'i lidhë klientët me bizneset e tyre të preferuara nëpërmjet ofertave ekskluzive dhe zbritjeve të vërteta. Besojmë se çdo shqiptar meriton të shijojë shërbime cilësore me çmime të favorshme.</p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: Target, title: 'Transparencë', desc: 'Çmime të qarta, pa kosto të fshehura. Çfarë shihni është çfarë paguani.', color: 'text-brand-600', bg: 'bg-brand-50' },
            { icon: Heart, title: 'Besueshmëri', desc: 'Çdo biznes partner është verifikuar nga ekipi ynë për të garantuar cilësi.', color: 'text-red-500', bg: 'bg-red-50' },
            { icon: Zap, title: 'Inovacion', desc: 'Teknologji moderne, eksperiencë e thjeshtë dhe e shpejtë për çdo përdorues.', color: 'text-amber-500', bg: 'bg-amber-50' },
          ].map(({ icon: Icon, title, desc, color, bg }) => (
            <motion.div key={title} whileHover={{ y: -4 }} className="card p-6 text-center">
              <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}><Icon size={24} className={color} /></div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-brand-gradient rounded-3xl p-8 text-white text-center grid grid-cols-3 gap-6">
          {[{ icon: Users, value: '50K+', label: 'Klientë' }, { icon: Globe, value: '1K+', label: 'Biznese' }, { icon: TrendingUp, value: '200K+', label: 'Voucher Shitje' }].map(({ icon: Icon, value, label }) => (
            <div key={label}>
              <Icon size={28} className="mx-auto mb-2 text-green-200" />
              <p className="text-3xl font-black">{value}</p>
              <p className="text-green-100">{label}</p>
            </div>
          ))}
        </div>

        {/* Team section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-3">Ekipi Ynë</h2>
          <p className="text-gray-500 mb-8">Jemi një ekip i vogël por i dedikuar, me pasion për teknologjinë dhe tregtinë elektronike shqiptare.</p>
          <p className="text-gray-500">📧 Kontaktoni: <a href="mailto:info@zbritje.al" className="text-brand-600 font-medium hover:underline">info@zbritje.al</a></p>
        </div>
      </div>
    </div>
  );
}
