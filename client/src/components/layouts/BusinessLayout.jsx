import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Tag, Ticket, BarChart2, Store, QrCode, LogOut, Menu, X, ChevronRight, Plus,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/business-dashboard', icon: LayoutDashboard, label: 'Ballina', end: true },
  { to: '/business-dashboard/deals', icon: Tag, label: 'Deal-et' },
  { to: '/business-dashboard/vouchers', icon: Ticket, label: 'Voucherët' },
  { to: '/business-dashboard/analytics', icon: BarChart2, label: 'Analitikë' },
  { to: '/business-dashboard/scanner', icon: QrCode, label: 'Skaner QR' },
  { to: '/business-dashboard/profile', icon: Store, label: 'Profili Biznesit' },
];

export default function BusinessLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

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
            <p className="font-semibold text-gray-900">Business Panel</p>
            <p className="text-xs text-brand-600">Zbritje.al Partner</p>
          </div>
        </div>
        <NavLink to="/business-dashboard/deals/create" className="btn-primary w-full mt-4 text-sm py-2.5">
          <Plus size={16} /> Krijo Deal
        </NavLink>
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
        <NavLink to="/" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
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
        <main className="flex-1 p-4 md:p-8 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
}
