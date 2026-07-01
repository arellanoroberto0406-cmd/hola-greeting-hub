import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ShoppingCart, Heart, Search, Menu, User, Package, LogOut,
  ChevronRight, X, Store, Sparkles, Crown, Zap,
} from "lucide-react";
import { Store as StoreType } from "@/types/store";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import HeaderSecurityStrip from "./HeaderSecurityStrip";

type PlanTier = "basic" | "professional" | "enterprise";

interface PremiumStoreHeaderProps {
  store: StoreType;
  slug: string;
  planTier: PlanTier;
  onSearchChange?: (search: string) => void;
  searchValue?: string;
  showSearch?: boolean;
  collections?: string[];
  onCollectionSelect?: (collection: string) => void;
  selectedCollection?: string;
}

const PremiumStoreHeader = ({
  store, slug, planTier,
  onSearchChange, searchValue = "", showSearch = true,
  collections = [], onCollectionSelect, selectedCollection = "all",
}: PremiumStoreHeaderProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isBasic = planTier === "basic";
  const isProfessional = planTier === "professional";
  const isEnterprise = planTier === "enterprise";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Announcement Bar */}
      <AnimatePresence>
        {(store as any).announcement_active && (store as any).announcement_text && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${store.primary_color}, ${store.secondary_color || store.primary_color}cc, ${store.primary_color})`,
            }}
          >
            {!isBasic && (
              <motion.div
                className="absolute inset-0"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
            )}
            <div className="relative py-2 px-4 text-center">
              <p className="text-sm font-medium text-white flex items-center justify-center gap-2">
                {!isBasic && <Sparkles className="h-3.5 w-3.5" />}
                {(store as any).announcement_text}
                {!isBasic && <Sparkles className="h-3.5 w-3.5" />}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "sticky top-0 z-50 transition-all duration-500 border-b",
          isScrolled 
            ? "bg-background/80 backdrop-blur-xl shadow-lg shadow-black/5 border-border/50" 
            : "bg-background/60 backdrop-blur-md border-transparent"
        )}
      >
        {/* Top gradient accent line */}
        <div 
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${store.primary_color}, transparent)` }}
        />

        <div className="container mx-auto px-4">
          <div className={cn(
            "flex items-center justify-between transition-all",
            isScrolled ? "h-14" : "h-16 md:h-[72px]"
          )}>
            {/* Logo */}
            <motion.div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate(`/tienda/${slug}`)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {store.logo_url ? (
                <img
                  src={store.logo_url}
                  alt={store.name}
                  className={cn("w-auto transition-all", isScrolled ? "h-8 md:h-9" : "h-9 md:h-11")}
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {!isBasic && (
                      <motion.div
                        className="absolute -inset-1.5 rounded-2xl blur-lg opacity-40"
                        style={{ backgroundColor: store.primary_color }}
                        animate={{ opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                    )}
                    <div
                      className={cn(
                        "relative flex items-center justify-center rounded-xl transition-all",
                        isScrolled ? "h-9 w-9" : "h-10 w-10 md:h-11 md:w-11"
                      )}
                      style={{ 
                        background: `linear-gradient(135deg, ${store.primary_color}, ${store.primary_color}cc)`,
                        boxShadow: `0 4px 14px ${store.primary_color}40`
                      }}
                    >
                      <Store className={cn("text-white", isScrolled ? "h-4 w-4" : "h-5 w-5")} />
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <span
                      className={cn(
                        "block font-heading font-bold tracking-tight transition-all",
                        isScrolled ? "text-lg" : "text-xl md:text-2xl"
                      )}
                      style={{ color: store.primary_color }}
                    >
                      {store.name}
                    </span>
                    {!isBasic && !isScrolled && (
                      <span className="text-[11px] text-muted-foreground/70 font-medium tracking-wider uppercase">
                        {isEnterprise ? "✦ Premium Store" : "Tienda Online"}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Desktop Nav - Pill Navigation */}
            <nav className="hidden lg:flex items-center">
              <div className={cn(
                "flex items-center gap-0.5 p-1 rounded-2xl transition-colors",
                isScrolled ? "bg-muted/60" : "bg-muted/40"
              )}>
                {[{ id: "all", name: "Todos" }, ...collections.slice(0, 5).map(c => ({ id: c, name: c }))].map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => onCollectionSelect?.(collection.id)}
                    className={cn(
                      "relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300",
                      selectedCollection === collection.id
                        ? "text-white shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                    )}
                    style={selectedCollection === collection.id ? {
                      background: `linear-gradient(135deg, ${store.primary_color}, ${store.primary_color}dd)`,
                      boxShadow: `0 2px 10px ${store.primary_color}30`,
                    } : undefined}
                  >
                    {collection.name}
                  </button>
                ))}
              </div>
            </nav>

            {/* Desktop Search */}
            {showSearch && (
              <div className="hidden md:flex items-center flex-1 max-w-sm mx-6">
                <div className="relative w-full group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-foreground" />
                  <Input
                    placeholder="Buscar productos..."
                    value={searchValue}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className={cn(
                      "pl-10 pr-4 h-10 rounded-xl border-muted/80 bg-muted/30 transition-all duration-300",
                      "focus:bg-background focus:border-primary/40 focus:shadow-[0_0_0_3px] focus:shadow-primary/10"
                    )}
                  />
                  <AnimatePresence>
                    {searchValue && (
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full" onClick={() => onSearchChange?.("")}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Mobile Search */}
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 rounded-xl" onClick={() => setIsSearchOpen(!isSearchOpen)}>
                <Search className="h-[18px] w-[18px]" />
              </Button>

              {/* Account */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback
                          className="text-white text-xs font-bold"
                          style={{ background: `linear-gradient(135deg, ${store.primary_color}, ${store.primary_color}bb)` }}
                        >
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-border/60">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium">Mi cuenta</span>
                        <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(`/tienda/${slug}/cuenta`)}>
                      <Package className="h-4 w-4 mr-2" /> Mis pedidos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/tienda/${slug}/cuenta`)}>
                      <Heart className="h-4 w-4 mr-2" /> Lista de deseos
                      {wishlist.length > 0 && <Badge variant="secondary" className="ml-auto text-xs">{wishlist.length}</Badge>}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" /> Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => navigate("/auth")}>
                  <User className="h-[18px] w-[18px]" />
                </Button>
              )}

              {/* Wishlist */}
              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl" onClick={() => navigate(`/tienda/${slug}/cuenta`)}>
                <Heart className="h-[18px] w-[18px]" />
                <AnimatePresence>
                  {wishlist.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${store.primary_color}, ${store.primary_color}dd)` }}
                    >
                      {wishlist.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>

              {/* Cart Button */}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "relative rounded-xl gap-1.5 transition-all",
                  totalItems > 0 && "text-white hover:text-white"
                )}
                style={totalItems > 0 ? {
                  background: `linear-gradient(135deg, ${store.primary_color}, ${store.primary_color}cc)`,
                  boxShadow: `0 2px 12px ${store.primary_color}30`,
                } : undefined}
              >
                <ShoppingCart className="h-[18px] w-[18px]" />
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-xs font-bold"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </Button>

              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 rounded-xl">
                    <Menu className="h-[18px] w-[18px]" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 rounded-r-3xl border-r-0 shadow-2xl">
                  <SheetHeader>
                    <SheetTitle className="text-left flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-xl flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${store.primary_color}, ${store.primary_color}cc)` }}
                      >
                        <Store className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <span className="block font-bold">{store.name}</span>
                        <span className="text-xs text-muted-foreground font-normal">Tienda Online</span>
                      </div>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="mt-8 space-y-1">
                    {[{ id: "all", name: "Todos los productos" }, ...collections.map(c => ({ id: c, name: c }))].map((collection, index) => (
                      <motion.button
                        key={collection.id}
                        onClick={() => { onCollectionSelect?.(collection.id); setIsMobileMenuOpen(false); }}
                        className={cn(
                          "w-full flex items-center justify-between p-3.5 rounded-xl transition-all text-sm font-medium",
                          selectedCollection === collection.id
                            ? "text-white shadow-md"
                            : "text-foreground hover:bg-muted/60"
                        )}
                        style={selectedCollection === collection.id ? {
                          background: `linear-gradient(135deg, ${store.primary_color}, ${store.primary_color}dd)`,
                        } : undefined}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                      >
                        <span>{collection.name}</span>
                        <ChevronRight className={cn("h-4 w-4 transition-transform", selectedCollection === collection.id && "translate-x-1")} />
                      </motion.button>
                    ))}
                  </div>

                  {/* Mobile menu footer */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="p-4 rounded-2xl bg-muted/40 border border-border/30">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {isEnterprise ? <Crown className="h-3.5 w-3.5" style={{ color: store.primary_color }} /> :
                         isProfessional ? <Zap className="h-3.5 w-3.5" style={{ color: store.primary_color }} /> :
                         <Store className="h-3.5 w-3.5" style={{ color: store.primary_color }} />}
                        <span className="font-medium">
                          {isEnterprise ? "Premium Store" : isProfessional ? "Pro Store" : "Tienda"}
                        </span>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {isSearchOpen && showSearch && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden border-t border-border/30">
              <div className="container mx-auto px-4 py-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar productos..."
                    value={searchValue}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="pl-10 h-11 rounded-xl bg-muted/40 border-transparent focus:border-primary/30"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};

export default PremiumStoreHeader;
