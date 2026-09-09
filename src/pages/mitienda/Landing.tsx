import { useNavigate } from "react-router-dom";
import {
  ArrowRight, BarChart3, Brush, ChevronRight, CreditCard, Package, PlayCircle,
  Rocket, Share2, ShieldCheck, Sparkles, Truck, UserPlus, Wand2,
} from "lucide-react";
import "@/mitienda/mitienda.css";
import MtNav, { MtLogo } from "@/mitienda/components/MtNav";
import StoreMock from "@/mitienda/components/StoreMock";
import { CATEGORIES, EMPTY_DRAFT, PLANS, StyleKey } from "@/mitienda/draft";

const BENEFITS = [
  { icon: Brush, title: "Personaliza todo", text: "Colores, tipografías, secciones y más. Haz que se vea como tú." },
  { icon: Package, title: "Vende tus productos", text: "Ropa, comida, servicios o lo que quieras. Sin límites." },
  { icon: CreditCard, title: "Recibe pedidos y pagos", text: "Con múltiples medios de pago y gestión de envíos." },
  { icon: Share2, title: "Comparte tu propio enlace", text: "Tú eliges el nombre. Compártelo en redes, WhatsApp o donde quieras." },
];

const SHOWCASE: { key: string; label: string; style: StyleKey }[] = [
  { key: "ropa", label: "Moda", style: "moderna" },
  { key: "comida", label: "Comida", style: "juvenil" },
  { key: "belleza", label: "Belleza", style: "elegante" },
  { key: "tecnologia", label: "Tecnología", style: "minimalista" },
  { key: "hogar", label: "Hogar", style: "premium" },
  { key: "servicios", label: "Servicios", style: "colorida" },
];

const STEPS = [
  { icon: UserPlus, title: "Crea tu cuenta", text: "Solo necesitas tu correo electrónico." },
  { icon: Sparkles, title: "Cuéntanos sobre tu negocio", text: "Nos ayuda a personalizar tu experiencia." },
  { icon: Wand2, title: "Recibe una primera propuesta", text: "Te sugerimos un diseño ideal para ti." },
  { icon: Rocket, title: "Personalízala y publícala", text: "Ajusta los detalles, publica y comparte tu tienda." },
];

const FLOATING = [
  { icon: Package, title: "125", sub: "Pedidos hoy", trend: "+24%" },
  { icon: ShieldCheck, title: "Pagos", sub: "seguros" },
  { icon: Share2, title: "Conecta", sub: "tus redes" },
  { icon: Truck, title: "Envíos", sub: "a todo el país" },
  { icon: BarChart3, title: "+62%", sub: "Tu tienda creciendo" },
];

