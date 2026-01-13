import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { MenuProvider } from "@/context/MenuContext";
import { AuthProvider } from "@/context/AuthContext";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BrandPage from "./pages/BrandPage";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import StoreFront from "./pages/StoreFront";
import StoreCheckout from "./pages/StoreCheckout";
import CustomerAccount from "./pages/CustomerAccount";
import PWAInstallPrompt from "./components/PWAInstallPrompt";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <MenuProvider>
          <CartProvider>
            <WishlistProvider>
              <Toaster />
              <Sonner />
              <PWAInstallPrompt />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tienda/:slug" element={<StoreFront />} />
                  <Route path="/tienda/:slug/checkout" element={<StoreCheckout />} />
                  <Route path="/tienda/:slug/cuenta" element={<CustomerAccount />} />
                  <Route path="/marca/:slug" element={<BrandPage />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </WishlistProvider>
          </CartProvider>
        </MenuProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
