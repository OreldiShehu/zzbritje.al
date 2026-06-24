import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Zap } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  const footerLinks = {
    platform: [
      { label: t('footer.how_it_works'), to: '/how-it-works' },
      { label: t('footer.about'), to: '/about' },
      { label: t('footer.partner'), to: '/become-partner' },
      { label: t('footer.contact'), to: '/contact' },
    ],
    support: [
      { label: t('footer.contact'), to: '/contact' },
      { label: t('footer.return_policy'), to: '/terms' },
      { label: t('footer.report'), to: '/contact' },
    ],
    legal: [
      { label: t('footer.terms'), to: '/terms' },
      { label: t('footer.privacy'), to: '/privacy' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer */}
      <div className="container-custom py-12">
        {/* Brand row */}
        <div className="flex flex-col items-center text-center mb-10">
          <Link to="/" className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-xl">Z</span>
            </div>
            <span className="font-black text-2xl text-white font-display">Zbritje.al</span>
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-5">
            {t('footer.tagline')}
          </p>
          {/* Contact */}
          <div className="flex flex-col items-center gap-2 text-sm mb-5">
            <a href="mailto:zbritje.al2026@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail size={15} className="text-brand-400" /> zbritje.al2026@gmail.com
            </a>
            <a href="tel:+355692866668" className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone size={15} className="text-brand-400" /> +355 69 2866668
            </a>
            <span className="flex items-center gap-2">
              <MapPin size={15} className="text-brand-400" />Tiranë
            </span>
          </div>
          {/* Social */}
          <div className="flex items-center gap-3">
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

        {/* Links — 3 cols on mobile, inline on desktop */}
        <div className="grid grid-cols-3 gap-6 border-t border-gray-800 pt-8">
          {[
            { title: t('footer.platform'), links: footerLinks.platform },
            { title: t('footer.support'), links: footerLinks.support },
            { title: t('footer.legal'), links: footerLinks.legal },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="font-bold text-white text-sm mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map(({ label, to }) => (
                  <li key={to + label}>
                    <Link to={to} className="text-xs text-gray-400 hover:text-white transition-colors leading-relaxed block">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-5 flex flex-col items-center gap-2 text-xs text-gray-500 text-center">
          <p>© {new Date().getFullYear()} Zbritje.al — {t('footer.copyright')}</p>
          <span className="flex items-center gap-1.5">
          </span>
        </div>
      </div>
    </footer>
  );
}
