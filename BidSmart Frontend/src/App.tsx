import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import Landing from "./pages/Landing";
import BrowseAuctions from "./pages/BrowseAuctions";
import AuctionDetail from "./pages/AuctionDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import BuyerDashboard from "./pages/BuyerDashboard";
import MyBids from "./pages/MyBids";
import Watchlist from "./pages/Watchlist";
import SellerDashboard from "./pages/SellerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import WinnerDeclaration from "./pages/WinnerDeclaration";
import SellerProducts from "./pages/SellerProducts";
import SellerResults from "./pages/SellerResults";
import AddEditProduct from "./pages/AddEditProduct";
import Reports from "./pages/Reports";
import BecomeSeller from "./pages/BecomeSeller";
import BecomeBuyer from "./pages/BecomeBuyer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Navbar />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auctions" element={<BrowseAuctions />} />
            <Route path="/auctions/:id" element={<AuctionDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Buyer-only routes */}
            <Route path="/buyer/dashboard" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerDashboard /></ProtectedRoute>} />
            <Route path="/buyer/my-bids" element={<ProtectedRoute allowedRoles={['buyer']}><MyBids /></ProtectedRoute>} />
            <Route path="/buyer/watchlist" element={<ProtectedRoute allowedRoles={['buyer']}><Watchlist /></ProtectedRoute>} />

            {/* Seller-only routes */}
            <Route path="/seller/dashboard" element={<ProtectedRoute allowedRoles={['seller']}><SellerDashboard /></ProtectedRoute>} />
            <Route path="/seller/products" element={<ProtectedRoute allowedRoles={['seller']}><SellerProducts /></ProtectedRoute>} />
            <Route path="/seller/products/new" element={<ProtectedRoute allowedRoles={['seller']}><AddEditProduct /></ProtectedRoute>} />
            <Route path="/seller/products/:id/edit" element={<ProtectedRoute allowedRoles={['seller']}><AddEditProduct /></ProtectedRoute>} />
            <Route path="/seller/results" element={<ProtectedRoute allowedRoles={['seller']}><SellerResults /></ProtectedRoute>} />

            {/* Admin-only routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>} />

            {/* Any logged-in user */}
            <Route path="/notifications" element={<ProtectedRoute allowedRoles={['buyer', 'seller', 'admin']}><Notifications /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRoles={['buyer', 'seller', 'admin']}><Profile /></ProtectedRoute>} />
            <Route path="/auctions/:id/winner" element={<ProtectedRoute allowedRoles={['buyer', 'seller', 'admin']}><WinnerDeclaration /></ProtectedRoute>} />
            <Route path="/become-seller" element={<ProtectedRoute allowedRoles={['buyer', 'guest', 'seller']}><BecomeSeller /></ProtectedRoute>} />
            <Route path="/become-buyer" element={<ProtectedRoute allowedRoles={['buyer', 'seller']}><BecomeBuyer /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
