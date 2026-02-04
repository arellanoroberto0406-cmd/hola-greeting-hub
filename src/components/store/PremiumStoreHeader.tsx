import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ShoppingCart,
  Heart,
  Search,
  Menu,
  User,
  Package,
  LogOut,
  ChevronRight,
  X,
  Store,
  Sparkles,
  Crown,
  Zap,
} from "lucide-react";
import { Store as StoreType } from "@/types/store";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
  store,
  slug,
  planTier,
  onSearchChange,
  searchValue = "",
  showSearch = true,
  collections = [],
  onCollectionSelect,
  selectedCollection = "all",
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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerVariants = {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
  };

  return (
    <>
      {/* Announcement Bar - Premium styling based on plan */}
      <AnimatePresence>
        {(store as any).announcement_active && (store as any).announcement_text && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={cn(
              "relative overflow-hidden",
              isEnterprise && "bg-gradient-to-r",
              isProfessional && "bg-gradient-to-r"
            )}
            style={{
              background: isEnterprise
                ? `linear-gradient(90deg, ${store.primary_color}, ${store.secondary_color || store.primary_color}dd, ${store.primary_color})`
                : isProfessional
                ? `linear-gradient(90deg, ${store.primary_color}ee, ${store.primary_color})`
                : store.primary_color,
            }}
          >
            {isEnterprise && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(255,255,255,0.15)_0%,_transparent_50%)]" />
                <motion.div
                  className="absolute top-0 left-0 w-full h-full"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                  }}
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </div>
            )}
            <div className="relative py-2.5 px-4 text-center">
              <p className="text-sm font-medium text-white flex items-center justify-center gap-2">
                {isEnterprise && <Sparkles className="h-4 w-4" />}
                {(store as any).announcement_text}
                {isEnterprise && <Sparkles className="h-4 w-4" />}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header */}
      <motion.header
        variants={headerVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "sticky top-0 z-50 transition-all duration-500",
          isScrolled ? "py-2" : "py-0",
          isEnterprise && "backdrop-blur-2xl",
          isProfessional && "backdrop-blur-xl",
          isBasic && "backdrop-blur-md"
        )}
        style={{
          backgroundColor: isScrolled
            ? isEnterprise
              ? `${store.primary_color}08`
              : `rgba(255,255,255,0.95)`
            : isEnterprise
            ? `${store.primary_color}05`
            : "transparent",
          borderBottom: `1px solid ${store.primary_color}${isScrolled ? "20" : "10"}`,
        }}
      >
        {/* Enterprise floating glow effect */}
        {isEnterprise && (
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${store.primary_color}20, transparent 70%)`,
            }}
          />
        )}

        <div className="container mx-auto px-4 relative">
          <div className={cn(
            "flex items-center justify-between transition-all",
            isScrolled ? "h-14" : "h-16 md:h-20"
          )}>
            {/* Logo / Store Name */}
            <motion.div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate(`/tienda/${slug}`)}
              whileHover={!isBasic ? { scale: 1.02 } : {}}
              whileTap={!isBasic ? { scale: 0.98 } : {}}
            >
              {store.logo_url ? (
                <motion.img
                  src={store.logo_url}
                  alt={store.name}
                  className={cn(
                    "w-auto transition-all",
                    isScrolled ? "h-8 md:h-10" : "h-10 md:h-12"
                  )}
                  layoutId="store-logo"
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {isEnterprise && (
                      <motion.div
                        className="absolute -inset-1 rounded-xl opacity-60 blur-lg"
                        style={{ backgroundColor: store.primary_color }}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                    <div
                      className={cn(
                        "relative flex items-center justify-center transition-all",
                        isScrolled ? "h-9 w-9" : "h-10 w-10 md:h-12 md:w-12",
                        isEnterprise && "rounded-2xl shadow-xl",
                        isProfessional && "rounded-xl shadow-lg",
                        isBasic && "rounded-lg"
                      )}
                      style={{ backgroundColor: store.primary_color }}
                    >
                      <Store className={cn(
                        "text-white",
                        isScrolled ? "h-4 w-4" : "h-5 w-5 md:h-6 md:w-6"
                      )} />
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <motion.span
                      className={cn(
                        "block font-heading font-bold transition-all",
                        isScrolled ? "text-lg" : "text-xl md:text-2xl"
                      )}
                      style={{ color: store.primary_color }}
                    >
                      {store.name}
                    </motion.span>
                    {isEnterprise && !isScrolled && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-muted-foreground flex items-center gap-1"
                      >
                        <Crown className="h-3 w-3" style={{ color: store.primary_color }} />
                        Tienda Premium
                      </motion.span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {[{ id: "all", name: "Todos" }, ...collections.slice(0, 5).map(c => ({ id: c, name: c }))].map((collection, index) => (
                <motion.button
                  key={collection.id}
                  onClick={() => onCollectionSelect?.(collection.id)}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium rounded-lg transition-all",
                    selectedCollection === collection.id
                      ? "text-white"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  initial={!isBasic ? { opacity: 0, y: -10 } : {}}
                  animate={!isBasic ? { opacity: 1, y: 0 } : {}}
                  transition={!isBasic ? { delay: index * 0.05 } : {}}
                  whileHover={!isBasic ? { y: -2 } : {}}
                >
                  {selectedCollection === collection.id && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className={cn(
                        "absolute inset-0",
                        isEnterprise && "rounded-xl shadow-lg",
                        isProfessional && "rounded-lg shadow-md",
                        isBasic && "rounded-md"
                      )}
                      style={{ backgroundColor: store.primary_color }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10">{collection.name}</span>
                </motion.button>
              ))}
            </nav>

            {/* Desktop Search */}
            {showSearch && (
              <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
                <motion.div
                  className="relative w-full"
                  initial={!isBasic ? { opacity: 0, scale: 0.95 } : {}}
                  animate={!isBasic ? { opacity: 1, scale: 1 } : {}}
                  transition={!isBasic ? { delay: 0.3 } : {}}
                >
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar productos..."
                    value={searchValue}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className={cn(
                      "pl-11 pr-4 transition-all",
                      isEnterprise && "rounded-2xl bg-muted/30 border-transparent focus:border-primary/30 focus:bg-background shadow-inner h-11",
                      isProfessional && "rounded-xl bg-muted/40 border-transparent focus:border-primary/30 h-10",
                      isBasic && "rounded-lg bg-muted/50 border-transparent h-10"
                    )}
                    style={{
                      boxShadow: isEnterprise ? `inset 0 2px 4px ${store.primary_color}10` : undefined,
                    }}
                  />
                  <AnimatePresence>
                    {searchValue && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full"
                          onClick={() => onSearchChange?.("")}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}

            {/* Right Actions */}
            <div className="flex items-center gap-1.5">
              {/* Mobile Search Toggle */}
              <motion.div
                initial={!isBasic ? { opacity: 0, x: 20 } : {}}
                animate={!isBasic ? { opacity: 1, x: 0 } : {}}
                transition={!isBasic ? { delay: 0.35 } : {}}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "md:hidden",
                    isEnterprise && "h-10 w-10 rounded-xl",
                    isProfessional && "h-10 w-10 rounded-lg",
                    isBasic && "h-9 w-9"
                  )}
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                >
                  <Search className="h-5 w-5" />
                </Button>
              </motion.div>

              {/* Account */}
              <motion.div
                initial={!isBasic ? { opacity: 0, x: 20 } : {}}
                animate={!isBasic ? { opacity: 1, x: 0 } : {}}
                transition={!isBasic ? { delay: 0.4 } : {}}
              >
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          isEnterprise && "h-10 w-10 rounded-xl",
                          isProfessional && "h-10 w-10 rounded-lg",
                          isBasic && "h-9 w-9 rounded-md"
                        )}
                      >
                        <Avatar 
                          className={cn(
                            isEnterprise && "h-8 w-8 ring-2 ring-offset-2",
                            isProfessional && "h-8 w-8",
                            isBasic && "h-7 w-7"
                          )}
                          style={isEnterprise ? { 
                            // @ts-expect-error CSS custom property
                            "--tw-ring-color": store.primary_color 
                          } : undefined}
                        >
                          <AvatarFallback
                            style={{ backgroundColor: store.primary_color }}
                            className="text-white text-xs font-bold"
                          >
                            {user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className={cn(
                      "w-56",
                      isEnterprise && "rounded-xl shadow-xl",
                      isProfessional && "rounded-lg shadow-lg"
                    )}>
                      <DropdownMenuLabel>
                        <div className="flex flex-col">
                          <span className="font-medium">Mi cuenta</span>
                          <span className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate(`/tienda/${slug}/cuenta`)}>
                        <Package className="h-4 w-4 mr-2" />
                        Mis pedidos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/tienda/${slug}/cuenta`)}>
                        <Heart className="h-4 w-4 mr-2" />
                        Lista de deseos
                        {wishlist.length > 0 && (
                          <Badge variant="secondary" className="ml-auto">
                            {wishlist.length}
                          </Badge>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={signOut} className="text-destructive">
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar sesión
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      isEnterprise && "h-10 w-10 rounded-xl",
                      isProfessional && "h-10 w-10 rounded-lg",
                      isBasic && "h-9 w-9"
                    )}
                    onClick={() => navigate("/auth")}
                  >
                    <User className="h-5 w-5" />
                  </Button>
                )}
              </motion.div>

              {/* Wishlist */}
              <motion.div
                initial={!isBasic ? { opacity: 0, x: 20 } : {}}
                animate={!isBasic ? { opacity: 1, x: 0 } : {}}
                transition={!isBasic ? { delay: 0.45 } : {}}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "relative",
                    isEnterprise && "h-10 w-10 rounded-xl",
                    isProfessional && "h-10 w-10 rounded-lg",
                    isBasic && "h-9 w-9"
                  )}
                  onClick={() => navigate(`/tienda/${slug}/cuenta`)}
                >
                  <Heart className="h-5 w-5" />
                  <AnimatePresence>
                    {wishlist.length > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className={cn(
                          "absolute -top-1 -right-1 text-white text-xs font-bold flex items-center justify-center",
                          isEnterprise && "h-5 w-5 rounded-full shadow-lg",
                          isProfessional && "h-5 w-5 rounded-full",
                          isBasic && "h-4 w-4 rounded-full text-[10px]"
                        )}
                        style={{ backgroundColor: store.primary_color }}
                      >
                        {wishlist.length}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>

              {/* Cart */}
              <motion.div
                initial={!isBasic ? { opacity: 0, x: 20 } : {}}
                animate={!isBasic ? { opacity: 1, x: 0 } : {}}
                transition={!isBasic ? { delay: 0.5 } : {}}
              >
                <Button
                  variant={isEnterprise ? "default" : "ghost"}
                  size={isEnterprise ? "sm" : "icon"}
                  className={cn(
                    "relative",
                    isEnterprise && "rounded-xl gap-2 px-4 shadow-lg hover:shadow-xl",
                    isProfessional && "h-10 w-10 rounded-lg",
                    isBasic && "h-9 w-9"
                  )}
                  style={isEnterprise ? { backgroundColor: store.primary_color } : {}}
                >
                  <ShoppingCart className={cn(
                    isEnterprise ? "h-4 w-4" : "h-5 w-5"
                  )} />
                  {isEnterprise && totalItems > 0 && (
                    <span className="font-bold">{totalItems}</span>
                  )}
                  {!isEnterprise && totalItems > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={cn(
                        "absolute -top-1 -right-1 flex items-center justify-center text-xs font-bold text-white",
                        isProfessional && "h-5 w-5 rounded-full",
                        isBasic && "h-4 w-4 rounded-full text-[10px]"
                      )}
                      style={{ backgroundColor: store.primary_color }}
                    >
                      {totalItems}
                    </motion.div>
                  )}
                </Button>
              </motion.div>

              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <motion.div
                    initial={!isBasic ? { opacity: 0, x: 20 } : {}}
                    animate={!isBasic ? { opacity: 1, x: 0 } : {}}
                    transition={!isBasic ? { delay: 0.55 } : {}}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "lg:hidden",
                        isEnterprise && "h-10 w-10 rounded-xl",
                        isProfessional && "h-10 w-10 rounded-lg",
                        isBasic && "h-9 w-9"
                      )}
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </SheetTrigger>
                <SheetContent side="left" className={cn(
                  "w-80",
                  isEnterprise && "rounded-r-3xl",
                  isProfessional && "rounded-r-2xl"
                )}>
                  <SheetHeader>
                    <SheetTitle className="text-left flex items-center gap-2">
                      <div
                        className={cn(
                          "h-8 w-8 flex items-center justify-center",
                          isEnterprise && "rounded-xl",
                          isProfessional && "rounded-lg",
                          isBasic && "rounded-md"
                        )}
                        style={{ backgroundColor: store.primary_color }}
                      >
                        <Store className="h-4 w-4 text-white" />
                      </div>
                      {store.name}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-8 space-y-2">
                    {[{ id: "all", name: "Todos los productos" }, ...collections.map(c => ({ id: c, name: c }))].map((collection, index) => (
                      <motion.button
                        key={collection.id}
                        onClick={() => {
                          onCollectionSelect?.(collection.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-4 transition-all",
                          selectedCollection === collection.id
                            ? "text-white"
                            : "hover:bg-muted",
                          isEnterprise && "rounded-2xl",
                          isProfessional && "rounded-xl",
                          isBasic && "rounded-lg"
                        )}
                        style={selectedCollection === collection.id ? { backgroundColor: store.primary_color } : {}}
                        initial={!isBasic ? { opacity: 0, x: -20 } : {}}
                        animate={!isBasic ? { opacity: 1, x: 0 } : {}}
                        transition={!isBasic ? { delay: index * 0.05 } : {}}
                      >
                        <span className="font-medium">{collection.name}</span>
                        <ChevronRight className={cn(
                          "h-4 w-4 transition-transform",
                          selectedCollection === collection.id && "translate-x-1"
                        )} />
                      </motion.button>
                    ))}
                  </div>

                  {/* Mobile menu footer with plan badge */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div
                      className={cn(
                        "p-4 bg-muted/50",
                        isEnterprise && "rounded-2xl",
                        isProfessional && "rounded-xl",
                        isBasic && "rounded-lg"
                      )}
                    >
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {isEnterprise && <Crown className="h-4 w-4" style={{ color: store.primary_color }} />}
                        {isProfessional && <Zap className="h-4 w-4" style={{ color: store.primary_color }} />}
                        {isBasic && <Store className="h-4 w-4" style={{ color: store.primary_color }} />}
                        <span>
                          {isEnterprise ? "Tienda Enterprise" : isProfessional ? "Tienda Profesional" : "Tienda"}
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
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="container mx-auto px-4 pb-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar productos..."
                    value={searchValue}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className={cn(
                      "pl-11 bg-muted/50 border-transparent",
                      isEnterprise && "rounded-2xl h-12",
                      isProfessional && "rounded-xl h-11",
                      isBasic && "rounded-lg h-10"
                    )}
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