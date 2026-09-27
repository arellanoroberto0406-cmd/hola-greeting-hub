import { Truck, ShieldCheck, RotateCcw, Lock, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBarProps {
  primaryColor: string;
  freeShippingThreshold?: number;
  className?: string;
}

const TrustBar = ({ freeShippingThreshold = 999, className }: TrustBarProps) => {
  const items = [
    { icon: Truck, title: "Envío gratis", desc: `Compras +$${freeShippingThreshold.toLocaleString()}` },
    { icon: ShieldCheck, title: "Compra protegida", desc: "Garantía de devolución" },
    { icon: RotateCcw, title: "30 días", desc: "Para devoluciones" },
    { icon: Lock, title: "Pago seguro", desc: "Datos cifrados" },
  ];

  return (
    <div className={cn("vc-trust", className)}>
      <div className="vc-trust-track" aria-hidden="true">
        <div className="vc-marquee">
          {[0, 1].map((copy) => (
            <div className="vc-marquee-set" key={copy}>
              <span><Flame /> Compra segura</span><span>Envíos nacionales</span><span>Atención directa</span><span>Pago protegido</span>
            </div>
          ))}
        </div>
      </div>
      <div className="vc-trust-grid">
        {items.map(({ icon: Icon, title, desc }) => (
          <div className="vc-trust-item" key={title}>
            <div className="vc-trust-icon"><Icon aria-hidden="true" /></div>
            <div><strong>{title}</strong><span>{desc}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustBar;