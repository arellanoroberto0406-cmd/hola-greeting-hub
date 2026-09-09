import { NavLink } from "react-router-dom";
import {
  Bot, BarChart3, Brush, Grid2X2, Home, LifeBuoy, LogOut, Megaphone, Package,
  CreditCard, Settings, ShoppingBag, Truck, Users, BookOpen, Crown,
} from "lucide-react";
import { MT_BRAND } from "../draft";

export interface MtNavItem {
  key: string;
  label: string;
  icon: typeof Home;
  to: string;
  badge?: number;
}

export const MT_NAV: MtNavItem[] = [
  { key: "inicio", label: "Inicio", icon: Home, to: "/mitienda/panel" },
  { key: "productos", label: "Productos", icon: Package, to: "/mitienda/panel/productos" },
  { key: "pedidos", label: "Pedidos", icon: ShoppingBag, to: "/mitienda/panel/pedidos" },
  { key: "clientes", label: "Clientes", icon: Users, to: "/mitienda/panel/clientes" },
  { key: "diseno", label: "Diseño", icon: Brush, to: "/mitienda/panel/diseno" },
  { key: "marketing", label: "Marketing", icon: Megaphone, to: "/mitienda/panel/marketing" },
  { key: "estadisticas", label: "Estadísticas", icon: BarChart3, to: "/mitienda/panel/estadisticas" },
  { key: "envios", label: "Envíos", icon: Truck, to: "/mitienda/panel/envios" },
  { key: "pagos", label: "Pagos", icon: CreditCard, to: "/mitienda/panel/pagos" },
  { key: "aplicaciones", label: "Aplicaciones", icon: Grid2X2, to: "/mitienda/panel/aplicaciones" },
  { key: "configuracion", label: "Configuración", icon: Settings, to: "/mitienda/panel/configuracion" },
];

interface Props {
  planName: string;
  newOrders: number;
  onAsk: () => void;
  onPlans: () => void;
  onHelp: () => void;
  onResources: () => void;
  onSignOut: () => void;
  onNavigate?: () => void;
}

const MtSidebar = ({ planName, newOrders, onAsk, onPlans, onHelp, onResources, onSignOut, onNavigate }: Props) => (
  <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
    <NavLink to="/mitienda" className="flex items-center gap-2.5 px-2 py-1" onClick={onNavigate}>
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#3b46f1] to-[#7c5cff] text-white">
        <ShoppingBag className="h-5 w-5" />
      </span>
      <span className="text-xl font-extrabold tracking-tight">{MT_BRAND}</span>
    </NavLink>

    <nav className="space-y-1">
      {MT_NAV.map((item) => (
        <NavLink
          key={item.key}
          to={item.to}
          end={item.key === "inicio"}
          onClick={onNavigate}
          className={({ isActive }) => `mt-nav-item ${isActive ? "mt-nav-item-active" : ""}`}
        >
          <item.icon className="h-[18px] w-[18px]" />
          <span className="flex-1">{item.label}</span>
          {item.key === "pedidos" && newOrders > 0 && <span className="mt-badge">{newOrders}</span>}
        </NavLink>
      ))}
    </nav>

    <div className="mt-auto space-y-3">
      <div className="rounded-2xl border border-[#dde3ff] bg-gradient-to-br from-[#eef1ff] to-[#f7f2ff] p-3">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#3b46f1]">
            <Bot className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold">{MT_BRAND} IA</p>
            <p className="mt-muted text-[11px] leading-tight">Tu asistente de negocios siempre contigo.</p>
          </div>
        </div>
        <button type="button" className="mt-btn mt-btn-ghost mt-btn-sm mt-3 w-full" onClick={onAsk}>
          <Bot className="h-4 w-4" /> Pregúntale a la IA
        </button>
      </div>

      <div className="rounded-2xl border border-[#e5e9f2] bg-white p-3">
        <p className="flex items-center gap-1.5 text-sm font-bold text-[#3b46f1]">
          <Crown className="h-4 w-4" /> Plan {planName}
        </p>
        <p className="mt-muted mt-1 text-[11px] leading-tight">Mejora tu plan y desbloquea más funciones.</p>
        <button type="button" className="mt-btn mt-btn-ghost mt-btn-sm mt-2 w-full" onClick={onPlans}>
          Ver planes
        </button>
      </div>

      <div className="space-y-1 border-t pt-2">
        <button type="button" className="mt-nav-item w-full" onClick={onHelp}>
          <LifeBuoy className="h-[18px] w-[18px]" /> Ayuda
        </button>
        <button type="button" className="mt-nav-item w-full" onClick={onResources}>
          <BookOpen className="h-[18px] w-[18px]" /> Centro de recursos
        </button>
        <button type="button" className="mt-nav-item w-full" onClick={onSignOut}>
          <LogOut className="h-[18px] w-[18px]" /> Cerrar sesión
        </button>
      </div>
    </div>
  </div>
);

export default MtSidebar;
