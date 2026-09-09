import { useCallback, useEffect, useState } from "react";

export const MT_BRAND = "MiTienda";
export const MT_DOMAIN = "mitienda.mx";

export type StyleKey = "moderna" | "elegante" | "minimalista" | "juvenil" | "colorida" | "premium";

export interface StorePreset {
  key: StyleKey;
  label: string;
  primary: string;
  ink: string;
  surface: string;
  font: string;
  radius: string;
}

export const STYLE_PRESETS: StorePreset[] = [
  { key: "moderna", label: "Moderna", primary: "#3b46f1", ink: "#0f172a", surface: "#f3f5ff", font: "Inter", radius: "14px" },
  { key: "elegante", label: "Elegante", primary: "#9a7b4f", ink: "#1c1917", surface: "#faf6f0", font: "Playfair Display", radius: "6px" },
  { key: "minimalista", label: "Minimalista", primary: "#111827", ink: "#111827", surface: "#f7f7f7", font: "Inter", radius: "4px" },
  { key: "juvenil", label: "Juvenil", primary: "#f43f5e", ink: "#18181b", surface: "#fff1f4", font: "Poppins", radius: "22px" },
  { key: "colorida", label: "Colorida", primary: "#7c3aed", ink: "#1e1b4b", surface: "#fdf4ff", font: "Poppins", radius: "20px" },
  { key: "premium", label: "Premium", primary: "#0f766e", ink: "#052e2b", surface: "#effcf9", font: "Manrope", radius: "10px" },
];

export interface CategoryDef {
  key: string;
  label: string;
  emoji: string;
  products: { name: string; price: number; emoji: string }[];
}

export const CATEGORIES: CategoryDef[] = [
  { key: "ropa", label: "Ropa", emoji: "👕", products: [
    { name: "Hoodie Urban", price: 699, emoji: "🧥" },
    { name: "Playera Basic", price: 499, emoji: "👕" },
    { name: "Gorra Minimal", price: 399, emoji: "🧢" },
    { name: "Jeans Slim", price: 899, emoji: "👖" },
  ] },
  { key: "calzado", label: "Calzado", emoji: "👟", products: [
    { name: "Tenis Classic", price: 1299, emoji: "👟" },
    { name: "Botas Trail", price: 1699, emoji: "🥾" },
    { name: "Sandalias Sol", price: 549, emoji: "🩴" },
    { name: "Zapato Formal", price: 1499, emoji: "👞" },
  ] },
  { key: "belleza", label: "Belleza", emoji: "💄", products: [
    { name: "Serum Facial", price: 380, emoji: "🧴" },
    { name: "Labial Mate", price: 220, emoji: "💄" },
    { name: "Kit Skincare", price: 890, emoji: "🧖" },
    { name: "Perfume Nube", price: 1250, emoji: "🌸" },
  ] },
  { key: "comida", label: "Comida", emoji: "🍰", products: [
    { name: "Pastel Chocolate", price: 450, emoji: "🍰" },
    { name: "Caja Postres", price: 320, emoji: "🧁" },
    { name: "Café de Origen", price: 260, emoji: "☕" },
    { name: "Snack Box", price: 199, emoji: "🍪" },
  ] },
  { key: "tecnologia", label: "Tecnología", emoji: "🎧", products: [
    { name: "Audífonos Pro", price: 1999, emoji: "🎧" },
    { name: "Teclado Mini", price: 899, emoji: "⌨️" },
    { name: "Cargador GaN", price: 549, emoji: "🔌" },
    { name: "Smartwatch", price: 2490, emoji: "⌚" },
  ] },
  { key: "hogar", label: "Hogar", emoji: "🪴", products: [
    { name: "Maceta Minimal", price: 320, emoji: "🪴" },
    { name: "Velas Aromáticas", price: 280, emoji: "🕯️" },
    { name: "Lámpara Nórdica", price: 1250, emoji: "💡" },
    { name: "Cojín Textil", price: 390, emoji: "🛋️" },
  ] },
  { key: "servicios", label: "Servicios", emoji: "🛠️", products: [
    { name: "Sesión de fotos", price: 1500, emoji: "📸" },
    { name: "Asesoría 1 hora", price: 800, emoji: "💬" },
    { name: "Mantenimiento", price: 650, emoji: "🛠️" },
    { name: "Clase privada", price: 450, emoji: "🎓" },
  ] },
  { key: "digitales", label: "Productos digitales", emoji: "💾", products: [
    { name: "Curso completo", price: 990, emoji: "🎬" },
    { name: "Plantillas Pack", price: 350, emoji: "📁" },
    { name: "Ebook guía", price: 190, emoji: "📘" },
    { name: "Presets Foto", price: 250, emoji: "🎨" },
  ] },
  { key: "otro", label: "Otro", emoji: "✨", products: [
    { name: "Producto uno", price: 350, emoji: "📦" },
    { name: "Producto dos", price: 520, emoji: "🎁" },
    { name: "Producto tres", price: 780, emoji: "🛍️" },
    { name: "Producto cuatro", price: 990, emoji: "✨" },
  ] },
];

