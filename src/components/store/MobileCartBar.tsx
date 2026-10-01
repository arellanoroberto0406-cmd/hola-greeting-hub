import { ShoppingCart, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface MobileCartBarProps {
  slug: string;
  primaryColor: string;
  freeShippingThreshold?: number;
}

/**
 * Sticky bottom bar shown on mobile when the cart has items.
 * Drives conversion by making checkout always one tap away.
 * Hidden on md+ screens (desktop has the header cart).
 */
const MobileCartBar = ({ slug, primaryColor, freeShippingThreshold = 999 }: MobileCartBarProps) => {
  const { totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  const remaining = Math.max(0, freeShippingThreshold - totalPrice);
  const progress = Math.min(100, (totalPrice / freeShippingThreshold) * 100);
  const qualifiesForFreeShipping = totalPrice >= freeShippingThreshold;

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="vc-mobile-cart md:hidden fixed bottom-0 left-0 right-0 z-40"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* Free shipping progress */}
          {!qualifiesForFreeShipping && remaining > 0 && (
            <div className="px-4 pt-2">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-muted-foreground">
                  Te faltan{" "}
                  <span className="font-semibold text-foreground">
                    ${remaining.toLocaleString()}
                  </span>{" "}
                  para envío gratis
                </span>
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="vc-mobile-cart-progress h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          {qualifiesForFreeShipping && (
            <div className="px-4 pt-2">
              <p className="vc-shipping-success text-[11px] font-semibold text-center">
                ✓ ¡Tienes envío gratis!
              </p>
            </div>
          )}

          <Button
            onClick={() => navigate(`/tienda/${slug}/checkout`)}
            className="vc-mobile-cart-cta w-full h-auto flex items-center justify-between px-4 py-3 font-semibold"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="vc-mobile-cart-count absolute -top-2 -right-2 h-5 w-5 text-[10px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              </div>
              <span className="text-sm">
                ${totalPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <span>Finalizar compra</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileCartBar;
