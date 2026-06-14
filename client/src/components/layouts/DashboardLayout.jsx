import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, User, Bell, Gift, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: Ticket, label: 'Kupona-t e Mia', end: true },
  { to: '/dashboard/notifications', icon: Bell, label: 'Njoftime' },
  { to: '/dashboard/referrals', icon: Gift, label: 'Ftoni Miq' },
  { to: '/dashboard/profile', icon: User, label: 'Profili' },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('U çkyçët me sukses');
    navigate('/');
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full bg-white ${mobile ? '' : 'border-r border-gray-100'}`}>
      {/* User info */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=1a3f8a&color=fff&size=48`}
            alt={user?.firstName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
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
                : 'flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-all duration-150'
            }
          >
            <Icon size={20} />
            <span>{label}</span>
            <ChevronRight size={16} className="ml-auto opacity-40" />
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-colors">
          <LogOut size={20} />
          <span>Çkyçu</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 z-30">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed left-0 inset-y-0 w-72 z-50 lg:hidden"
            >
              <div className="relative h-full">
                <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 p-2 rounded-lg bg-gray-100 z-10">
                  <X size={20} />
                </button>
                <Sidebar mobile />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <h1 className="font-display font-bold text-gray-900">Dashboard</h1>
          <div className="ml-auto flex items-center gap-3">
            <NavLink to="/dashboard/notifications" className="relative p-2 rounded-lg hover:bg-gray-100">
              <Bell size={20} className="text-gray-600" />
            </NavLink>
            <NavLink to="/" className="text-sm text-brand-600 hover:text-brand-700 font-medium">← Kthehu</NavLink>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
