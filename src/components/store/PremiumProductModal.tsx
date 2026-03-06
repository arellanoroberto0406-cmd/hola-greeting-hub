import { Product } from "@/types/product";
import { Store } from "@/types/store";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart, ShoppingCart, Star, Truck, Shield, RotateCcw, Package,
  Check, Sparkles, Zap, Share2, Minus, Plus, ChevronRight,
  Info, MessageSquare, Clock, Award,
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
  product, store, planTier, isOpen, onClose,
  onAddToCart, onToggleWishlist, isInWishlist,
}: PremiumProductModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [addedToCart, setAddedToCart] = useState(false);

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
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
      onClose();
    }, 1200);
  };

  const staggerDelay = isEnterprise ? 0.08 : isProfessional ? 0.04 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "p-0 overflow-hidden rounded-2xl border-border/50",
        isEnterprise && "max-w-5xl max-h-[95vh]",
        isProfessional && "max-w-4xl max-h-[92vh]",
        isBasic && "max-w-3xl max-h-[90vh]"
      )}>
        <div className="overflow-y-auto max-h-[90vh]">
          <div className={cn(
            "grid gap-0",
            isEnterprise && "lg:grid-cols-[1.15fr_1fr]",
            !isEnterprise && "md:grid-cols-2"
          )}>
            {/* Image Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className={cn(
                "relative bg-muted/20",
                isEnterprise && "p-6 lg:p-8",
                isProfessional && "p-5",
                isBasic && "p-4"
              )}
            >
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                {product.isNew && (
                  <Badge
                    className="shadow-lg text-[11px] font-bold px-2.5 py-1 rounded-lg"
                    style={{
                      background: `linear-gradient(135deg, ${store.primary_color}, ${store.primary_color}cc)`,
                      boxShadow: `0 2px 8px ${store.primary_color}40`
                    }}
                  >
                    {!isBasic && <Sparkles className="h-3 w-3 mr-1" />}
                    NUEVO
                  </Badge>
                )}
                {product.isOnSale && product.originalPrice && (
                  <Badge className="bg-gradient-to-r from-red-500 to-rose-500 shadow-lg text-[11px] font-bold px-2.5 py-1 rounded-lg">
                    <Zap className="h-3 w-3 mr-1" />
                    -{discountPercent}% OFF
                  </Badge>
                )}
              </div>

              {/* Share button */}
              {!isBasic && (
                <div className="absolute top-4 right-4 z-10">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-xl shadow-lg bg-white/80 backdrop-blur-sm hover:bg-white h-9 w-9"
                    onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <ProductGallery
                mainImage={product.image}
                images={product.images || []}
                productName={product.name}
                primaryColor={store.primary_color}
              />

              {/* Trust badges (Enterprise) */}
              {isEnterprise && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 grid grid-cols-3 gap-2"
                >
                  {[
                    { icon: Truck, label: "Envío Rápido", sub: "3-5 días" },
                    { icon: Shield, label: "Compra Segura", sub: "100% protegido" },
                    { icon: RotateCcw, label: "Devolución", sub: "30 días" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl bg-background/80 border border-border/30"
                    >
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${store.primary_color}12` }}>
                        <item.icon className="h-4 w-4" style={{ color: store.primary_color }} />
                      </div>
                      <span className="text-[11px] font-semibold text-center leading-tight">{item.label}</span>
                      <span className="text-[10px] text-muted-foreground">{item.sub}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>

            {/* Content Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className={cn(
                "flex flex-col",
                isEnterprise && "p-6 lg:p-8",
                isProfessional && "p-5",
                isBasic && "p-4"
              )}
            >
              {/* Header */}
              <div className="space-y-3">
                {!isBasic && (
                  <p className="text-xs text-muted-foreground font-medium tracking-wider uppercase flex items-center gap-1.5">
                    {product.collection}
                  </p>
                )}

                <h2 className={cn(
                  "font-heading font-bold leading-tight",
                  isEnterprise && "text-2xl lg:text-3xl",
                  isProfessional && "text-2xl",
                  isBasic && "text-xl"
                )}>
                  {product.name}
                </h2>

                {/* Rating */}
                {!isBasic && product.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn(
                          "h-4 w-4",
                          i < Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"
                        )} />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {product.rating.toFixed(1)} · {product.reviewCount} reseñas
                    </span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className={cn(
                    "font-bold",
                    isEnterprise ? "text-3xl lg:text-4xl" : "text-3xl"
                  )} style={{ color: store.primary_color }}>
                    ${totalPrice.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-base text-muted-foreground line-through">
                      ${(product.originalPrice * quantity).toLocaleString()}
                    </span>
                  )}
                </div>

                {!isBasic && savings > 0 && (
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-sm font-semibold">
                    <Check className="h-4 w-4" />
                    Ahorras ${savings.toLocaleString()} ({discountPercent}%)
                  </div>
                )}

                {isEnterprise && quantity > 1 && (
                  <p className="text-sm text-muted-foreground">${product.price.toLocaleString()} por unidad</p>
                )}
              </div>

              {/* Color Selection */}
              {!isBasic && product.colors && product.colors.length > 0 && (
                <div className="mt-5 space-y-2.5">
                  <label className="text-sm font-semibold">
                    Color {selectedColor && <span className="text-muted-foreground font-normal">— {selectedColor}</span>}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "h-10 w-10 rounded-xl border-2 transition-all shadow-sm hover:scale-110",
                          selectedColor === color
                            ? "border-foreground ring-2 ring-offset-2"
                            : "border-transparent hover:border-muted-foreground/40"
                        )}
                        style={{ 
                          backgroundColor: color.toLowerCase(),
                          ...(selectedColor === color ? { ringColor: store.primary_color } : {})
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mt-5 space-y-2.5">
                <label className="text-sm font-semibold">Cantidad</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border/60 rounded-xl overflow-hidden">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold text-sm">{quantity}</span>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1.5 text-sm font-medium",
                    product.stock > 10 ? "text-emerald-600" : product.stock > 0 ? "text-orange-500" : "text-red-500"
                  )}>
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      product.stock > 10 ? "bg-emerald-500" : product.stock > 0 ? "bg-orange-500 animate-pulse" : "bg-red-500"
                    )} />
                    {product.stock > 10 ? "En stock" : product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <Button
                  className={cn(
                    "flex-1 gap-2 rounded-xl font-semibold transition-all duration-300",
                    isEnterprise && "h-13 text-base",
                    isProfessional && "h-12",
                    isBasic && "h-11"
                  )}
                  style={{
                    background: product.stock === 0 ? undefined :
                      addedToCart ? "linear-gradient(135deg, #22c55e, #16a34a)" :
                      `linear-gradient(135deg, ${store.primary_color}, ${store.primary_color}dd)`,
                    boxShadow: product.stock > 0 && !addedToCart ? `0 4px 20px ${store.primary_color}30` : undefined,
                  }}
                  variant={product.stock === 0 ? "secondary" : "default"}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <AnimatePresence mode="wait">
                    {addedToCart ? (
                      <motion.span key="added" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2">
                        <Check className="h-5 w-5" /> ¡Agregado al carrito!
                      </motion.span>
                    ) : (
                      <motion.span key="add" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        {product.stock === 0 ? "Agotado" : "Agregar al Carrito"}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn("rounded-xl shrink-0", isEnterprise ? "h-13 w-13" : "h-12 w-12")}
                  onClick={() => onToggleWishlist(product)}
                >
                  <Heart className={cn(
                    "h-5 w-5 transition-all",
                    isInWishlist && "fill-red-500 text-red-500"
                  )} />
                </Button>
              </div>

              {/* Benefits strip */}
              {!isBasic && (
                <div className={cn(
                  "mt-5 p-4 rounded-xl border border-border/30 space-y-2.5",
                  isEnterprise && "bg-muted/30"
                )}>
                  {[
                    { icon: Truck, text: "Envío gratis en pedidos +$999" },
                    { icon: RotateCcw, text: "Devolución gratuita en 30 días" },
                    ...(isEnterprise ? [{ icon: Award, text: "Garantía de calidad incluida" }] : []),
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm">
                      <div className="h-6 w-6 rounded-md flex items-center justify-center" style={{ backgroundColor: `${store.primary_color}10` }}>
                        <item.icon className="h-3.5 w-3.5" style={{ color: store.primary_color }} />
                      </div>
                      <span className="text-muted-foreground">{item.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tabs */}
              {!isBasic && (
                <div className="mt-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className={cn(
                      "grid w-full rounded-xl bg-muted/50",
                      isEnterprise ? "grid-cols-3" : "grid-cols-2"
                    )}>
                      <TabsTrigger value="details" className="gap-1.5 rounded-lg text-xs">
                        <Info className="h-3.5 w-3.5" /> Detalles
                      </TabsTrigger>
                      <TabsTrigger value="reviews" className="gap-1.5 rounded-lg text-xs">
                        <MessageSquare className="h-3.5 w-3.5" /> Reseñas
                      </TabsTrigger>
                      {isEnterprise && (
                        <TabsTrigger value="shipping" className="gap-1.5 rounded-lg text-xs">
                          <Truck className="h-3.5 w-3.5" /> Envío
                        </TabsTrigger>
                      )}
                    </TabsList>

                    <TabsContent value="details" className="mt-4 space-y-4">
                      {product.description && <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>}
                      {product.features && product.features.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Características</h4>
                          <ul className="space-y-2">
                            {product.features.map((feature, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                <div className="h-5 w-5 rounded-md flex items-center justify-center mt-0.5 shrink-0" style={{ backgroundColor: `${store.primary_color}12` }}>
                                  <Check className="h-3 w-3" style={{ color: store.primary_color }} />
                                </div>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {product.materials && (
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Materiales</h4>
                          <p className="text-sm text-muted-foreground">{product.materials}</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="reviews" className="mt-4">
                      <ProductReviews productId={product.id} />
                    </TabsContent>

                    {isEnterprise && (
                      <TabsContent value="shipping" className="mt-4 space-y-3">
                        {[
                          { icon: Truck, title: "Envío Estándar", desc: "3-5 días hábiles", price: "$99" },
                          { icon: Zap, title: "Envío Express", desc: "1-2 días hábiles", price: "$199" },
                          { icon: Package, title: "Retiro en tienda", desc: "Disponible hoy", price: "Gratis" },
                        ].map((option, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border/40 hover:border-primary/30 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${store.primary_color}12` }}>
                                <option.icon className="h-4 w-4" style={{ color: store.primary_color }} />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{option.title}</p>
                                <p className="text-xs text-muted-foreground">{option.desc}</p>
                              </div>
                            </div>
                            <span className="font-bold text-sm">{option.price}</span>
                          </div>
                        ))}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                          <Clock className="h-3.5 w-3.5" />
                          Pedidos antes de las 2pm se envían el mismo día
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                </div>
              )}

              {/* Basic description */}
              {isBasic && (
                <div className="mt-5 space-y-3">
                  {product.description && <p className="text-muted-foreground text-sm">{product.description}</p>}
                  {product.features && product.features.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Características</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {product.features.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumProductModal;
