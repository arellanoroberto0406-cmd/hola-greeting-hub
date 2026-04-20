import { Truck, ShieldCheck, RotateCcw, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBarProps {
  primaryColor: string;
  freeShippingThreshold?: number;
  className?: string;
}

/**
 * Compact trust bar shown below the store header.
 * Boosts conversion by communicating shipping, returns and security guarantees.
 * Mobile: horizontal scroll with snap. Desktop: 4-column grid.
 */
const TrustBar = ({ primaryColor, freeShippingThreshold = 999, className }: TrustBarProps) => {
  const items = [
    {
      icon: Truck,
      title: "Envío gratis",
      desc: `En compras +$${freeShippingThreshold.toLocaleString()}`,
    },
    {
      icon: ShieldCheck,
      title: "Compra protegida",
      desc: "Garantía de devolución",
    },
    {
      icon: RotateCcw,
      title: "30 días",
      desc: "Para devoluciones",
    },
    {
      icon: Lock,
      title: "Pago seguro",
      desc: "SSL y datos cifrados",
    },
  ];

  return (
    <div
      className={cn(
        "border-b border-border/40 bg-muted/30 backdrop-blur-sm",
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex md:grid md:grid-cols-4 gap-3 md:gap-6 py-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-2.5 min-w-[180px] md:min-w-0 snap-start shrink-0"
              >
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    color: primaryColor,
                  }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-tight truncate">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-tight truncate">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrustBar;
