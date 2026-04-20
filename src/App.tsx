import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { MenuProvider } from "@/context/MenuContext";
import { AuthProvider } from "@/context/AuthContext";

// Eager: rutas de entrada (auth) — críticas para LCP
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import PWAInstallPrompt from "./components/PWAInstallPrompt";

// Lazy: rutas pesadas (dashboard, storefront, checkout)
const Index = lazy(() => import("./pages/Index"));
const BrandPage = lazy(() => import("./pages/BrandPage"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const StoreFront = lazy(() => import("./pages/StoreFront"));
const StoreCheckout = lazy(() => import("./pages/StoreCheckout"));
const CustomerAccount = lazy(() => import("./pages/CustomerAccount"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

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
                <Suspense fallback={<RouteFallback />}>
                  <Routes>
                    <Route path="/" element={<Auth />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/inicio" element={<Index />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/tienda/:slug" element={<StoreFront />} />
                    <Route path="/tienda/:slug/checkout" element={<StoreCheckout />} />
                    <Route path="/tienda/:slug/cuenta" element={<CustomerAccount />} />
                    <Route path="/marca/:slug" element={<BrandPage />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </WishlistProvider>
          </CartProvider>
        </MenuProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
