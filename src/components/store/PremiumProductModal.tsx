import { Product } from "@/types/product";
import { Store } from "@/types/store";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Package,
  Check,
  Sparkles,
  Zap,
  Share2,
  Minus,
  Plus,
  ChevronRight,
  Info,
  MessageSquare,
  Clock,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import ProductGallery from "@/components/ProductGallery";
import ProductReviews from "@/components/ProductReviews";

type PlanTier = "basic" | "professional" | "enterprise";

interface PremiumProductModalProps {
  product: Product | null;
  store: Store;
  planTier: PlanTier;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, color?: string) => void;
  onToggleWishlist: (product: Product) => void;
  isInWishlist: boolean;
}

export const PremiumProductModal = ({
  product,
  store,
  planTier,
  isOpen,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
}: PremiumProductModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");

  const isBasic = planTier === "basic";
  const isProfessional = planTier === "professional";
  const isEnterprise = planTier === "enterprise";

  if (!product) return null;

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const totalPrice = product.price * quantity;
  const savings = product.originalPrice 
    ? (product.originalPrice - product.price) * quantity 
    : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product, selectedColor || undefined);
    }
    onClose();
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isEnterprise ? 0.1 : isProfessional ? 0.05 : 0,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: isEnterprise ? 20 : 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: isEnterprise ? 0.4 : 0.2 }
    },
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "p-0 overflow-hidden",
          isEnterprise && "max-w-5xl max-h-[95vh]",
          isProfessional && "max-w-4xl max-h-[92vh]",
          isBasic && "max-w-4xl max-h-[90vh]"
        )}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="overflow-y-auto max-h-[90vh]"
        >
          <div className={cn(
            "grid gap-0",
            isEnterprise && "lg:grid-cols-[1.2fr_1fr]",
            !isEnterprise && "md:grid-cols-2"
          )}>
            {/* Image Section */}
            <motion.div 
              variants={itemVariants}
              className={cn(
                "relative bg-muted/30",
                isEnterprise && "p-8",
                isProfessional && "p-6",
                isBasic && "p-6"
              )}
            >
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {product.isNew && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Badge
                      className={cn(
                        "flex items-center gap-1",
                        isEnterprise && "text-sm px-3 py-1 shadow-lg"
                      )}
                      style={{ backgroundColor: store.primary_color }}
                    >
                      {isEnterprise && <Sparkles className="h-3.5 w-3.5" />}
                      Nuevo
                    </Badge>
                  </motion.div>
                )}
                {product.isOnSale && product.originalPrice && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Badge 
                      className={cn(
                        "bg-red-500 flex items-center gap-1",
                        isEnterprise && "text-sm px-3 py-1 shadow-lg"
                      )}
                    >
                      {isEnterprise && <Zap className="h-3.5 w-3.5" />}
                      -{discountPercent}% OFF
                    </Badge>
                  </motion.div>
                )}
              </div>

              {/* Share button (Professional+) */}
              {!isBasic && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="absolute top-4 right-4 z-10"
                >
                  <Button
                    variant="secondary"
                    size="icon"
                    className={cn(
                      "rounded-full",
                      isEnterprise && "shadow-lg"
                    )}
                    onClick={() => {
                      navigator.share?.({
                        title: product.name,
                        text: product.description,
                        url: window.location.href,
                      });
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              <ProductGallery
                mainImage={product.image}
                images={product.images || []}
                productName={product.name}
                primaryColor={store.primary_color}
              />

              {/* Trust badges (Enterprise only) */}
              {isEnterprise && (
                <motion.div
                  variants={itemVariants}
                  className="mt-6 grid grid-cols-3 gap-3"
                >
                  {[
                    { icon: Truck, label: "Envío Rápido" },
                    { icon: Shield, label: "Compra Segura" },
                    { icon: RotateCcw, label: "Devolución Fácil" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-background/60 backdrop-blur-sm border"
                    >
                      <item.icon className="h-5 w-5" style={{ color: store.primary_color }} />
                      <span className="text-xs font-medium text-center">{item.label}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>

            {/* Content Section */}
            <motion.div 
              variants={itemVariants}
              className={cn(
                "flex flex-col",
                isEnterprise && "p-8",
                isProfessional && "p-6",
                isBasic && "p-6"
              )}
            >
              {/* Header */}
              <div className="space-y-3">
                {/* Collection / Category */}
                {!isBasic && (
                  <motion.p 
                    variants={itemVariants}
                    className="text-sm text-muted-foreground flex items-center gap-1"
                  >
                    {product.collection}
                    {isEnterprise && <ChevronRight className="h-3 w-3" />}
                  </motion.p>
                )}

                {/* Product Name */}
                <motion.h2 
                  variants={itemVariants}
                  className={cn(
                    "font-heading font-bold",
                    isEnterprise && "text-3xl",
                    isProfessional && "text-2xl",
                    isBasic && "text-2xl"
                  )}
                >
                  {product.name}
                </motion.h2>

                {/* Rating (Professional+) */}
                {!isBasic && product.rating > 0 && (
                  <motion.div 
                    variants={itemVariants}
                    className="flex items-center gap-2"
                  >
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < Math.round(product.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-muted text-muted"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {product.rating.toFixed(1)} ({product.reviewCount} reseñas)
                    </span>
                  </motion.div>
                )}
              </div>

              <Separator className="my-4" />

              {/* Price Section */}
              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span 
                    className={cn(
                      "font-bold",
                      isEnterprise && "text-4xl",
                      isProfessional && "text-3xl",
                      isBasic && "text-3xl"
                    )}
                    style={{ color: store.primary_color }}
                  >
                    ${totalPrice.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      ${(product.originalPrice * quantity).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Savings badge (Professional+) */}
                {!isBasic && savings > 0 && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    <Check className="h-4 w-4" />
                    Ahorras ${savings.toLocaleString()} ({discountPercent}% OFF)
                  </motion.div>
                )}

                {/* Per unit price (Enterprise) */}
                {isEnterprise && quantity > 1 && (
                  <p className="text-sm text-muted-foreground">
                    ${product.price.toLocaleString()} por unidad
                  </p>
                )}
              </motion.div>

              {/* Color Selection (Professional+) */}
              {!isBasic && product.colors && product.colors.length > 0 && (
                <motion.div variants={itemVariants} className="mt-4 space-y-2">
                  <label className="text-sm font-medium">
                    Color: <span className="text-muted-foreground">{selectedColor || "Seleccionar"}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "h-10 w-10 rounded-full border-2 transition-all shadow-sm",
                          selectedColor === color 
                            ? "border-foreground ring-2 ring-offset-2 ring-primary" 
                            : "border-transparent hover:border-muted-foreground/50"
                        )}
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Quantity Selector */}
              <motion.div variants={itemVariants} className="mt-4 space-y-2">
                <label className="text-sm font-medium">Cantidad</label>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex items-center border rounded-lg",
                    isEnterprise && "rounded-xl"
                  )}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-l-lg"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-r-lg"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Stock indicator */}
                  <span className={cn(
                    "text-sm",
                    product.stock > 10 ? "text-green-600" : 
                    product.stock > 0 ? "text-orange-500" : "text-red-500"
                  )}>
                    {product.stock > 10 
                      ? "En stock" 
                      : product.stock > 0 
                        ? `Solo ${product.stock} disponibles` 
                        : "Agotado"}
                  </span>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div 
                variants={itemVariants} 
                className={cn(
                  "flex gap-3 mt-6",
                  isEnterprise && "mt-8"
                )}
              >
                <Button
                  className={cn(
                    "flex-1 gap-2",
                    isEnterprise && "h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
                  )}
                  size={isEnterprise ? "lg" : "default"}
                  style={{ backgroundColor: product.stock === 0 ? undefined : store.primary_color }}
                  variant={product.stock === 0 ? "secondary" : "default"}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className={cn("h-5 w-5", isEnterprise && "h-6 w-6")} />
                  {product.stock === 0 ? "Agotado" : "Agregar al Carrito"}
                </Button>
                <Button
                  variant="outline"
                  size={isEnterprise ? "lg" : "default"}
                  className={cn(
                    isEnterprise && "h-14 w-14"
                  )}
                  onClick={() => onToggleWishlist(product)}
                >
                  <Heart 
                    className={cn(
                      "h-5 w-5 transition-all",
                      isInWishlist && "fill-red-500 text-red-500",
                      isEnterprise && "h-6 w-6"
                    )}
                  />
                </Button>
              </motion.div>

              {/* Benefits strip (Professional+) */}
              {!isBasic && (
                <motion.div 
                  variants={itemVariants}
                  className={cn(
                    "mt-6 p-4 rounded-xl bg-muted/50 space-y-2",
                    isEnterprise && "p-5"
                  )}
                >
                  {[
                    { icon: Truck, text: "Envío gratis en pedidos +$999" },
                    { icon: RotateCcw, text: "Devolución gratuita en 30 días" },
                    ...(isEnterprise ? [{ icon: Award, text: "Garantía de calidad incluida" }] : []),
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <item.icon className="h-4 w-4 text-green-600" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Tabs for more info (Professional+) */}
              {!isBasic && (
                <motion.div variants={itemVariants} className="mt-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className={cn(
                      "grid w-full",
                      isEnterprise ? "grid-cols-3" : "grid-cols-2"
                    )}>
                      <TabsTrigger value="details" className="gap-1.5">
                        <Info className="h-3.5 w-3.5" />
                        Detalles
                      </TabsTrigger>
                      <TabsTrigger value="reviews" className="gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Reseñas
                      </TabsTrigger>
                      {isEnterprise && (
                        <TabsTrigger value="shipping" className="gap-1.5">
                          <Truck className="h-3.5 w-3.5" />
                          Envío
                        </TabsTrigger>
                      )}
                    </TabsList>

                    <TabsContent value="details" className="mt-4 space-y-4">
                      {product.description && (
                        <p className="text-muted-foreground">{product.description}</p>
                      )}
                      {product.features && product.features.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Características:</h4>
                          <ul className="space-y-1.5">
                            {product.features.map((feature, i) => (
                              <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-start gap-2 text-sm text-muted-foreground"
                              >
                                <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                {feature}
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {product.materials && (
                        <div>
                          <h4 className="font-medium mb-1">Materiales:</h4>
                          <p className="text-sm text-muted-foreground">{product.materials}</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="reviews" className="mt-4">
                      <ProductReviews productId={product.id} />
                    </TabsContent>

                    {isEnterprise && (
                      <TabsContent value="shipping" className="mt-4 space-y-4">
                        <div className="space-y-3">
                          {[
                            { icon: Truck, title: "Envío Estándar", desc: "3-5 días hábiles", price: "$99" },
                            { icon: Zap, title: "Envío Express", desc: "1-2 días hábiles", price: "$199" },
                            { icon: Package, title: "Retiro en tienda", desc: "Disponible hoy", price: "Gratis" },
                          ].map((option, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div 
                                  className="h-10 w-10 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: `${store.primary_color}20` }}
                                >
                                  <option.icon className="h-5 w-5" style={{ color: store.primary_color }} />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{option.title}</p>
                                  <p className="text-xs text-muted-foreground">{option.desc}</p>
                                </div>
                              </div>
                              <span className="font-semibold text-sm">{option.price}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Pedidos antes de las 2pm se envían el mismo día
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                </motion.div>
              )}

              {/* Basic plan: Simple description and features */}
              {isBasic && (
                <motion.div variants={itemVariants} className="mt-6 space-y-4">
                  {product.description && (
                    <p className="text-muted-foreground">{product.description}</p>
                  )}
                  {product.features && product.features.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Características:</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {product.features.map((feature, i) => (
                          <li key={i}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumProductModal;
