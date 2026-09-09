import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Monitor, Smartphone } from "lucide-react";
import "@/mitienda/mitienda.css";
import StoreMock from "@/mitienda/components/StoreMock";
import { CATEGORIES, EMPTY_DRAFT, STYLE_PRESETS, StyleKey, readDraft } from "@/mitienda/draft";

const Ejemplo = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const tipo = params.get("tipo");
  const estilo = params.get("estilo") as StyleKey | null;
  const saved = readDraft();

  const draft = tipo
    ? { ...EMPTY_DRAFT, name: CATEGORIES.find((cat) => cat.key === tipo)?.label || "Tienda demo", categories: [tipo], style: estilo || "moderna" }
    : saved.name
      ? saved
      : { ...EMPTY_DRAFT, name: "LunaStore", categories: ["hogar", "belleza", "ropa"] };

  return (
    <div className="mt mt-shell">
      <div className="sticky top-0 z-40 border-b bg-white/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-3">
          <button type="button" className="mt-btn mt-btn-ghost mt-btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" /> Volver
          </button>
          <p className="mt-muted text-sm font-semibold">Vista de cliente · así ve tu tienda cualquier visitante</p>
          <div className="flex gap-1">
            <button type="button" aria-label="Vista escritorio" className="mt-btn mt-btn-ghost mt-btn-sm"
              style={device === "desktop" ? { background: "#eaeeff", color: "#3b46f1" } : undefined}
              onClick={() => setDevice("desktop")}><Monitor className="h-4 w-4" /></button>
            <button type="button" aria-label="Vista móvil" className="mt-btn mt-btn-ghost mt-btn-sm"
              style={device === "mobile" ? { background: "#eaeeff", color: "#3b46f1" } : undefined}
              onClick={() => setDevice("mobile")}><Smartphone className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1100px] px-4 py-8">
        {device === "desktop" ? (
          <div className="mt-device-frame"><StoreMock draft={draft} device="desktop" /></div>
        ) : (
          <div className="mx-auto mt-phone-frame w-[300px]"><StoreMock draft={draft} device="mobile" /></div>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {STYLE_PRESETS.slice(0, 3).map((style) => (
            <button key={style.key} type="button" className="mt-card mt-card-hover overflow-hidden"
              onClick={() => navigate(`/mitienda/ejemplo?tipo=${draft.categories[0] || "ropa"}&estilo=${style.key}`)}>
              <StoreMock draft={{ ...draft, style: style.key }} device="mobile" />
              <span className="block border-t p-2 text-sm font-semibold">{style.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button type="button" className="mt-btn mt-btn-primary" onClick={() => navigate("/mitienda/registro")}>
            Crear mi tienda gratis <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ejemplo;
