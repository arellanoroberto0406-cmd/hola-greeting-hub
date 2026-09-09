import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3, Brush, Check, CreditCard, Crown, Eye, FileText, Lock, Mail,
  Package, Rocket, ShoppingCart, Sparkles, Truck, X, Zap,
} from "lucide-react";
import "@/mitienda/mitienda.css";
import MtNav from "@/mitienda/components/MtNav";
import { useToast } from "@/hooks/use-toast";
import { MT_DOMAIN, PLANS, checklistOf, progressOf, useStoreDraft } from "@/mitienda/draft";

const DELIVERY_OPTIONS = [
  { key: "nacional", label: "Envíos nacionales" },
  { key: "local", label: "Entrega local" },
  { key: "recoger", label: "Recoger en tienda" },
  { key: "digital", label: "Productos digitales" },
  { key: "sin", label: "Sin envíos" },
];

const PAYMENT_OPTIONS = [
  { key: "tarjeta", label: "Tarjeta" },
  { key: "transferencia", label: "Transferencia" },
  { key: "efectivo", label: "Efectivo" },
  { key: "contraentrega", label: "Pago al entregar" },
  { key: "mercadopago", label: "Mercado Pago" },
  { key: "stripe", label: "Stripe" },
  { key: "whatsapp", label: "Solo pedidos por WhatsApp" },
];

const PREMIUM = [
  { key: "carritos", icon: ShoppingCart, title: "Recuperación de carritos", short: "Recupera ventas automáticamente.", detail: "Recupera clientes que dejaron productos sin comprar. MiTienda puede enviar recordatorios automáticamente.", plan: "Crecimiento" },
  { key: "auto", icon: Zap, title: "Automatizaciones", short: "Ahorra tiempo y vende más.", detail: "Crea reglas automáticas: mensajes de bienvenida, seguimiento de pedidos y recordatorios de pago.", plan: "Crecimiento" },
  { key: "stats", icon: BarChart3, title: "Estadísticas avanzadas", short: "Conoce a tus clientes.", detail: "Descubre qué productos venden más, de dónde llegan tus visitas y qué clientes vuelven a comprar.", plan: "Crecimiento" },
];

