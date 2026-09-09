import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Brush, CheckCircle2, Copy, CreditCard, ExternalLink, Package } from "lucide-react";
import "@/mitienda/mitienda.css";
import MtNav from "@/mitienda/components/MtNav";
import StoreMock from "@/mitienda/components/StoreMock";
import { useToast } from "@/hooks/use-toast";
import { MT_DOMAIN, useStoreDraft } from "@/mitienda/draft";

const COLORS = ["#3b46f1", "#7c5cff", "#38bdf8", "#f59e0b", "#10b981", "#f43f5e"];

const Confetti = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    {Array.from({ length: 26 }).map((_, index) => (
      <span
        key={index}
        className="mt-confetti"
        style={{
          left: `${(index * 3.8) % 100}%`,
          background: COLORS[index % COLORS.length],
          animationDuration: `${3 + (index % 4)}s`,
          animationDelay: `${(index % 8) * 0.35}s`,
        }}
      />
    ))}
  </div>
);

const Publicada = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { draft } = useStoreDraft();
  const [copied, setCopied] = useState(false);

  const slug = draft.slug || "tu-tienda";
  const url = `${MT_DOMAIN}/${slug}`;
  const shareUrl = `https://${url}`;
  const qr = useMemo(
    () => `https://api.qrserver.com/v1/create-qr-code/?size=320x320&ecc=H&data=${encodeURIComponent(shareUrl)}`,
    [shareUrl],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: "Enlace copiado", description: "Ya puedes compartir tu tienda." });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "No se pudo copiar", variant: "destructive" });
    }
  };

  const share = (network: string) => {
    const text = encodeURIComponent(`¡Ya está en línea mi tienda ${draft.name || "MiTienda"}! ${shareUrl}`);
    const links: Record<string, string> = {
      WhatsApp: `https://wa.me/?text=${text}`,
      Facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      Instagram: "https://www.instagram.com/",
      TikTok: "https://www.tiktok.com/upload",
    };
    if (network === "Instagram" || network === "TikTok") {
      copy();
      toast({ title: `Enlace listo para ${network}`, description: "Pégalo en tu perfil o publicación." });
    }
    window.open(links[network], "_blank", "noopener");
  };

  return (
    <div className="mt mt-shell">
      <MtNav variant="minimal" />

      <section className="mt-aurora relative overflow-hidden">
        <Confetti />
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-8 px-4 py-12 lg:grid-cols-[1.05fr_1fr]">
          <div className="mt-rise">
            <span className="mt-chip">¡Listo!</span>
            <h1 className="mt-title mt-4 text-[2.1rem] sm:text-[2.9rem]">🎉 ¡Tu tienda ya está en línea!</h1>
            <p className="mt-muted mt-3 max-w-lg">
              <strong className="text-[#0f172a]">{draft.name || "Tu tienda"}</strong> ya está disponible para todo el mundo.
              Tu tienda está abierta 24/7. Compártela y empieza a recibir visitas.
            </p>

            <div className="mt-card mt-6 flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="mt-muted text-xs font-semibold">Tu tienda en línea</p>
                <p className="truncate text-xl font-extrabold text-[#3b46f1]">{url}</p>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-[#e9fbf2] px-3 py-1 text-sm font-semibold text-[#0f9b6c]">
                <CheckCircle2 className="h-4 w-4" /> Publicada
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button type="button" className="mt-btn mt-btn-primary" onClick={copy}>
                <Copy className="h-4 w-4" /> {copied ? "Copiado" : "Copiar enlace"}
              </button>
              <button type="button" className="mt-btn mt-btn-ghost" onClick={() => navigate("/mitienda/ejemplo")}>
                <ExternalLink className="h-4 w-4" /> Ver mi tienda
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="mt-device-frame"><StoreMock draft={draft} device="desktop" /></div>
            <div className="mt-phone-frame mt-float absolute -bottom-6 -left-3 w-[120px]">
              <StoreMock draft={draft} device="mobile" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1200px] gap-4 px-4 py-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="mt-card p-6">
          <h2 className="mt-title text-2xl">Comparte tu tienda</h2>
          <p className="mt-muted mt-1">Haz que más personas conozcan tu negocio.</p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { name: "WhatsApp", emoji: "💬", bg: "#e9fbf2" },
              { name: "Facebook", emoji: "📘", bg: "#eaf1ff" },
              { name: "Instagram", emoji: "📸", bg: "#fdeef6" },
              { name: "TikTok", emoji: "🎵", bg: "#f2f2f2" },
            ].map((network) => (
              <button key={network.name} type="button" className="mt-card mt-card-hover p-4 text-center" style={{ background: network.bg }}
                onClick={() => share(network.name)}>
                <span className="block text-2xl">{network.emoji}</span>
                <span className="mt-1 block text-sm font-semibold">{network.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-card p-6 text-center">
          <h2 className="text-xl font-bold">Código QR</h2>
          <p className="mt-muted mt-1 text-sm">Que te encuentren es aún más fácil.</p>
          <img src={qr} alt={`Código QR de ${url}`} className="mx-auto mt-4 h-40 w-40 rounded-xl border" loading="lazy" />
          <p className="mt-3 text-sm font-semibold text-[#3b46f1]">{url}</p>
          <a className="mt-btn mt-btn-ghost mt-btn-sm mt-3 inline-flex" href={qr} download={`qr-${slug}.png`} target="_blank" rel="noreferrer">
            Descargar QR
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 pb-16">
        <h2 className="mt-title text-2xl">¿Qué quieres hacer ahora?</h2>
        <p className="mt-muted mt-1">Sigue impulsando tu negocio. Aquí tienes algunas opciones:</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Package, title: "Agregar productos", text: "Suma más productos y haz crecer tu catálogo.", to: "/dashboard" },
            { icon: CreditCard, title: "Activar pagos", text: "Configura tus métodos de pago para empezar a vender.", to: "/mitienda/panel" },
            { icon: BarChart3, title: "Ver estadísticas", text: "Conoce tus visitas, ventas y el rendimiento de tu tienda.", to: "/dashboard" },
            { icon: Brush, title: "Seguir personalizando", text: "Ajusta el diseño, colores y contenidos cuando quieras.", to: "/dashboard" },
          ].map((action) => (
            <button key={action.title} type="button" className="mt-card mt-card-hover p-5 text-left" onClick={() => navigate(action.to)}>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#eef1ff] text-[#3b46f1]"><action.icon className="h-5 w-5" /></span>
              <p className="mt-3 font-bold">{action.title}</p>
              <p className="mt-muted mt-1 text-sm">{action.text}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Publicada;
