export type SectionType = 
  | 'hero'
  | 'featured_products'
  | 'categories'
  | 'banner'
  | 'testimonials'
  | 'newsletter'
  | 'about'
  | 'contact'
  | 'products_grid'
  | 'custom_text'
  | 'image_slider'
  | 'video'
  | 'faq'
  // Professional sections
  | 'countdown_timer'
  | 'instagram_feed'
  | 'brand_logos'
  | 'comparison_table'
  | 'popup_banner'
  // Enterprise sections
  | 'parallax_hero'
  | 'interactive_gallery'
  | 'animated_stats'
  | 'mega_menu'
  | 'customer_reviews_carousel'
  | 'product_showcase_3d'
  | 'loyalty_program'
  | 'live_chat_widget'
  | 'premium_video';

export type FontFamily = 
  | 'inter'
  | 'montserrat'
  | 'playfair'
  | 'poppins'
  | 'roboto'
  | 'lora'
  | 'oswald'
  | 'raleway'
  | 'merriweather'
  | 'nunito'
  | 'dm-sans'
  | 'space-grotesk'
  | 'crimson-pro'
  | 'outfit';

export type AnimationType = 
  | 'none'
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom'
  | 'bounce'
  | 'flip'
  | 'rotate'
  | 'blur'
  | 'scale';

export interface SectionBackground {
  type: 'none' | 'solid' | 'gradient' | 'pattern' | 'image' | 'video';
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  gradientDirection?: 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-br' | 'to-bl' | 'to-tr' | 'to-tl';
  pattern?: 'dots' | 'grid' | 'waves' | 'none' | 'diagonal' | 'circles' | 'hexagon';
  opacity?: number;
  imageUrl?: string;
  videoUrl?: string;
}

export const ANIMATION_OPTIONS: { value: AnimationType; label: string }[] = [
  { value: 'none', label: 'Sin animación' },
  { value: 'fade', label: 'Aparecer' },
  { value: 'slide-up', label: 'Deslizar hacia arriba' },
  { value: 'slide-down', label: 'Deslizar hacia abajo' },
  { value: 'slide-left', label: 'Deslizar desde la izquierda' },
  { value: 'slide-right', label: 'Deslizar desde la derecha' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'bounce', label: 'Rebote' },
  { value: 'flip', label: 'Voltear' },
  { value: 'rotate', label: 'Rotar' },
  { value: 'blur', label: 'Desenfocar' },
  { value: 'scale', label: 'Escalar' },
];

export const BACKGROUND_COLORS: { value: string; label: string; color: string }[] = [
  { value: 'transparent', label: 'Transparente', color: 'transparent' },
  { value: 'white', label: 'Blanco', color: '#ffffff' },
  { value: 'light-gray', label: 'Gris claro', color: '#f5f5f5' },
  { value: 'warm-gray', label: 'Gris cálido', color: '#fafaf9' },
  { value: 'cool-gray', label: 'Gris frío', color: '#f8fafc' },
  { value: 'cream', label: 'Crema', color: '#fffbeb' },
  { value: 'soft-pink', label: 'Rosa suave', color: '#fdf2f8' },
  { value: 'soft-blue', label: 'Azul suave', color: '#eff6ff' },
  { value: 'soft-green', label: 'Verde suave', color: '#f0fdf4' },
  { value: 'soft-purple', label: 'Morado suave', color: '#faf5ff' },
  { value: 'primary-light', label: 'Primario claro', color: 'primary-light' },
  { value: 'dark', label: 'Oscuro', color: '#1a1a1a' },
  { value: 'charcoal', label: 'Carbón', color: '#374151' },
  { value: 'custom', label: 'Personalizado', color: 'custom' },
];

export interface GlobalStyles {
  headingFont: FontFamily;
  bodyFont: FontFamily;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  sectionSpacing: 'compact' | 'normal' | 'relaxed' | 'spacious';
  buttonStyle: 'solid' | 'outline' | 'ghost' | 'gradient' | '3d';
  cardShadow: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'glow';
  colorMode?: 'light' | 'dark' | 'auto';
  accentStyle?: 'minimal' | 'bold' | 'neon' | 'pastel';
}

export const DEFAULT_GLOBAL_STYLES: GlobalStyles = {
  headingFont: 'oswald',
  bodyFont: 'montserrat',
  borderRadius: 'lg',
  sectionSpacing: 'normal',
  buttonStyle: 'solid',
  cardShadow: 'md',
  colorMode: 'light',
  accentStyle: 'minimal',
};

export const FONT_OPTIONS: { value: FontFamily; label: string; googleFont: string }[] = [
  { value: 'inter', label: 'Inter', googleFont: 'Inter:wght@400;500;600;700' },
  { value: 'montserrat', label: 'Montserrat', googleFont: 'Montserrat:wght@400;500;600;700' },
  { value: 'playfair', label: 'Playfair Display', googleFont: 'Playfair+Display:wght@400;500;600;700' },
  { value: 'poppins', label: 'Poppins', googleFont: 'Poppins:wght@400;500;600;700' },
  { value: 'roboto', label: 'Roboto', googleFont: 'Roboto:wght@400;500;700' },
  { value: 'lora', label: 'Lora', googleFont: 'Lora:wght@400;500;600;700' },
  { value: 'oswald', label: 'Oswald', googleFont: 'Oswald:wght@400;500;600;700' },
  { value: 'raleway', label: 'Raleway', googleFont: 'Raleway:wght@400;500;600;700' },
  { value: 'merriweather', label: 'Merriweather', googleFont: 'Merriweather:wght@400;700' },
  { value: 'nunito', label: 'Nunito', googleFont: 'Nunito:wght@400;500;600;700' },
  { value: 'dm-sans', label: 'DM Sans', googleFont: 'DM+Sans:wght@400;500;600;700' },
  { value: 'space-grotesk', label: 'Space Grotesk', googleFont: 'Space+Grotesk:wght@400;500;600;700' },
  { value: 'crimson-pro', label: 'Crimson Pro', googleFont: 'Crimson+Pro:wght@400;500;600;700' },
  { value: 'outfit', label: 'Outfit', googleFont: 'Outfit:wght@400;500;600;700' },
];

