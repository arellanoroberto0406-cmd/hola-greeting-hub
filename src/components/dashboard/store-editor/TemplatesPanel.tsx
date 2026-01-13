import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DESIGN_TEMPLATES, 
  DesignTemplate, 
  GlobalStyles, 
  StoreSection,
  DEFAULT_SECTIONS,
  FONT_OPTIONS
} from "@/types/storeLayout";
import { Store } from "@/types/store";
import { 
  Sparkles, 
  Check, 
  Eye,
  Wand2,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TemplatesPanelProps {
  currentStyles: GlobalStyles;
  currentSections: StoreSection[];
  onApplyTemplate: (styles: GlobalStyles, sections: StoreSection[]) => void;
  primaryColor?: string;
  store: Store;
}

const CATEGORY_LABELS: Record<string, string> = {
  all: 'Todas',
  modern: 'Moderno',
  classic: 'Clásico',
  minimal: 'Minimalista',
  bold: 'Audaz',
  elegant: 'Elegante',
};

const CATEGORY_COLORS: Record<string, string> = {
  modern: 'bg-blue-500/10 text-blue-700 border-blue-200',
  classic: 'bg-amber-500/10 text-amber-700 border-amber-200',
  minimal: 'bg-gray-500/10 text-gray-700 border-gray-200',
  bold: 'bg-red-500/10 text-red-700 border-red-200',
  elegant: 'bg-purple-500/10 text-purple-700 border-purple-200',
};

export const TemplatesPanel = ({
  currentStyles,
  currentSections,
  onApplyTemplate,
  primaryColor = '#6366f1',
  store,
}: TemplatesPanelProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<DesignTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<DesignTemplate | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredTemplates = categoryFilter === 'all' 
    ? DESIGN_TEMPLATES 
    : DESIGN_TEMPLATES.filter(t => t.category === categoryFilter);

  const handleSelectTemplate = (template: DesignTemplate) => {
    setSelectedTemplate(template);
    setIsConfirmOpen(true);
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplate) return;

    // Create sections based on template
    const newSections: StoreSection[] = DEFAULT_SECTIONS.map(section => ({
      ...section,
      enabled: selectedTemplate.sectionIds.includes(section.id),
    }));

    // Reorder sections based on template order
    const orderedSections = selectedTemplate.sectionIds
      .map(id => newSections.find(s => s.id === id))
      .filter(Boolean) as StoreSection[];
    
    const remainingSections = newSections.filter(
      s => !selectedTemplate.sectionIds.includes(s.id)
    );

    onApplyTemplate(selectedTemplate.globalStyles, [...orderedSections, ...remainingSections]);
    setIsConfirmOpen(false);
    setSelectedTemplate(null);
  };

  const getPreviewStyles = (template: DesignTemplate) => {
    const headingFont = FONT_OPTIONS.find(f => f.value === template.globalStyles.headingFont)?.label || 'sans-serif';
    const bodyFont = FONT_OPTIONS.find(f => f.value === template.globalStyles.bodyFont)?.label || 'sans-serif';
    
    return {
      headingFont,
      bodyFont,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div 
              className="h-12 w-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <Wand2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Plantillas de Diseño</h3>
              <p className="text-sm text-muted-foreground">
                Elige una plantilla y personalízala a tu gusto
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filteredTemplates.length} plantilla{filteredTemplates.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filteredTemplates.map((template, index) => {
            const previewStyles = getPreviewStyles(template);
            const isHovered = previewTemplate?.id === template.id;
            
            return (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg group overflow-hidden ${
                    isHovered ? 'ring-2 ring-primary' : ''
                  }`}
                  onMouseEnter={() => setPreviewTemplate(template)}
                  onMouseLeave={() => setPreviewTemplate(null)}
                  onClick={() => handleSelectTemplate(template)}
                >
                  {/* Preview Area */}
                  <div className="relative h-32 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                    {/* Mini Preview */}
                    <div className="absolute inset-2 bg-background rounded-lg shadow-sm overflow-hidden border">
                      {/* Mini Header */}
                      <div 
                        className="h-6 flex items-center px-2 gap-1 border-b"
                        style={{ backgroundColor: `${primaryColor}10` }}
                      >
                        <div 
                          className="w-3 h-3 rounded-sm"
                          style={{ 
                            backgroundColor: primaryColor,
                            borderRadius: template.globalStyles.borderRadius === 'full' ? '9999px' : 
                              template.globalStyles.borderRadius === 'none' ? '0' : '2px'
                          }}
                        />
                        <div 
                          className="h-2 w-12 bg-muted rounded-sm"
                          style={{ fontFamily: `'${previewStyles.headingFont}', sans-serif` }}
                        />
                      </div>
                      {/* Mini Content */}
                      <div className="p-2 space-y-2">
                        <div 
                          className="h-8 bg-gradient-to-r from-primary/20 to-primary/10 rounded"
                          style={{
                            borderRadius: template.globalStyles.borderRadius === 'full' ? '9999px' : 
                              template.globalStyles.borderRadius === 'none' ? '0' : '4px'
                          }}
                        />
                        <div className="grid grid-cols-3 gap-1">
                          {[1, 2, 3].map(i => (
                            <div 
                              key={i}
                              className="aspect-square bg-muted"
                              style={{
                                borderRadius: template.globalStyles.borderRadius === 'full' ? '9999px' : 
                                  template.globalStyles.borderRadius === 'none' ? '0' : '2px',
                                boxShadow: template.globalStyles.cardShadow === 'none' ? 'none' :
                                  template.globalStyles.cardShadow === 'sm' ? '0 1px 2px rgba(0,0,0,0.05)' :
                                  '0 2px 4px rgba(0,0,0,0.1)'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Hover Overlay */}
                    <motion.div 
                      className="absolute inset-0 bg-primary/80 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isHovered ? 1 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button variant="secondary" size="sm" className="gap-2">
                        <Check className="h-4 w-4" />
                        Aplicar
                      </Button>
                    </motion.div>

                    {/* Emoji Badge */}
                    <div className="absolute top-1 right-1 text-2xl">
                      {template.thumbnail}
                    </div>
                  </div>

                  {/* Info */}
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 
                          className="font-semibold text-sm line-clamp-1"
                          style={{ fontFamily: `'${previewStyles.headingFont}', sans-serif` }}
                        >
                          {template.name}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] px-1.5 py-0 ${CATEGORY_COLORS[template.category]}`}
                        >
                          {CATEGORY_LABELS[template.category]}
                        </Badge>
                      </div>
                      <p 
                        className="text-xs text-muted-foreground line-clamp-2"
                        style={{ fontFamily: `'${previewStyles.bodyFont}', sans-serif` }}
                      >
                        {template.description}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{template.sectionIds.length} secciones</span>
                        <span>•</span>
                        <span>{previewStyles.headingFont}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedTemplate?.thumbnail}</span>
              Aplicar plantilla "{selectedTemplate?.name}"
            </DialogTitle>
            <DialogDescription>
              Esta acción reemplazará tu configuración actual de estilos y secciones. 
              Podrás seguir personalizando todo después de aplicar la plantilla.
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Fuente de títulos</p>
                  <p className="font-medium">
                    {FONT_OPTIONS.find(f => f.value === selectedTemplate.globalStyles.headingFont)?.label}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Fuente del cuerpo</p>
                  <p className="font-medium">
                    {FONT_OPTIONS.find(f => f.value === selectedTemplate.globalStyles.bodyFont)?.label}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Bordes</p>
                  <p className="font-medium capitalize">{selectedTemplate.globalStyles.borderRadius}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Secciones activas</p>
                  <p className="font-medium">{selectedTemplate.sectionIds.length}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApplyTemplate} style={{ backgroundColor: primaryColor }}>
              <Sparkles className="h-4 w-4 mr-2" />
              Aplicar plantilla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplatesPanel;
