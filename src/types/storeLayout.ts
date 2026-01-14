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
  | 'faq';

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
  | 'nunito';

export type AnimationType = 
  | 'none'
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom'
  | 'bounce';

export interface SectionBackground {
  type: 'none' | 'solid' | 'gradient' | 'pattern';
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  gradientDirection?: 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-br' | 'to-bl' | 'to-tr' | 'to-tl';
  pattern?: 'dots' | 'grid' | 'waves' | 'none';
  opacity?: number;
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
  { value: 'custom', label: 'Personalizado', color: 'custom' },
];

export interface GlobalStyles {
  headingFont: FontFamily;
  bodyFont: FontFamily;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  sectionSpacing: 'compact' | 'normal' | 'relaxed' | 'spacious';
  buttonStyle: 'solid' | 'outline' | 'ghost';
  cardShadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const DEFAULT_GLOBAL_STYLES: GlobalStyles = {
  headingFont: 'oswald',
  bodyFont: 'montserrat',
  borderRadius: 'lg',
  sectionSpacing: 'normal',
  buttonStyle: 'solid',
  cardShadow: 'md',
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
];

// Design Templates
export interface DesignTemplate {
  id: string;
  name: string;
  description: string;
  category: 'modern' | 'classic' | 'minimal' | 'bold' | 'elegant';
  thumbnail: string;
  globalStyles: GlobalStyles;
  sectionIds: string[];
  requiredPlan?: 'basic' | 'professional' | 'enterprise'; // undefined = free for all
  isPremium?: boolean;
}

export const DESIGN_TEMPLATES: DesignTemplate[] = [
  // FREE TEMPLATES (Basic Plan)
  {
    id: 'modern-minimal',
    name: 'Moderno Minimalista',
    description: 'Diseño limpio y espacioso con énfasis en el contenido',
    category: 'minimal',
    thumbnail: '🎯',
    globalStyles: {
      headingFont: 'inter',
      bodyFont: 'inter',
      borderRadius: 'lg',
      sectionSpacing: 'relaxed',
      buttonStyle: 'solid',
      cardShadow: 'sm',
    },
    sectionIds: ['hero-1', 'featured-1', 'banner-1', 'newsletter-1', 'contact-1'],
  },
  {
    id: 'friendly-casual',
    name: 'Casual Amigable',
    description: 'Bordes redondeados y aspecto accesible',
    category: 'modern',
    thumbnail: '😊',
    globalStyles: {
      headingFont: 'nunito',
      bodyFont: 'nunito',
      borderRadius: 'full',
      sectionSpacing: 'normal',
      buttonStyle: 'solid',
      cardShadow: 'md',
    },
    sectionIds: ['hero-1', 'categories-1', 'featured-1', 'testimonials-1', 'newsletter-1'],
  },
  {
    id: 'classic-professional',
    name: 'Clásico Profesional',
    description: 'Estilo corporativo y confiable',
    category: 'classic',
    thumbnail: '💼',
    globalStyles: {
      headingFont: 'merriweather',
      bodyFont: 'roboto',
      borderRadius: 'md',
      sectionSpacing: 'normal',
      buttonStyle: 'solid',
      cardShadow: 'sm',
    },
    sectionIds: ['hero-1', 'about-1', 'featured-1', 'products-1', 'contact-1'],
  },

  // PROFESSIONAL PLAN TEMPLATES
  {
    id: 'elegant-boutique',
    name: 'Boutique Elegante',
    description: 'Tipografía refinada ideal para moda y lujo',
    category: 'elegant',
    thumbnail: '✨',
    requiredPlan: 'professional',
    isPremium: true,
    globalStyles: {
      headingFont: 'playfair',
      bodyFont: 'lora',
      borderRadius: 'sm',
      sectionSpacing: 'spacious',
      buttonStyle: 'outline',
      cardShadow: 'none',
    },
    sectionIds: ['hero-1', 'categories-1', 'featured-1', 'testimonials-1', 'about-1', 'contact-1'],
  },
  {
    id: 'bold-impact',
    name: 'Impacto Audaz',
    description: 'Estilo llamativo con sombras pronunciadas',
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
    },
    sectionIds: ['hero-1', 'banner-1', 'featured-1', 'products-1', 'faq-1', 'contact-1'],
  },
  {
    id: 'tech-startup',
    name: 'Tech Startup',
    description: 'Moderno y tecnológico con gradientes sutiles',
    category: 'modern',
    thumbnail: '🚀',
    requiredPlan: 'professional',
    isPremium: true,
    globalStyles: {
      headingFont: 'poppins',
      bodyFont: 'inter',
      borderRadius: 'xl',
      sectionSpacing: 'relaxed',
      buttonStyle: 'solid',
      cardShadow: 'lg',
    },
    sectionIds: ['hero-1', 'featured-1', 'video-1', 'faq-1', 'newsletter-1', 'contact-1'],
  },
  {
    id: 'artisan-craft',
    name: 'Artesanal',
    description: 'Cálido y artesanal para productos hechos a mano',
    category: 'classic',
    thumbnail: '🎨',
    requiredPlan: 'professional',
    isPremium: true,
    globalStyles: {
      headingFont: 'lora',
      bodyFont: 'raleway',
      borderRadius: 'sm',
      sectionSpacing: 'spacious',
      buttonStyle: 'outline',
      cardShadow: 'sm',
    },
    sectionIds: ['hero-1', 'about-1', 'image-slider-1', 'featured-1', 'testimonials-1', 'contact-1'],
  },
  {
    id: 'vibrant-store',
    name: 'Tienda Vibrante',
    description: 'Colorido y energético para productos juveniles',
    category: 'bold',
    thumbnail: '🌈',
    requiredPlan: 'professional',
    isPremium: true,
    globalStyles: {
      headingFont: 'montserrat',
      bodyFont: 'poppins',
      borderRadius: 'lg',
      sectionSpacing: 'compact',
      buttonStyle: 'solid',
      cardShadow: 'md',
    },
    sectionIds: ['hero-1', 'categories-1', 'banner-1', 'featured-1', 'products-1', 'newsletter-1'],
  },
  {
    id: 'nordic-clean',
    name: 'Nórdico Limpio',
    description: 'Estilo escandinavo minimalista con espacios amplios',
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
    },
    sectionIds: ['hero-1', 'featured-1', 'about-1', 'products-1', 'newsletter-1'],
  },

  // ENTERPRISE PLAN TEMPLATES
  {
    id: 'luxury-gold',
    name: 'Lujo Dorado',
    description: 'Diseño premium con toques dorados para marcas de alto nivel',
    category: 'elegant',
    thumbnail: '👑',
    requiredPlan: 'enterprise',
    isPremium: true,
    globalStyles: {
      headingFont: 'playfair',
      bodyFont: 'montserrat',
      borderRadius: 'sm',
      sectionSpacing: 'spacious',
      buttonStyle: 'outline',
      cardShadow: 'lg',
    },
    sectionIds: ['hero-1', 'image-slider-1', 'categories-1', 'featured-1', 'testimonials-1', 'video-1', 'about-1', 'contact-1'],
  },
  {
    id: 'fashion-runway',
    name: 'Pasarela de Moda',
    description: 'Estilo editorial de alta costura para marcas de moda',
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
    },
    sectionIds: ['hero-1', 'image-slider-1', 'featured-1', 'video-1', 'categories-1', 'testimonials-1', 'newsletter-1', 'contact-1'],
  },
  {
    id: 'dark-premium',
    name: 'Premium Oscuro',
    description: 'Tema oscuro sofisticado para productos exclusivos',
    category: 'bold',
    thumbnail: '🌙',
    requiredPlan: 'enterprise',
    isPremium: true,
    globalStyles: {
      headingFont: 'poppins',
      bodyFont: 'inter',
      borderRadius: 'lg',
      sectionSpacing: 'normal',
      buttonStyle: 'solid',
      cardShadow: 'xl',
    },
    sectionIds: ['hero-1', 'video-1', 'featured-1', 'banner-1', 'products-1', 'faq-1', 'about-1', 'contact-1'],
  },
  {
    id: 'magazine-style',
    name: 'Estilo Revista',
    description: 'Layout editorial como revista de alta gama',
    category: 'modern',
    thumbnail: '📰',
    requiredPlan: 'enterprise',
    isPremium: true,
    globalStyles: {
      headingFont: 'merriweather',
      bodyFont: 'poppins',
      borderRadius: 'sm',
      sectionSpacing: 'spacious',
      buttonStyle: 'solid',
      cardShadow: 'md',
    },
    sectionIds: ['hero-1', 'image-slider-1', 'categories-1', 'featured-1', 'video-1', 'testimonials-1', 'about-1', 'newsletter-1', 'faq-1', 'contact-1'],
  },
  {
    id: 'wellness-spa',
    name: 'Bienestar & Spa',
    description: 'Diseño relajante para productos de salud y bienestar',
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
    },
    sectionIds: ['hero-1', 'about-1', 'image-slider-1', 'featured-1', 'testimonials-1', 'video-1', 'faq-1', 'newsletter-1', 'contact-1'],
  },
  {
    id: 'urban-streetwear',
    name: 'Urban Streetwear',
    description: 'Estilo urbano audaz para marcas de streetwear',
    category: 'bold',
    thumbnail: '🛹',
    requiredPlan: 'enterprise',
    isPremium: true,
    globalStyles: {
      headingFont: 'oswald',
      bodyFont: 'poppins',
      borderRadius: 'none',
      sectionSpacing: 'compact',
      buttonStyle: 'solid',
      cardShadow: 'xl',
    },
    sectionIds: ['hero-1', 'video-1', 'categories-1', 'featured-1', 'banner-1', 'products-1', 'testimonials-1', 'newsletter-1', 'contact-1'],
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
  }
];
