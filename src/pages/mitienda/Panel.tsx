import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3, Bot, Brush, Check, ChevronRight, CreditCard, Crown, Eye, FileText, Heart,
  Lock, Package, Rocket, Send, Settings, ShoppingBag, ShoppingCart, Smartphone, Sparkles,
  Store, Truck, Users, X, Zap,
} from "lucide-react";
import MtLayout from "@/mitienda/components/MtLayout";
import StoreMock from "@/mitienda/components/StoreMock";
import { useToast } from "@/hooks/use-toast";
import { MT_BRAND, MT_DOMAIN, PLANS, checklistOf, useStoreDraft } from "@/mitienda/draft";
import { RANGES, RangeKey, statsFor, useMtDashboard } from "@/mitienda/useMtDashboard";

const PREMIUM = [
  { key: "carritos", icon: ShoppingCart, title: "Recuperación de carritos", short: "Recupera clientes que no terminaron su compra.", detail: "MiTienda avisa automáticamente a quienes dejaron productos sin pagar, con un mensaje y un enlace para terminar la compra.", plan: "Crecimiento" },
  { key: "auto", icon: Zap, title: "Automatizaciones", short: "Ahorra tiempo y vende más con flujos automáticos.", detail: "Mensajes de bienvenida, seguimiento de pedidos y recordatorios de pago que se envían solos.", plan: "Crecimiento" },
  { key: "stats", icon: BarChart3, title: "Estadísticas avanzadas", short: "Conoce a fondo el rendimiento de tu tienda.", detail: "Descubre qué productos venden más, de dónde llegan tus visitas y qué clientes vuelven a comprar.", plan: "Crecimiento" },
];

const SUGGESTIONS = [
  "Generar productos",
  "Crear promoción",
  "Analizar ventas",
  "Mejorar mi diseño",
];

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  paid: { label: "Pagado", bg: "#d9f5e7", color: "#0f9b6c" },
  shipped: { label: "Enviado", bg: "#dbeafe", color: "#1d4ed8" },
  delivered: { label: "Entregado", bg: "#d9f5e7", color: "#0f9b6c" },
  pending: { label: "Pendiente", bg: "#ffedd5", color: "#c2620b" },
  awaiting_payment: { label: "Por pagar", bg: "#ffedd5", color: "#c2620b" },
  processing: { label: "En proceso", bg: "#dbeafe", color: "#1d4ed8" },
  cancelled: { label: "Cancelado", bg: "#fee2e2", color: "#b91c1c" },
  payment_failed: { label: "Pago fallido", bg: "#fee2e2", color: "#b91c1c" },
};

const money = (value: number) =>
  `$${value.toLocaleString("es-MX", { maximumFractionDigits: 0 })}`;