// Section availability by plan
export type PlanTier = 'basic' | 'professional' | 'enterprise';

export interface SectionConfig {
  type: SectionType;
  label: string;
  description: string;
  icon: string;
  requiredPlan: PlanTier;
  isNew?: boolean;
  isPremium?: boolean;
}

export const SECTION_CONFIGS: SectionConfig[] = [
  // Basic sections (all plans)
  { type: 'hero', label: 'Banner Principal', description: 'Sección de bienvenida con imagen de fondo', icon: '🏠', requiredPlan: 'basic' },
  { type: 'featured_products', label: 'Productos Destacados', description: 'Muestra productos seleccionados', icon: '⭐', requiredPlan: 'basic' },
  { type: 'categories', label: 'Categorías', description: 'Navegación por categorías de productos', icon: '📁', requiredPlan: 'basic' },
  { type: 'banner', label: 'Banner Promocional', description: 'Anuncio de ofertas y promociones', icon: '📢', requiredPlan: 'basic' },
  { type: 'products_grid', label: 'Grilla de Productos', description: 'Vista de todos los productos', icon: '🛍️', requiredPlan: 'basic' },
  { type: 'newsletter', label: 'Newsletter', description: 'Formulario de suscripción al boletín', icon: '📧', requiredPlan: 'basic' },
  { type: 'about', label: 'Sobre Nosotros', description: 'Historia y valores de tu marca', icon: '📖', requiredPlan: 'basic' },
  { type: 'contact', label: 'Contacto', description: 'Información de contacto y formulario', icon: '📞', requiredPlan: 'basic' },
  { type: 'testimonials', label: 'Testimonios', description: 'Opiniones de clientes satisfechos', icon: '💬', requiredPlan: 'basic' },
  { type: 'faq', label: 'Preguntas Frecuentes', description: 'Respuestas a dudas comunes', icon: '❓', requiredPlan: 'basic' },
  { type: 'custom_text', label: 'Texto Personalizado', description: 'Contenido de texto libre', icon: '📝', requiredPlan: 'basic' },
  
  // Professional sections
  { type: 'image_slider', label: 'Slider de Imágenes', description: 'Carrusel de imágenes con transiciones', icon: '🖼️', requiredPlan: 'professional', isPremium: true },
  { type: 'video', label: 'Video de Presentación', description: 'Video promocional o tutorial', icon: '🎬', requiredPlan: 'professional', isPremium: true },
  { type: 'countdown_timer', label: 'Temporizador de Oferta', description: 'Cuenta regresiva para promociones', icon: '⏰', requiredPlan: 'professional', isPremium: true, isNew: true },
  { type: 'instagram_feed', label: 'Feed de Instagram', description: 'Muestra tus publicaciones de Instagram', icon: '📸', requiredPlan: 'professional', isPremium: true, isNew: true },
  { type: 'brand_logos', label: 'Logos de Marcas', description: 'Carrusel de marcas asociadas', icon: '🏷️', requiredPlan: 'professional', isPremium: true, isNew: true },
  { type: 'comparison_table', label: 'Tabla Comparativa', description: 'Compara productos o planes', icon: '📊', requiredPlan: 'professional', isPremium: true, isNew: true },
  { type: 'popup_banner', label: 'Banner Emergente', description: 'Popup promocional o de bienvenida', icon: '💥', requiredPlan: 'professional', isPremium: true, isNew: true },
  
  // Enterprise sections
  { type: 'parallax_hero', label: 'Hero Parallax', description: 'Banner con efecto de profundidad 3D', icon: '🌌', requiredPlan: 'enterprise', isPremium: true, isNew: true },
  { type: 'interactive_gallery', label: 'Galería Interactiva', description: 'Galería con zoom y lightbox', icon: '✨', requiredPlan: 'enterprise', isPremium: true, isNew: true },
  { type: 'animated_stats', label: 'Estadísticas Animadas', description: 'Números que se animan al hacer scroll', icon: '📈', requiredPlan: 'enterprise', isPremium: true, isNew: true },
  { type: 'mega_menu', label: 'Mega Menú', description: 'Menú desplegable avanzado', icon: '🗂️', requiredPlan: 'enterprise', isPremium: true, isNew: true },
  { type: 'customer_reviews_carousel', label: 'Carrusel de Reseñas', description: 'Reseñas con animaciones premium', icon: '🌟', requiredPlan: 'enterprise', isPremium: true, isNew: true },
  { type: 'product_showcase_3d', label: 'Showcase 3D', description: 'Presentación de producto con efectos 3D', icon: '🎮', requiredPlan: 'enterprise', isPremium: true, isNew: true },
  { type: 'loyalty_program', label: 'Programa de Lealtad', description: 'Widget de puntos y recompensas', icon: '🎁', requiredPlan: 'enterprise', isPremium: true, isNew: true },
  { type: 'live_chat_widget', label: 'Chat en Vivo', description: 'Widget de atención en tiempo real', icon: '💬', requiredPlan: 'enterprise', isPremium: true, isNew: true },
  { type: 'premium_video', label: 'Video Premium', description: 'Sección de video cinematográfico con múltiples estilos', icon: '🎬', requiredPlan: 'enterprise', isPremium: true, isNew: true },
];

// Design Templates
export interface DesignTemplate {
  id: string;
  name: string;
  description: string;
  category: 'modern' | 'classic' | 'minimal' | 'bold' | 'elegant' | 'creative' | 'luxury' | 'tech';
  thumbnail: string;
  globalStyles: GlobalStyles;
  sectionIds: string[];
  requiredPlan?: PlanTier;
  isPremium?: boolean;
  previewColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  tags?: string[];
}

