import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface CartSheetProps {
  slug?: string;
  primaryColor?: string;
  children: ReactNode;
}

/**
 * Slide-over cart used by the store headers.
 * Lets a visitor review items, adjust quantities and go to checkout.
 */
export const CartSheet = ({ slug, primaryColor = "#8B4513", children }: CartSheetProps) => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-left flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" style={{ color: primaryColor }} />
            Tu carrito {totalItems > 0 && `(${totalItems})`}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">Tu carrito está vacío</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6 my-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.selectedColor || ""}-${item.selectedVariant?.id || ""}`}
                    className="flex gap-3"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="h-20 w-20 rounded-xl object-cover border border-border/50"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                      {item.selectedColor && (
                        <p className="text-xs text-muted-foreground">Color: {item.selectedColor}</p>
                      )}
                      <p className="text-sm font-semibold mt-1" style={{ color: primaryColor }}>
                        ${item.price.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          aria-label="Quitar una unidad"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1, item.selectedVariant?.id)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          aria-label="Agregar una unidad"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1, item.selectedVariant?.id)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 ml-auto text-destructive"
                          aria-label="Eliminar del carrito"
                          onClick={() => removeItem(item.id, item.selectedVariant?.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-3 pt-2">
              <Separator />
              <div className="flex items-center justify-between font-semibold">
                <span>Subtotal</span>
                <span style={{ color: primaryColor }}>${totalPrice.toLocaleString()}</span>
              </div>
              <Button
                size="lg"
                className="w-full text-white"
                style={{ backgroundColor: primaryColor }}
                onClick={() => navigate(`/tienda/${slug}/checkout`)}
              >
                Ir a pagar
              </Button>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Pago seguro · Datos protegidos
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
