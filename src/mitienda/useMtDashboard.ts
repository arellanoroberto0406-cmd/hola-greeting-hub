import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export type RangeKey = "hoy" | "7d" | "30d" | "mes" | "mes_anterior" | "ano";

export const RANGES: { key: RangeKey; label: string }[] = [
  { key: "hoy", label: "Hoy" },
  { key: "7d", label: "Últimos 7 días" },
  { key: "30d", label: "Últimos 30 días" },
  { key: "mes", label: "Este mes" },
  { key: "mes_anterior", label: "Mes anterior" },
  { key: "ano", label: "Este año" },
];

export const rangeBounds = (key: RangeKey) => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  switch (key) {
    case "hoy":
      start.setHours(0, 0, 0, 0);
      break;
    case "7d":
      start.setDate(now.getDate() - 7);
      break;
    case "30d":
      start.setDate(now.getDate() - 30);
      break;
    case "mes":
      start.setFullYear(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      break;
    case "mes_anterior":
      start.setFullYear(now.getFullYear(), now.getMonth() - 1, 1);
      start.setHours(0, 0, 0, 0);
      end.setFullYear(now.getFullYear(), now.getMonth(), 1);
      end.setHours(0, 0, 0, 0);
      break;
    case "ano":
      start.setFullYear(now.getFullYear(), 0, 1);
      start.setHours(0, 0, 0, 0);
      break;
  }
  const span = end.getTime() - start.getTime();
  const prevStart = new Date(start.getTime() - span);
  return { start, end, prevStart };
};

export interface MtOrder {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  total: number;
  status: string;
  created_at: string;
}

export interface MtDashboardData {
  storeId: string | null;
  storeName: string | null;
  storeSlug: string | null;
  isActive: boolean;
  hasContact: boolean;
  hasPolicies: boolean;
  hasPayments: boolean;
  hasShipping: boolean;
  hasLogo: boolean;
  productCount: number;
  customerCount: number;
  orders: MtOrder[];
  planName: string;
}

/** Datos reales de la tienda del usuario. Si aún no tiene tienda, devuelve null. */
export const useMtDashboard = (range: RangeKey) => {
  const { user } = useAuth();

  return useQuery<MtDashboardData | null>({
    queryKey: ["mt-dashboard", user?.id, range],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data: store } = await supabase
        .from("stores")
        .select(
          "id,name,slug,is_active,logo_url,email,phone,address,return_policy,shipping_info,shipping_cost,payment_methods,whatsapp_number",
        )
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!store) return null;

      const [{ count: productCount }, { count: customerCount }, ordersRes, subRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }).eq("store_id", store.id),
        supabase.from("store_customers").select("id", { count: "exact", head: true }).eq("store_id", store.id),
        supabase
          .from("orders")
          .select("id,first_name,last_name,email,total,status,created_at")
          .eq("store_id", store.id)
          .order("created_at", { ascending: false })
          .limit(200),
        supabase
          .from("store_subscriptions")
          .select("status, subscription_plans(name)")
          .eq("store_id", store.id)
          .maybeSingle(),
      ]);

      const methods = (store.payment_methods ?? {}) as Record<string, unknown>;
      const planRow = subRes.data as { status?: string; subscription_plans?: { name?: string } | null } | null;

      return {
        storeId: store.id,
        storeName: store.name,
        storeSlug: store.slug,
        isActive: Boolean(store.is_active),
        hasContact: Boolean(store.email && store.phone),
        hasPolicies: Boolean(store.return_policy || store.shipping_info),
        hasPayments: Object.values(methods).some(Boolean),
        hasShipping: store.shipping_cost !== null && store.shipping_cost !== undefined,
        hasLogo: Boolean(store.logo_url),
        productCount: productCount ?? 0,
        customerCount: customerCount ?? 0,
        orders: (ordersRes.data ?? []) as MtOrder[],
        planName:
          planRow?.status === "active" && planRow.subscription_plans?.name
            ? planRow.subscription_plans.name
            : "Gratis",
      };
    },
  });
};

const inRange = (iso: string, start: Date, end: Date) => {
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t < end.getTime();
};

export const statsFor = (orders: MtOrder[], range: RangeKey) => {
  const { start, end, prevStart } = rangeBounds(range);
  const current = orders.filter((o) => inRange(o.created_at, start, end));
  const previous = orders.filter((o) => inRange(o.created_at, prevStart, start));

  const sum = (list: MtOrder[]) => list.reduce((total, order) => total + Number(order.total || 0), 0);
  const clients = (list: MtOrder[]) => new Set(list.map((o) => (o.email || "").toLowerCase())).size;

  const delta = (now: number, before: number) => {
    if (!before) return now > 0 ? 100 : 0;
    return Math.round(((now - before) / before) * 100);
  };

  // Mini gráfica: pedidos por tramo dentro del rango.
  const buckets = 8;
  const span = (end.getTime() - start.getTime()) / buckets;
  const series = Array.from({ length: buckets }, (_, index) =>
    current.filter((o) => {
      const t = new Date(o.created_at).getTime();
      return t >= start.getTime() + span * index && t < start.getTime() + span * (index + 1);
    }).length,
  );

  return {
    orders: { value: current.length, delta: delta(current.length, previous.length) },
    sales: { value: sum(current), delta: delta(sum(current), sum(previous)) },
    clients: { value: clients(current), delta: delta(clients(current), clients(previous)) },
    series,
  };
};
