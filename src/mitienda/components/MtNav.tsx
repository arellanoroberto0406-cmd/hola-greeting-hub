import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, ShoppingBag, X } from "lucide-react";
import { MT_BRAND } from "../draft";

export const MtLogo = ({ compact = false }: { compact?: boolean }) => (
  <Link to="/mitienda" className="flex items-center gap-2" aria-label={`Ir al inicio de ${MT_BRAND}`}>
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#3b46f1] to-[#7c5cff] text-white">
      <ShoppingBag className="h-5 w-5" />
    </span>
    {!compact && <span className="text-lg font-extrabold tracking-tight">MiTienda</span>}
  </Link>
);

const LINKS = [
  { label: "Cómo funciona", to: "/mitienda#como-funciona" },
  { label: "Plantillas", to: "/mitienda#plantillas" },
  { label: "Funciones", to: "/mitienda#funciones" },
  { label: "Precios", to: "/mitienda#precios" },
  { label: "Ayuda", to: "/mitienda#ayuda" },
];

const MtNav = ({ variant = "public" }: { variant?: "public" | "minimal" }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4">
        <MtLogo />

        {variant === "public" && (
          <nav className="mt-muted hidden items-center gap-7 text-sm font-medium lg:flex">
            {LINKS.map((link) => (
              <a key={link.label} href={link.to} className="transition-colors hover:text-[#3b46f1]">
                {link.label}
              </a>
            ))}
          </nav>
        )}

        <div className="hidden items-center gap-2 md:flex">
          <button type="button" className="mt-btn mt-btn-ghost mt-btn-sm" onClick={() => navigate("/mitienda/login")}>
            Iniciar sesión
          </button>
          <button type="button" className="mt-btn mt-btn-primary mt-btn-sm" onClick={() => navigate("/mitienda/registro")}>
            Crear mi tienda
          </button>
        </div>

        <button
          type="button"
          className="mt-btn mt-btn-ghost mt-btn-sm md:hidden"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t bg-white px-4 py-4 md:hidden">
          {variant === "public" && (
            <nav className="mt-muted flex flex-col gap-3 text-sm font-medium">
              {LINKS.map((link) => (
                <a key={link.label} href={link.to} onClick={() => setOpen(false)}>
                  {link.label}
                </a>
              ))}
            </nav>
          )}
          <div className="mt-4 grid gap-2">
            <button type="button" className="mt-btn mt-btn-ghost" onClick={() => navigate("/mitienda/login")}>
              Iniciar sesión
            </button>
            <button type="button" className="mt-btn mt-btn-primary" onClick={() => navigate("/mitienda/registro")}>
              Crear mi tienda
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default MtNav;
