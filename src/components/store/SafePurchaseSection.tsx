import { motion } from "framer-motion";
import { ShieldCheck, Lock, RefreshCw, BadgeCheck, Truck, Headphones } from "lucide-react";

interface SafePurchaseSectionProps {
  primaryColor: string;
  storeName: string;
}

const guarantees = [
  {
    icon: ShieldCheck,
    title: "Compra 100% Protegida",
    desc: "Tu dinero está respaldado. Si tu pedido no llega o no es como se describe, te devolvemos el importe.",
  },
  {
    icon: Lock,
    title: "Pago Cifrado SSL",
    desc: "Procesamos los pagos con cifrado bancario. Nunca almacenamos los datos de tu tarjeta.",
  },
  {
    icon: BadgeCheck,
    title: "Pasarelas Verificadas",
    desc: "Trabajamos con PayPal y transferencia bancaria con validación manual de cada pago.",
  },
  {
    icon: RefreshCw,
    title: "Devoluciones Sencillas",
    desc: "30 días para cambiar de opinión. Reembolso garantizado sin complicaciones.",
  },
  {
    icon: Truck,
    title: "Envío con Seguimiento",
    desc: "Cada pedido viaja con número de rastreo. Sabes dónde está tu compra en todo momento.",
  },
  {
    icon: Headphones,
    title: "Soporte Real",
    desc: "Atención por WhatsApp y chat en vivo. Personas reales que te responden rápido.",
  },
];

export const SafePurchaseSection = ({ primaryColor, storeName }: SafePurchaseSectionProps) => {
  return (
    <section
      className="relative py-16 md:py-24 px-4 overflow-hidden"
      aria-labelledby="compra-segura-heading"
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}08, transparent 60%, ${primaryColor}05)`,
        }}
      />
      <div className="absolute inset-0 -z-10 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 border backdrop-blur-sm"
            style={{
              backgroundColor: `${primaryColor}10`,
              borderColor: `${primaryColor}30`,
              color: primaryColor,
            }}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            COMPRA SEGURA GARANTIZADA
          </div>
          <h2
            id="compra-segura-heading"
            className="text-3xl md:text-5xl font-bold mb-4 tracking-tight"
          >
            Compra con total tranquilidad
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            En {storeName} cuidamos cada detalle de tu experiencia. Estas son las garantías que respaldan tu compra.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {guarantees.map((g, i) => {
            const Icon = g.icon;
            return (
              <motion.div
                key={g.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="group relative p-5 md:p-6 rounded-2xl border bg-card/60 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{ borderColor: `${primaryColor}20` }}
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}08, transparent)`,
                  }}
                />
                <div
                  className="relative inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    color: primaryColor,
                  }}
                >
                  <Icon className="h-6 w-6" strokeWidth={2.2} />
                </div>
                <h3 className="relative font-bold text-lg mb-2">{g.title}</h3>
                <p className="relative text-sm text-muted-foreground leading-relaxed">
                  {g.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Trust footer strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs md:text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" style={{ color: primaryColor }} />
            <span>Cifrado SSL 256-bit</span>
          </div>
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4" style={{ color: primaryColor }} />
            <span>Pagos verificados PayPal</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" style={{ color: primaryColor }} />
            <span>Datos protegidos GDPR</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SafePurchaseSection;
