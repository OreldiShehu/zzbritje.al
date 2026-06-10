import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Store, Tag, FolderOpen, BarChart3, CreditCard,
  LifeBuoy, Shield, Settings, LogOut, Menu, X, Zap,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: Users, label: 'Përdoruesit' },
  { to: '/admin/businesses', icon: Store, label: 'Bizneset' },
  { to: '/admin/deals', icon: Tag, label: 'Deal-et' },
  { to: '/admin/categories', icon: FolderOpen, label: 'Kategoritë' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analitikë' },
  { to: '/admin/payments', icon: CreditCard, label: 'Pagesat' },
  { to: '/admin/support', icon: LifeBuoy, label: 'Suport' },
  { to: '/admin/audit-logs', icon: Shield, label: 'Audit Logs' },
  { to: '/admin/settings', icon: Settings, label: 'Cilësimet' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); toast.success('U çkyçët'); navigate('/'); };

  const Sidebar = ({ mobile = false }) => (
    <div className="flex flex-col h-full bg-dark text-white">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-gradient rounded-lg flex items-center justify-center"><Zap size={20} className="text-white" /></div>
          <div>
            <p className="font-bold text-white">Zbritje.al</p>
            <p className="text-xs text-green-400">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => mobile && setSidebarOpen(false)}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 px-4 py-3 rounded-xl text-white bg-brand-700 font-semibold'
                : 'flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/10 hover:text-white font-medium transition-all'
            }>
            <Icon size={18} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <NavLink to="/" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white">← Kthehu</NavLink>
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/30 font-medium transition-colors mt-1">
          <LogOut size={18} /> <span>Çkyçu</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 z-30"><Sidebar /></div>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.div initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed left-0 inset-y-0 w-64 z-50 lg:hidden">
              <div className="relative h-full">
                <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 text-white z-10"><X size={20} /></button>
                <Sidebar mobile />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 lg:pl-64 flex flex-col">
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100"><Menu size={20} /></button>
          <h1 className="font-display font-bold text-gray-900">Admin Panel — Zbritje.al</h1>
          <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">Live System</span>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
}
