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

  const getRoleLinks = () => {
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      return [
        { to: '/admin', icon: Shield, label: 'Paneli Admin' },
        { to: '/dashboard/notifications', icon: Bell, label: 'Njoftime', badge: unreadCount },
      ];
    }
    if (user?.role === 'business') {
      return [
        { to: '/business-dashboard', icon: LayoutDashboard, label: 'Paneli im' },
        { to: '/business-dashboard/deals', icon: Store, label: 'Deal-et e mia' },
        { to: '/business-dashboard/profile', icon: User, label: 'Profili i biznesit' },
        { to: '/dashboard/notifications', icon: Bell, label: 'Njoftime', badge: unreadCount },
      ];
    }
    return [
      { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
      { to: '/dashboard/vouchers', icon: Ticket, label: t('nav.my_vouchers') },
      { to: '/dashboard/favorites', icon: Heart, label: t('nav.favorites', 'Të preferuarat') },
      { to: '/dashboard/notifications', icon: Bell, label: t('nav.notifications', 'Njoftime'), badge: unreadCount },
      { to: '/dashboard/wallet', icon: Wallet, label: t('nav.wallet') },
    ];
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm shadow-sm'}`}>
        <div className="container-custom">
          <div className="flex items-center gap-3 h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img
                src="/logo.png"
                alt="Zbritje.al"
                className="h-8 sm:h-9 w-auto object-contain"
              />
              <span className="font-black text-lg text-gray-900 font-display tracking-tight">Zbritje<span className="text-brand-600">.al</span></span>
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

              {isAuthenticated ? (
                <>
                  {/* Desktop dropdown */}
                  <div ref={profileRef} className="hidden sm:block relative">
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-1 p-1 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center">
                        <span className="text-white text-xs font-black">
                          {(user?.firstName?.[0] || '').toUpperCase()}{(user?.lastName?.[0] || '').toUpperCase()}
                        </span>
                      </div>
                      <ChevronDown size={13} className={`text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {profileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
                        >
                          <div className="px-4 py-2.5 border-b border-gray-100 mb-1">
                            <p className="font-semibold text-gray-900 text-sm truncate">{user?.firstName} {user?.lastName}</p>
                            <p className="text-xs text-brand-600 capitalize">
                              {user?.role === 'customer' ? 'Klient' : user?.role === 'business' ? 'Biznes' : 'Admin'}
                            </p>
                          </div>
                          {getRoleLinks().map(({ to, icon: Icon, label, badge }) => (
                            <NavLink key={to} to={to} onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-sm transition-colors">
                              <Icon size={16} className="text-gray-400 flex-shrink-0" />
                              <span className="flex-1">{label}</span>
                              {badge > 0 && (
                                <span className="w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                  {badge > 9 ? '9+' : badge}
                                </span>
                              )}
                            </NavLink>
                          ))}
                          <div className="border-t border-gray-100 mt-1 pt-1">
                            <button onClick={handleLogout}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 w-full text-sm transition-colors">
                              <LogOut size={16} className="flex-shrink-0" />
                              {t('nav.logout')}
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

              <Link to="/search" className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileOpen(false)}>
                <Search size={20} className="text-gray-700" />
              </Link>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-gray-100">
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
              className="bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="container-custom py-4">
                {/* Mobile search bar */}
                <form onSubmit={(e) => { handleSearch(e); setMobileOpen(false); }} className="mb-4">
                  <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Kërko deal..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>
                </form>

                {isAuthenticated ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 px-3 py-3 bg-brand-50 rounded-xl mb-2">
                      <img
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=1a3f8a&color=fff&size=40`}
                        alt={user?.firstName}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-brand-600 font-medium capitalize">
                          {user?.role === 'customer' ? 'Klient' : user?.role === 'business' ? 'Biznes' : 'Admin'}
                        </p>
                      </div>
                    </div>
                    {getRoleLinks().map(({ to, icon: Icon, label, badge }) => (
                      <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors text-sm font-medium">
                        <Icon size={18} className="text-gray-400 flex-shrink-0" />
                        <span>{label}</span>
                        {badge > 0 && (
                          <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                            {badge > 9 ? '9+' : badge}
                          </span>
                        )}
                      </NavLink>
                    ))}
                    <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 w-full transition-colors text-sm font-medium">
                      <LogOut size={18} className="flex-shrink-0" />
                      {t('nav.logout')}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary w-full py-3 text-center">{t('nav.login')}</Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary w-full py-3 text-center">{t('nav.register')}</Link>
                  </div>
                )}

                {/* Language selector */}
                <div className="flex items-center gap-2 pt-3 mt-1 border-t border-gray-100">
                  <Globe size={14} className="text-gray-400 flex-shrink-0" />
                  <div className="flex flex-wrap gap-1.5">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { changeLanguage(lang.code); setMobileOpen(false); }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${i18n.language === lang.code ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                      >
                        {lang.flag} {lang.code.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <div className="h-16" />
    </>
  );
}