export const DESIGN_TEMPLATES: DesignTemplate[] = [
  // ═══════════════════════════════════════════════════
  // FREE TEMPLATES (Basic Plan) - 5 templates
  // ═══════════════════════════════════════════════════
  {
    id: 'modern-minimal',
    name: 'Moderno Minimalista',
    description: 'Diseño limpio y espacioso con énfasis en el contenido. Perfecto para tiendas que buscan un look profesional y elegante.',
    category: 'minimal',
    thumbnail: '🎯',
    globalStyles: {
      headingFont: 'inter',
      bodyFont: 'inter',
      borderRadius: 'lg',
      sectionSpacing: 'relaxed',
      buttonStyle: 'solid',
      cardShadow: 'sm',
      colorMode: 'light',
      accentStyle: 'minimal',
    },
    sectionIds: ['hero-1', 'featured-1', 'banner-1', 'newsletter-1', 'contact-1'],
    previewColors: { primary: '#3B82F6', secondary: '#F1F5F9', accent: '#60A5FA' },
    tags: ['minimalista', 'moderno', 'limpio'],
  },
  {
    id: 'friendly-casual',
    name: 'Casual Amigable',
    description: 'Bordes redondeados y aspecto accesible. Ideal para tiendas de productos cotidianos y marcas juveniles.',
    category: 'modern',
    thumbnail: '😊',
    globalStyles: {
      headingFont: 'nunito',
      bodyFont: 'nunito',
      borderRadius: 'full',
      sectionSpacing: 'normal',
      buttonStyle: 'solid',
      cardShadow: 'md',
      colorMode: 'light',
      accentStyle: 'pastel',
    },
    sectionIds: ['hero-1', 'categories-1', 'featured-1', 'testimonials-1', 'newsletter-1'],
    previewColors: { primary: '#F472B6', secondary: '#FDF2F8', accent: '#EC4899' },
    tags: ['amigable', 'juvenil', 'colorido'],
  },
  {
    id: 'classic-professional',
    name: 'Clásico Profesional',
    description: 'Estilo corporativo y confiable. Transmite seriedad y profesionalismo para empresas establecidas.',
    category: 'classic',
    thumbnail: '💼',
    globalStyles: {
      headingFont: 'merriweather',
      bodyFont: 'roboto',
      borderRadius: 'md',
      sectionSpacing: 'normal',
      buttonStyle: 'solid',
      cardShadow: 'sm',
      colorMode: 'light',
      accentStyle: 'minimal',
    },
    sectionIds: ['hero-1', 'about-1', 'featured-1', 'products-1', 'contact-1'],
    previewColors: { primary: '#1E40AF', secondary: '#EFF6FF', accent: '#3B82F6' },
    tags: ['profesional', 'corporativo', 'serio'],
  },
  {
    id: 'simple-clean',
    name: 'Simple y Limpio',
    description: 'La esencia del minimalismo. Menos es más para destacar tus productos sin distracciones.',
    category: 'minimal',
    thumbnail: '✨',
    globalStyles: {
      headingFont: 'dm-sans',
      bodyFont: 'dm-sans',
      borderRadius: 'sm',
      sectionSpacing: 'spacious',
      buttonStyle: 'outline',
      cardShadow: 'none',
      colorMode: 'light',
      accentStyle: 'minimal',
    },
    sectionIds: ['hero-1', 'products-1', 'about-1', 'contact-1'],
    previewColors: { primary: '#000000', secondary: '#FFFFFF', accent: '#6B7280' },
    tags: ['simple', 'limpio', 'básico'],
  },
  {
    id: 'warm-cozy',
    name: 'Cálido y Acogedor',
    description: 'Tonos cálidos y tipografía serif para una sensación hogareña y artesanal.',
    category: 'classic',
    thumbnail: '🏡',
    globalStyles: {
      headingFont: 'lora',
      bodyFont: 'raleway',
      borderRadius: 'lg',
      sectionSpacing: 'relaxed',
      buttonStyle: 'solid',
      cardShadow: 'md',
      colorMode: 'light',
      accentStyle: 'pastel',
    },
    sectionIds: ['hero-1', 'categories-1', 'featured-1', 'about-1', 'testimonials-1', 'contact-1'],
    previewColors: { primary: '#B45309', secondary: '#FFFBEB', accent: '#D97706' },
    tags: ['cálido', 'artesanal', 'acogedor'],
  },

  // ═══════════════════════════════════════════════════
  // PROFESSIONAL PLAN TEMPLATES - 12 templates
  // ═══════════════════════════════════════════════════
  {
    id: 'elegant-boutique',
    name: 'Boutique Elegante',
    description: 'Tipografía refinada y espaciado generoso. Ideal para moda, joyería y productos de lujo accesible.',
    category: 'elegant',
    thumbnail: '👜',
    requiredPlan: 'professional',
    isPremium: true,
    globalStyles: {
      headingFont: 'playfair',
      bodyFont: 'lora',
      borderRadius: 'sm',
      sectionSpacing: 'spacious',
      buttonStyle: 'outline',
      cardShadow: 'none',
      colorMode: 'light',
      accentStyle: 'minimal',
    },
    sectionIds: ['hero-1', 'categories-1', 'featured-1', 'testimonials-1', 'about-1', 'contact-1'],
    previewColors: { primary: '#831843', secondary: '#FDF2F8', accent: '#BE185D' },
    tags: ['elegante', 'moda', 'boutique', 'lujo'],
  },
  {
    id: 'bold-impact',
    name: 'Impacto Audaz',
    description: 'Diseño potente con sombras pronunciadas y tipografía bold. Para marcas que quieren destacar.',
    category: 'bold',
    thumbnail: '🔥',
    requiredPlan: 'professional',
    isPremium: true,
    globalStyles: {
      headingFont: 'oswald',
      bodyFont: 'montserrat',
      borderRadius: 'none',
      sectionSpacing: 'compact',
      buttonStyle: 'solid',
      cardShadow: 'xl',
      colorMode: 'light',
      accentStyle: 'bold',
    },
    sectionIds: ['hero-1', 'banner-1', 'featured-1', 'products-1', 'faq-1', 'contact-1'],
    previewColors: { primary: '#DC2626', secondary: '#FEF2F2', accent: '#EF4444' },
    tags: ['audaz', 'impactante', 'energético'],
  },
  {
    id: 'tech-startup',
    name: 'Tech Startup',
    description: 'Estética moderna y tecnológica con gradientes sutiles. Perfecto para gadgets y productos digitales.',
    category: 'tech',
    thumbnail: '🚀',
    requiredPlan: 'professional',
    isPremium: true,
    globalStyles: {
      headingFont: 'space-grotesk',
      bodyFont: 'inter',
      borderRadius: 'xl',
      sectionSpacing: 'relaxed',
      buttonStyle: 'gradient',
      cardShadow: 'lg',
      colorMode: 'light',
      accentStyle: 'neon',
    },
    sectionIds: ['hero-1', 'featured-1', 'video-1', 'faq-1', 'newsletter-1', 'contact-1'],
    previewColors: { primary: '#7C3AED', secondary: '#F5F3FF', accent: '#8B5CF6' },
    tags: ['tech', 'startup', 'moderno', 'digital'],
  },
  {
    id: 'artisan-craft',
    name: 'Artesanal Premium',
    description: 'Diseño cálido y auténtico para productos hechos a mano. Transmite calidad y dedicación.',
    category: 'classic',
    thumbnail: '🎨',
    requiredPlan: 'professional',
    isPremium: true,
    globalStyles: {
      headingFont: 'crimson-pro',
      bodyFont: 'raleway',
      borderRadius: 'sm',
      sectionSpacing: 'spacious',
      buttonStyle: 'outline',
      cardShadow: 'sm',
      colorMode: 'light',
      accentStyle: 'pastel',
    },
    sectionIds: ['hero-1', 'about-1', 'image-slider-1', 'featured-1', 'testimonials-1', 'contact-1'],
    previewColors: { primary: '#78350F', secondary: '#FEF3C7', accent: '#92400E' },
    tags: ['artesanal', 'handmade', 'natural', 'orgánico'],
  },
  {
    id: 'vibrant-store',
    name: 'Tienda Vibrante',
    description: 'Colores vivos y energía juvenil. Ideal para productos dirigidos a millennials y Gen Z.',
    category: 'bold',
    thumbnail: '🌈',
    requiredPlan: 'professional',
    isPremium: true,
    globalStyles: {
      headingFont: 'outfit',
      bodyFont: 'poppins',
      borderRadius: 'lg',
      sectionSpacing: 'compact',
      buttonStyle: 'solid',
      cardShadow: 'md',
      colorMode: 'light',
      accentStyle: 'neon',
    },
    sectionIds: ['hero-1', 'categories-1', 'banner-1', 'featured-1', 'products-1', 'newsletter-1'],
    previewColors: { primary: '#F59E0B', secondary: '#FFFBEB', accent: '#FBBF24' },
    tags: ['vibrante', 'juvenil', 'colorido', 'energético'],
  },
  {
    id: 'nordic-clean',
    name: 'Nórdico Premium',
    description: 'Estilo escandinavo con espacios amplios y paleta neutral. Elegancia en la simplicidad.',
    category: 'minimal',
    thumbnail: '🏔️',
    requiredPlan: 'professional',
    isPremium: true,
    globalStyles: {
      headingFont: 'raleway',
      bodyFont: 'inter',
      borderRadius: 'md',
      sectionSpacing: 'spacious',
      buttonStyle: 'outline',
      cardShadow: 'none',
      colorMode: 'light',
      accentStyle: 'minimal',
    },
    sectionIds: ['hero-1', 'featured-1', 'about-1', 'products-1', 'newsletter-1'],
    previewColors: { primary: '#374151', secondary: '#F9FAFB', accent: '#6B7280' },
    tags: ['nórdico', 'escandinavo', 'minimalista', 'elegante'],
  },
  {
    id: 'eco-green',
    name: 'Eco Sustentable',
    description: 'Diseño verde y natural para productos ecológicos y sustentables. Conecta con la naturaleza.',
    category: 'modern',
    thumbnail: '🌿',
    requiredPlan: 'professional',
    isPremium: true,
    globalStyles: {
      headingFont: 'dm-sans',
      bodyFont: 'nunito',
      borderRadius: 'lg',
      sectionSpacing: 'relaxed',
      buttonStyle: 'solid',
      cardShadow: 'sm',
      colorMode: 'light',
      accentStyle: 'pastel',
    },
    sectionIds: ['hero-1', 'about-1', 'categories-1', 'featured-1', 'testimonials-1', 'newsletter-1', 'contact-1'],
    previewColors: { primary: '#059669', secondary: '#ECFDF5', accent: '#10B981' },
    tags: ['eco', 'verde', 'sustentable', 'natural'],
  },
  {
    id: 'urban-edge',
    name: 'Urbano Moderno',
    description: 'Estética urbana con bordes definidos. Para streetwear, sneakers y cultura urbana.',
    category: 'bold',
    thumbnail: '🏙️',
    requiredPlan: 'professional',
    isPremium: true,
    globalStyles: {
      headingFont: 'oswald',
      bodyFont: 'roboto',
      borderRadius: 'none',
      sectionSpacing: 'compact',
      buttonStyle: 'solid',
      cardShadow: 'lg',
      colorMode: 'dark',
      accentStyle: 'bold',
    },
    sectionIds: ['hero-1', 'featured-1', 'video-1', 'categories-1', 'products-1', 'contact-1'],
    previewColors: { primary: '#FBBF24', secondary: '#1F2937', accent: '#F59E0B' },
    tags: ['urbano', 'streetwear', 'moderno', 'edge'],
  },
  {
    id: 'beauty-glow',
    name: 'Belleza Radiante',
    description: 'Diseño suave y femenino con tonos rosados. Perfecto para cosméticos y cuidado personal.',
    category: 'elegant',
    thumbnail: '💄',
    requiredPlan: 'professional',
    isPremium: true,
    globalStyles: {
      headingFont: 'playfair',
      bodyFont: 'poppins',
      borderRadius: 'full',
      sectionSpacing: 'relaxed',
      buttonStyle: 'solid',
      cardShadow: 'glow',
      colorMode: 'light',
      accentStyle: 'pastel',
    },
    sectionIds: ['hero-1', 'categories-1', 'featured-1', 'image-slider-1', 'testimonials-1', 'newsletter-1', 'contact-1'],
    previewColors: { primary: '#DB2777', secondary: '#FDF2F8', accent: '#EC4899' },
    tags: ['belleza', 'cosmética', 'femenino', 'suave'],
  },
  {
    id: 'food-delicious',
    name: 'Delicias Gourmet',
    description: 'Diseño apetitoso para restaurantes, cafeterías y tiendas de alimentos gourmet.',
    category: 'creative',
    thumbnail: '🍽️',
    requiredPlan: 'professional',
    isPremium: true,
    globalStyles: {
      headingFont: 'lora',
      bodyFont: 'montserrat',
      borderRadius: 'lg',
      sectionSpacing: 'normal',
      buttonStyle: 'solid',
      cardShadow: 'md',
      colorMode: 'light',
      accentStyle: 'bold',
    },
    sectionIds: ['hero-1', 'categories-1', 'featured-1', 'image-slider-1', 'about-1', 'testimonials-1', 'contact-1'],
    previewColors: { primary: '#EA580C', secondary: '#FFF7ED', accent: '#F97316' },
    tags: ['comida', 'restaurante', 'gourmet', 'delicioso'],
  },
  {
    id: 'fitness-power',
    name: 'Fitness Power',
    description: 'Diseño energético y motivador para gimnasios, suplementos y ropa deportiva.',
    category: 'bold',
    thumbnail: '💪',
    requiredPlan: 'professional',
    isPremium: true,
    globalStyles: {
      headingFont: 'oswald',
      bodyFont: 'inter',
      borderRadius: 'sm',
      sectionSpacing: 'compact',
      buttonStyle: 'solid',
      cardShadow: 'xl',
      colorMode: 'dark',
      accentStyle: 'neon',
    },
    sectionIds: ['hero-1', 'featured-1', 'video-1', 'products-1', 'testimonials-1', 'faq-1', 'contact-1'],
    previewColors: { primary: '#10B981', secondary: '#111827', accent: '#34D399' },
    tags: ['fitness', 'deportivo', 'gimnasio', 'energético'],
  },
  {
    id: 'kids-fun',
    name: 'Mundo Infantil',
    description: 'Diseño divertido y colorido para tiendas de productos infantiles y juguetes.',
    category: 'creative',
    thumbnail: '🎠',
    requiredPlan: 'professional',
    isPremium: true,
    globalStyles: {
      headingFont: 'nunito',
      bodyFont: 'poppins',
      borderRadius: 'full',
      sectionSpacing: 'normal',
      buttonStyle: 'solid',
      cardShadow: 'lg',
      colorMode: 'light',
      accentStyle: 'pastel',
    },
    sectionIds: ['hero-1', 'categories-1', 'featured-1', 'banner-1', 'products-1', 'testimonials-1', 'newsletter-1'],
    previewColors: { primary: '#6366F1', secondary: '#EEF2FF', accent: '#818CF8' },
    tags: ['infantil', 'niños', 'colorido', 'divertido'],
  },

  // ═══════════════════════════════════════════════════
  // ENTERPRISE PLAN TEMPLATES - 15 templates
  // ═══════════════════════════════════════════════════
  {
    id: 'luxury-gold',
    name: 'Lujo Dorado',
    description: 'Diseño premium con acentos dorados y tipografía exclusiva. Para marcas de alto nivel que buscan transmitir exclusividad.',
    category: 'luxury',
    thumbnail: '👑',
    requiredPlan: 'enterprise',
    isPremium: true,
    globalStyles: {
      headingFont: 'playfair',
      bodyFont: 'montserrat',
      borderRadius: 'sm',
      sectionSpacing: 'spacious',
      buttonStyle: 'outline',
      cardShadow: 'glow',
      colorMode: 'light',
      accentStyle: 'bold',
    },
    sectionIds: ['hero-1', 'image-slider-1', 'categories-1', 'featured-1', 'testimonials-1', 'video-1', 'about-1', 'contact-1'],
    previewColors: { primary: '#B8860B', secondary: '#FFFBEB', accent: '#D4AF37' },
    tags: ['lujo', 'premium', 'dorado', 'exclusivo'],
  },
  {
    id: 'fashion-runway',
    name: 'Pasarela de Moda',
    description: 'Estilo editorial de alta costura con layout asimétrico. Para marcas de moda que buscan impactar.',
    category: 'elegant',
    thumbnail: '👗',
    requiredPlan: 'enterprise',
    isPremium: true,
    globalStyles: {
      headingFont: 'oswald',
      bodyFont: 'lora',
      borderRadius: 'none',
      sectionSpacing: 'relaxed',
      buttonStyle: 'ghost',
      cardShadow: 'none',
      colorMode: 'light',
      accentStyle: 'minimal',
    },
    sectionIds: ['hero-1', 'image-slider-1', 'featured-1', 'video-1', 'categories-1', 'testimonials-1', 'newsletter-1', 'contact-1'],
    previewColors: { primary: '#000000', secondary: '#FFFFFF', accent: '#4B5563' },
    tags: ['moda', 'editorial', 'runway', 'haute couture'],
  },
  {
    id: 'dark-premium',
    name: 'Premium Oscuro',
    description: 'Tema oscuro sofisticado con acentos luminosos. Transmite exclusividad y modernidad.',
    category: 'luxury',
    thumbnail: '🌙',
    requiredPlan: 'enterprise',
    isPremium: true,
    globalStyles: {
      headingFont: 'space-grotesk',
      bodyFont: 'inter',
      borderRadius: 'lg',
      sectionSpacing: 'normal',
      buttonStyle: 'gradient',
      cardShadow: 'glow',
      colorMode: 'dark',
      accentStyle: 'neon',
    },
    sectionIds: ['hero-1', 'video-1', 'featured-1', 'banner-1', 'products-1', 'faq-1', 'about-1', 'contact-1'],
    previewColors: { primary: '#8B5CF6', secondary: '#0F172A', accent: '#A78BFA' },
    tags: ['oscuro', 'premium', 'neon', 'moderno'],
  },
  {
    id: 'magazine-style',
    name: 'Estilo Revista',
    description: 'Layout editorial como revista de alta gama con tipografía elegante y espaciado cuidadoso.',
    category: 'elegant',
    thumbnail: '📰',
    requiredPlan: 'enterprise',
    isPremium: true,
    globalStyles: {
      headingFont: 'crimson-pro',
      bodyFont: 'poppins',
      borderRadius: 'sm',
      sectionSpacing: 'spacious',
      buttonStyle: 'solid',
      cardShadow: 'md',
      colorMode: 'light',
      accentStyle: 'minimal',
    },
    sectionIds: ['hero-1', 'image-slider-1', 'categories-1', 'featured-1', 'video-1', 'testimonials-1', 'about-1', 'newsletter-1', 'faq-1', 'contact-1'],
    previewColors: { primary: '#7C2D12', secondary: '#FEF3C7', accent: '#B45309' },
    tags: ['revista', 'editorial', 'elegante', 'clásico'],
  },
  {
    id: 'wellness-spa',
    name: 'Bienestar & Spa',
    description: 'Diseño relajante con colores suaves y espaciado generoso. Perfecto para wellness y autocuidado.',
    category: 'elegant',
    thumbnail: '🧘',
    requiredPlan: 'enterprise',
    isPremium: true,
    globalStyles: {
      headingFont: 'playfair',
      bodyFont: 'raleway',
      borderRadius: 'full',
      sectionSpacing: 'spacious',
      buttonStyle: 'outline',
      cardShadow: 'sm',
      colorMode: 'light',
      accentStyle: 'pastel',
    },
    sectionIds: ['hero-1', 'about-1', 'image-slider-1', 'featured-1', 'testimonials-1', 'video-1', 'faq-1', 'newsletter-1', 'contact-1'],
    previewColors: { primary: '#0D9488', secondary: '#F0FDFA', accent: '#14B8A6' },
    tags: ['wellness', 'spa', 'relax', 'bienestar'],
  },
  {
    id: 'urban-streetwear',
    name: 'Urban Streetwear Pro',
    description: 'Estética urbana audaz con elementos de cultura street. Para marcas de streetwear premium.',
    category: 'bold',
    thumbnail: '🛹',
    requiredPlan: 'enterprise',
    isPremium: true,
    globalStyles: {
      headingFont: 'oswald',
      bodyFont: 'poppins',
      borderRadius: 'none',
      sectionSpacing: 'compact',
      buttonStyle: '3d',
      cardShadow: 'xl',
      colorMode: 'dark',
      accentStyle: 'neon',
    },
    sectionIds: ['hero-1', 'video-1', 'categories-1', 'featured-1', 'banner-1', 'products-1', 'testimonials-1', 'newsletter-1', 'contact-1'],
    previewColors: { primary: '#EF4444', secondary: '#18181B', accent: '#F87171' },
    tags: ['streetwear', 'urban', 'street', 'audaz'],
  },
  {
    id: 'jewelry-exclusive',
    name: 'Joyería Exclusiva',
    description: 'Diseño elegante con detalles dorados para joyerías y accesorios de lujo.',
    category: 'luxury',
    thumbnail: '💎',
    requiredPlan: 'enterprise',
    isPremium: true,
    globalStyles: {
      headingFont: 'playfair',
      bodyFont: 'lora',
      borderRadius: 'sm',
      sectionSpacing: 'spacious',
      buttonStyle: 'outline',
      cardShadow: 'glow',
      colorMode: 'light',
      accentStyle: 'bold',
    },
    sectionIds: ['hero-1', 'image-slider-1', 'categories-1', 'featured-1', 'about-1', 'testimonials-1', 'newsletter-1', 'contact-1'],
    previewColors: { primary: '#854D0E', secondary: '#FEF9C3', accent: '#CA8A04' },
    tags: ['joyería', 'lujo', 'accesorios', 'elegante'],
  },
  {
    id: 'tech-dark',
    name: 'Tech Nocturno',
    description: 'Diseño futurista con tema oscuro y acentos neón. Para productos tecnológicos premium.',
    category: 'tech',
    thumbnail: '🔮',
    requiredPlan: 'enterprise',
    isPremium: true,
    globalStyles: {
      headingFont: 'space-grotesk',
      bodyFont: 'dm-sans',
      borderRadius: 'xl',
      sectionSpacing: 'relaxed',
      buttonStyle: 'gradient',
      cardShadow: 'glow',
      colorMode: 'dark',
      accentStyle: 'neon',
    },
    sectionIds: ['hero-1', 'video-1', 'featured-1', 'categories-1', 'products-1', 'faq-1', 'newsletter-1', 'contact-1'],
    previewColors: { primary: '#22D3EE', secondary: '#0F172A', accent: '#06B6D4' },
    tags: ['tech', 'futurista', 'oscuro', 'neón'],
  },
  {
    id: 'art-gallery',
    name: 'Galería de Arte',
    description: 'Diseño minimalista inspirado en galerías de arte. Espacios amplios que dejan brillar tus productos.',
    category: 'minimal',
    thumbnail: '🖼️',
    requiredPlan: 'enterprise',
    isPremium: true,
    globalStyles: {
      headingFont: 'crimson-pro',
      bodyFont: 'inter',
      borderRadius: 'none',
      sectionSpacing: 'spacious',
      buttonStyle: 'ghost',
      cardShadow: 'none',
      colorMode: 'light',
      accentStyle: 'minimal',
    },
    sectionIds: ['hero-1', 'image-slider-1', 'featured-1', 'about-1', 'testimonials-1', 'contact-1'],
    previewColors: { primary: '#1F2937', secondary: '#FFFFFF', accent: '#6B7280' },
    tags: ['arte', 'galería', 'minimalista', 'elegante'],
  },
  {
    id: 'wine-cellar',
    name: 'Bodega Premium',
    description: 'Diseño sofisticado para vinos, licores y productos gourmet de alta gama.',
    category: 'luxury',
    thumbnail: '🍷',
    requiredPlan: 'enterprise',
    isPremium: true,
    globalStyles: {
      headingFont: 'playfair',
      bodyFont: 'merriweather',
      borderRadius: 'sm',
      sectionSpacing: 'relaxed',
      buttonStyle: 'outline',
      cardShadow: 'lg',
      colorMode: 'dark',
      accentStyle: 'bold',
    },
    sectionIds: ['hero-1', 'about-1', 'categories-1', 'featured-1', 'image-slider-1', 'testimonials-1', 'faq-1', 'contact-1'],
    previewColors: { primary: '#9F1239', secondary: '#1F2937', accent: '#BE123C' },
    tags: ['vinos', 'bodega', 'gourmet', 'premium'],
  },
  {
    id: 'automotive-pro',
    name: 'Automotriz Pro',
    description: 'Diseño potente para concesionarias, autopartes y productos automotrices.',
    category: 'bold',
    thumbnail: '🏎️',
    requiredPlan: 'enterprise',
    isPremium: true,
    globalStyles: {
      headingFont: 'oswald',
      bodyFont: 'roboto',
      borderRadius: 'sm',
      sectionSpacing: 'compact',
      buttonStyle: 'solid',
      cardShadow: 'xl',
      colorMode: 'dark',
      accentStyle: 'bold',
    },
    sectionIds: ['hero-1', 'video-1', 'categories-1', 'featured-1', 'products-1', 'about-1', 'testimonials-1', 'faq-1', 'contact-1'],
    previewColors: { primary: '#B91C1C', secondary: '#111827', accent: '#DC2626' },
    tags: ['automotriz', 'autos', 'potente', 'deportivo'],
  },
  {
    id: 'organic-farm',
    name: 'Granja Orgánica',
    description: 'Diseño natural y fresco para productos orgánicos, granjas y alimentos naturales.',
    category: 'creative',
    thumbnail: '🌾',
    requiredPlan: 'enterprise',
    isPremium: true,
    globalStyles: {
      headingFont: 'lora',
      bodyFont: 'nunito',
      borderRadius: 'lg',
      sectionSpacing: 'relaxed',
      buttonStyle: 'solid',
      cardShadow: 'sm',
      colorMode: 'light',
      accentStyle: 'pastel',
    },
    sectionIds: ['hero-1', 'about-1', 'image-slider-1', 'categories-1', 'featured-1', 'testimonials-1', 'newsletter-1', 'contact-1'],
    previewColors: { primary: '#166534', secondary: '#F0FDF4', accent: '#22C55E' },
    tags: ['orgánico', 'natural', 'granja', 'verde'],
  },
  {
    id: 'gaming-zone',
    name: 'Gaming Zone',
    description: 'Diseño gaming con neón y efectos visuales impactantes. Para tiendas de videojuegos y accesorios.',
    category: 'tech',
    thumbnail: '🎮',
    requiredPlan: 'enterprise',
    isPremium: true,
    globalStyles: {
      headingFont: 'space-grotesk',
      bodyFont: 'poppins',
      borderRadius: 'lg',
      sectionSpacing: 'compact',
      buttonStyle: 'gradient',
      cardShadow: 'glow',
      colorMode: 'dark',
      accentStyle: 'neon',
    },
    sectionIds: ['hero-1', 'video-1', 'featured-1', 'categories-1', 'products-1', 'banner-1', 'faq-1', 'newsletter-1', 'contact-1'],
    previewColors: { primary: '#A855F7', secondary: '#0F0F0F', accent: '#C084FC' },
    tags: ['gaming', 'gamer', 'neón', 'tech'],
  },
  {
    id: 'wedding-elegant',
    name: 'Bodas Elegantes',
    description: 'Diseño romántico y elegante para productos de bodas, eventos y celebraciones.',
    category: 'elegant',
    thumbnail: '💒',
    requiredPlan: 'enterprise',
    isPremium: true,
    globalStyles: {
      headingFont: 'playfair',
      bodyFont: 'raleway',
      borderRadius: 'full',
      sectionSpacing: 'spacious',
      buttonStyle: 'outline',
      cardShadow: 'sm',
      colorMode: 'light',
      accentStyle: 'pastel',
    },
    sectionIds: ['hero-1', 'image-slider-1', 'about-1', 'categories-1', 'featured-1', 'testimonials-1', 'faq-1', 'newsletter-1', 'contact-1'],
    previewColors: { primary: '#BE185D', secondary: '#FDF2F8', accent: '#EC4899' },
    tags: ['bodas', 'eventos', 'elegante', 'romántico'],
  },
  {
    id: 'pet-paradise',
    name: 'Paraíso de Mascotas',
    description: 'Diseño amigable y colorido para tiendas de mascotas y productos para animales.',
    category: 'creative',
    thumbnail: '🐾',
    requiredPlan: 'enterprise',
    isPremium: true,
    globalStyles: {
      headingFont: 'nunito',
      bodyFont: 'poppins',
      borderRadius: 'full',
      sectionSpacing: 'normal',
      buttonStyle: 'solid',
      cardShadow: 'lg',
      colorMode: 'light',
      accentStyle: 'pastel',
    },
    sectionIds: ['hero-1', 'categories-1', 'featured-1', 'image-slider-1', 'products-1', 'testimonials-1', 'about-1', 'newsletter-1', 'contact-1'],
    previewColors: { primary: '#0891B2', secondary: '#ECFEFF', accent: '#06B6D4' },
    tags: ['mascotas', 'animales', 'colorido', 'amigable'],
  },
];

