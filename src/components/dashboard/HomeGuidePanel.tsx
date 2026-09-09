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
  CreditCard,
  TrendingUp,
  Users,
  CircleCheck,
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
      id: "payments",
      icon: CreditCard,
      title: "Configura tus pagos",
      description: "Elige cómo quieres recibir el dinero de tus ventas.",
      action: "Configurar pagos",
      done: hasPaymentMethod,
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
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-2xl font-bold md:text-3xl">¡Hola, {storeName}! <span aria-hidden="true">👋</span></h1><p className="text-sm text-muted-foreground">Aquí tienes un resumen de tu tienda. Sigue configurando para recibir más clientes.</p></div>
        <p className="text-xs text-muted-foreground">Tu negocio, todo en un solo lugar.</p>
      </div>
      {/* Welcome + progress */}
      <Card className="dashboard-progress overflow-hidden">
        <div className="p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <Badge variant="secondary" className="mb-2">Tu tienda en 4 pasos</Badge>
              <h2 className="font-heading text-xl font-bold">Completa la configuración y empieza a vender</h2>
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

          <div className="mt-5 max-w-2xl">
            <div className="flex items-center justify-between text-xs font-medium mb-2">
              <span>{completed} de {steps.length} pasos listos</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </Card>

      {/* Steps */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, i) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card
              className={`dashboard-step dashboard-step-${i + 1} h-full cursor-pointer`}
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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardSnapshot icon={Wallet} label="Ingresos" value="$0.00" note="Este mes" />
        <DashboardSnapshot icon={ShoppingBag} label="Pedidos" value={String(orderCount)} note="Este mes" />
        <DashboardSnapshot icon={Package} label="Productos" value={String(productCount)} note="En catálogo" />
        <DashboardSnapshot icon={Users} label="Clientes" value="—" note="Próximamente" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.55fr_.8fr]">
        <Card className="dashboard-panel"><CardContent className="p-5"><div className="mb-4 flex items-center justify-between"><div><h3 className="font-bold">Acciones rápidas</h3><p className="text-xs text-muted-foreground">Continúa trabajando en tu negocio</p></div><TrendingUp className="h-5 w-5 text-primary" /></div><div className="grid gap-3 sm:grid-cols-3">{shortcuts.map((s) => <Button key={s.id} variant="outline" className="h-auto justify-start gap-3 p-4" onClick={() => onGo(s.id)}><s.icon className="h-5 w-5 text-primary" /><span className="text-left"><span className="block font-semibold">{s.label}</span><span className="block text-xs text-muted-foreground">{s.hint}</span></span></Button>)}</div></CardContent></Card>
        <Card className="dashboard-panel"><CardContent className="p-5"><div className="mb-4 flex items-center gap-3"><div className="dashboard-metric-icon"><CircleCheck className="h-5 w-5" /></div><div><h3 className="font-bold">Tienda en línea</h3><p className="text-xs text-emerald-400">Publicada y disponible</p></div></div><Button className="w-full" onClick={() => window.open(`/tienda/${storeSlug}`, "_blank")}>Abrir tienda <ExternalLink className="h-4 w-4" /></Button></CardContent></Card>
      </div>
    </div>
  );
};

const DashboardSnapshot = ({ icon: Icon, label, value, note }: { icon: typeof Wallet; label: string; value: string; note: string }) => (
  <Card className="dashboard-panel"><CardContent className="flex items-center justify-between p-4"><div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p><p className="text-[11px] text-emerald-400">{note}</p></div><div className="dashboard-metric-icon"><Icon className="h-5 w-5" /></div></CardContent></Card>
);

export default HomeGuidePanel;
