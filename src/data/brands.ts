import { Product } from "@/types/product";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo?: string;
  bannerImage: string;
  tagline: string;
}

export const brands: Brand[] = [
  {
    id: "barbahats",
    name: "BarbaHats",
    slug: "barbahats",
    description: "Gorras premium con estilo único y materiales de primera calidad. Diseños exclusivos para quienes buscan destacar.",
    bannerImage: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=1920&h=600&fit=crop",
    tagline: "Estilo que define tu personalidad"
  },
  {
    id: "gallofino",
    name: "GalloFino",
    slug: "gallofino",
    description: "Colección elegante inspirada en la tradición mexicana. Calidad artesanal con toques modernos.",
    bannerImage: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=1920&h=600&fit=crop",
    tagline: "Tradición con estilo contemporáneo"
  },
  {
    id: "jchats",
    name: "JC Hats",
    slug: "jchats",
    description: "Diseños urbanos y streetwear para los amantes del estilo callejero. Gorras con actitud.",
    bannerImage: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=1920&h=600&fit=crop",
    tagline: "Urban style, premium quality"
  }
];

// Productos por marca
export const barbaHatsProducts: Product[] = [
  {
    id: "bh-1",
    name: "BarbaHats Classic Black",
    price: 899,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=600&fit=crop"],
    colors: ["Negro", "Gris"],
    collection: "BarbaHats",
    stock: 35,
    description: "Gorra clásica BarbaHats en negro con bordado premium. El icono de la marca.",
    isNew: true,
    rating: 4.9,
    reviewCount: 45,
    materials: "100% algodón premium, bordado 3D",
    features: ["Bordado exclusivo", "Ajuste perfecto", "Materiales premium"],
  },
  {
    id: "bh-2",
    name: "BarbaHats Gold Edition",
    price: 1299,
    image: "https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=500&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=500&h=600&fit=crop"],
    colors: ["Negro/Dorado", "Blanco/Dorado"],
    collection: "BarbaHats",
    stock: 15,
    description: "Edición limitada con detalles en dorado. Para los más exclusivos.",
    rating: 5.0,
    reviewCount: 28,
    materials: "Algodón premium con hilos dorados",
    features: ["Edición limitada", "Detalles dorados", "Empaque especial"],
  },
  {
    id: "bh-3",
    name: "BarbaHats Sport",
    price: 749,
    originalPrice: 899,
    image: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=500&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=500&h=600&fit=crop"],
    colors: ["Negro", "Azul", "Rojo"],
    collection: "BarbaHats",
    stock: 42,
    description: "Línea deportiva BarbaHats. Perfecta para entrenar con estilo.",
    isOnSale: true,
    rating: 4.7,
    reviewCount: 33,
    materials: "Material técnico transpirable",
    features: ["Transpirable", "Secado rápido", "Ligera"],
  },
  {
    id: "bh-4",
    name: "BarbaHats Urban Camo",
    price: 949,
    image: "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=500&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=500&h=600&fit=crop"],
    colors: ["Camuflaje", "Verde Militar"],
    collection: "BarbaHats",
    stock: 25,
    description: "Diseño urbano con patrón camuflaje. Estilo streetwear auténtico.",
    rating: 4.6,
    reviewCount: 19,
    materials: "Algodón con estampado de alta definición",
    features: ["Diseño único", "Streetwear", "Versátil"],
  },
];

