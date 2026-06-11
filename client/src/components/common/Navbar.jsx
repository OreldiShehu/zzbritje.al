import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Search, MapPin, Bell, Heart, Menu, X, ChevronDown, User,
  LayoutDashboard, LogOut, Store, Shield, Ticket, Wallet, Globe,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { LANGUAGES } from '../../i18n';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const CATEGORIES = [
  { icon: '🍽️', slug: 'restorante' },
  { icon: '💅', slug: 'bukuri' },
  { icon: '🏨', slug: 'hotele' },
  { icon: '🎭', slug: 'aktivitete' },
  { icon: '🦷', slug: 'shendet' },
  { icon: '💪', slug: 'sport' },
  { icon: '☕', slug: 'kafene' },
  { icon: '🌙', slug: 'jete-nate' },
  { icon: '✈️', slug: 'udhetim' },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const langRef = useRef(null);

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/notifications?unreadOnly=true&limit=1').then((r) => {
      setUnreadCount(r.data.pagination?.total || 0);
    }).catch(() => {});
  }, [isAuthenticated]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = async () => {
    await logout();
    toast.success(t('auth.logout_success'));
    navigate('/');
    setProfileOpen(false);
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin' || user?.role === 'superadmin') return '/admin';
    if (user?.role === 'business') return '/business-dashboard';
    return '/dashboard';
  };

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setLangOpen(false);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm shadow-sm'}`}>
        <div className="container-custom">
          <div className="flex items-center gap-3 h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0">
              <img
                src="/logo.png"
                alt="Zbritje.al"
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-3">
              <div className="relative w-full">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('nav.search_placeholder')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all"
                />
              </div>
            </form>

            {/* Categories */}
            <div className="hidden lg:block relative">
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="flex items-center gap-1.5 text-gray-700 hover:text-brand-600 font-medium text-sm transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-50"
              >
                {t('nav.categories')} <ChevronDown size={14} className={`transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {categoriesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
                    onMouseLeave={() => setCategoriesOpen(false)}
                  >
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat.slug}
                        to={`/category/${cat.slug}`}
                        onClick={() => setCategoriesOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-brand-50 hover:text-brand-700 transition-colors text-sm text-gray-700"
                      >
                        <span>{cat.icon}</span>
                        <span>{t(`nav.categories_list.${cat.slug}`)}</span>
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <Link to="/search" onClick={() => setCategoriesOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-brand-600 font-medium">
                        {t('nav.see_all')}
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1 ml-auto">

              {/* Language switcher */}
              <div ref={langRef} className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-600 font-medium"
                  title="Change language"
                >
                  <span className="text-base">{currentLang.flag}</span>
                  <span className="hidden sm:block">{currentLang.code.toUpperCase()}</span>
                  <ChevronDown size={12} className="text-gray-400" />
                </button>
                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
                    >
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => changeLanguage(lang.code)}
                          className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-brand-50 hover:text-brand-700 transition-colors ${i18n.language === lang.code ? 'text-brand-600 font-semibold bg-brand-50' : 'text-gray-700'}`}
                        >
                          <span className="text-base">{lang.flag}</span>
                          <span>{lang.label}</span>
                          {i18n.language === lang.code && <span className="ml-auto text-brand-500">✓</span>}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {isAuthenticated ? (
                <>
                  <NavLink to="/dashboard/favorites" className="p-2 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                    <Heart size={20} />
                  </NavLink>
                  <NavLink to="/dashboard/notifications" className="relative p-2 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </NavLink>

                  <div ref={profileRef} className="relative">
                    <button onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                      <img
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=1a3f8a&color=fff&size=32`}
                        alt={user?.firstName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.firstName}</span>
                      <ChevronDown size={14} className="text-gray-400" />
                    </button>

                    <AnimatePresence>
                      {profileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                          className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
                        >
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                          </div>
                          {[
                            { to: getDashboardLink(), icon: LayoutDashboard, label: t('nav.dashboard') },
                            { to: '/dashboard/vouchers', icon: Ticket, label: t('nav.my_vouchers') },
                            { to: '/dashboard/wallet', icon: Wallet, label: `${t('nav.wallet')}: ${user?.walletBalance?.toLocaleString() || 0} L` },
                          ].map(({ to, icon: Icon, label }) => (
                            <Link key={to} to={to} onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                              <Icon size={16} className="text-gray-400" />{label}
                            </Link>
                          ))}
                          <div className="border-t border-gray-100 mt-1 pt-1">
                            <button onClick={handleLogout}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 w-full transition-colors">
                              <LogOut size={16} />{t('nav.logout')}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="hidden sm:inline-flex btn-ghost text-sm py-2 px-3">{t('nav.login')}</Link>
                  <Link to="/register" className="btn-primary text-sm py-2 px-4">{t('nav.register')}</Link>
                </>
              )}

              <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="container-custom py-4 space-y-3">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('nav.search_placeholder_short')}
                      className="input-field text-sm py-2.5 pl-9"
                    />
                  </div>
                  <button type="submit" className="btn-primary py-2.5 px-4"><Search size={18} /></button>
                </form>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.slice(0, 6).map((cat) => (
                    <Link key={cat.slug} to={`/category/${cat.slug}`} onClick={() => setMobileOpen(false)}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gray-50 hover:bg-brand-50 text-center transition-colors">
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="text-xs text-gray-700 font-medium leading-tight">{t(`nav.categories_list.${cat.slug}`)}</span>
                    </Link>
                  ))}
                </div>
                {/* Language selector mobile */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { changeLanguage(lang.code); setMobileOpen(false); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors ${i18n.language === lang.code ? 'border-brand-500 bg-brand-50 text-brand-700 font-semibold' : 'border-gray-200 text-gray-600 hover:border-brand-300'}`}
                    >
                      {lang.flag} {lang.label}
                    </button>
                  ))}
                </div>
                {!isAuthenticated && (
                  <div className="flex gap-2 pt-1">
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 py-2.5">{t('nav.login')}</Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 py-2.5">{t('nav.register')}</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <div className="h-16" />
    </>
  );
}
