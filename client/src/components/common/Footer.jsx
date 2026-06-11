import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Zap } from 'lucide-react';

const footerLinks = {
  platform: [
    { label: 'Si Funksionon', to: '/how-it-works' },
    { label: 'Rreth Nesh', to: '/about' },
    { label: 'Bëhu Partner', to: '/become-partner' },
    { label: 'Shtyp & Media', to: '/press' },
    { label: 'Karrierë', to: '/careers' },
  ],
  support: [
    { label: 'Qendra e Ndihmës', to: '/help' },
    { label: 'Kontakt', to: '/contact' },
    { label: 'Politika e Kthimit', to: '/refund-policy' },
    { label: 'FAQ', to: '/faq' },
    { label: 'Raport Problem', to: '/report' },
  ],
  legal: [
    { label: 'Kushtet e Shërbimit', to: '/terms' },
    { label: 'Politika e Privatësisë', to: '/privacy' },
    { label: 'Politika e Cookies', to: '/cookies' },
    { label: 'GDPR', to: '/gdpr' },
  ],
};

const cities = ['Tiranë', 'Durrës', 'Vlorë', 'Shkodër', 'Elbasan', 'Korçë', 'Berat', 'Sarandë'];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter */}
      <div className="bg-brand-gradient">
        <div className="container-custom py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-white font-display">Mos Humbet Asnjë Ofertë!</h3>
              <p className="text-blue-100 mt-1">Regjistrohu dhe merr ofertat më të mira çdo ditë.</p>
            </div>
            <form className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Email-i juaj..."
                className="flex-1 md:w-72 px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-green-100 focus:outline-none focus:bg-white/30 focus:ring-2 focus:ring-white/50 transition-all"
              />
              <button className="px-6 py-3 bg-white text-brand-700 font-bold rounded-xl hover:bg-brand-50 transition-colors whitespace-nowrap">
                Abonohu
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-xl">Z</span>
              </div>
              <span className="font-black text-2xl text-white font-display">Zbritje.al</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              Platforma Nr.1 e zbritjeve, voucherëve dhe ofertave në Shqipëri.
              Kurseni deri 80% në restorantet, hotelet dhe shërbimet më të mira.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><Mail size={16} className="text-brand-400" /><a href="mailto:info@zbritje.al" className="hover:text-white transition-colors">info@zbritje.al</a></div>
              <div className="flex items-center gap-2"><Phone size={16} className="text-brand-400" /><a href="tel:+355696000000" className="hover:text-white transition-colors">+355 69 600 0000</a></div>
              <div className="flex items-center gap-2"><MapPin size={16} className="text-brand-400" /><span>Rruga e Kavajës, Tiranë, Albania</span></div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: Facebook, href: 'https://facebook.com/zbritjeal', label: 'Facebook' },
                { icon: Instagram, href: 'https://instagram.com/zbritjeal', label: 'Instagram' },
                { icon: Twitter, href: 'https://twitter.com/zbritjeal', label: 'Twitter' },
                { icon: Youtube, href: 'https://youtube.com/zbritjeal', label: 'YouTube' },
              ].map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-brand-600 transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: 'Platforma', links: footerLinks.platform },
            { title: 'Mbështetja', links: footerLinks.support },
            { title: 'Ligjore', links: footerLinks.legal },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="font-bold text-white mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map(({ label, to }) => (
                  <li key={to}>
                    <Link to={to} className="text-sm text-gray-400 hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Cities */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Oferta sipas Qytetit</h4>
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <Link key={city} to={`/city/${city.toLowerCase()}`}
                className="px-3 py-1 bg-gray-800 rounded-lg text-sm text-gray-400 hover:bg-brand-900 hover:text-brand-300 transition-colors">
                {city}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Zbritje.al — Të gjitha të drejtat të rezervuara</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Zap size={14} className="text-brand-500" />Made in 🇦🇱 Albania</span>
            <span>|</span>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