const Panel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { draft, patch } = useStoreDraft();
  const [range, setRange] = useState<RangeKey>("7d");
  const { data, isLoading } = useMtDashboard(range);
  const [premium, setPremium] = useState<string | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiSeed, setAiSeed] = useState<string | null>(null);
  const [aiDraft, setAiDraft] = useState("");

  const storeName = data?.storeName || draft.name || "Tu tienda";
  const published = data ? data.isActive : draft.published;
  const planName = data?.planName || PLANS.find((plan) => plan.key === draft.plan)?.name || "Gratis";
  const storeUrl = data?.storeSlug
    ? `https://apptienda.lovable.app/tienda/${data.storeSlug}`
    : `${MT_DOMAIN}/${draft.slug || "tu-tienda"}`;

  const items = useMemo(() => {
    if (!data) return checklistOf(draft).map((item) => ({ ...item, to: "/mitienda/crear" }));
    return [
      { key: "nombre", label: "Nombre y logo", hint: data.hasLogo ? storeName : "Agrega el logo de tu tienda", done: Boolean(data.storeName && data.hasLogo), to: "/mitienda/panel/diseno" },
      { key: "diseno", label: "Diseño", hint: "Plantilla, colores y secciones", done: true, to: "/mitienda/panel/diseno" },
      { key: "producto", label: "Primer producto", hint: `${data.productCount} producto(s) en tu catálogo`, done: data.productCount > 0, to: "/mitienda/panel/productos" },
      { key: "contacto", label: "Información de contacto", hint: "Correo, teléfono y dirección", done: data.hasContact, to: "/mitienda/panel/configuracion" },
      { key: "entregas", label: "Entregas", hint: "Métodos y zonas de envío", done: data.hasShipping, to: "/mitienda/panel/envios" },
      { key: "pagos", label: "Pagos (opcional)", hint: "Cobra con tarjeta o transferencia", done: data.hasPayments, optional: true, to: "/mitienda/panel/pagos" },
      { key: "politicas", label: "Políticas de la tienda", hint: "Cambios, devoluciones y privacidad", done: data.hasPolicies, to: "/mitienda/panel/configuracion" },
    ];
  }, [data, draft, storeName]);

  const doneCount = items.filter((item) => item.done).length;
  const percent = Math.round((doneCount / items.length) * 100);
  const required = items.filter((item) => !item.optional);
  const canPublish = required.every((item) => item.done);
  const pending = items.find((item) => !item.done && !item.optional);

  const orders = data?.orders ?? [];
  const stats = statsFor(orders, range);
  const newOrders = orders.filter((order) => ["pending", "awaiting_payment", "paid"].includes(order.status)).length;

  const notices = [
    ...(newOrders > 0 ? [{ id: "pedidos", text: `Recibiste ${newOrders} pedido(s) que esperan tu atención.` }] : []),
    ...(pending ? [{ id: "paso", text: `Tu siguiente paso: ${pending.label.toLowerCase()}.` }] : []),
    ...(stats.sales.delta > 0 ? [{ id: "ventas", text: `Tus ventas subieron ${stats.sales.delta}% en este periodo.` }] : []),
  ];

  const nextStep = published
    ? pending
      ? { title: "Da el siguiente paso", text: `Completa ${pending.label.toLowerCase()} para vender mejor.`, to: pending.to }
      : { title: "Haz crecer tu negocio", text: "Crea una promoción y comparte tu tienda en redes.", to: "/mitienda/panel/marketing" }
    : pending
      ? { title: "Da el siguiente paso", text: `${pending.label}: ${pending.hint}`, to: pending.to }
      : { title: "Da el siguiente paso", text: "Publica tu tienda y empieza a llegar a más clientes.", to: "#publicar" };

  const askAi = (text: string) => {
    if (!text.trim()) return;
    setAiSeed(text.trim());
    setAiDraft("");
    setAiOpen(true);
  };

  const publish = () => {
    patch({ published: true });
    setPublishOpen(false);
    navigate("/mitienda/publicada");
  };

  const statCards = [
    { label: "Pedidos", value: String(stats.orders.value), delta: stats.orders.delta, icon: ShoppingBag, color: "#ef4444" },
    { label: "Ventas", value: money(stats.sales.value), delta: stats.sales.delta, icon: CreditCard, color: "#10b981" },
    { label: "Clientes", value: String(stats.clients.value), delta: stats.clients.delta, icon: Users, color: "#7c5cff" },
    { label: "Productos", value: String(data?.productCount ?? 0), delta: 0, icon: Package, color: "#3b46f1" },
  ];

  return (
    <MtLayout
      planName={planName}
      newOrders={newOrders}
      notices={notices}
      previewTo="/mitienda/ejemplo"
      aiOpen={aiOpen}
      onAiOpenChange={setAiOpen}
      aiSeed={aiSeed}
      onAiSeedUsed={() => setAiSeed(null)}
      aiContext={`Tienda: ${storeName}. Plan: ${planName}. Publicada: ${published ? "sí" : "no"}. Productos: ${data?.productCount ?? 0}. Pedidos del periodo: ${stats.orders.value}. Ventas del periodo: ${money(stats.sales.value)}.`}
    >
      {/* Saludo + siguiente paso */}
      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h1 className="mt-title text-[1.8rem] sm:text-[2.3rem]">
            Buenos días 👋
            <br />
            <span className="text-[#3b46f1]">{storeName}</span>
          </h1>
          <p className="mt-muted mt-2 max-w-xl">
            {published
              ? "Tu tienda está funcionando. Revisa tus ventas y sigue haciendo crecer tu negocio."
              : "Tu tienda va muy bien. Completa los siguientes pasos para publicarla y comenzar a vender."}
          </p>
        </div>
        <button
          type="button"
          className="mt-card mt-card-hover flex items-center gap-3 p-4 text-left"
          style={{ background: "linear-gradient(120deg,#eef1ff,#f7f0ff 60%,#eef7ff)" }}
          onClick={() => (nextStep.to === "#publicar" ? setPublishOpen(true) : navigate(nextStep.to))}
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-[#3b46f1]"><Rocket className="h-5 w-5" /></span>
          <span className="min-w-0">
            <span className="block text-sm font-bold">{nextStep.title}</span>
            <span className="mt-muted block text-xs">{nextStep.text}</span>
          </span>
          <ChevronRight className="mt-muted ml-auto h-5 w-5 shrink-0" />
        </button>
      </section>

      {/* Progreso / estado */}
      <section className="mt-card mt-4 grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.5fr_1fr] lg:items-center">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#eef1ff] text-[#3b46f1]"><Store className="h-6 w-6" /></span>
          <div className="min-w-0 flex-1">
            <p className="font-bold">{published ? "Tu tienda está publicada" : "Tu tienda está casi lista"}</p>
            <div className="mt-progress mt-2"><span style={{ width: `${percent}%` }} /></div>
            <p className="mt-muted mt-1.5 text-sm">{doneCount} de {items.length} pasos completados</p>
          </div>
          <p className="shrink-0 text-2xl font-extrabold text-[#3b46f1]">{percent}%</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <button type="button" className="mt-btn mt-btn-ghost" onClick={() => navigate("/mitienda/ejemplo")}>
            <Eye className="h-4 w-4" /> Ver como cliente
          </button>
          <button type="button" className="mt-btn mt-btn-primary" onClick={() => setPublishOpen(true)}>
            <Rocket className="h-4 w-4" /> {published ? "Actualizar tienda" : "Publicar mi tienda"}
          </button>
          {!canPublish && (
            <p className="mt-muted text-center text-xs sm:col-span-2">
              Falta {required.filter((item) => !item.done).map((item) => item.label.toLowerCase()).join(", ")} antes de publicar.
            </p>
          )}
        </div>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr_0.9fr]">
        {/* Lista de configuración */}
        <section className="mt-card p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef1ff] text-[#3b46f1]"><Settings className="h-5 w-5" /></span>
            <div>
              <h2 className="font-bold">Lista de configuración</h2>
              <p className="mt-muted text-sm">Sigue estos pasos para tener tu tienda lista.</p>
            </div>
          </div>
          <ul className="mt-4 space-y-1.5">
            {items.map((item) => (
              <li key={item.key}>
                <button type="button" className="flex w-full items-center gap-3 rounded-2xl border p-3 text-left hover:bg-[#fbfcff]"
                  onClick={() => navigate(item.to)}>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border"
                    style={item.done ? { background: "#10b981", borderColor: "#10b981", color: "#fff" } : { borderColor: "#cbd5e1" }}>
                    {item.done && <Check className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold">{item.label}</span>
                    <span className="mt-muted block truncate text-xs">{item.hint}</span>
                  </span>
                  <span className="hidden shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:block"
                    style={item.done ? { background: "#d9f5e7", color: "#0f9b6c" } : { background: "#f1f5f9", color: "#64748b" }}>
                    {item.done ? "Completado" : item.optional ? "Opcional" : "Pendiente"}
                  </span>
                  <ChevronRight className="mt-muted h-4 w-4 shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Acciones rápidas */}
        <section className="mt-card p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff4e6] text-[#f59e0b]"><Zap className="h-5 w-5" /></span>
            <div>
              <h2 className="font-bold">Acciones rápidas</h2>
              <p className="mt-muted text-sm">Realiza las tareas más importantes de tu tienda.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {[
              { icon: Package, title: "Agregar productos", text: "Sube tus productos o importa desde un catálogo.", bg: "#eef4ff", color: "#3b46f1", to: "/mitienda/panel/productos" },
              { icon: CreditCard, title: "Activar pagos", text: "Recibe pagos con tarjeta, transferencia, etc.", bg: "#e9fbf2", color: "#0f9b6c", to: "/mitienda/panel/pagos" },
              { icon: Truck, title: "Configurar entregas", text: "Define cómo entregarás tus productos.", bg: "#fff4e8", color: "#c2620b", to: "/mitienda/panel/envios" },
              { icon: Brush, title: "Seguir personalizando", text: "Edita el diseño y las secciones de tu tienda.", bg: "#f6eeff", color: "#7c5cff", to: "/mitienda/panel/diseno" },
            ].map((action) => (
              <button key={action.title} type="button" className="flex items-center gap-3 rounded-2xl p-3 text-left transition hover:brightness-[0.98]"
                style={{ background: action.bg }} onClick={() => navigate(action.to)}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white" style={{ color: action.color }}>
                  <action.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold" style={{ color: action.color }}>{action.title}</span>
                  <span className="mt-muted block text-xs">{action.text}</span>
                </span>
                <ChevronRight className="mt-muted h-4 w-4 shrink-0" />
              </button>
            ))}
          </div>
        </section>

        {/* Vista previa + premium */}
        <div className="space-y-4">
          <section className="mt-card p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef1ff] text-[#3b46f1]"><Smartphone className="h-5 w-5" /></span>
              <div>
                <h2 className="font-bold">Vista previa de tu tienda</h2>
                <p className="mt-muted text-sm">Así verán tu tienda tus clientes.</p>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3">
              <div className="mt-phone-frame w-[168px] shrink-0">
                <StoreMock draft={{ ...draft, name: storeName }} device="mobile" />
              </div>
              <ul className="space-y-3">
                {[
                  { icon: Smartphone, title: "Diseño", text: "100% responsive", color: "#3b46f1", bg: "#eef1ff" },
                  { icon: Sparkles, title: published ? "Estado" : "Pendiente", text: published ? "Publicada y vendiendo" : "Lista para vender", color: "#0f9b6c", bg: "#e9fbf2" },
                  { icon: Heart, title: "Marca", text: "Tu marca, tu historia", color: "#f43f5e", bg: "#ffeef2" },
                ].map((badge) => (
                  <li key={badge.title} className="text-xs">
                    <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: badge.bg, color: badge.color }}>
                      <badge.icon className="h-4 w-4" />
                    </span>
                    <span className="mt-1.5 block font-bold">{badge.title}</span>
                    <span className="mt-muted block">{badge.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button type="button" className="mt-btn mt-btn-ghost mt-btn-sm mt-4 w-full" onClick={() => navigate("/mitienda/ejemplo")}>
              <Eye className="h-4 w-4" /> Ver como cliente
            </button>
          </section>

          <section className="mt-card p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff7e0] text-[#eab308]"><Crown className="h-5 w-5" /></span>
              <div className="flex-1">
                <h2 className="font-bold">Funcionalidades premium</h2>
                <p className="mt-muted text-sm">Lleva tu negocio al siguiente nivel.</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {PREMIUM.map((feature) => (
                <li key={feature.key}>
                  <button type="button" className="w-full rounded-2xl border p-3 text-left hover:bg-[#fbfcff]" onClick={() => setPremium(feature.key)}>
                    <span className="flex items-center gap-2">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#fff1f2] text-[#f43f5e]"><Lock className="h-4 w-4" /></span>
                      <span className="text-sm font-bold">{feature.title}</span>
                    </span>
                    <span className="mt-muted mt-1.5 block text-xs">{feature.short}</span>
                    <span className="mt-1 block text-xs font-semibold text-[#3b46f1]">Disponible desde {feature.plan} →</span>
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="mt-btn mt-btn-ghost mt-btn-sm mt-3 w-full" onClick={() => navigate("/mitienda#precios")}>
              Ver todas
            </button>
          </section>
        </div>
      </div>

      {/* Estadísticas + pedidos */}
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <section className="mt-card p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef1ff] text-[#3b46f1]"><BarChart3 className="h-5 w-5" /></span>
              <h2 className="font-bold">Estadísticas de tu tienda</h2>
            </div>
            <select
              className="mt-input !w-auto !py-2 text-sm"
              aria-label="Periodo de estadísticas"
              value={range}
              onChange={(event) => setRange(event.target.value as RangeKey)}
            >
              {RANGES.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
            </select>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <div key={card.label} className="rounded-2xl border p-3">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#f5f7fb]" style={{ color: card.color }}>
                  <card.icon className="h-4 w-4" />
                </span>
                <p className="mt-muted mt-2 text-xs">{card.label}</p>
                <p className="text-xl font-extrabold">{isLoading ? "…" : card.value}</p>
                {card.delta !== 0 && (
                  <p className="text-xs font-semibold" style={{ color: card.delta > 0 ? "#0f9b6c" : "#b91c1c" }}>
                    {card.delta > 0 ? "↑" : "↓"} {Math.abs(card.delta)}%
                  </p>
                )}
                <div className="mt-stat-spark mt-2">
                  {stats.series.map((value, index) => (
                    <span key={index} style={{ height: `${10 + value * 22}%`, background: `${card.color}33` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          {!data && !isLoading && (
            <p className="mt-muted mt-3 text-xs">
              Aún no tienes una tienda creada aquí. Termina el asistente para ver tus cifras reales.
            </p>
          )}
        </section>

        <section className="mt-card p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef1ff] text-[#3b46f1]"><ShoppingBag className="h-5 w-5" /></span>
              <h2 className="font-bold">Pedidos recientes</h2>
            </div>
            <button type="button" className="text-sm font-semibold text-[#3b46f1]" onClick={() => navigate("/mitienda/panel/pedidos")}>
              Ver todos
            </button>
          </div>

          {orders.length === 0 ? (
            <p className="mt-muted mt-4 text-sm">
              Todavía no hay pedidos. Comparte tu tienda para recibir el primero.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {orders.slice(0, 4).map((order) => {
                const status = STATUS_STYLE[order.status] || { label: order.status, bg: "#f1f5f9", color: "#64748b" };
                return (
                  <li key={order.id}>
                    <button type="button" className="flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left hover:bg-[#fbfcff]"
                      onClick={() => navigate("/mitienda/panel/pedidos")}>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f5f7fb] text-[#64748b]">
                        <Package className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">{order.first_name} {order.last_name}</span>
                        <span className="mt-muted block text-xs">
                          #{order.id.slice(0, 6)} · {new Date(order.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                      <span className="shrink-0 text-sm font-bold">{money(Number(order.total))}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Barra IA */}
      <section className="mt-4 grid gap-4 overflow-hidden rounded-[22px] p-4 sm:p-5 lg:grid-cols-[1.4fr_1fr]"
        style={{ background: "linear-gradient(120deg,#3b46f1,#7c5cff 60%,#38bdf8)" }}>
        <div className="text-white">
          <div className="flex items-center gap-3">
            <span className="mt-float grid h-12 w-12 place-items-center rounded-2xl bg-white/20"><Bot className="h-6 w-6" /></span>
            <div>
              <p className="flex items-center gap-2 text-lg font-bold">
                {MT_BRAND} IA <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold">BETA</span>
              </p>
              <p className="text-sm opacity-90">Cuéntale a {MT_BRAND} qué necesitas y te ayudaremos a hacer crecer tu negocio.</p>
            </div>
          </div>
          <form className="mt-4 flex items-center gap-2" onSubmit={(event) => { event.preventDefault(); askAi(aiDraft); }}>
            <input
              className="mt-input"
              placeholder="Ejemplo: “Quiero crear una promoción para el Buen Fin”"
              aria-label="Pregunta para MiTienda IA"
              value={aiDraft}
              onChange={(event) => setAiDraft(event.target.value)}
            />
            <button type="submit" className="mt-btn !bg-white !px-4 !text-[#3b46f1]" aria-label="Enviar a la IA">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
        <div className="text-white">
          <p className="text-sm opacity-90">O prueba con estas sugerencias:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button key={suggestion} type="button" className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/30"
                onClick={() => askAi(suggestion === "Generar productos"
                  ? `Genérame 5 ideas de productos para mi tienda ${storeName}`
                  : suggestion === "Crear promoción"
                    ? `Créame una promoción atractiva para ${storeName}`
                    : suggestion === "Analizar ventas"
                      ? `Analiza mis ventas: ${stats.orders.value} pedidos y ${money(stats.sales.value)} en este periodo. ¿Qué hago para vender más?`
                      : `Dame 5 ideas para mejorar el diseño de mi tienda ${storeName}`)}>
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Modal premium */}
      {premium && (() => {
        const feature = PREMIUM.find((item) => item.key === premium)!;
        return (
          <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-900/50 p-4" role="dialog" aria-modal="true">
            <div className="mt-card mt-rise w-full max-w-md p-6">
              <div className="flex items-start justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#eef1ff] text-[#3b46f1]"><feature.icon className="h-6 w-6" /></span>
                <button type="button" aria-label="Cerrar" onClick={() => setPremium(null)}><X className="mt-muted h-5 w-5" /></button>
              </div>
              <h3 className="mt-3 text-xl font-bold">{feature.title}</h3>
              <p className="mt-muted mt-2 text-sm">{feature.detail}</p>
              <p className="mt-3 rounded-xl bg-[#f5f7fb] p-3 text-sm">🔒 Disponible desde el plan <strong>{feature.plan}</strong></p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button type="button" className="mt-btn mt-btn-ghost" onClick={() => askAi(`Explícame cómo me ayudaría ${feature.title} en mi tienda`)}>
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
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-900/50 p-4" role="dialog" aria-modal="true">
          <div className="mt-card mt-rise w-full max-w-lg p-6">
            <div className="flex items-start justify-between">
              <h3 className="mt-title text-2xl">{canPublish ? "Todo listo 🚀" : "Casi listo"}</h3>
              <button type="button" aria-label="Cerrar" onClick={() => setPublishOpen(false)}><X className="mt-muted h-5 w-5" /></button>
            </div>
            <p className="mt-muted mt-2">Tu tienda estará disponible en tu enlace público.</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {items.map((item) => (
                <li key={item.key} className="flex items-center gap-2 text-sm">
                  <span className="grid h-5 w-5 place-items-center rounded-full text-white" style={{ background: item.done ? "#10b981" : "#cbd5e1" }}>
                    {item.done ? <Check className="h-3 w-3" /> : "·"}
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
            <p className="mt-muted mt-4 rounded-xl bg-[#f5f7fb] p-3 text-sm">Tu enlace: <strong>{storeUrl}</strong></p>
            <button type="button" className="mt-btn mt-btn-primary mt-5 w-full" disabled={!canPublish} onClick={publish}>
              <Rocket className="h-4 w-4" /> {published ? "Actualizar mi tienda" : "Publicar mi tienda"}
            </button>
            {!canPublish && (
              <p className="mt-muted mt-2 text-center text-xs">
                <FileText className="mr-1 inline h-3 w-3" /> Completa los pasos pendientes para publicar.
              </p>
            )}
          </div>
        </div>
      )}
    </MtLayout>
  );
};

export default Panel;
