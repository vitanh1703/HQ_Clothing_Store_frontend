import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect, type JSX } from 'react';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Header'; 
import AuthForm from './pages/AuthForm';
import Logout from './pages/Logout';
import Footer from './components/Footer'; 
import ProductsPage from './pages/ProductsPage';
import CartPage from "./pages/CartPage";
import Home from "./pages/Home";
import NewsPage from "./pages/NewsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import ProfilePage from "./pages/ProfilePage";
import WishlistPage from "./pages/WishlistPage";
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import ShippingPolicy from './pages/ShippingPolicy';
import PaymentPage from './pages/PaymentPage';
import FAQPage from './pages/FAQPage';
import AboutUsPage from './pages/Aboutus';
import PaymentCallback from './pages/PaymentCallback';
import CustomerManager from './pages/admin/CustomerManager';
import SupplierManager from './pages/admin/SupplierManager';
import ProductManager from './pages/admin/ProductManager';
import NewsManager from './pages/admin/NewsManager';
import OrderManager from './pages/admin/OrderManager';
import AdminDashboard from './pages/admin/AdminDashboard';
import PromotionManager from './pages/admin/PromotionManager';
import InventoryManager from './pages/admin/InventoryManager';
import Statistics from './pages/admin/Statistics';

const RootRedirect = () => {
  const auth = sessionStorage.getItem("auth");
  if (auth) {
    try {
      const user = JSON.parse(auth).user;
      if (user?.role?.toLowerCase() === 'admin') {
        return <Navigate to="/admin" replace />;
      }
    } catch {}
  }
  return <Navigate to="/home" replace />;
};

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const userId = sessionStorage.getItem("userId");
      if (!userId) {
        setIsAuthorized(false);
        return;
      }
      try {
        await axios.get(`https://localhost:7137/api/auth/verify-admin/${userId}`);
        setIsAuthorized(true);
      } catch {
        setIsAuthorized(false);
      }
    };
    checkAdmin();
  }, []);

  if (isAuthorized === null) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Đang kiểm tra quyền truy cập...</div>;
  return isAuthorized ? children : <Navigate to="/home" replace />;
};

function App() {
  const location = useLocation();
  
  const hideLayoutPaths = ["/auth", "/logout"];
  const isHideLayout =
    hideLayoutPaths.includes(location.pathname) ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/customers") ||
    location.pathname.startsWith("/suppliers") ||
    location.pathname.startsWith("/orders") ||
    location.pathname.startsWith("/promotions") ||
    location.pathname.startsWith("/reports");

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {!isHideLayout && <Navbar />}

      <div className="main-content grow">
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/home" element={<Home />} />
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment-callback" element={<PaymentCallback />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/aboutus" element={<AboutUsPage />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/customers" element={<AdminRoute><CustomerManager /></AdminRoute>} />
          <Route path="/suppliers" element={<AdminRoute><SupplierManager /></AdminRoute>} />
          <Route path="/orders" element={<AdminRoute><OrderManager /></AdminRoute>} />
          <Route path="/promotions" element={<AdminRoute><PromotionManager /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><ProductManager /></AdminRoute>} />
          <Route path="/admin/news" element={<AdminRoute><NewsManager /></AdminRoute>} />
          <Route path="/admin/inventory" element={<AdminRoute><InventoryManager /></AdminRoute>} />
          <Route path="/reports" element={<AdminRoute><Statistics /></AdminRoute>} />
          <Route path="*" element={<div className="p-10 text-center text-2xl font-bold italic">404 - Không tìm thấy trang</div>} />
        </Routes>
      </div>

      {!isHideLayout && <Footer />}
    </div>
  );
}

export default App;