export const galloFinoProducts: Product[] = [
  {
    id: "gf-1",
    name: "GalloFino Tradición",
    price: 999,
    image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=500&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1521369909029-2afed882baee?w=500&h=600&fit=crop"],
    colors: ["Negro", "Café", "Beige"],
    collection: "GalloFino",
    stock: 30,
    description: "Gorra artesanal GalloFino con bordado tradicional mexicano.",
    isNew: true,
    rating: 4.8,
    reviewCount: 52,
    materials: "Algodón mexicano con bordado artesanal",
    features: ["Bordado a mano", "Diseño tradicional", "Hecho en México"],
  },
  {
    id: "gf-2",
    name: "GalloFino Elite",
    price: 1199,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=600&fit=crop"],
    colors: ["Negro Premium", "Blanco Premium"],
    collection: "GalloFino",
    stock: 20,
    description: "La línea más exclusiva de GalloFino. Materiales de lujo.",
    rating: 4.9,
    reviewCount: 38,
    materials: "Algodón pima con acabados de lujo",
    features: ["Premium", "Acabados de lujo", "Exclusivo"],
  },
  {
    id: "gf-3",
    name: "GalloFino Clásica",
    price: 699,
    originalPrice: 899,
    image: "https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=500&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=500&h=600&fit=crop"],
    colors: ["Negro", "Gris", "Azul Marino"],
    collection: "GalloFino",
    stock: 55,
    description: "El modelo clásico de GalloFino. Calidad garantizada.",
    isOnSale: true,
    rating: 4.7,
    reviewCount: 67,
    materials: "100% algodón de alta calidad",
    features: ["Clásico", "Versátil", "Duradero"],
  },
  {
    id: "gf-4",
    name: "GalloFino Fiesta",
    price: 849,
    image: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=500&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=500&h=600&fit=crop"],
    colors: ["Multicolor", "Rojo/Verde"],
    collection: "GalloFino",
    stock: 28,
    description: "Colores vibrantes inspirados en las fiestas mexicanas.",
    rating: 4.5,
    reviewCount: 24,
    materials: "Algodón con bordado multicolor",
    features: ["Colores vibrantes", "Festivo", "Original"],
  },
];

export const jcHatsProducts: Product[] = [
  {
    id: "jc-1",
    name: "JC Hats Street King",
    price: 799,
    image: "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=500&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=500&h=600&fit=crop"],
    colors: ["Negro", "Blanco", "Gris"],
    collection: "JC Hats",
    stock: 45,
    description: "El modelo insignia de JC Hats. Estilo urbano puro.",
    isNew: true,
    rating: 4.8,
    reviewCount: 41,
    materials: "Algodón con estampado de alta calidad",
    features: ["Streetwear", "Diseño urbano", "Trending"],
  },
  {
    id: "jc-2",
    name: "JC Hats Graffiti",
    price: 899,
    image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=500&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1521369909029-2afed882baee?w=500&h=600&fit=crop"],
    colors: ["Multicolor", "Negro/Neon"],
    collection: "JC Hats",
    stock: 32,
    description: "Arte urbano en tu cabeza. Diseño graffiti exclusivo.",
    rating: 4.6,
    reviewCount: 29,
    materials: "Algodón con arte impreso de alta definición",
    features: ["Arte urbano", "Exclusivo", "Llamativo"],
  },
  {
    id: "jc-3",
    name: "JC Hats Minimal",
    price: 649,
    originalPrice: 799,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=600&fit=crop"],
    colors: ["Negro", "Blanco", "Beige"],
    collection: "JC Hats",
    stock: 60,
    description: "Minimalismo urbano. Menos es más.",
    isOnSale: true,
    rating: 4.7,
    reviewCount: 55,
    materials: "Algodón premium suave",
    features: ["Minimalista", "Elegante", "Versátil"],
  },
  {
    id: "jc-4",
    name: "JC Hats Neon Nights",
    price: 949,
    image: "https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=500&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=500&h=600&fit=crop"],
    colors: ["Negro/Neon Verde", "Negro/Neon Rosa"],
    collection: "JC Hats",
    stock: 22,
    description: "Brilla en la noche. Detalles neón que destacan.",
    isNew: true,
    rating: 4.9,
    reviewCount: 18,
    materials: "Material reflectante con detalles neón",
    features: ["Reflectante", "Neón", "Nocturno"],
  },
];

export const getBrandBySlug = (slug: string): Brand | undefined => {
  return brands.find(b => b.slug === slug);
};

export const getProductsByBrand = (slug: string): Product[] => {
  switch (slug) {
    case "barbahats":
      return barbaHatsProducts;
    case "gallofino":
      return galloFinoProducts;
    case "jchats":
      return jcHatsProducts;
    default:
      return [];
  }
};