const Landing = () => {
  const navigate = useNavigate();
  const demo = { ...EMPTY_DRAFT, name: "LunaStore", slug: "lunastore", categories: ["hogar", "belleza", "ropa"], style: "moderna" as StyleKey };

  return (
    <div className="mt mt-shell">
      <MtNav />

      {/* HERO */}
      <section className="mt-aurora">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 py-12 lg:grid-cols-[1.05fr_1fr] lg:py-16">
          <div className="mt-rise">
            <span className="mt-chip">Tu negocio empieza aquí</span>
            <h1 className="mt-title mt-5 text-[2.35rem] sm:text-[3.2rem] lg:text-[3.6rem]">
              Crea tu tienda desde cero.
              <br />
              <span className="bg-gradient-to-r from-[#3b46f1] to-[#7c5cff] bg-clip-text text-transparent">
                Hazla completamente tuya.
              </span>
            </h1>
            <p className="mt-muted mt-5 max-w-xl text-lg">
              Diseña, publica, cobra y administra tu negocio desde un solo lugar. No necesitas saber de diseño ni programación.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button type="button" className="mt-btn mt-btn-primary" onClick={() => navigate("/mitienda/registro")}>
                Crear mi tienda gratis <ArrowRight className="h-4 w-4" />
              </button>
              <button type="button" className="mt-btn mt-btn-ghost" onClick={() => navigate("/mitienda/ejemplo")}>
                <PlayCircle className="h-5 w-5 text-[#3b46f1]" /> Ver una tienda de ejemplo
              </button>
            </div>
            <p className="mt-muted mt-4 text-sm">Sin tarjeta · Puedes empezar gratis · Personalízala cuando quieras</p>
          </div>

          <div className="relative">
            <div className="mt-device-frame">
              <div className="flex items-center gap-1.5 border-b bg-[#f6f8fc] px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
                <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
                <span className="h-2 w-2 rounded-full bg-[#28c840]" />
              </div>
              <StoreMock draft={demo} device="desktop" />
            </div>
            <div className="mt-phone-frame mt-float absolute -bottom-8 -left-2 w-[124px] sm:w-[140px]">
              <StoreMock draft={demo} device="mobile" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:absolute lg:-right-4 lg:top-2 lg:mt-0 lg:w-[170px] lg:grid-cols-1">
              {FLOATING.map((item) => (
                <div key={item.title + item.sub} className="mt-card flex items-center gap-2 p-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#eef1ff] text-[#3b46f1]">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{item.title}</p>
                    <p className="mt-muted truncate text-[11px]">{item.sub}</p>
                    {item.trend && <p className="text-[11px] font-semibold text-[#10b981]">↑ {item.trend}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section id="funciones" className="mx-auto max-w-[1200px] px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((item) => (
            <article key={item.title} className="mt-card mt-card-hover p-5">
              <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-[#eef1ff] text-[#3b46f1]">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="font-bold">{item.title}</h3>
              <p className="mt-muted mt-1 text-sm">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* PLANTILLAS */}
      <section id="plantillas" className="mx-auto max-w-[1200px] px-4 pb-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="mt-title text-2xl sm:text-3xl">Inspírate con tiendas reales</h2>
            <p className="mt-muted mt-1">Descubre algunos ejemplos por tipo de negocio.</p>
          </div>
          <button type="button" className="text-sm font-semibold text-[#3b46f1]" onClick={() => navigate("/mitienda/ejemplo")}>
            Ver todas las plantillas →
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SHOWCASE.map((item) => {
            const cat = CATEGORIES.find((entry) => entry.key === item.key);
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(`/mitienda/ejemplo?tipo=${item.key}&estilo=${item.style}`)}
                className="mt-card mt-card-hover overflow-hidden text-left"
              >
                <StoreMock
                  draft={{ ...EMPTY_DRAFT, name: item.label, categories: [item.key], style: item.style }}
                  device="desktop"
                />
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <span className="font-semibold">{cat?.emoji} {item.label}</span>
                  <ChevronRight className="mt-muted h-4 w-4" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="mt-soft-bg py-14">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="text-center">
            <h2 className="mt-title text-2xl sm:text-3xl">Crea tu tienda en pocos pasos</h2>
            <p className="mt-muted mt-2">En minutos, estarás más cerca de hacer realidad tu idea.</p>
          </div>
          <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="mt-card p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#eef1ff] text-sm font-bold text-[#3b46f1]">
                    {index + 1}
                  </span>
                  <step.icon className="h-5 w-5 text-[#3b46f1]" />
                </div>
                <h3 className="mt-3 font-bold">{step.title}</h3>
                <p className="mt-muted mt-1 text-sm">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* PRECIOS */}
      <section id="precios" className="mx-auto max-w-[1200px] px-4 py-14">
        <div className="text-center">
          <h2 className="mt-title text-2xl sm:text-3xl">Precios claros, sin sorpresas</h2>
          <p className="mt-muted mt-2">Empieza gratis para siempre y crece cuando lo necesites.</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <article key={plan.key} className={`mt-card p-5 ${plan.key === "crecimiento" ? "ring-2 ring-[#3b46f1]" : ""}`}>
              {plan.key === "crecimiento" && <span className="mt-chip mb-2">★ Más elegido</span>}
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <p className="mt-1 text-3xl font-extrabold">
                ${plan.price}
                <span className="mt-muted text-sm font-medium"> {plan.price === 0 ? "para siempre" : "/ mes"}</span>
              </p>
              <p className="mt-muted mt-2 text-sm">{plan.pitch}</p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2"><span className="text-[#10b981]">✓</span>{feature}</li>
                ))}
              </ul>
              <button type="button" className="mt-btn mt-btn-ghost mt-4 w-full" onClick={() => navigate("/mitienda/registro")}>
                Empezar con {plan.name}
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="ayuda" className="mx-auto max-w-[1200px] px-4 pb-16">
        <div className="mt-aurora mt-card overflow-hidden p-8 text-center sm:p-12">
          <h2 className="mt-title text-2xl sm:text-3xl">Tu negocio merece un lugar propio.</h2>
          <p className="mt-muted mx-auto mt-2 max-w-xl">
            Haz realidad tu idea con una tienda online fácil, rápida y a tu medida.
          </p>
          <button type="button" className="mt-btn mt-btn-primary mx-auto mt-6" onClick={() => navigate("/mitienda/registro")}>
            Crear mi tienda gratis <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-muted mt-3 text-sm">Sin tarjeta · Puedes empezar gratis · Personalízala cuando quieras</p>
          <div className="mt-muted mt-8 grid gap-4 sm:grid-cols-3">
            <div><p className="text-xl font-extrabold text-[#0f172a]">+50,000</p><p className="text-sm">Emprendedores</p></div>
            <div><p className="text-xl font-extrabold text-[#0f172a]">98%</p><p className="text-sm">Nos recomiendan</p></div>
            <div><p className="text-xl font-extrabold text-[#0f172a]">4.9/5</p><p className="text-sm">En reseñas reales</p></div>
          </div>
        </div>
      </section>

      <footer className="border-t bg-white py-8">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <MtLogo />
          <p className="mt-muted text-sm">© {new Date().getFullYear()} MiTienda. Crea, publica y vende.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
