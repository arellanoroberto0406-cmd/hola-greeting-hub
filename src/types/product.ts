export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  stock: number;
  priceAdjustment: number;
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  colors: string[];
  collection: string;
  stock: number;
  description: string;
  isNew?: boolean;
  isOnSale?: boolean;
  rating?: number;
  reviewCount?: number;
  reviews?: Review[];
  materials?: string;
  features?: string[];
  variants?: ProductVariant[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
  selectedVariant?: ProductVariant;
}

export type FilterOptions = {
  colors: string[];
  collections: string[];
  priceRange: [number, number];
  inStock: boolean;
};