export const SELL_MODES = [
  { key: "completa", label: "Tienda completa", desc: "Tu catálogo, pagos y envíos", emoji: "🏬" },
  { key: "whatsapp", label: "Catálogo + WhatsApp", desc: "Muestra productos y recibe pedidos", emoji: "💬" },
  { key: "reservas", label: "Reservaciones / servicios", desc: "Citas, horarios y reservas", emoji: "📅" },
  { key: "digitales", label: "Productos digitales", desc: "Descargas automáticas", emoji: "⬇️" },
  { key: "mixta", label: "Tienda física + online", desc: "Integra tu negocio físico y digital", emoji: "🏪" },
];

export const CHANNELS = [
  { key: "whatsapp", label: "WhatsApp", emoji: "💚" },
  { key: "instagram", label: "Instagram", emoji: "📸" },
  { key: "facebook", label: "Facebook", emoji: "🔵" },
  { key: "tiktok", label: "TikTok", emoji: "🎵" },
  { key: "fisica", label: "Tienda física", emoji: "🏠" },
  { key: "empezando", label: "Voy empezando", emoji: "🚀" },
];

export interface PlanDef {
  key: string;
  name: string;
  price: number;
  pitch: string;
  features: string[];
}

export const PLANS: PlanDef[] = [
  { key: "gratis", name: "Gratis", price: 0, pitch: "Publica tu tienda con las herramientas esenciales.", features: ["1 producto o catálogo básico", "Plantillas profesionales", `Tu propio enlace (${MT_DOMAIN}/tu-nombre)`, "Cobros en línea", "Soporte por email"] },
  { key: "basico", name: "Básico", price: 99, pitch: "Ideal para dar tus primeros pasos con más productos.", features: ["Hasta 30 productos", "Cupones básicos", "Soporte por email"] },
  { key: "emprende", name: "Emprende", price: 199, pitch: "Más herramientas para hacer crecer tu negocio.", features: ["Hasta 150 productos", "Gestión de envíos", "Reportes básicos"] },
  { key: "crecimiento", name: "Crecimiento", price: 299, pitch: "Porque quieres administrar catálogo, envíos, promociones y conocer tus ventas.", features: ["Productos ilimitados", "Gestión de envíos y zonas de entrega", "Promociones, cupones y descuentos", "Reportes de ventas y clientes", "Soporte prioritario"] },
  { key: "pro", name: "Pro", price: 499, pitch: "Funciones avanzadas para negocios en expansión.", features: ["Automatizaciones", "Recuperación de carritos", "Colaboradores"] },
  { key: "negocio", name: "Negocio", price: 999, pitch: "La solución completa para marcas establecidas.", features: ["Todo lo de Pro", "Estadísticas avanzadas", "Soporte dedicado"] },
];

