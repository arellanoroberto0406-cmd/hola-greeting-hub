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
  | 'custom_text';

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
  }
];
