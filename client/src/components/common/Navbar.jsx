import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Bell, Heart, Menu, X, ChevronDown, User,
  LayoutDashboard, LogOut, Store, Shield, Ticket, Wallet,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const categories = [
  { label: 'Restorante', icon: '🍽️', slug: 'restorante' },
  { label: 'Bukuri & Kujdes', icon: '💅', slug: 'bukuri' },
  { label: 'Hotele & Resorte', icon: '🏨', slug: 'hotele' },
  { label: 'Aktivitete', icon: '🎭', slug: 'aktivitete' },
  { label: 'Denta & Shëndet', icon: '🦷', slug: 'shendet' },
  { label: 'Palestër & Sport', icon: '💪', slug: 'sport' },
  { label: 'Kafene', icon: '☕', slug: 'kafene' },
  { label: 'Jetë Nate', icon: '🌙', slug: 'jete-nate' },
  { label: 'Udhëtime', icon: '✈️', slug: 'udhetim' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => { window.removeEventListener('scroll', handleScroll); document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = async () => {
    await logout();
    toast.success('U çkyçët me sukses!');
    navigate('/');
    setProfileOpen(false);
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin' || user?.role === 'superadmin') return '/admin';
    if (user?.role === 'business') return '/business-dashboard';
    return '/dashboard';
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm shadow-sm'}`}>
        <div className="container-custom">
          <div className="flex items-center gap-4 h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 bg-brand-gradient rounded-lg flex items-center justify-center shadow-brand">
                <span className="text-white font-black text-lg">Z</span>
              </div>
              <div>
                <span className="font-black text-lg text-gray-900 font-display">Zbritje</span>
                <span className="font-black text-lg text-brand-600 font-display">.al</span>
              </div>
            </Link>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
              <div className="relative w-full">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Kërko oferta, restorante, spa..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all"
                />
              </div>
            </form>

            {/* Categories dropdown */}
            <div className="hidden lg:block relative">
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="flex items-center gap-1.5 text-gray-700 hover:text-brand-600 font-medium text-sm transition-colors"
              >
                Kategoritë <ChevronDown size={16} className={`transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {categoriesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
                    onMouseLeave={() => setCategoriesOpen(false)}
                  >
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        to={`/category/${cat.slug}`}
                        onClick={() => setCategoriesOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-brand-50 hover:text-brand-700 transition-colors text-sm text-gray-700"
                      >
                        <span className="text-lg">{cat.icon}</span>
                        <span>{cat.label}</span>
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <Link to="/search" onClick={() => setCategoriesOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-brand-600 font-medium">
                        Shiko të gjitha →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Location */}
            <button className="hidden lg:flex items-center gap-1.5 text-gray-600 hover:text-brand-600 text-sm font-medium transition-colors">
              <MapPin size={16} /> Tiranë
            </button>

            {/* Right side */}
            <div className="flex items-center gap-2 ml-auto">
              {isAuthenticated ? (
                <>
                  <NavLink to="/dashboard/favorites" className="p-2 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                    <Heart size={20} />
                  </NavLink>
                  <NavLink to="/dashboard/notifications" className="relative p-2 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
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
                            { to: getDashboardLink(), icon: LayoutDashboard, label: 'Dashboard' },
                            { to: '/dashboard/vouchers', icon: Ticket, label: 'Voucherët e Mi' },
                            { to: '/dashboard/wallet', icon: Wallet, label: `Portofol: ${user?.walletBalance?.toLocaleString() || 0} L` },
                          ].map(({ to, icon: Icon, label }) => (
                            <Link key={to} to={to} onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                              <Icon size={16} className="text-gray-400" />{label}
                            </Link>
                          ))}
                          <div className="border-t border-gray-100 mt-1 pt-1">
                            <button onClick={handleLogout}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 w-full transition-colors">
                              <LogOut size={16} />Çkyçu
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="hidden sm:inline-flex btn-ghost text-sm py-2">Hyr</Link>
                  <Link to="/register" className="btn-primary text-sm py-2 px-4">Regjistrohu</Link>
                </>
              )}

              {/* Mobile menu toggle */}
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
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Kërko oferta..."
                    className="input-field text-sm py-2.5"
                  />
                  <button type="submit" className="btn-primary py-2.5 px-4">
                    <Search size={18} />
                  </button>
                </form>
                <div className="grid grid-cols-3 gap-2">
                  {categories.slice(0, 6).map((cat) => (
                    <Link key={cat.slug} to={`/category/${cat.slug}`} onClick={() => setMobileOpen(false)}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gray-50 hover:bg-brand-50 text-center transition-colors">
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="text-xs text-gray-700 font-medium leading-tight">{cat.label}</span>
                    </Link>
                  ))}
                </div>
                {!isAuthenticated && (
                  <div className="flex gap-2 pt-2">
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 py-2.5">Hyr</Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 py-2.5">Regjistrohu</Link>
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
