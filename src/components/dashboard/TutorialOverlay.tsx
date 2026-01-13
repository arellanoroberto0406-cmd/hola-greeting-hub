import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  BarChart3,
  Tag,
  Package,
  Layers,
  CreditCard,
  Settings,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Check,
  Play,
  Palette,
  LayoutTemplate,
  Eye,
  Upload,
  ExternalLink,
  Rocket,
  HelpCircle,
} from "lucide-react";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tips: string[];
  color: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "¡Bienvenido a tu Panel de Control!",
    description: "Este es tu centro de comando para gestionar tu tienda online. Aquí podrás controlar todos los aspectos de tu negocio.",
    icon: <Rocket className="h-8 w-8" />,
    tips: [
      "Navega entre las pestañas para acceder a diferentes funciones",
      "Los cambios se guardan automáticamente cuando sea posible",
      "Puedes ver tu tienda en cualquier momento con el botón 'Ver tienda'"
    ],
    color: "#8B5CF6"
  },
  {
    id: "orders",
    title: "📦 Pedidos",
    description: "Gestiona todos los pedidos de tus clientes. Ve el estado, detalles y actualiza el progreso de cada orden.",
    icon: <ShoppingBag className="h-8 w-8" />,
    tips: [
      "Revisa los pedidos pendientes diariamente",
      "Actualiza el estado para que tus clientes estén informados",
      "Filtra por estado: pendiente, procesando, enviado, entregado"
    ],
    color: "#F59E0B"
  },
  {
    id: "analytics",
    title: "📊 Analytics",
    description: "Visualiza estadísticas de ventas, productos más vendidos y tendencias de tu tienda.",
    icon: <BarChart3 className="h-8 w-8" />,
    tips: [
      "Revisa las métricas semanalmente para tomar decisiones",
      "Identifica tus productos estrella",
      "Analiza los horarios con más ventas"
    ],
    color: "#10B981"
  },
  {
    id: "coupons",
    title: "🏷️ Cupones",
    description: "Crea códigos de descuento para promociones especiales y atrae más clientes.",
    icon: <Tag className="h-8 w-8" />,
    tips: [
      "Crea cupones para fechas especiales (Black Friday, Navidad)",
      "Usa descuentos por porcentaje o monto fijo",
      "Establece límites de uso y fechas de expiración"
    ],
    color: "#EC4899"
  },
  {
    id: "products",
    title: "🛍️ Productos",
    description: "Agrega, edita y organiza tu catálogo de productos. Sube imágenes y define precios.",
    icon: <Package className="h-8 w-8" />,
    tips: [
      "Usa fotos de alta calidad para tus productos",
      "Escribe descripciones detalladas y atractivas",
      "Organiza por colecciones para facilitar la navegación",
      "Marca productos como 'Nuevo' o 'En oferta' para destacarlos"
    ],
    color: "#3B82F6"
  },
  {
    id: "editor",
    title: "🎨 Editor de Tienda",
    description: "Personaliza el diseño y apariencia de tu tienda. ¡Aquí es donde la magia sucede!",
    icon: <Layers className="h-8 w-8" />,
    tips: [
      "📋 Plantillas: Elige diseños predefinidos o guarda los tuyos",
      "🧩 Secciones: Arrastra y suelta para reorganizar tu tienda",
      "🎨 Estilos: Cambia fuentes, colores y efectos",
      "👁️ Vista previa: Ve los cambios en tiempo real"
    ],
    color: "#8B5CF6"
  },
  {
    id: "subscription",
    title: "💳 Plan y Suscripción",
    description: "Gestiona tu plan de suscripción y accede a funciones premium.",
    icon: <CreditCard className="h-8 w-8" />,
    tips: [
      "Revisa las características de cada plan",
      "Actualiza tu plan para desbloquear más funciones",
      "Consulta el historial de pagos"
    ],
    color: "#6366F1"
  },
  {
    id: "settings",
    title: "⚙️ Configuración",
    description: "Ajusta la configuración general de tu tienda: datos de contacto, envíos, colores y más.",
    icon: <Settings className="h-8 w-8" />,
    tips: [
      "Mantén actualizados tus datos de contacto",
      "Configura los costos de envío",
      "Personaliza los colores de tu marca",
      "Sube tu logo y banner"
    ],
    color: "#64748B"
  },
  {
    id: "finish",
    title: "¡Listo para comenzar!",
    description: "Ya conoces todas las herramientas. Ahora es momento de crear tu tienda perfecta.",
    icon: <Sparkles className="h-8 w-8" />,
    tips: [
      "Empieza agregando tus primeros productos",
      "Personaliza el diseño con el Editor",
      "Comparte tu tienda en redes sociales",
      "¡Recuerda que puedes ver este tutorial cuando quieras!"
    ],
    color: "#10B981"
  }
];

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  primaryColor?: string;
}

