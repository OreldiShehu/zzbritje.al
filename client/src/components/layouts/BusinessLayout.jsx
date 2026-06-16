import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Tag, BarChart2, Store, QrCode, LogOut, Menu, X, ChevronRight, Plus, AlertTriangle, Lock,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const WA_ADMIN = '355692866668';
const FREE_DEAL_LIMIT = 2;

const navItems = [
  { to: '/business-dashboard', icon: LayoutDashboard, label: 'HOME', bottomLabel: 'Kryefaqja', end: true },
  { to: '/business-dashboard/deals', icon: Tag, label: 'Deal-et', bottomLabel: 'Deal-et' },
  { to: '/business-dashboard/analytics', icon: BarChart2, label: 'Analitikë', bottomLabel: 'Statistika' },
  { to: '/business-dashboard/scanner', icon: QrCode, label: 'Skaner QR', bottomLabel: 'Skaner' },
  { to: '/business-dashboard/profile', icon: Store, label: 'Profili Biznesit', bottomLabel: 'Profili' },
];

export default function BusinessLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const { data: business } = useQuery({
    queryKey: ['business', 'my'],
    queryFn: () => api.get('/businesses/my').then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: activeDealsData } = useQuery({
    queryKey: ['business', 'active-deals-count'],
    queryFn: () => api.get('/deals/business/my?status=active&limit=5').then((r) => r.data),
    enabled: !!business && business.plan === 'free',
    staleTime: 2 * 60 * 1000,
  });

  const activeCount = activeDealsData?.pagination?.total || 0;
  const atFreeLimit = business?.plan === 'free' && activeCount >= FREE_DEAL_LIMIT;
  const waUpgradeUrl = `https://wa.me/${WA_ADMIN}?text=${encodeURIComponent(`Përshëndetje! Biznesi "${business?.name}" ka arritur limitin e planit Falas dhe dëshiron të kalojë në Pro.`)}`;

  const isUnverified = business && business.verificationStatus !== 'verified';

  const handleLogout = async () => {
    await logout();
    toast.success('U çkyçët me sukses');
    navigate('/');
  };

  const Sidebar = ({ mobile = false }) => (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-brand-gradient rounded-xl flex items-center justify-center">
            <Store size={22} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 truncate max-w-[120px]">{business?.name || 'Business Panel'}</p>
            <p className="text-xs text-brand-600">Zbritje.al Partner</p>
          </div>
        </div>
        {atFreeLimit ? (
          <div className="mt-4 space-y-2">
            <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed select-none">
              <Lock size={15} /> Krijo Deal
            </div>
            <a href={waUpgradeUrl} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold transition-colors">
              ⬆ Kalon në Pro
            </a>
          </div>
        ) : (
          <NavLink to="/business-dashboard/deals/create" className="btn-primary w-full mt-4 text-sm py-2.5 flex items-center justify-center gap-2">
            <Plus size={16} /> Krijo Deal
          </NavLink>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => mobile && setSidebarOpen(false)}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 px-4 py-3 rounded-xl text-brand-700 bg-brand-50 font-semibold border-r-4 border-brand-600'
                : 'flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-all'
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <NavLink to="/" className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors">
          ← Kthehu te Platforma
        </NavLink>
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-colors mt-1">
          <LogOut size={20} /> <span>Çkyçu</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 z-30"><Sidebar /></div>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed left-0 inset-y-0 w-72 z-50 lg:hidden">
              <div className="relative h-full">
                <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 p-2 rounded-lg bg-gray-100 z-10"><X size={20} /></button>
                <Sidebar mobile />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 lg:pl-72 flex flex-col">
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100"><Menu size={20} /></button>
          <h1 className="font-display font-bold text-gray-900">Business Dashboard</h1>
        </header>

        {/* Verification banner */}
        <AnimatePresence>
          {isUnverified && !bannerDismissed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-amber-50 border-b border-amber-200 overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-800 flex-1">
                  <span className="font-bold">Llogaria juaj është në pritje verifikimi.</span>{' '}
                  Ekipi ynë do ta shqyrtojë dhe do të merrni një njoftim sapo të verifikohet. Deri atëherë, disa funksione mund të jenë të kufizuara.
                </p>
                <button onClick={() => setBannerDismissed(true)} className="p-1 rounded-lg hover:bg-amber-100 text-amber-600 flex-shrink-0">
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="pb-20 lg:pb-0">
            <Outlet />
          </div>
        </main>

        {/* Bottom navigation — mobile only */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-30">
          {navItems.map(({ to, icon: Icon, bottomLabel, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-2 min-h-[56px] gap-0.5 transition-colors ${
                  isActive ? 'text-brand-600' : 'text-gray-400'
                }`
              }
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium leading-tight">{bottomLabel}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
