import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useAuthStore } from './store/authStore';
import LoadingSpinner from './components/common/LoadingSpinner';
import ScrollToTop from './components/common/ScrollToTop';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import DashboardLayout from './components/layouts/DashboardLayout';
import AdminLayout from './components/layouts/AdminLayout';
import BusinessLayout from './components/layouts/BusinessLayout';

// Eager-loaded pages
import Home from './pages/Home';
import NotFound from './pages/NotFound';

// Lazy-loaded pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const AuthCallback = lazy(() => import('./pages/auth/AuthCallback'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));

const DealDetails = lazy(() => import('./pages/DealDetails'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Search = lazy(() => import('./pages/Search'));
const CategoryPage = lazy(() => import('./pages/Category'));
const CityPage = lazy(() => import('./pages/City'));
const Businesses = lazy(() => import('./pages/Businesses'));
const BusinessProfile = lazy(() => import('./pages/BusinessProfile'));

// Customer Dashboard
const CustomerDashboard = lazy(() => import('./pages/customer/Dashboard'));
const CustomerVouchers = lazy(() => import('./pages/customer/Vouchers'));
const CustomerFavorites = lazy(() => import('./pages/customer/Favorites'));
const CustomerProfile = lazy(() => import('./pages/customer/Profile'));
const CustomerNotifications = lazy(() => import('./pages/customer/Notifications'));
const CustomerWallet = lazy(() => import('./pages/customer/Wallet'));
const CustomerReferrals = lazy(() => import('./pages/customer/Referrals'));
const CustomerTransactions = lazy(() => import('./pages/customer/Transactions'));

// Business Dashboard
const BusinessDashboard = lazy(() => import('./pages/business/Dashboard'));
const BusinessCreateDeal = lazy(() => import('./pages/business/CreateDeal'));
const BusinessEditDeal = lazy(() => import('./pages/business/EditDeal'));
const BusinessDeals = lazy(() => import('./pages/business/Deals'));
const BusinessVouchers = lazy(() => import('./pages/business/Vouchers'));
const BusinessAnalytics = lazy(() => import('./pages/business/Analytics'));
const BusinessProfilePage = lazy(() => import('./pages/business/Profile'));
const BusinessScanner = lazy(() => import('./pages/business/Scanner'));

// Admin Dashboard
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminBusinesses = lazy(() => import('./pages/admin/Businesses'));
const AdminDeals = lazy(() => import('./pages/admin/Deals'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));
const AdminSupport = lazy(() => import('./pages/admin/Support'));
const AdminAuditLogs = lazy(() => import('./pages/admin/AuditLogs'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));

// Static pages
const About = lazy(() => import('./pages/static/About'));
const HowItWorks = lazy(() => import('./pages/static/HowItWorks'));
const Privacy = lazy(() => import('./pages/static/Privacy'));
const Terms = lazy(() => import('./pages/static/Terms'));
const Contact = lazy(() => import('./pages/static/Contact'));
const BecomePartner = lazy(() => import('./pages/static/BecomePartner'));
const VoucherScan = lazy(() => import('./pages/VoucherScan'));

// Route guards
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>}>
    {children}
  </Suspense>
);

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/deals/:slug" element={<SuspenseWrapper><DealDetails /></SuspenseWrapper>} />
          <Route path="/search" element={<SuspenseWrapper><Search /></SuspenseWrapper>} />
          <Route path="/category/:slug" element={<SuspenseWrapper><CategoryPage /></SuspenseWrapper>} />
          <Route path="/city/:city" element={<SuspenseWrapper><CityPage /></SuspenseWrapper>} />
          <Route path="/businesses" element={<SuspenseWrapper><Businesses /></SuspenseWrapper>} />
          <Route path="/business/:slug" element={<SuspenseWrapper><BusinessProfile /></SuspenseWrapper>} />
          <Route path="/checkout/:dealId" element={<ProtectedRoute allowedRoles={['customer', 'business', 'admin', 'superadmin']}><SuspenseWrapper><Checkout /></SuspenseWrapper></ProtectedRoute>} />
          <Route path="/about" element={<SuspenseWrapper><About /></SuspenseWrapper>} />
          <Route path="/how-it-works" element={<SuspenseWrapper><HowItWorks /></SuspenseWrapper>} />
          <Route path="/privacy" element={<SuspenseWrapper><Privacy /></SuspenseWrapper>} />
          <Route path="/terms" element={<SuspenseWrapper><Terms /></SuspenseWrapper>} />
          <Route path="/contact" element={<SuspenseWrapper><Contact /></SuspenseWrapper>} />
          <Route path="/become-partner" element={<SuspenseWrapper><BecomePartner /></SuspenseWrapper>} />
          <Route path="/v/:code" element={<SuspenseWrapper><VoucherScan /></SuspenseWrapper>} />
        </Route>

        {/* Guest-only auth routes */}
        <Route path="/login" element={<GuestRoute><SuspenseWrapper><Login /></SuspenseWrapper></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><SuspenseWrapper><Register /></SuspenseWrapper></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><SuspenseWrapper><ForgotPassword /></SuspenseWrapper></GuestRoute>} />
        <Route path="/reset-password/:token" element={<SuspenseWrapper><ResetPassword /></SuspenseWrapper>} />
        <Route path="/verify-email" element={<SuspenseWrapper><VerifyEmail /></SuspenseWrapper>} />
        <Route path="/verify-email/:token" element={<SuspenseWrapper><VerifyEmail /></SuspenseWrapper>} />
        <Route path="/auth/callback" element={<SuspenseWrapper><AuthCallback /></SuspenseWrapper>} />

        {/* Customer Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['customer', 'business', 'admin', 'superadmin']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<SuspenseWrapper><CustomerDashboard /></SuspenseWrapper>} />
          <Route path="vouchers" element={<SuspenseWrapper><CustomerVouchers /></SuspenseWrapper>} />
          <Route path="favorites" element={<SuspenseWrapper><CustomerFavorites /></SuspenseWrapper>} />
          <Route path="profile" element={<SuspenseWrapper><CustomerProfile /></SuspenseWrapper>} />
          <Route path="notifications" element={<SuspenseWrapper><CustomerNotifications /></SuspenseWrapper>} />
          <Route path="wallet" element={<SuspenseWrapper><CustomerWallet /></SuspenseWrapper>} />
          <Route path="referrals" element={<SuspenseWrapper><CustomerReferrals /></SuspenseWrapper>} />
          <Route path="transactions" element={<SuspenseWrapper><CustomerTransactions /></SuspenseWrapper>} />
        </Route>

        {/* Business Dashboard */}
        <Route path="/business-dashboard" element={<ProtectedRoute allowedRoles={['business']}><BusinessLayout /></ProtectedRoute>}>
          <Route index element={<SuspenseWrapper><BusinessDashboard /></SuspenseWrapper>} />
          <Route path="deals" element={<SuspenseWrapper><BusinessDeals /></SuspenseWrapper>} />
          <Route path="deals/create" element={<SuspenseWrapper><BusinessCreateDeal /></SuspenseWrapper>} />
          <Route path="deals/edit/:id" element={<SuspenseWrapper><BusinessEditDeal /></SuspenseWrapper>} />
          <Route path="vouchers" element={<SuspenseWrapper><BusinessVouchers /></SuspenseWrapper>} />
          <Route path="analytics" element={<SuspenseWrapper><BusinessAnalytics /></SuspenseWrapper>} />
          <Route path="profile" element={<SuspenseWrapper><BusinessProfilePage /></SuspenseWrapper>} />
          <Route path="scanner" element={<SuspenseWrapper><BusinessScanner /></SuspenseWrapper>} />
        </Route>

        {/* Admin Dashboard */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<SuspenseWrapper><AdminDashboard /></SuspenseWrapper>} />
          <Route path="users" element={<SuspenseWrapper><AdminUsers /></SuspenseWrapper>} />
          <Route path="businesses" element={<SuspenseWrapper><AdminBusinesses /></SuspenseWrapper>} />
          <Route path="deals" element={<SuspenseWrapper><AdminDeals /></SuspenseWrapper>} />
          <Route path="categories" element={<SuspenseWrapper><AdminCategories /></SuspenseWrapper>} />
          <Route path="analytics" element={<SuspenseWrapper><AdminAnalytics /></SuspenseWrapper>} />
          <Route path="payments" element={<SuspenseWrapper><AdminPayments /></SuspenseWrapper>} />
          <Route path="support" element={<SuspenseWrapper><AdminSupport /></SuspenseWrapper>} />
          <Route path="audit-logs" element={<SuspenseWrapper><AdminAuditLogs /></SuspenseWrapper>} />
          <Route path="settings" element={<SuspenseWrapper><AdminSettings /></SuspenseWrapper>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
