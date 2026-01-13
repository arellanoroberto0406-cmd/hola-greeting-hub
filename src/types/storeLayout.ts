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
