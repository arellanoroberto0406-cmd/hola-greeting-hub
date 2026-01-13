import { useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "lucide-react";
import { Store as StoreType } from "@/types/store";

interface StoreNavigationProps {
  store: StoreType;
  slug: string;
  onSearchChange?: (search: string) => void;
  searchValue?: string;
  showSearch?: boolean;
  collections?: string[];
  onCollectionSelect?: (collection: string) => void;
}

const StoreNavigation = ({
  store,
  slug,
  onSearchChange,
  searchValue = "",
  showSearch = true,
  collections = [],
  onCollectionSelect,
}: StoreNavigationProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300"
      style={{
        backgroundColor: `${store.primary_color}08`,
        borderColor: `${store.primary_color}20`,
      }}
    >
      {/* Announcement Bar */}
      {(store as any).announcement_active && (store as any).announcement_text && (
        <div
          className="py-2 px-4 text-center text-sm font-medium"
          style={{
            backgroundColor: store.primary_color,
            color: "white",
          }}
        >
          {(store as any).announcement_text}
        </div>
      )}

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo / Store Name */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate(`/tienda/${slug}`)}
          >
            {store.logo_url ? (
              <img
                src={store.logo_url}
                alt={store.name}
                className="h-10 md:h-12 w-auto"
              />
            ) : (
              <div className="flex items-center gap-2">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: store.primary_color }}
                >
                  <Store className="h-5 w-5 text-white" />
                </div>
                <span
                  className="font-heading text-xl md:text-2xl font-bold"
                  style={{ color: store.primary_color }}
                >
                  {store.name}
                </span>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <button
              onClick={() => onCollectionSelect?.("all")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Todos
            </button>
            {collections.slice(0, 5).map((collection) => (
              <button
                key={collection}
                onClick={() => onCollectionSelect?.(collection)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {collection}
              </button>
            ))}
          </nav>

          {/* Desktop Search */}
          {showSearch && (
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="pl-10 bg-muted/50 border-transparent focus:border-primary/50"
                />
                {searchValue && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => onSearchChange?.("")}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Account */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback
                        style={{ backgroundColor: store.primary_color }}
                        className="text-white text-xs"
                      >
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
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
                className="h-10 w-10 rounded-xl"
                onClick={() => navigate("/auth")}
              >
                <User className="h-5 w-5" />
              </Button>
            )}

            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl relative"
              onClick={() => navigate(`/tienda/${slug}/cuenta`)}
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                  style={{ backgroundColor: store.primary_color }}
                >
                  {wishlist.length}
                </span>
              )}
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  style={{ backgroundColor: store.primary_color }}
                >
                  {totalItems}
                </Badge>
              )}
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="text-left">Menú</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => {
                      onCollectionSelect?.("all");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <span>Todos los productos</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {collections.map((collection) => (
                    <button
                      key={collection}
                      onClick={() => {
                        onCollectionSelect?.(collection);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <span>{collection}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && showSearch && (
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-10 bg-muted/50 border-transparent"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default StoreNavigation;