export const TutorialOverlay = ({ isOpen, onClose, primaryColor = "#8B5CF6" }: TutorialOverlayProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([0]));

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (!isLastStep) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setVisitedSteps(prev => new Set([...prev, nextStep]));
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    // Save that user has seen the tutorial
    localStorage.setItem('dashboard_tutorial_seen', 'true');
    onClose();
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-md flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          {/* Progress Bar */}
          <div className="mb-4 flex items-center gap-2">
            {TUTORIAL_STEPS.map((_, index) => (
              <motion.div
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 cursor-pointer`}
                style={{
                  backgroundColor: index <= currentStep ? primaryColor : 'hsl(var(--muted))',
                  opacity: index <= currentStep ? 1 : 0.3,
                }}
                onClick={() => {
                  setCurrentStep(index);
                  setVisitedSteps(prev => new Set([...prev, index]));
                }}
                whileHover={{ scale: 1.1 }}
              />
            ))}
          </div>

          <Card className="overflow-hidden border-2 shadow-2xl">
            {/* Header */}
            <div 
              className="p-6 text-white relative overflow-hidden"
              style={{ backgroundColor: step.color }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white transform translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white transform -translate-x-1/2 translate-y-1/2" />
              </div>

              <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    key={step.id}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                  >
                    {step.icon}
                  </motion.div>
                  <div>
                    <Badge className="mb-2 bg-white/20 hover:bg-white/30 text-white border-0">
                      Paso {currentStep + 1} de {TUTORIAL_STEPS.length}
                    </Badge>
                    <motion.h2 
                      key={step.title}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-2xl font-bold"
                    >
                      {step.title}
                    </motion.h2>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Description */}
              <motion.p
                key={step.description}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg text-muted-foreground"
              >
                {step.description}
              </motion.p>

              {/* Tips */}
              <motion.div
                key={`tips-${step.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-3"
              >
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  💡 Consejos
                </h4>
                <ul className="space-y-2">
                  {step.tips.map((tip, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <Check 
                        className="h-5 w-5 flex-shrink-0 mt-0.5" 
                        style={{ color: step.color }}
                      />
                      <span className="text-sm">{tip}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-muted-foreground"
                >
                  Saltar tutorial
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={isFirstStep}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="gap-2 min-w-[140px]"
                    style={{ backgroundColor: step.color }}
                  >
                    {isLastStep ? (
                      <>
                        ¡Comenzar!
                        <Sparkles className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Siguiente
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Keyboard hint */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            Usa las flechas ← → del teclado para navegar • ESC para cerrar
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Small floating button to reopen tutorial
export const TutorialHelpButton = ({ onClick, primaryColor }: { onClick: () => void; primaryColor?: string }) => {
  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg flex items-center justify-center text-white"
      style={{ backgroundColor: primaryColor || '#8B5CF6' }}
      title="Ver tutorial"
    >
      <HelpCircle className="h-6 w-6" />
    </motion.button>
  );
};

export default TutorialOverlay;
