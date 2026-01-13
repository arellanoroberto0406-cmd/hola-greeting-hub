import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StoreSection } from "@/types/storeLayout";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { GripVertical, Settings, Eye, EyeOff, Type, Image, Grid, ShoppingBag, Mail, Info, Phone, Sparkles, Layout } from "lucide-react";
import { motion } from "framer-motion";

interface SortableSectionProps {
  section: StoreSection;
  onToggle: (id: string) => void;
  onEdit: (section: StoreSection) => void;
  primaryColor?: string;
}

const sectionIcons: Record<string, any> = {
  hero: Layout,
  featured_products: Sparkles,
  categories: Grid,
  banner: Image,
  testimonials: Type,
  newsletter: Mail,
  about: Info,
  contact: Phone,
  products_grid: ShoppingBag,
  custom_text: Type,
};

const sectionDescriptions: Record<string, string> = {
  hero: 'Banner principal con título y botón de acción',
  featured_products: 'Muestra productos destacados',
  categories: 'Navegación por categorías de productos',
  banner: 'Banner promocional o informativo',
  testimonials: 'Reseñas y testimonios de clientes',
  newsletter: 'Formulario de suscripción al boletín',
  about: 'Información sobre tu tienda',
  contact: 'Información de contacto y redes sociales',
  products_grid: 'Grilla completa de productos con filtros',
  custom_text: 'Sección de texto personalizado',
};

export const SortableSection = ({ section, onToggle, onEdit, primaryColor = '#8B4513' }: SortableSectionProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = sectionIcons[section.type] || Layout;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDragging ? 'z-50' : ''}`}
    >
      <Card
        className={`p-4 transition-all duration-200 ${
          isDragging ? 'shadow-2xl scale-105 ring-2' : 'shadow-sm hover:shadow-md'
        } ${!section.enabled ? 'opacity-60' : ''}`}
        style={{
          borderColor: isDragging ? primaryColor : undefined,
        }}
      >
        <div className="flex items-center gap-4">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 -m-2 rounded-lg hover:bg-muted transition-colors"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Icon */}
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <Icon className="h-5 w-5" style={{ color: primaryColor }} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{section.title}</h4>
            <p className="text-sm text-muted-foreground truncate">
              {sectionDescriptions[section.type]}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(section)}
              className="h-9 w-9"
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              {section.enabled ? (
                <Eye className="h-4 w-4 text-muted-foreground" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              <Switch
                checked={section.enabled}
                onCheckedChange={() => onToggle(section.id)}
              />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
