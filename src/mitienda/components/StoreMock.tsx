import { categoriesFor, presetFor, productsFor, StoreDraft } from "../draft";

interface Props {
  draft: StoreDraft;
  device?: "desktop" | "mobile";
  className?: string;
}

const StoreMock = ({ draft, device = "desktop", className = "" }: Props) => {
  const preset = presetFor(draft.style);
  const name = draft.name.trim() || "Tu Tienda";
  const cats = categoriesFor(draft.categories);
  const products = productsFor(draft.categories).slice(0, device === "mobile" ? 4 : 8);
  const mobile = device === "mobile";

  return (
    <div
      className={className}
      style={{ background: "#fff", color: preset.ink, fontFamily: `${preset.font}, Inter, sans-serif` }}
    >
      {/* Barra de la tienda */}
      <div
        className="flex items-center justify-between border-b px-3 py-2"
        style={{ borderColor: "#e9ecf5" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="grid h-5 w-5 place-items-center rounded text-[10px] font-bold text-white"
            style={{ background: preset.primary, borderRadius: preset.radius }}
          >
            {name.charAt(0).toUpperCase()}
          </span>
          <span className="text-[11px] font-bold">{name}</span>
        </div>
        {mobile ? (
          <span className="text-[11px]">🛒</span>
        ) : (
          <div className="flex items-center gap-3 text-[9px] opacity-70">
            <span>Inicio</span><span>Productos</span><span>Categorías</span><span>Nosotros</span><span>🔍</span><span>🛒</span>
          </div>
        )}
      </div>

      {/* Portada */}
      <div className="px-3 py-4" style={{ background: preset.surface }}>
        <p className="text-[8px] font-semibold uppercase tracking-widest opacity-60">Nueva colección</p>
        <p className={`${mobile ? "text-[15px]" : "text-[20px]"} mt-1 font-extrabold leading-tight`}>
          {draft.tagline.split(".")[0] || "Tu estilo"}
          <br />
          <span style={{ color: preset.primary }}>hecho para ti</span>
        </p>
        <p className="mt-1 text-[8px] opacity-70">Productos que hacen tu vida más linda.</p>
        <span
          className="mt-2 inline-block px-3 py-1 text-[9px] font-semibold text-white"
          style={{ background: preset.primary, borderRadius: preset.radius }}
        >
          Ver productos →
        </span>
      </div>

      {/* Confianza */}
      <div className="flex justify-between border-b px-3 py-2 text-[7px] opacity-70" style={{ borderColor: "#eef1f8" }}>
        <span>🚚 Envíos a todo el país</span>
        <span>🛡️ Pagos seguros</span>
        {!mobile && <span>💚 Clientes felices</span>}
      </div>

      {/* Categorías */}
      <div className="px-3 pt-3">
        <p className="text-[9px] font-bold">Categorías</p>
        <div className="mt-2 flex gap-2 overflow-hidden">
          {cats.slice(0, mobile ? 3 : 6).map((cat) => (
            <div key={cat.key} className="flex-1 text-center">
              <div
                className="grid aspect-square place-items-center text-[14px]"
                style={{ background: preset.surface, borderRadius: preset.radius }}
              >
                {cat.emoji}
              </div>
              <p className="mt-1 truncate text-[7px] opacity-70">{cat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Productos */}
      <div className="px-3 py-3">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-bold">Productos destacados</p>
          <span className="text-[7px]" style={{ color: preset.primary }}>Ver todo →</span>
        </div>
        <div className={`mt-2 grid gap-2 ${mobile ? "grid-cols-2" : "grid-cols-4"}`}>
          {products.map((product) => (
            <div key={product.name} className="overflow-hidden border" style={{ borderRadius: preset.radius, borderColor: "#eef1f8" }}>
              <div className="grid aspect-square place-items-center text-[18px]" style={{ background: preset.surface }}>
                {product.emoji}
              </div>
              <div className="p-1.5">
                <p className="truncate text-[7px] font-semibold">{product.name}</p>
                <p className="text-[7px] font-bold" style={{ color: preset.primary }}>${product.price} MXN</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {draft.channels.includes("whatsapp") && (
        <div className="px-3 pb-3">
          <div className="rounded-lg px-2 py-1.5 text-[8px] font-semibold text-white" style={{ background: "#22c55e", borderRadius: preset.radius }}>
            💬 Pide por WhatsApp
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreMock;
