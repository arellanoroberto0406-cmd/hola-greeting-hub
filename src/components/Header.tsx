import { useState } from "react";
import { Heart, ShoppingCart, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNavigate, Link } from "react-router-dom";
import { Minus, Plus, Truck } from "lucide-react";
import { brands } from "@/data/brands";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { wishlist } = useWishlist();
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-background/95 via-background/90 to-background/80 backdrop-blur-xl border-b border-border/30 transition-all duration-300 shadow-lg shadow-black/5">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="relative">
              <h1 className="font-display text-2xl sm:text-3xl tracking-wider text-primary transition-all duration-500 group-hover:scale-105">
                BOUTIQUE AR
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Gorras Premium</p>
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Inicio
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Marcas <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                {brands.map((brand) => (
                  <DropdownMenuItem key={brand.id} asChild>
                    <Link to={`/marca/${brand.slug}`} className="w-full cursor-pointer">
                      {brand.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300"
              onClick={() => navigate("/favoritos")}
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-scale-in shadow-lg shadow-primary/50">
                  {wishlist.length}
                </span>
              )}
            </Button>

            {/* Cart Sheet */}
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary relative group transition-all duration-300">
                  <ShoppingCart className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  {totalItems > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg flex flex-col">
                <SheetHeader>
                  <SheetTitle className="flex items-center justify-between">
                    <span>Carrito ({totalItems})</span>
                    {items.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearCart} className="hover:text-destructive">
                        Vaciar
                      </Button>
                    )}
                  </SheetTitle>
                </SheetHeader>

                {items.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">Tu carrito está vacío</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="flex-1 -mx-6 px-6">
                      <div className="space-y-4 py-4">
                        {items.map((item, index) => (
                          <div
                            key={`${item.id}-${item.selectedColor}`}
                            className="flex gap-4 animate-fade-in border border-border/50 rounded-lg p-3 hover:border-primary/30 transition-all duration-300"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-md"
                            />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium text-sm">{item.name}</h4>
                                  {item.selectedColor && (
                                    <p className="text-xs text-muted-foreground">
                                      Color: {item.selectedColor}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => removeItem(item.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="text-sm font-medium w-8 text-center">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    disabled={item.quantity >= item.stock}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                                <p className="font-bold text-primary">
                                  ${(item.price * item.quantity).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <div className="space-y-4 pt-4">
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Subtotal:</span>
                          <span>${totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Truck className="h-4 w-4" />
                            Envío:
                          </span>
                          <span className={totalPrice >= 500 ? "text-green-500 font-semibold" : ""}>
                            {totalPrice >= 500 ? "GRATIS" : "$99"}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between text-lg font-bold">
                          <span>Total:</span>
                          <span className="text-primary text-2xl">
                            ${(totalPrice + (totalPrice >= 500 ? 0 : 99)).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={() => {
                          setIsCartOpen(false);
                          navigate("/checkout");
                        }}
                      >
                        Proceder al Pago
                      </Button>
                    </div>
                  </>
                )}
              </SheetContent>
            </Sheet>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl hover:bg-primary/10 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border/30 mt-4 animate-fade-in">
            <div className="flex flex-col gap-3">
              <Link 
                to="/" 
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-2">Marcas</p>
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  to={`/marca/${brand.slug}`}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2 pl-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {brand.name}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