export interface StoreDraft {
  step: number;
  name: string;
  slug: string;
  categories: string[];
  sellMode: string;
  channels: string[];
  style: StyleKey;
  identityReady: boolean;
  logoName: string | null;
  tagline: string;
  productChoice: string | null;
  plan: string | null;
  contact: { email: string; phone: string; address: string };
  delivery: string[];
  payments: string[];
  policies: boolean;
  firstProduct: boolean;
  published: boolean;
}

export const EMPTY_DRAFT: StoreDraft = {
  step: 1,
  name: "",
  slug: "",
  categories: [],
  sellMode: "",
  channels: [],
  style: "moderna",
  identityReady: false,
  logoName: null,
  tagline: "Moderno. Cercano. Para todos los días.",
  productChoice: null,
  plan: null,
  contact: { email: "", phone: "", address: "" },
  delivery: [],
  payments: [],
  policies: false,
  firstProduct: false,
  published: false,
};

const KEY = "mitienda-draft-v1";

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 30);

export const readDraft = (): StoreDraft => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY_DRAFT;
    return { ...EMPTY_DRAFT, ...(JSON.parse(raw) as Partial<StoreDraft>) };
  } catch {
    return EMPTY_DRAFT;
  }
};

export const useStoreDraft = () => {
  const [draft, setDraft] = useState<StoreDraft>(() => readDraft());

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(draft));
    } catch {
      /* almacenamiento opcional */
    }
  }, [draft]);

  const patch = useCallback((value: Partial<StoreDraft>) => {
    setDraft((current) => ({ ...current, ...value }));
  }, []);

  const reset = useCallback(() => setDraft(EMPTY_DRAFT), []);

  return { draft, patch, reset };
};

export const presetFor = (style: StyleKey) =>
  STYLE_PRESETS.find((item) => item.key === style) || STYLE_PRESETS[0];

export const categoriesFor = (keys: string[]) => {
  const picked = CATEGORIES.filter((item) => keys.includes(item.key));
  return picked.length ? picked : [CATEGORIES[0], CATEGORIES[5], CATEGORIES[2]];
};

export const productsFor = (keys: string[]) =>
  categoriesFor(keys)
    .flatMap((category) => category.products)
    .slice(0, 8);

export const checklistOf = (draft: StoreDraft) => [
  { key: "nombre", label: "Nombre y logo", hint: draft.name || "Elige el nombre de tu tienda", done: Boolean(draft.name && draft.identityReady) },
  { key: "diseno", label: "Diseño", hint: `Plantilla ${presetFor(draft.style).label}`, done: Boolean(draft.style && draft.identityReady) },
  { key: "producto", label: "Primer producto", hint: draft.firstProduct ? "Listo" : "Agrega al menos un producto", done: draft.firstProduct },
  { key: "contacto", label: "Información de contacto", hint: "Agrega un correo, teléfono y dirección", done: Boolean(draft.contact.email && draft.contact.phone) },
  { key: "entregas", label: "Entregas", hint: "Configura tus métodos y zonas de envío", done: draft.delivery.length > 0 },
  { key: "pagos", label: "Pagos (opcional)", hint: "Activa pagos en línea para vender sin límites", done: draft.payments.length > 0, optional: true },
  { key: "politicas", label: "Políticas", hint: "Cambios, devoluciones y privacidad", done: draft.policies },
];

export const progressOf = (draft: StoreDraft) => {
  const items = checklistOf(draft);
  const done = items.filter((item) => item.done).length;
  return { done, total: items.length, percent: Math.round((done / items.length) * 100) };
};

export const recommendPlan = (draft: StoreDraft) => {
  if (draft.sellMode === "whatsapp" && draft.categories.length <= 1) return "basico";
  if (draft.sellMode === "digitales") return "emprende";
  if (draft.categories.length >= 4 || draft.channels.length >= 3) return "pro";
  return "crecimiento";
};
