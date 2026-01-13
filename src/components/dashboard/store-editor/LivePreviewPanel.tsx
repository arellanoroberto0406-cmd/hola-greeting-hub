import { useMemo } from "react";
import { StoreSection, GlobalStyles, FONT_OPTIONS } from "@/types/storeLayout";
import { Store } from "@/types/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Mail, 
  Phone, 
  MapPin, 
  Instagram, 
  Facebook, 
  ShoppingBag, 
  Star,
  Monitor,
  Smartphone,
  Tablet
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LivePreviewPanelProps {
  sections: StoreSection[];
  store: Store;
  globalStyles: GlobalStyles;
  device?: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange?: (device: 'desktop' | 'tablet' | 'mobile') => void;
  showDeviceControls?: boolean;
}

const getStyleVariables = (styles: GlobalStyles, primaryColor: string) => {
  const headingFont = FONT_OPTIONS.find(f => f.value === styles.headingFont)?.label || 'Oswald';
  const bodyFont = FONT_OPTIONS.find(f => f.value === styles.bodyFont)?.label || 'Montserrat';
  
  const borderRadiusMap: Record<string, string> = {
    'none': '0px',
    'sm': '4px',
    'md': '8px',
    'lg': '12px',
    'xl': '16px',
    'full': '9999px',
  };
  
  const spacingMap: Record<string, string> = {
    'compact': '1rem',
    'normal': '2rem',
    'relaxed': '3rem',
    'spacious': '4rem',
  };

  const shadowMap: Record<string, string> = {
    'none': 'none',
    'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  };

  return {
    '--preview-heading-font': `'${headingFont}', sans-serif`,
    '--preview-body-font': `'${bodyFont}', sans-serif`,
    '--preview-radius': borderRadiusMap[styles.borderRadius] || '12px',
    '--preview-spacing': spacingMap[styles.sectionSpacing] || '2rem',
    '--preview-shadow': shadowMap[styles.cardShadow] || 'none',
    '--preview-primary': primaryColor,
  } as React.CSSProperties;
};

export const LivePreviewPanel = ({ 
  sections, 
  store, 
  globalStyles,
  device = 'desktop',
  onDeviceChange,
  showDeviceControls = true
}: LivePreviewPanelProps) => {
  const enabledSections = sections.filter(s => s.enabled);
  
  const styleVars = useMemo(() => 
    getStyleVariables(globalStyles, store.primary_color || '#6366f1'),
    [globalStyles, store.primary_color]
  );

  const deviceWidth = device === 'mobile' ? 'max-w-[320px]' : device === 'tablet' ? 'max-w-[768px]' : 'w-full';

  const getButtonStyles = () => {
    const base = 'px-4 py-2 text-sm font-medium transition-all';
    switch (globalStyles.buttonStyle) {
      case 'outline':
        return `${base} bg-transparent border-2`;
      case 'ghost':
        return `${base} bg-transparent hover:bg-opacity-10`;
      default:
        return `${base} text-white`;
    }
  };

  const renderSection = (section: StoreSection) => {
    switch (section.type) {
      case 'hero':
        return (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="py-8 px-6 text-center"
            style={{
              background: section.settings.backgroundType === 'gradient'
                ? `linear-gradient(135deg, ${store.primary_color}20, ${store.secondary_color}20)`
                : store.primary_color + '15',
              borderRadius: 'var(--preview-radius)',
              fontFamily: 'var(--preview-body-font)',
            }}
          >
            <h2 
              className="text-xl font-bold mb-2" 
              style={{ 
                color: store.primary_color,
                fontFamily: 'var(--preview-heading-font)',
              }}
            >
              {section.settings.headline}
            </h2>
            <p className="text-muted-foreground text-sm mb-4">{section.settings.subtitle}</p>
            {section.settings.showButton && (
              <button
                className={getButtonStyles()}
                style={{ 
                  backgroundColor: globalStyles.buttonStyle === 'solid' ? store.primary_color : 'transparent',
                  borderColor: store.primary_color,
                  color: globalStyles.buttonStyle === 'solid' ? 'white' : store.primary_color,
                  borderRadius: 'var(--preview-radius)',
                }}
              >
                {section.settings.buttonText}
                <ArrowRight className="h-4 w-4 ml-2 inline" />
              </button>
            )}
          </motion.div>
        );

      case 'categories':
        return (
          <motion.div 
            key={section.id} 
            className="py-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h3 
              className="font-semibold mb-3 text-sm"
              style={{ fontFamily: 'var(--preview-heading-font)' }}
            >
              {section.title}
            </h3>
            <div 
              className="grid gap-2" 
              style={{ gridTemplateColumns: `repeat(${Math.min(section.settings.columns || 4, 4)}, 1fr)` }}
            >
              {['Cat 1', 'Cat 2', 'Cat 3', 'Cat 4'].slice(0, section.settings.columns || 4).map((cat, i) => (
                <div 
                  key={i} 
                  className="aspect-square bg-muted flex items-center justify-center text-xs text-muted-foreground"
                  style={{ borderRadius: 'var(--preview-radius)' }}
                >
                  {cat}
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 'featured_products':
      case 'products_grid':
        return (
          <motion.div 
            key={section.id} 
            className="py-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <h3 
              className="font-semibold mb-3 text-sm"
              style={{ fontFamily: 'var(--preview-heading-font)' }}
            >
              {section.title}
            </h3>
            <div 
              className="grid gap-2" 
              style={{ gridTemplateColumns: `repeat(${Math.min(section.settings.columns || 4, 4)}, 1fr)` }}
            >
              {Array.from({ length: Math.min(section.settings.limit || 4, 8) }).map((_, i) => (
                <div 
                  key={i} 
                  className="p-2 bg-card border"
                  style={{ 
                    borderRadius: 'var(--preview-radius)',
                    boxShadow: 'var(--preview-shadow)',
                  }}
                >
                  <div 
                    className="aspect-square bg-muted mb-2 relative"
                    style={{ borderRadius: `calc(var(--preview-radius) - 4px)` }}
                  >
                    {section.settings.showBadges && i === 0 && (
                      <Badge 
                        className="absolute top-1 left-1 text-[8px] px-1 py-0" 
                        style={{ 
                          backgroundColor: store.primary_color,
                          borderRadius: 'var(--preview-radius)',
                        }}
                      >
                        Nuevo
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p 
                      className="text-[9px] font-medium truncate"
                      style={{ fontFamily: 'var(--preview-body-font)' }}
                    >
                      Producto {i + 1}
                    </p>
                    {section.settings.showPrice && (
                      <p className="text-[9px]" style={{ color: store.primary_color }}>$199.00</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 'banner':
        return (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="py-3 px-4 text-center text-white text-xs"
            style={{
              backgroundColor: section.settings.backgroundColor === 'primary'
                ? store.primary_color
                : section.settings.backgroundColor === 'secondary'
                ? store.secondary_color
                : section.settings.backgroundColor === 'dark'
                ? '#1a1a1a'
                : store.accent_color,
              borderRadius: 'var(--preview-radius)',
              fontFamily: 'var(--preview-body-font)',
            }}
          >
            {section.settings.text}
          </motion.div>
        );

      case 'newsletter':
        return (
          <motion.div 
            key={section.id} 
            className="py-6 px-4 text-center bg-muted/50"
            style={{ 
              borderRadius: 'var(--preview-radius)',
              fontFamily: 'var(--preview-body-font)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Mail className="h-5 w-5 mx-auto mb-2" style={{ color: store.primary_color }} />
            <h3 
              className="font-semibold mb-1 text-xs"
              style={{ fontFamily: 'var(--preview-heading-font)' }}
            >
              {section.settings.headline}
            </h3>
            <p className="text-[9px] text-muted-foreground mb-2">{section.settings.subtitle}</p>
            <div className="flex gap-1 max-w-[160px] mx-auto">
              <Input 
                placeholder="email@ejemplo.com" 
                className="h-6 text-[9px]"
                style={{ borderRadius: 'var(--preview-radius)' }}
              />
              <button
                className={getButtonStyles()}
                style={{ 
                  backgroundColor: globalStyles.buttonStyle === 'solid' ? store.primary_color : 'transparent',
                  borderColor: store.primary_color,
                  color: globalStyles.buttonStyle === 'solid' ? 'white' : store.primary_color,
                  borderRadius: 'var(--preview-radius)',
                  fontSize: '9px',
                  padding: '0 8px',
                }}
              >
                Ok
              </button>
            </div>
          </motion.div>
        );

      case 'about':
        return (
          <motion.div 
            key={section.id} 
            className="py-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 
              className="font-semibold mb-2 text-sm"
              style={{ fontFamily: 'var(--preview-heading-font)' }}
            >
              {section.title}
            </h3>
            <p 
              className="text-xs text-muted-foreground line-clamp-2"
              style={{ fontFamily: 'var(--preview-body-font)' }}
            >
              {section.settings.content}
            </p>
          </motion.div>
        );

      case 'contact':
        return (
          <motion.div 
            key={section.id} 
            className="py-4 space-y-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 
              className="font-semibold mb-2 text-sm"
              style={{ fontFamily: 'var(--preview-heading-font)' }}
            >
              {section.title}
            </h3>
            {store.phone && (
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Phone className="h-3 w-3" />
                {store.phone}
              </div>
            )}
            {store.email && (
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Mail className="h-3 w-3" />
                {store.email}
              </div>
            )}
            {section.settings.showSocial && (
              <div className="flex gap-2 mt-2">
                {store.instagram_url && <Instagram className="h-3 w-3" style={{ color: store.primary_color }} />}
                {store.facebook_url && <Facebook className="h-3 w-3" style={{ color: store.primary_color }} />}
              </div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {showDeviceControls && onDeviceChange && (
        <div className="flex items-center justify-center gap-1 p-1 bg-muted rounded-lg w-fit mx-auto">
          <Button
            variant={device === 'desktop' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 px-3"
            onClick={() => onDeviceChange('desktop')}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant={device === 'tablet' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 px-3"
            onClick={() => onDeviceChange('tablet')}
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant={device === 'mobile' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 px-3"
            onClick={() => onDeviceChange('mobile')}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className={`mx-auto transition-all duration-300 ${deviceWidth}`}>
        <motion.div 
          className="bg-background rounded-xl border shadow-sm overflow-hidden"
          style={styleVars}
          layout
        >
          {/* Preview Header */}
          <div 
            className="p-2 border-b flex items-center justify-between"
            style={{ backgroundColor: `${store.primary_color}08` }}
          >
            <div className="flex items-center gap-2">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="h-5" />
              ) : (
                <div 
                  className="h-5 w-5 flex items-center justify-center"
                  style={{ 
                    backgroundColor: store.primary_color,
                    borderRadius: 'var(--preview-radius)',
                  }}
                >
                  <ShoppingBag className="h-3 w-3 text-white" />
                </div>
              )}
              <span 
                className="font-medium text-xs" 
                style={{ 
                  color: store.primary_color,
                  fontFamily: 'var(--preview-heading-font)',
                }}
              >
                {store.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-12 bg-muted rounded" />
              <div className="h-4 w-4 bg-muted rounded" />
            </div>
          </div>

          {/* Preview Content */}
          <div 
            className="p-3 max-h-[400px] overflow-y-auto"
            style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--preview-spacing)',
            }}
          >
            <AnimatePresence mode="sync">
              {enabledSections.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <p className="text-xs">No hay secciones habilitadas</p>
                </div>
              ) : (
                enabledSections.map(renderSection)
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LivePreviewPanel;
