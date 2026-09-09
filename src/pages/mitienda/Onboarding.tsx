import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Check, Clock, Download, Eye, FileSpreadsheet, Loader2,
  Palette, Plus, RefreshCw, Sparkles, Store, Upload, Wand2,
} from "lucide-react";
import "@/mitienda/mitienda.css";
import MtNav from "@/mitienda/components/MtNav";
import DevicePreview from "@/mitienda/components/DevicePreview";
import StoreMock from "@/mitienda/components/StoreMock";
import { useToast } from "@/hooks/use-toast";
import {
  CATEGORIES, CHANNELS, MT_DOMAIN, PLANS, SELL_MODES, STYLE_PRESETS, StyleKey,
  presetFor, recommendPlan, slugify, useStoreDraft,
} from "@/mitienda/draft";

const TAKEN = ["tienda", "shop", "moda", "urbanstyle"];

const STEP_LABELS = ["Cuenta", "Negocio", "Identidad", "Diseño", "Publica"];

const Stepper = ({ step }: { step: number }) => (
  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
    {STEP_LABELS.map((label, index) => {
      const value = index + 1;
      const done = value < step;
      const active = value === step;
      return (
        <div key={label} className="flex items-center gap-2">
          <span
            className="grid h-8 w-8 place-items-center rounded-full text-sm font-bold transition-colors"
            style={{
              background: done ? "#10b981" : active ? "#3b46f1" : "#eef1f8",
              color: done || active ? "#fff" : "#94a3b8",
            }}
          >
            {done ? <Check className="h-4 w-4" /> : value}
          </span>
          <span className={`hidden text-sm sm:block ${active ? "font-bold" : "mt-muted"}`}>{label}</span>
          {value < STEP_LABELS.length && <span className="hidden h-px w-6 bg-[#e2e8f0] sm:block" />}
        </div>
      );
    })}
  </div>
);

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { draft, patch } = useStoreDraft();
  const [ideas, setIdeas] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const step = Math.min(Math.max(draft.step, 1), 5);
  const preset = presetFor(draft.style);

  const slug = draft.slug || slugify(draft.name);
  const available = slug.length >= 3 && !TAKEN.includes(slug);
  const suggestions = slug ? [`${slug}mx`, `${slug}-oficial`, `${slug}.shop`] : [];
  const recommended = useMemo(() => recommendPlan(draft), [draft]);

  const go = (value: number) => {
    patch({ step: value });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggle = (field: "categories" | "channels", key: string) => {
    const current = draft[field];
    patch({ [field]: current.includes(key) ? current.filter((item) => item !== key) : [...current, key] } as never);
  };

  const generateIdeas = () => {
    const base = slugify(draft.name) || "tienda";
    setIdeas([`${base}studio`, `casa${base}`, `${base}mx`, `${base}shop`]);
    toast({ title: "Ideas generadas", description: "Elige una o escribe la tuya." });
  };

  const generateIdentity = () => {
    setGenerating(true);
    window.setTimeout(() => {
      const styles = STYLE_PRESETS.map((item) => item.key);
      const next = styles[(styles.indexOf(draft.style) + 1) % styles.length] as StyleKey;
      patch({ style: next, identityReady: true, tagline: "Moderno. Cercano. Para todos los días." });
      setGenerating(false);
      toast({ title: "Identidad lista", description: "Puedes usarla o generar otra." });
    }, 700);
  };

  const canContinue = step === 1 ? Boolean(draft.name.trim() && available)
    : step === 2 ? draft.categories.length > 0 && Boolean(draft.sellMode)
    : step === 3 ? draft.identityReady
    : true;

  return (
    <div className="mt mt-shell">
      <MtNav variant="minimal" />

      <div className="mx-auto max-w-[1200px] px-4 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button type="button" className="mt-btn mt-btn-ghost mt-btn-sm" onClick={() => (step === 1 ? navigate("/mitienda") : go(step - 1))}>
            <ArrowLeft className="h-4 w-4" /> {step === 1 ? "Volver al inicio" : "Atrás"}
          </button>
          <Stepper step={step} />
          <span className="mt-muted text-sm font-semibold">Paso {step} de 5</span>
        </div>
        <div className="mt-progress mb-8"><span style={{ width: `${(step / 5) * 100}%` }} /></div>

        {/* PASO 1 — NOMBRE Y ENLACE */}
        {step === 1 && (
          <div className="mt-rise grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <span className="mt-chip">Crea tu tienda paso a paso</span>
              <h1 className="mt-title mt-4 text-[2rem] sm:text-[2.6rem]">¿Cómo se llamará tu tienda?</h1>
              <p className="mt-muted mt-2">Elige un nombre y tu enlace inicial. Puedes cambiarlo después.</p>

              <div className="mt-6">
                <label className="mt-label" htmlFor="mt-store-name">Nombre de tu tienda</label>
                <div className="relative">
                  <input
                    id="mt-store-name" className="mt-input !pr-16 text-lg font-semibold" maxLength={50}
                    placeholder="Urban Style" value={draft.name}
                    onChange={(event) => patch({ name: event.target.value, slug: slugify(event.target.value) })}
                  />
                  <span className="mt-muted absolute right-4 top-1/2 -translate-y-1/2 text-xs">{draft.name.length}/50</span>
                </div>
              </div>

              <div className="mt-4">
                <label className="mt-label" htmlFor="mt-store-slug">Tu enlace en MiTienda</label>
                <div className="flex">
                  <span className="mt-muted flex items-center rounded-l-[14px] border border-r-0 bg-[#f5f7fb] px-3 text-sm">{MT_DOMAIN}/</span>
                  <input
                    id="mt-store-slug" className="mt-input rounded-l-none" value={slug}
                    onChange={(event) => patch({ slug: slugify(event.target.value) })} placeholder="tutienda"
                  />
                  {slug.length >= 3 && (
                    <span
                      className="ml-2 flex items-center gap-1 rounded-xl px-3 text-sm font-semibold"
                      style={available ? { background: "#e9fbf2", color: "#0f9b6c" } : { background: "#fdecec", color: "#c0392b" }}
                    >
                      {available ? <>Disponible <Check className="h-4 w-4" /></> : "Ocupado"}
                    </span>
                  )}
                </div>
                {!available && slug.length >= 3 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {suggestions.map((item) => (
                      <button key={item} type="button" className="mt-chip" onClick={() => patch({ slug: slugify(item) })}>{item}</button>
                    ))}
                  </div>
                )}
              </div>

              {ideas.length > 0 && (
                <div className="mt-4">
                  <p className="mt-label">Sugerencias de nombres</p>
                  <div className="flex flex-wrap gap-2">
                    {ideas.map((idea) => (
                      <button key={idea} type="button" className="mt-chip" onClick={() => patch({ name: idea, slug: slugify(idea) })}>{idea}</button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 grid gap-3">
                <button type="button" className="mt-btn mt-btn-primary" disabled={!canContinue} onClick={() => go(2)}>
                  Continuar <ArrowRight className="h-4 w-4" />
                </button>
                <button type="button" className="mt-btn mt-btn-ghost" onClick={generateIdeas}>
                  <Sparkles className="h-4 w-4 text-[#7c5cff]" /> Generar ideas de nombre
                </button>
              </div>
            </div>

            <DevicePreview draft={draft} subtitle="Así se verá tu tienda mientras escribes." />
          </div>
        )}

        {/* PASO 2 — ENCUESTA */}
        {step === 2 && (
          <div className="mt-rise grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <h1 className="mt-title text-[1.9rem] sm:text-[2.4rem]">Vamos a crear una tienda hecha para ti ✨</h1>
              <p className="mt-muted mt-2">Cuéntanos un poco sobre tu negocio y verás cómo cobra vida en tiempo real.</p>

              <section className="mt-card mt-6 p-5">
                <p className="font-bold">1. ¿Qué quieres vender?</p>
                <p className="mt-muted text-sm">Selecciona una o varias opciones</p>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {CATEGORIES.map((cat) => (
                    <button key={cat.key} type="button" className="mt-option" data-on={draft.categories.includes(cat.key)}
                      onClick={() => toggle("categories", cat.key)}>
                      <span className="block text-2xl">{cat.emoji}</span>
                      <span className="mt-1 block text-xs font-semibold">{cat.label}</span>
                      {draft.categories.includes(cat.key) && (
                        <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-[#3b46f1] text-white"><Check className="h-3 w-3" /></span>
                      )}
                    </button>
                  ))}
                </div>
              </section>

              <section className="mt-card mt-4 p-5">
                <p className="font-bold">2. ¿Cómo quieres vender?</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {SELL_MODES.map((mode) => (
                    <button key={mode.key} type="button" className="mt-option !text-left" data-on={draft.sellMode === mode.key}
                      onClick={() => patch({ sellMode: mode.key })}>
                      <span className="text-xl">{mode.emoji}</span>
                      <span className="mt-1 block text-sm font-semibold">{mode.label}</span>
                      <span className="mt-muted block text-xs">{mode.desc}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="mt-card mt-4 p-5">
                <p className="font-bold">3. ¿Dónde vendes actualmente?</p>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {CHANNELS.map((channel) => (
                    <button key={channel.key} type="button" className="mt-option" data-on={draft.channels.includes(channel.key)}
                      onClick={() => toggle("channels", channel.key)}>
                      <span className="block text-xl">{channel.emoji}</span>
                      <span className="mt-1 block text-[11px] font-semibold">{channel.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="mt-card mt-4 p-5">
                <p className="font-bold">4. ¿Cómo quieres que se vea tu tienda?</p>
                <p className="mt-muted text-sm">Elige un estilo. Podrás personalizarlo después.</p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {STYLE_PRESETS.map((style) => (
                    <button key={style.key} type="button" className="mt-option !p-1.5" data-on={draft.style === style.key}
                      onClick={() => patch({ style: style.key })}>
                      <span className="block overflow-hidden rounded-lg border">
                        <StoreMock draft={{ ...draft, style: style.key }} device="mobile" />
                      </span>
                      <span className="mt-1.5 block text-xs font-semibold">{style.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              <div className="mt-5 flex gap-3">
                <button type="button" className="mt-btn mt-btn-ghost" onClick={() => go(1)}><ArrowLeft className="h-4 w-4" /> Atrás</button>
                <button type="button" className="mt-btn mt-btn-primary flex-1" disabled={!canContinue} onClick={() => go(3)}>
                  Continuar <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <DevicePreview draft={draft} subtitle="Tu tienda se adapta a tus respuestas." />
              <div className="mt-card mt-8 p-4 text-sm">
                <p className="font-bold">Tu tienda se adapta a tus respuestas</p>
                <p className="mt-muted">Colores, secciones, productos y estilo. Todo en tiempo real.</p>
              </div>
            </div>
          </div>
        )}

        {/* PASO 3 — IDENTIDAD */}
        {step === 3 && (
          <div className="mt-rise">
            <h1 className="mt-title text-[1.9rem] sm:text-[2.5rem]">Dale personalidad a tu negocio</h1>
            <p className="mt-muted mt-2">Sube tu logo o deja que MiTienda prepare una identidad para ti.</p>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <label className="mt-card mt-card-hover flex cursor-pointer items-center gap-4 p-5">
                <span className="grid h-20 w-20 shrink-0 place-items-center rounded-xl border-2 border-dashed text-[#3b46f1]">
                  <Upload className="h-6 w-6" />
                </span>
                <span>
                  <span className="block text-lg font-bold">Subir mi logo</span>
                  <span className="mt-muted block text-sm">Usa tu propio logo en formatos PNG, JPG o SVG.</span>
                  <span className="mt-btn mt-btn-ghost mt-btn-sm mt-2">Subir archivo</span>
                </span>
                <input type="file" accept="image/png,image/jpeg,image/svg+xml" className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    patch({ logoName: file.name, identityReady: true });
                    toast({ title: "Logo cargado", description: file.name });
                  }} />
              </label>

              <button type="button" className="mt-card p-5 text-left" style={{ borderColor: draft.identityReady && !draft.logoName ? "#3b46f1" : undefined, borderWidth: 2 }}
                onClick={generateIdentity} disabled={generating}>
                <div className="flex items-center gap-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[#eef1ff] text-[#3b46f1]">
                    {generating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Wand2 className="h-6 w-6" />}
                  </span>
                  <div>
                    <p className="text-lg font-bold">Crear identidad por mí ✨</p>
                    <p className="mt-muted text-sm">Generamos logo, colores, tipografía, botones e iconos para tu negocio.</p>
                  </div>
                </div>
              </button>
            </div>

            {draft.identityReady && (
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <section className="mt-card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="mt-chip"><Sparkles className="h-4 w-4" /> Tu identidad generada</p>
                    <span className="mt-muted text-xs">Generada con IA por MiTienda</span>
                  </div>
                  <h2 className="mt-3 text-2xl font-extrabold">{draft.name || "Tu Tienda"}</h2>
                  <p className="mt-muted text-sm">{draft.tagline}</p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="mt-card p-4">
                      <p className="mt-muted text-xs font-semibold">Logo / Wordmark</p>
                      <p className="mt-2 text-xl font-extrabold" style={{ fontFamily: preset.font }}>{draft.name || "Tu Tienda"}</p>
                      <span className="mt-1 block h-1 w-14 rounded" style={{ background: preset.primary }} />
                    </div>
                    <div className="mt-card p-4">
                      <p className="mt-muted text-xs font-semibold">Paleta de colores</p>
                      <div className="mt-2 flex gap-2">
                        {[preset.ink, "#6B7280", preset.primary, preset.surface, "#FFFFFF"].map((color) => (
                          <span key={color} className="h-8 w-8 rounded-full border" style={{ background: color }} title={color} />
                        ))}
                      </div>
                    </div>
                    <div className="mt-card p-4">
                      <p className="mt-muted text-xs font-semibold">Tipografía</p>
                      <p className="text-lg font-bold" style={{ fontFamily: preset.font }}>{preset.font}</p>
                      <p className="mt-muted text-xs">Aa Bb Cc Dd Ee Ff Gg · Moderna y legible.</p>
                    </div>
                    <div className="mt-card p-4">
                      <p className="mt-muted text-xs font-semibold">Estilo de botones</p>
                      <span className="mt-2 inline-block px-3 py-1.5 text-xs font-semibold text-white" style={{ background: preset.ink, borderRadius: preset.radius }}>Botón primario →</span>
                      <span className="mt-2 ml-2 inline-block border px-3 py-1.5 text-xs font-semibold" style={{ borderRadius: preset.radius }}>Botón secundario</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" className="mt-btn mt-btn-ghost mt-btn-sm" onClick={generateIdentity}>
                      <RefreshCw className="h-4 w-4" /> Generar otra
                    </button>
                    <button type="button" className="mt-btn mt-btn-primary mt-btn-sm" onClick={() => go(4)}>
                      Usar esta identidad <ArrowRight className="h-4 w-4" />
                    </button>
                    <button type="button" className="mt-btn mt-btn-ghost mt-btn-sm" onClick={() => go(4)}>Editar después</button>
                  </div>
                </section>

                <DevicePreview draft={draft} title="Vista previa de tu tienda" subtitle="Así se verá tu tienda con esta identidad." />
              </div>
            )}
          </div>
        )}

        {/* PASO 4 — PRIMERA TIENDA + PRODUCTOS */}
        {step === 4 && (
          <div className="mt-rise grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <h1 className="mt-title text-[1.9rem] sm:text-[2.4rem]">✨ Tu primera tienda <span className="text-[#10b981]">está lista</span></h1>
              <p className="mt-muted mt-2">Creamos una base para tu negocio. Ahora puedes personalizarla o agregar productos.</p>
              <div className="mt-6"><DevicePreview draft={draft} title="Tu tienda" subtitle="Revísala en escritorio y móvil." /></div>
              <div className="mt-10 grid gap-2 sm:grid-cols-3">
                <button type="button" className="mt-btn mt-btn-primary" onClick={() => navigate("/dashboard")}>
                  <Palette className="h-4 w-4" /> Personalizar
                </button>
                <button type="button" className="mt-btn mt-btn-ghost" onClick={() => navigate("/mitienda/ejemplo")}>
                  <Eye className="h-4 w-4" /> Ver como cliente
                </button>
                <button type="button" className="mt-btn mt-btn-ghost" onClick={() => go(2)}>
                  <Palette className="h-4 w-4" /> Cambiar estilo
                </button>
              </div>
            </div>

            <div>
              <div className="mt-card p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#eef1ff] text-[#3b46f1]"><Store className="h-5 w-5" /></span>
                  <div>
                    <p className="text-lg font-bold">¿Ya tienes productos?</p>
                    <p className="mt-muted text-sm">Elige cómo quieres agregarlos a tu tienda.</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-2">
                  {[
                    { key: "manual", icon: Plus, title: "Agregar mi primer producto", text: "Crea un producto desde cero en pocos minutos." },
                    { key: "csv", icon: FileSpreadsheet, title: "Importar Excel/CSV", text: "Sube tu lista de productos desde un archivo." },
                    { key: "import", icon: Download, title: "Importar desde otra tienda", text: "Migra desde Shopify, WooCommerce u otra plataforma." },
                    { key: "ia", icon: Sparkles, title: "MiTienda IA", text: "Genera tus productos con IA a partir de una descripción o URL." },
                    { key: "later", icon: Clock, title: "Lo haré después", text: "Ir al panel de mi tienda por ahora." },
                  ].map((option) => (
                    <button key={option.key} type="button" className="mt-card mt-card-hover flex items-center gap-3 p-3 text-left"
                      style={draft.productChoice === option.key ? { borderColor: "#3b46f1" } : undefined}
                      onClick={() => {
                        patch({ productChoice: option.key, firstProduct: option.key !== "later" });
                        toast({
                          title: option.key === "later" ? "Sin problema" : option.title,
                          description: option.key === "later" ? "Puedes agregar productos cuando quieras." : "Lo terminarás en tu panel de productos.",
                        });
                      }}>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f2f5ff] text-[#3b46f1]"><option.icon className="h-5 w-5" /></span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold">{option.title}</span>
                        <span className="mt-muted block text-xs">{option.text}</span>
                      </span>
                      <ArrowRight className="mt-muted ml-auto h-4 w-4" />
                    </button>
                  ))}
                </div>
                <p className="mt-muted mt-4 rounded-xl bg-[#f5f7fb] p-3 text-xs">
                  💡 Puedes empezar con pocos productos y seguir agregando más después.
                </p>
              </div>

              <button type="button" className="mt-btn mt-btn-primary mt-4 w-full" onClick={() => go(5)}>
                Continuar <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* PASO 5 — PLANES */}
        {step === 5 && (
          <div className="mt-rise">
            <h1 className="mt-title text-[1.9rem] sm:text-[2.5rem]">¿Cómo quieres empezar?</h1>
            <p className="mt-muted mt-2">Según lo que quieres hacer, estas son tus mejores opciones.</p>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <article className="mt-card p-6">
                <span className="mt-chip">Empieza hoy, sin tarjeta</span>
                <h2 className="mt-title mt-3 text-3xl">Gratis</h2>
                <p className="mt-1 text-3xl font-extrabold">$0 <span className="mt-muted text-base font-medium">para siempre</span></p>
                <p className="mt-muted mt-2">Publica tu tienda con las herramientas esenciales.</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {PLANS[0].features.map((feature) => (
                    <li key={feature} className="flex gap-2"><Check className="h-4 w-4 text-[#3b46f1]" />{feature}</li>
                  ))}
                </ul>
                <button type="button" className="mt-btn mt-btn-primary mt-6 w-full"
                  onClick={() => { patch({ plan: "gratis" }); navigate("/mitienda/panel"); }}>
                  Continuar gratis <ArrowRight className="h-4 w-4" />
                </button>
              </article>

              {(() => {
                const plan = PLANS.find((item) => item.key === recommended) || PLANS[3];
                return (
                  <article className="mt-card p-6 ring-2 ring-[#3b46f1]">
                    <span className="mt-chip">★ Recomendado para ti</span>
                    <h2 className="mt-title mt-3 text-3xl">{plan.name}</h2>
                    <p className="mt-1 text-3xl font-extrabold">${plan.price} <span className="mt-muted text-base font-medium">/ mes</span></p>
                    <p className="mt-muted mt-2">{plan.pitch}</p>
                    <ul className="mt-4 space-y-2 text-sm">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex gap-2"><Check className="h-4 w-4 text-[#3b46f1]" />{feature}</li>
                      ))}
                    </ul>
                    <button type="button" className="mt-btn mt-btn-primary mt-6 w-full"
                      onClick={() => { patch({ plan: plan.key }); navigate("/mitienda/panel"); }}>
                      Elegir {plan.name} <ArrowRight className="h-4 w-4" />
                    </button>
                  </article>
                );
              })()}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {PLANS.filter((plan) => !["gratis", recommended].includes(plan.key)).map((plan) => (
                <details key={plan.key} className="mt-card p-4">
                  <summary className="cursor-pointer list-none">
                    <span className="font-bold">{plan.name}</span>
                    <span className="mt-muted block text-sm">${plan.price} / mes</span>
                    <span className="mt-muted block text-xs">{plan.pitch}</span>
                  </summary>
                  <ul className="mt-3 space-y-1 text-xs">
                    {plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}
                  </ul>
                  <button type="button" className="mt-btn mt-btn-ghost mt-btn-sm mt-3 w-full"
                    onClick={() => { patch({ plan: plan.key }); navigate("/mitienda/panel"); }}>
                    Elegir {plan.name}
                  </button>
                </details>
              ))}
            </div>

            <p className="mt-muted mt-6 text-center text-sm">Sin riesgos. Puedes cambiar de plan en cualquier momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