const Panel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { draft, patch } = useStoreDraft();
  const [openTask, setOpenTask] = useState<string | null>(null);
  const [premium, setPremium] = useState<string | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);

  const items = checklistOf(draft);
  const progress = progressOf(draft);
  const storeName = draft.name || "Tu tienda";
  const required = items.filter((item) => !item.optional);
  const canPublish = required.every((item) => item.done);
  const planName = PLANS.find((plan) => plan.key === draft.plan)?.name || "Gratis";

  const toggleList = (field: "delivery" | "payments", key: string) => {
    const current = draft[field];
    patch({ [field]: current.includes(key) ? current.filter((item) => item !== key) : [...current, key] } as never);
  };

  const publish = () => {
    patch({ published: true });
    setPublishOpen(false);
    navigate("/mitienda/publicada");
  };

  return (
    <div className="mt mt-shell">
      <MtNav variant="minimal" />

      <main className="mx-auto max-w-[1200px] px-4 py-8">
        {/* Encabezado */}
        <section className="mt-aurora mt-card mt-rise grid gap-6 p-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <span className="mt-chip">Panel de tu tienda</span>
            <h1 className="mt-title mt-3 text-[2rem] sm:text-[2.6rem]">
              Buenos días 👋
              <br />
              <span className="text-[#3b46f1]">{storeName}</span>
            </h1>
            <p className="mt-muted mt-3 max-w-md">
              Tu tienda va muy bien. Completa los siguientes pasos para publicarla y comenzar a vender.
            </p>
            <p className="mt-muted mt-2 text-sm">Plan actual: <strong className="text-[#0f172a]">{planName}</strong></p>
          </div>

          <div>
            <div className="mt-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold">Tu tienda está casi lista</p>
                <p className="text-xl font-extrabold text-[#3b46f1]">{progress.percent}%</p>
              </div>
              <div className="mt-progress mt-3"><span style={{ width: `${progress.percent}%` }} /></div>
              <p className="mt-muted mt-2 text-sm">{progress.done} de {progress.total} pasos completados</p>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button type="button" className="mt-btn mt-btn-ghost" onClick={() => navigate("/mitienda/ejemplo")}>
                <Eye className="h-4 w-4" /> Ver como cliente
              </button>
              <button type="button" className="mt-btn mt-btn-primary" onClick={() => setPublishOpen(true)}>
                <Rocket className="h-4 w-4" /> Publicar mi tienda
              </button>
            </div>
            {!canPublish && <p className="mt-muted mt-2 text-center text-xs">Publica cuando completes los pasos restantes.</p>}
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
          {/* Checklist */}
          <section className="mt-card p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#eef1ff] text-[#3b46f1]"><Check className="h-5 w-5" /></span>
              <div>
                <h2 className="text-lg font-bold">Lista de configuración</h2>
                <p className="mt-muted text-sm">Sigue estos pasos para tener tu tienda lista para el mundo.</p>
              </div>
            </div>

            <ul className="mt-4 space-y-2">
              {items.map((item) => (
                <li key={item.key} className="rounded-2xl border" style={item.done ? { background: "#f4fdf8", borderColor: "#c9f0dd" } : undefined}>
                  <button type="button" className="flex w-full items-center gap-3 p-3 text-left"
                    onClick={() => setOpenTask(openTask === item.key ? null : item.key)}>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border"
                      style={item.done ? { background: "#10b981", borderColor: "#10b981", color: "#fff" } : { borderColor: "#cbd5e1" }}>
                      {item.done && <Check className="h-4 w-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold">{item.label}</span>
                      <span className="mt-muted block truncate text-xs">{item.hint}</span>
                    </span>
                    <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                      style={item.done ? { background: "#d9f5e7", color: "#0f9b6c" } : { background: "#f1f5f9", color: "#64748b" }}>
                      {item.done ? "Completado" : item.optional ? "Opcional" : "Pendiente"}
                    </span>
                  </button>

                  {openTask === item.key && (
                    <div className="border-t p-4">
                      {item.key === "contacto" && (
                        <div className="grid gap-3 sm:grid-cols-3">
                          <input className="mt-input" placeholder="Correo" value={draft.contact.email}
                            onChange={(event) => patch({ contact: { ...draft.contact, email: event.target.value } })} />
                          <input className="mt-input" placeholder="Teléfono" value={draft.contact.phone}
                            onChange={(event) => patch({ contact: { ...draft.contact, phone: event.target.value } })} />
                          <input className="mt-input" placeholder="Dirección" value={draft.contact.address}
                            onChange={(event) => patch({ contact: { ...draft.contact, address: event.target.value } })} />
                        </div>
                      )}
                      {item.key === "entregas" && (
                        <div className="flex flex-wrap gap-2">
                          {DELIVERY_OPTIONS.map((option) => (
                            <button key={option.key} type="button" className="mt-option !px-3 !py-2"
                              data-on={draft.delivery.includes(option.key)} onClick={() => toggleList("delivery", option.key)}>
                              <span className="text-xs font-semibold">{option.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {item.key === "pagos" && (
                        <div className="flex flex-wrap gap-2">
                          {PAYMENT_OPTIONS.map((option) => (
                            <button key={option.key} type="button" className="mt-option !px-3 !py-2"
                              data-on={draft.payments.includes(option.key)} onClick={() => toggleList("payments", option.key)}>
                              <span className="text-xs font-semibold">{option.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {item.key === "politicas" && (
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="h-4 w-4 accent-[#3b46f1]" checked={draft.policies}
                            onChange={(event) => patch({ policies: event.target.checked })} />
                          Ya definí mis políticas de cambios, devoluciones y privacidad.
                        </label>
                      )}
                      {item.key === "producto" && (
                        <button type="button" className="mt-btn mt-btn-primary mt-btn-sm"
                          onClick={() => { patch({ firstProduct: true }); toast({ title: "Producto marcado como listo" }); }}>
                          Marcar mi primer producto como listo
                        </button>
                      )}
                      {(item.key === "nombre" || item.key === "diseno") && (
                        <button type="button" className="mt-btn mt-btn-ghost mt-btn-sm" onClick={() => navigate("/mitienda/crear")}>
                          Editar en el asistente
                        </button>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <div className="space-y-6">
            {/* Acciones rápidas */}
            <section className="mt-card p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff4e6] text-[#f59e0b]"><Zap className="h-5 w-5" /></span>
                <div>
                  <h2 className="text-lg font-bold">Acciones rápidas</h2>
                  <p className="mt-muted text-sm">Acelera la configuración de tu tienda.</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { icon: Package, title: "Agregar productos", text: "Sube tus productos y organízalos por categorías.", bg: "#eef1ff", to: "/dashboard" },
                  { icon: CreditCard, title: "Activar pagos", text: "Conecta Stripe, Mercado Pago o pagos manuales.", bg: "#eaf3ff", to: "/dashboard" },
                  { icon: Truck, title: "Configurar entregas", text: "Define costos, zonas y tiempos de envío.", bg: "#e9fbf2", to: "/dashboard" },
                  { icon: Brush, title: "Seguir personalizando", text: "Ajusta colores, tipografías y secciones.", bg: "#f6edff", to: "/dashboard" },
                ].map((action) => (
                  <button key={action.title} type="button" className="mt-card mt-card-hover p-4 text-left" style={{ background: action.bg }}
                    onClick={() => navigate(action.to)}>
                    <action.icon className="h-5 w-5 text-[#3b46f1]" />
                    <p className="mt-2 text-sm font-bold">{action.title}</p>
                    <p className="mt-muted text-xs">{action.text}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* Premium */}
            <section className="mt-card p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff7e0] text-[#eab308]"><Crown className="h-5 w-5" /></span>
                <div>
                  <h2 className="text-lg font-bold">Funcionalidades premium</h2>
                  <p className="mt-muted text-sm">Lleva tu negocio al siguiente nivel con MiTienda Crecimiento.</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {PREMIUM.map((feature) => (
                  <li key={feature.key}>
                    <button type="button" className="mt-card mt-card-hover flex w-full items-center gap-3 p-3 text-left"
                      onClick={() => setPremium(feature.key)}>
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f5f7fb] text-[#3b46f1]"><feature.icon className="h-4 w-4" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold">{feature.title}</span>
                        <span className="mt-muted block truncate text-xs">{feature.short}</span>
                      </span>
                      <span className="mt-muted flex shrink-0 items-center gap-1 text-[11px]">
                        <Lock className="h-3 w-3" /> Desde {feature.plan}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" className="mt-btn mt-btn-ghost mt-4 w-full" onClick={() => navigate("/mitienda#precios")}>
                Ver todos los planes
              </button>
            </section>
          </div>
        </div>
      </main>

      {/* Modal premium */}
      {premium && (() => {
        const feature = PREMIUM.find((item) => item.key === premium)!;
        return (
          <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4" role="dialog" aria-modal="true">
            <div className="mt-card mt-rise w-full max-w-md p-6">
              <div className="flex items-start justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#eef1ff] text-[#3b46f1]"><feature.icon className="h-6 w-6" /></span>
                <button type="button" aria-label="Cerrar" onClick={() => setPremium(null)}><X className="mt-muted h-5 w-5" /></button>
              </div>
              <h3 className="mt-3 text-xl font-bold">{feature.title}</h3>
              <p className="mt-muted mt-2 text-sm">{feature.detail}</p>
              <p className="mt-3 rounded-xl bg-[#f5f7fb] p-3 text-sm">🔒 Disponible desde el plan <strong>{feature.plan}</strong></p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button type="button" className="mt-btn mt-btn-ghost" onClick={() => toast({ title: "Demostración", description: feature.detail })}>
                  Ver demostración
                </button>
                <button type="button" className="mt-btn mt-btn-primary" onClick={() => { setPremium(null); navigate("/mitienda#precios"); }}>
                  Mejorar mi plan
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal publicar */}
      {publishOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4" role="dialog" aria-modal="true">
          <div className="mt-card mt-rise w-full max-w-lg p-6">
            <div className="flex items-start justify-between">
              <h3 className="mt-title text-2xl">Todo listo 🚀</h3>
              <button type="button" aria-label="Cerrar" onClick={() => setPublishOpen(false)}><X className="mt-muted h-5 w-5" /></button>
            </div>
            <p className="mt-muted mt-2">Tu tienda está preparada para recibir visitas.</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {items.map((item) => (
                <li key={item.key} className="flex items-center gap-2 text-sm">
                  <span className="grid h-5 w-5 place-items-center rounded-full text-white"
                    style={{ background: item.done ? "#10b981" : "#cbd5e1" }}>
                    {item.done ? <Check className="h-3 w-3" /> : "·"}
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
            <p className="mt-muted mt-4 rounded-xl bg-[#f5f7fb] p-3 text-sm">
              <Mail className="mr-1 inline h-4 w-4" /> Tu enlace: <strong>{MT_DOMAIN}/{draft.slug || "tu-tienda"}</strong>
            </p>
            <button type="button" className="mt-btn mt-btn-primary mt-5 w-full" disabled={!canPublish} onClick={publish}>
              <Rocket className="h-4 w-4" /> Publicar mi tienda
            </button>
            {!canPublish && (
              <p className="mt-muted mt-2 text-center text-xs">
                <FileText className="mr-1 inline h-3 w-3" /> Completa los pasos pendientes para publicar.
              </p>
            )}
          </div>
        </div>
      )}

      <footer className="mt-muted border-t bg-white py-6 text-center text-sm">
        <Sparkles className="mr-1 inline h-4 w-4 text-[#3b46f1]" /> Tu emprendimiento apenas comienza. Estamos aquí para acompañarte.
      </footer>
    </div>
  );
};

export default Panel;
