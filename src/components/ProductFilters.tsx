import { useState } from "react";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export interface FilterState {
  search: string;
  collection: string;
  sortBy: string;
  priceRange: [number, number];
  showOnSale: boolean;
  showNew: boolean;
  showInStock: boolean;
}

interface ProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  collections: string[];
  maxPrice: number;
  primaryColor: string;
  totalProducts: number;
  filteredCount: number;
}

const ProductFilters = ({
  filters,
  onFiltersChange,
  collections,
  maxPrice,
  primaryColor,
  totalProducts,
  filteredCount,
}: ProductFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      collection: "all",
      sortBy: "default",
      priceRange: [0, maxPrice],
      showOnSale: false,
      showNew: false,
      showInStock: false,
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.collection !== "all" ||
    filters.sortBy !== "default" ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < maxPrice ||
    filters.showOnSale ||
    filters.showNew ||
    filters.showInStock;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Rango de precio</Label>
        <Slider
          value={filters.priceRange}
          onValueChange={(value) => updateFilter("priceRange", value as [number, number])}
          max={maxPrice}
          min={0}
          step={10}
          className="w-full"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>${filters.priceRange[0].toLocaleString()}</span>
          <span>${filters.priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      <Separator />

      {/* Quick Filters */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Filtros rápidos</Label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="onSale"
              checked={filters.showOnSale}
              onCheckedChange={(checked) => updateFilter("showOnSale", !!checked)}
            />
            <label htmlFor="onSale" className="text-sm cursor-pointer">
              En oferta
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isNew"
              checked={filters.showNew}
              onCheckedChange={(checked) => updateFilter("showNew", !!checked)}
            />
            <label htmlFor="isNew" className="text-sm cursor-pointer">
              Nuevos productos
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="inStock"
              checked={filters.showInStock}
              onCheckedChange={(checked) => updateFilter("showInStock", !!checked)}
            />
            <label htmlFor="inStock" className="text-sm cursor-pointer">
              En stock
            </label>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <>
          <Separator />
          <Button variant="outline" className="w-full" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Limpiar filtros
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search and Main Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => updateFilter("search", "")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Collection Select */}
        <Select
          value={filters.collection}
          onValueChange={(value) => updateFilter("collection", value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {collections.map((collection) => (
              <SelectItem key={collection} value={collection}>
                {collection}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Select */}
        <Select
          value={filters.sortBy}
          onValueChange={(value) => updateFilter("sortBy", value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Más relevantes</SelectItem>
            <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
            <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
            <SelectItem value="name-asc">Nombre: A-Z</SelectItem>
            <SelectItem value="name-desc">Nombre: Z-A</SelectItem>
            <SelectItem value="newest">Más nuevos</SelectItem>
          </SelectContent>
        </Select>

        {/* Mobile Filter Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="sm:hidden gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <Badge 
                  className="h-5 w-5 p-0 flex items-center justify-center text-xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  !
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Filter Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="hidden sm:flex gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <Badge 
                  className="h-5 w-5 p-0 flex items-center justify-center text-xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  !
                </Badge>
              )}
            </Button>
          </SheetTrigger>
        </Sheet>
      </div>

      {/* Active Filters & Results Count */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {filteredCount === totalProducts
            ? `${totalProducts} productos`
            : `${filteredCount} de ${totalProducts} productos`}
        </span>

        {hasActiveFilters && (
          <>
            <Separator orientation="vertical" className="h-4" />
            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                "{filters.search}"
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("search", "")}
                />
              </Badge>
            )}
            {filters.collection !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {filters.collection}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("collection", "all")}
                />
              </Badge>
            )}
            {filters.showOnSale && (
              <Badge variant="secondary" className="gap-1">
                En oferta
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("showOnSale", false)}
                />
              </Badge>
            )}
            {filters.showNew && (
              <Badge variant="secondary" className="gap-1">
                Nuevos
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("showNew", false)}
                />
              </Badge>
            )}
            {filters.showInStock && (
              <Badge variant="secondary" className="gap-1">
                En stock
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("showInStock", false)}
                />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={clearFilters}
            >
              Limpiar todo
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductFilters;
