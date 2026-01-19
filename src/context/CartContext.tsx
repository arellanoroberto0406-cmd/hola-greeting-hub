import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem, Product, ProductVariant } from "@/types/product";
import { useToast } from "@/hooks/use-toast";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, color?: string, variant?: ProductVariant) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  storeId: string | null;
  setStoreId: (id: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "lovable_cart";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.items || [];
      }
    } catch (e) {
      console.error("Error loading cart from localStorage:", e);
    }
    return [];
  });
  
  const [storeId, setStoreId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.storeId || null;
      }
    } catch (e) {
      console.error("Error loading storeId from localStorage:", e);
    }
    return null;
  });
  
  const { toast } = useToast();

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items, storeId }));
    } catch (e) {
      console.error("Error saving cart to localStorage:", e);
    }
  }, [items, storeId]);

  const addItem = (product: Product, color?: string, variant?: ProductVariant) => {
    setItems((prevItems) => {
      const itemKey = `${product.id}-${color || ''}-${variant?.id || ''}`;
      const existingItem = prevItems.find(
        (item) => 
          item.id === product.id && 
          item.selectedColor === color &&
          item.selectedVariant?.id === variant?.id
      );

      if (existingItem) {
        toast({
          title: "Cantidad actualizada",
          description: `${product.name} ahora tiene ${existingItem.quantity + 1} unidades`,
        });
        return prevItems.map((item) =>
          item.id === product.id && 
          item.selectedColor === color &&
          item.selectedVariant?.id === variant?.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      toast({
        title: "Producto agregado",
        description: `${product.name} se agregó al carrito`,
      });

      const price = variant ? product.price + (variant.priceAdjustment || 0) : product.price;
      return [...prevItems, { ...product, price, quantity: 1, selectedColor: color, selectedVariant: variant }];
    });
  };

  const removeItem = (productId: string, variantId?: string) => {
    setItems((prevItems) => 
      prevItems.filter((item) => 
        !(item.id === productId && (!variantId || item.selectedVariant?.id === variantId))
      )
    );
    toast({
      title: "Producto eliminado",
      description: "El producto se eliminó del carrito",
    });
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeItem(productId, variantId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId && (!variantId || item.selectedVariant?.id === variantId)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setStoreId(null);
    toast({
      title: "Carrito vacío",
      description: "Se eliminaron todos los productos del carrito",
    });
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        storeId,
        setStoreId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
