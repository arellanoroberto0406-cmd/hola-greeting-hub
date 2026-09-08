import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Palette,
  Package,
  Share2,
  Check,
  ArrowRight,
  ExternalLink,
  ShoppingBag,
  Wallet,
  Sparkles,
} from "lucide-react";

interface HomeGuidePanelProps {
  storeName: string;
  storeSlug: string;
  primaryColor: string;
  productCount: number;
  orderCount: number;
  hasCustomDesign: boolean;
  hasPaymentMethod: boolean;
  onGo: (tab: string) => void;
}

const HomeGuidePanel = ({
  storeName,
  storeSlug,
  primaryColor,
  productCount,
  orderCount,
  hasCustomDesign,
  hasPaymentMethod,
  onGo,
}: HomeGuidePanelProps) => {
  const steps = [
    {
      id: "editor",
      icon: Palette,
      title: "Dale su estilo a tu tienda",
      description: "Elige colores, portada y las secciones que quieres mostrar.",
      action: "Personalizar",
      done: hasCustomDesign,
    },
    {
      id: "products",
      icon: Package,
      title: "Sube tus productos",
      description: "Agrega fotos, precios y existencias para empezar a vender.",
      action: productCount > 0 ? "Agregar más" : "Subir productos",
      done: productCount > 0,
    },
    {
      id: "url",
      icon: Share2,
      title: "Comparte tu enlace",
      description: "Manda tu tienda por WhatsApp, redes sociales o con un código QR.",
      action: "Compartir",
      done: orderCount > 0,
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  const progress = Math.round((completed / steps.length) * 100);

  const shortcuts = [
    { id: "orders", icon: ShoppingBag, label: "Ver pedidos", hint: `${orderCount} este mes` },
    { id: "payments", icon: Wallet, label: "Cómo te pagan", hint: hasPaymentMethod ? "Listo" : "Sin configurar" },
    { id: "subscription", icon: Sparkles, label: "Mi plan", hint: "Mejorar" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome + progress */}
      <Card className="overflow-hidden border-border/60">
        <div
          className="p-6 md:p-8"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}1f, ${primaryColor}05)`,
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <Badge variant="secondary" className="mb-3">Tu tienda en 3 pasos</Badge>
              <h2 className="font-heading text-2xl md:text-3xl font-bold truncate">
                Hola, {storeName}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">
                Sigue estos pasos y tu tienda queda lista para recibir clientes.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => window.open(`/tienda/${storeSlug}`, "_blank")}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Ver mi tienda
            </Button>
          </div>

          <div className="mt-6 max-w-md">
            <div className="flex items-center justify-between text-xs font-medium mb-2">
              <span>{completed} de {steps.length} pasos listos</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </Card>

      {/* Steps */}
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step, i) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card
              className="h-full border-border/60 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onGo(step.id)}
            >
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="h-11 w-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}1a`, color: primaryColor }}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  {step.done ? (
                    <Badge className="gap-1 bg-emerald-500/15 text-emerald-600 border-0">
                      <Check className="h-3 w-3" /> Listo
                    </Badge>
                  ) : (
                    <span className="text-xs font-semibold text-muted-foreground">
                      Paso {i + 1}
                    </span>
                  )}
                </div>
                <h3 className="font-heading font-bold text-base mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground flex-1">{step.description}</p>
                <Button
                  variant="ghost"
                  className="mt-4 justify-between px-0 hover:bg-transparent"
                  style={{ color: primaryColor }}
                >
                  {step.action}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Shortcuts */}
      <div className="grid gap-3 sm:grid-cols-3">
        {shortcuts.map((s) => (
          <button
            key={s.id}
            onClick={() => onGo(s.id)}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 text-left transition-colors hover:bg-muted/50"
          >
            <s.icon className="h-5 w-5 flex-shrink-0" style={{ color: primaryColor }} />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{s.label}</p>
              <p className="text-xs text-muted-foreground truncate">{s.hint}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomeGuidePanel;
