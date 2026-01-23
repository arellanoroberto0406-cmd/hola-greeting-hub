import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StoreSection, SECTION_CONFIGS } from "@/types/storeLayout";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GripVertical, 
  Settings, 
  Eye, 
  EyeOff, 
  Type, 
  Image, 
  Grid, 
  ShoppingBag, 
  Mail, 
  Info, 
  Phone, 
  Sparkles, 
  Layout,
  Copy,
  Trash2,
  MessageSquareQuote,
  Play,
  HelpCircle,
  MoreVertical,
  Timer,
  Instagram,
  Award,
  BarChart3,
  Layers,
  Star,
  Gift,
  MessageCircle,
  Crown
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

interface SortableSectionProps {
  section: StoreSection;
  onToggle: (id: string) => void;
  onEdit: (section: StoreSection) => void;
  onDuplicate: (section: StoreSection) => void;
  onDelete: (id: string) => void;
  primaryColor?: string;
}

const sectionIcons: Record<string, any> = {
  hero: Layout,
  featured_products: Sparkles,
  categories: Grid,
  banner: Image,
  testimonials: MessageSquareQuote,
  newsletter: Mail,
  about: Info,
  contact: Phone,
  products_grid: ShoppingBag,
  custom_text: Type,
  image_slider: Image,
  video: Play,
  faq: HelpCircle,
  // Professional sections
  countdown_timer: Timer,
  instagram_feed: Instagram,
  brand_logos: Award,
  comparison_table: BarChart3,
  popup_banner: Layers,
  // Enterprise sections
  parallax_hero: Layers,
  interactive_gallery: Image,
  animated_stats: BarChart3,
  mega_menu: Grid,
  customer_reviews_carousel: Star,
  product_showcase_3d: ShoppingBag,
  loyalty_program: Gift,
  live_chat_widget: MessageCircle,
};

export const SortableSection = ({ 
  section, 
  onToggle, 
  onEdit, 
  onDuplicate,
  onDelete,
  primaryColor = '#8B4513' 
}: SortableSectionProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
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
  
  // Get section config for additional info
  const sectionConfig = SECTION_CONFIGS.find(s => s.type === section.type);
  const isPremium = sectionConfig?.isPremium;
  const isNew = sectionConfig?.isNew;
  const requiredPlan = sectionConfig?.requiredPlan;
  const description = sectionConfig?.description || '';

  const handleDelete = () => {
    onDelete(section.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
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

            {/* Icon with premium indicator */}
            <div className="relative">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <Icon className="h-5 w-5" style={{ color: primaryColor }} />
              </div>
              {isPremium && (
                <div 
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: requiredPlan === 'enterprise' ? '#F59E0B' : '#3B82F6' }}
                >
                  <Crown className="h-2.5 w-2.5 text-white" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium truncate">{section.title}</h4>
                {isNew && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700 border-green-200">
                    Nuevo
                  </Badge>
                )}
                {isPremium && (
                  <Badge 
                    variant="outline" 
                    className="text-[10px] px-1.5 py-0"
                    style={{ 
                      borderColor: requiredPlan === 'enterprise' ? '#F59E0B' : '#3B82F6',
                      color: requiredPlan === 'enterprise' ? '#F59E0B' : '#3B82F6'
                    }}
                  >
                    {requiredPlan === 'enterprise' ? 'Enterprise' : 'Pro'}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(section)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(section)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Tooltip>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent>
                  {section.enabled ? 'Sección visible' : 'Sección oculta'}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar sección?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar la sección "{section.title}"? 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
