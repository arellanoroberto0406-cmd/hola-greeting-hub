import { StoreSection } from "@/types/storeLayout";
import { Store } from "@/types/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Mail, Phone, MapPin, Instagram, Facebook, ShoppingBag, Star } from "lucide-react";

interface StorePreviewProps {
  sections: StoreSection[];
  store: Store;
}

export const StorePreview = ({ sections, store }: StorePreviewProps) => {
  const enabledSections = sections.filter(s => s.enabled);

  const renderSection = (section: StoreSection) => {
    switch (section.type) {
      case 'hero':
        return (
          <div
            key={section.id}
            className="py-12 px-6 text-center rounded-lg"
            style={{
              background: section.settings.backgroundType === 'gradient'
                ? `linear-gradient(135deg, ${store.primary_color}20, ${store.secondary_color}20)`
                : store.primary_color + '15'
            }}
          >
            <h2 className="text-2xl font-bold mb-2" style={{ color: store.primary_color }}>
              {section.settings.headline}
            </h2>
            <p className="text-muted-foreground mb-4">{section.settings.subtitle}</p>
            {section.settings.showButton && (
              <Button size="sm" style={{ backgroundColor: store.primary_color }}>
                {section.settings.buttonText}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        );

      case 'categories':
        return (
          <div key={section.id} className="py-6">
            <h3 className="font-semibold mb-4">{section.title}</h3>
            <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${Math.min(section.settings.columns || 4, 4)}, 1fr)` }}>
              {['Categoría 1', 'Categoría 2', 'Categoría 3', 'Categoría 4'].slice(0, section.settings.columns || 4).map((cat, i) => (
                <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                  {cat}
                </div>
              ))}
            </div>
          </div>
        );

      case 'featured_products':
      case 'products_grid':
        return (
          <div key={section.id} className="py-6">
            <h3 className="font-semibold mb-4">{section.title}</h3>
            <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${Math.min(section.settings.columns || 4, 4)}, 1fr)` }}>
              {Array.from({ length: Math.min(section.settings.limit || 4, 8) }).map((_, i) => (
                <Card key={i} className="p-2">
                  <div className="aspect-square bg-muted rounded mb-2 relative">
                    {section.settings.showBadges && i === 0 && (
                      <Badge className="absolute top-1 left-1 text-[8px] px-1 py-0" style={{ backgroundColor: store.primary_color }}>
                        Nuevo
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium truncate">Producto {i + 1}</p>
                    {section.settings.showPrice && (
                      <p className="text-[10px]" style={{ color: store.primary_color }}>$199.00</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'banner':
        return (
          <div
            key={section.id}
            className="py-4 px-6 text-center rounded-lg text-white text-sm"
            style={{
              backgroundColor: section.settings.backgroundColor === 'primary'
                ? store.primary_color
                : section.settings.backgroundColor === 'secondary'
                ? store.secondary_color
                : section.settings.backgroundColor === 'dark'
                ? '#1a1a1a'
                : store.accent_color
            }}
          >
            {section.settings.text}
          </div>
        );

      case 'newsletter':
        return (
          <div key={section.id} className="py-8 px-6 text-center bg-muted/50 rounded-lg">
            <Mail className="h-6 w-6 mx-auto mb-2" style={{ color: store.primary_color }} />
            <h3 className="font-semibold mb-1 text-sm">{section.settings.headline}</h3>
            <p className="text-[10px] text-muted-foreground mb-3">{section.settings.subtitle}</p>
            <div className="flex gap-2 max-w-[200px] mx-auto">
              <Input placeholder="email@ejemplo.com" className="h-7 text-[10px]" />
              <Button size="sm" className="h-7 text-[10px]" style={{ backgroundColor: store.primary_color }}>
                Suscribir
              </Button>
            </div>
          </div>
        );

      case 'about':
        return (
          <div key={section.id} className="py-6">
            <h3 className="font-semibold mb-2">{section.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-3">
              {section.settings.content}
            </p>
          </div>
        );

      case 'contact':
        return (
          <div key={section.id} className="py-6 space-y-2">
            <h3 className="font-semibold mb-3">{section.title}</h3>
            {store.phone && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                {store.phone}
              </div>
            )}
            {store.email && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                {store.email}
              </div>
            )}
            {section.settings.showSocial && (
              <div className="flex gap-2 mt-2">
                {store.instagram_url && <Instagram className="h-4 w-4" style={{ color: store.primary_color }} />}
                {store.facebook_url && <Facebook className="h-4 w-4" style={{ color: store.primary_color }} />}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
      {/* Preview Header */}
      <div 
        className="p-3 border-b flex items-center justify-between"
        style={{ backgroundColor: `${store.primary_color}08` }}
      >
        <div className="flex items-center gap-2">
          {store.logo_url ? (
            <img src={store.logo_url} alt={store.name} className="h-6" />
          ) : (
            <div 
              className="h-6 w-6 rounded flex items-center justify-center"
              style={{ backgroundColor: store.primary_color }}
            >
              <ShoppingBag className="h-3 w-3 text-white" />
            </div>
          )}
          <span className="font-medium text-sm" style={{ color: store.primary_color }}>
            {store.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 bg-muted rounded" />
          <div className="h-5 w-5 bg-muted rounded" />
        </div>
      </div>

      {/* Preview Content */}
      <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
        {enabledSections.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>No hay secciones habilitadas</p>
          </div>
        ) : (
          enabledSections.map(renderSection)
        )}
      </div>
    </div>
  );
};
