import { Lock, ShieldCheck, BadgeCheck, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface HeaderSecurityStripProps {
  primaryColor: string;
}

/**
 * Prominent security strip shown right under the store header.
 * Communicates trust at every page: SSL, buyer protection, verified payments, returns.
 */
const HeaderSecurityStrip = ({ primaryColor }: HeaderSecurityStripProps) => {
  const items = [
    { icon: Lock, label: "Pago 100% seguro", sub: "Cifrado SSL 256-bit" },
    { icon: ShieldCheck, label: "Compra protegida", sub: "Reembolso garantizado" },
    { icon: BadgeCheck, label: "Vendedor verificado", sub: "Tienda oficial" },
    { icon: RotateCcw, label: "Devoluciones 30 días", sub: "Sin complicaciones" },
  ];

  return (
    <div
      className="relative border-b overflow-hidden"
      style={{
        borderColor: `${primaryColor}25`,
        background: `linear-gradient(90deg, ${primaryColor}10, ${primaryColor}05 50%, ${primaryColor}10)`,
      }}
    >
      {/* animated sheen */}
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${primaryColor}20, transparent)`,
        }}
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />

      <div className="container mx-auto px-4 relative">
        <div className="flex md:grid md:grid-cols-4 gap-3 md:gap-4 py-2.5 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {items.map(({ icon: Icon, label, sub }, i) => (
            <div
              key={i}
              className="flex items-center gap-2 min-w-[190px] md:min-w-0 snap-start shrink-0"
            >
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ring-1"
                style={{
                  backgroundColor: `${primaryColor}18`,
                  color: primaryColor,
                  boxShadow: `0 0 0 1px ${primaryColor}30, 0 2px 8px -2px ${primaryColor}40`,
                }}
              >
                <Icon className="h-4 w-4" strokeWidth={2.4} />
              </div>
              <div className="leading-tight min-w-0">
                <p className="text-[12px] font-bold truncate">{label}</p>
                <p className="text-[10.5px] text-muted-foreground truncate">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeaderSecurityStrip;