export interface StoreSection {
  id: string;
  type: SectionType;
  title: string;
  enabled: boolean;
  settings: Record<string, any>;
}

export interface StoreLayout {
  id: string;
  store_id: string;
  sections: StoreSection[];
  globalStyles?: GlobalStyles;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_SECTIONS: StoreSection[] = [
  {
    id: 'hero-1',
    type: 'hero',
    title: 'Banner Principal',
    enabled: true,
    settings: {
      headline: '¡Bienvenido a nuestra tienda!',
      subtitle: 'Descubre los mejores productos',
      showButton: true,
      buttonText: 'Ver productos',
      backgroundType: 'gradient'
    }
  },
  {
    id: 'categories-1',
    type: 'categories',
    title: 'Categorías',
    enabled: true,
    settings: {
      columns: 4,
      showDescription: true
    }
  },
  {
    id: 'featured-1',
    type: 'featured_products',
    title: 'Productos Destacados',
    enabled: true,
    settings: {
      limit: 8,
      showPrice: true,
      showBadges: true
    }
  },
  {
    id: 'banner-1',
    type: 'banner',
    title: 'Banner Promocional',
    enabled: true,
    settings: {
      text: '¡Envío gratis en compras mayores a $999!',
      backgroundColor: 'primary'
    }
  },
  {
    id: 'products-1',
    type: 'products_grid',
    title: 'Todos los Productos',
    enabled: true,
    settings: {
      showFilters: true,
      columns: 4
    }
  },
  {
    id: 'newsletter-1',
    type: 'newsletter',
    title: 'Newsletter',
    enabled: false,
    settings: {
      headline: 'Suscríbete a nuestro boletín',
      subtitle: 'Recibe ofertas exclusivas'
    }
  },
  {
    id: 'about-1',
    type: 'about',
    title: 'Sobre Nosotros',
    enabled: false,
    settings: {
      content: 'Somos una tienda comprometida con la calidad...'
    }
  },
  {
    id: 'contact-1',
    type: 'contact',
    title: 'Contacto',
    enabled: true,
    settings: {
      showMap: false,
      showSocial: true
    }
  },
  {
    id: 'testimonials-1',
    type: 'testimonials',
    title: 'Testimonios',
    enabled: false,
    settings: {
      headline: 'Lo que dicen nuestros clientes',
      subtitle: 'Opiniones reales de clientes satisfechos',
      columns: 3
    }
  },
  {
    id: 'image-slider-1',
    type: 'image_slider',
    title: 'Galería de Imágenes',
    enabled: false,
    settings: {
      autoplay: true,
      interval: 5000,
      showCaptions: true,
      aspectRatio: '16/9'
    }
  },
  {
    id: 'video-1',
    type: 'video',
    title: 'Video de Presentación',
    enabled: false,
    settings: {
      videoUrl: '',
      youtubeId: '',
      autoplay: false,
      loop: true,
      showControls: true
    }
  },
  {
    id: 'faq-1',
    type: 'faq',
    title: 'Preguntas Frecuentes',
    enabled: false,
    settings: {
      headline: 'Preguntas Frecuentes',
      subtitle: 'Encuentra respuestas a las preguntas más comunes'
    }
  },
  // Professional sections defaults
  {
    id: 'countdown-timer-1',
    type: 'countdown_timer',
    title: 'Temporizador de Oferta',
    enabled: false,
    settings: {
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      headline: '¡Oferta por tiempo limitado!',
      subtitle: 'No te pierdas estos descuentos increíbles'
    }
  },
  {
    id: 'instagram-feed-1',
    type: 'instagram_feed',
    title: 'Feed de Instagram',
    enabled: false,
    settings: {
      columns: 4,
      showHandle: true
    }
  },
  {
    id: 'brand-logos-1',
    type: 'brand_logos',
    title: 'Marcas Asociadas',
    enabled: false,
    settings: {
      headline: 'Marcas que confían en nosotros',
      autoplay: true
    }
  },
  {
    id: 'comparison-table-1',
    type: 'comparison_table',
    title: 'Tabla Comparativa',
    enabled: false,
    settings: {
      headline: 'Compara nuestros planes',
      columns: 3
    }
  },
  {
    id: 'popup-banner-1',
    type: 'popup_banner',
    title: 'Banner Emergente',
    enabled: false,
    settings: {
      headline: '¡Bienvenido!',
      subtitle: 'Obtén 10% de descuento en tu primera compra',
      showOnce: true,
      delay: 3000
    }
  },
  // Enterprise sections defaults
  {
    id: 'parallax-hero-1',
    type: 'parallax_hero',
    title: 'Hero Parallax',
    enabled: false,
    settings: {
      headline: 'Experiencia Premium',
      subtitle: 'Descubre nuestra colección exclusiva',
      parallaxIntensity: 'medium'
    }
  },
  {
    id: 'interactive-gallery-1',
    type: 'interactive_gallery',
    title: 'Galería Interactiva',
    enabled: false,
    settings: {
      enableLightbox: true,
      enableZoom: true,
      columns: 3
    }
  },
  {
    id: 'animated-stats-1',
    type: 'animated_stats',
    title: 'Estadísticas Animadas',
    enabled: false,
    settings: {
      stats: [
        { label: 'Clientes felices', value: 10000, suffix: '+' },
        { label: 'Productos vendidos', value: 50000, suffix: '+' },
        { label: 'Años de experiencia', value: 10, suffix: '' }
      ]
    }
  },
  {
    id: 'customer-reviews-carousel-1',
    type: 'customer_reviews_carousel',
    title: 'Carrusel de Reseñas',
    enabled: false,
    settings: {
      autoplay: true,
      showRating: true,
      showPhoto: true
    }
  },
  {
    id: 'loyalty-program-1',
    type: 'loyalty_program',
    title: 'Programa de Lealtad',
    enabled: false,
    settings: {
      headline: 'Únete a nuestro programa de recompensas',
      pointsPerDollar: 1,
      showTiers: true
    }
  }
];

// Helper function to check if a section is available for a plan
export const canUseSectionType = (sectionType: SectionType, userPlan: PlanTier): boolean => {
  const config = SECTION_CONFIGS.find(s => s.type === sectionType);
  if (!config) return true;
  
  const planHierarchy: Record<PlanTier, number> = {
    basic: 0,
    professional: 1,
    enterprise: 2,
  };
  
  return planHierarchy[userPlan] >= planHierarchy[config.requiredPlan];
};

// Get sections available for a specific plan
export const getSectionsForPlan = (userPlan: PlanTier): SectionConfig[] => {
  return SECTION_CONFIGS.filter(section => canUseSectionType(section.type, userPlan));
};

// Get all sections with availability info
export const getSectionsWithAvailability = (userPlan: PlanTier): (SectionConfig & { available: boolean })[] => {
  return SECTION_CONFIGS.map(section => ({
    ...section,
    available: canUseSectionType(section.type, userPlan),
  }));
};
