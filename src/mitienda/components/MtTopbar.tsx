import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, Eye, LogOut, Menu, Search, Settings, User } from "lucide-react";
import { MT_NAV } from "./MtSidebar";

interface Notice { id: string; text: string }

interface Props {
  initials: string;
  name: string;
  role: string;
  notices: Notice[];
  onMenu: () => void;
  onPreview: () => void;
  onSignOut: () => void;
}

const SEARCHABLE = [
  ...MT_NAV.map((item) => ({ label: item.label, to: item.to, kind: "Sección" })),
  { label: "Agregar producto", to: "/mitienda/panel/productos", kind: "Acción" },
  { label: "Cupones y promociones", to: "/mitienda/panel/marketing", kind: "Acción" },
  { label: "Métodos de pago", to: "/mitienda/panel/pagos", kind: "Configuración" },
  { label: "Zonas de envío", to: "/mitienda/panel/envios", kind: "Configuración" },
  { label: "Políticas de la tienda", to: "/mitienda/panel/configuracion", kind: "Configuración" },
  { label: "Pedidos pendientes", to: "/mitienda/panel/pedidos", kind: "Pedidos" },
  { label: "Mis clientes", to: "/mitienda/panel/clientes", kind: "Clientes" },
];

const MtTopbar = ({ initials, name, role, notices, onMenu, onPreview, onSignOut }: Props) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [openBell, setOpenBell] = useState(false);
  const [openUser, setOpenUser] = useState(false);

  const results = query.trim()
    ? SEARCHABLE.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6)
    : [];

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="flex items-center gap-2 p-3 sm:gap-3 sm:px-5">
        <button type="button" className="mt-icon-btn lg:hidden" aria-label="Abrir menú" onClick={onMenu}>
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative min-w-0 flex-1">
          <Search className="mt-muted pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <input
            className="mt-input !py-2.5 !pl-10"
            placeholder="Buscar en tu tienda…"
            aria-label="Buscar en tu tienda"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {results.length > 0 && (
            <ul className="mt-card absolute left-0 right-0 top-[110%] z-50 overflow-hidden p-1">
              {results.map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-[#f5f7fb]"
                    onClick={() => { setQuery(""); navigate(item.to); }}
                  >
                    <span className="font-medium">{item.label}</span>
                    <span className="mt-muted text-xs">{item.kind}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="button" className="mt-btn mt-btn-ghost mt-btn-sm hidden sm:inline-flex" onClick={onPreview}>
          <Eye className="h-4 w-4" /> Ver como cliente
        </button>

        <div className="relative">
          <button type="button" className="mt-icon-btn" aria-label="Notificaciones" onClick={() => { setOpenBell(!openBell); setOpenUser(false); }}>
            <Bell className="h-5 w-5" />
            {notices.length > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#ef4444]" />}
          </button>
          {openBell && (
            <div className="mt-card absolute right-0 top-[115%] z-50 w-72 p-3">
              <p className="text-sm font-bold">Notificaciones</p>
              {notices.length === 0 ? (
                <p className="mt-muted mt-2 text-sm">Todo tranquilo por ahora.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {notices.map((notice) => (
                    <li key={notice.id} className="rounded-xl bg-[#f5f7fb] p-2 text-sm">{notice.text}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-2 rounded-2xl border px-2 py-1.5 hover:bg-[#fbfcff]"
            onClick={() => { setOpenUser(!openUser); setOpenBell(false); }}
            aria-label="Mi cuenta"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#eef1ff] text-xs font-bold text-[#3b46f1]">{initials}</span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-bold">{name}</span>
              <span className="mt-muted block text-[11px]">{role}</span>
            </span>
            <ChevronDown className="mt-muted h-4 w-4" />
          </button>
          {openUser && (
            <div className="mt-card absolute right-0 top-[115%] z-50 w-56 p-1">
              <button type="button" className="mt-menu-item" onClick={() => { setOpenUser(false); navigate("/mitienda/panel/configuracion"); }}>
                <User className="h-4 w-4" /> Mi cuenta
              </button>
              <button type="button" className="mt-menu-item" onClick={() => { setOpenUser(false); navigate("/mitienda/panel/configuracion"); }}>
                <Settings className="h-4 w-4" /> Configuración
              </button>
              <button type="button" className="mt-menu-item" onClick={onSignOut}>
                <LogOut className="h-4 w-4" /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default MtTopbar;
