import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  useCustomTemplates, 
  useCreateCustomTemplate, 
  useDeleteCustomTemplate,
  CustomTemplate 
} from "@/hooks/useCustomTemplates";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  Check, 
  Wand2,
  Filter,
  Plus,
  Save,
  Trash2,
  User,
  Loader2,
  Download,
  Upload
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  custom: 'bg-green-500/10 text-green-700 border-green-200',
};

const EMOJI_OPTIONS = ['🎨', '✨', '🚀', '💎', '🌟', '🎯', '💼', '🔥', '🌈', '❤️', '🛍️', '✅'];

export const TemplatesPanel = ({
  currentStyles,
  currentSections,
  onApplyTemplate,
  primaryColor = '#6366f1',
  store,
}: TemplatesPanelProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<DesignTemplate | null>(null);
  const [selectedCustomTemplate, setSelectedCustomTemplate] = useState<CustomTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCustomConfirmOpen, setIsCustomConfirmOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<CustomTemplate | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [templateTab, setTemplateTab] = useState<string>('predefined');
  
  // Save template form
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [newTemplateEmoji, setNewTemplateEmoji] = useState('🎨');

  // Custom templates hooks
  const { data: customTemplates = [], isLoading: isLoadingCustom } = useCustomTemplates(store.id);
  const createTemplate = useCreateCustomTemplate();
  const deleteTemplate = useDeleteCustomTemplate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTemplates = categoryFilter === 'all' 
    ? DESIGN_TEMPLATES 
    : DESIGN_TEMPLATES.filter(t => t.category === categoryFilter);

  const handleSelectTemplate = (template: DesignTemplate) => {
    setSelectedTemplate(template);
    setIsConfirmOpen(true);
  };

  const handleSelectCustomTemplate = (template: CustomTemplate) => {
    setSelectedCustomTemplate(template);
    setIsCustomConfirmOpen(true);
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplate) return;

    const newSections: StoreSection[] = DEFAULT_SECTIONS.map(section => ({
      ...section,
      enabled: selectedTemplate.sectionIds.includes(section.id),
    }));

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

  const handleApplyCustomTemplate = () => {
    if (!selectedCustomTemplate) return;

    const newSections: StoreSection[] = DEFAULT_SECTIONS.map(section => ({
      ...section,
      enabled: selectedCustomTemplate.section_ids.includes(section.id),
    }));

    const orderedSections = selectedCustomTemplate.section_ids
      .map(id => newSections.find(s => s.id === id))
      .filter(Boolean) as StoreSection[];
    
    const remainingSections = newSections.filter(
      s => !selectedCustomTemplate.section_ids.includes(s.id)
    );

    onApplyTemplate(selectedCustomTemplate.global_styles, [...orderedSections, ...remainingSections]);
    setIsCustomConfirmOpen(false);
    setSelectedCustomTemplate(null);
  };

  const handleSaveAsTemplate = async () => {
    if (!newTemplateName.trim()) return;

    const enabledSectionIds = currentSections
      .filter(s => s.enabled)
      .map(s => s.id);

    await createTemplate.mutateAsync({
      storeId: store.id,
      name: newTemplateName.trim(),
      description: newTemplateDescription.trim() || undefined,
      thumbnail: newTemplateEmoji,
      globalStyles: currentStyles,
      sectionIds: enabledSectionIds,
    });

    setIsSaveDialogOpen(false);
    setNewTemplateName('');
    setNewTemplateDescription('');
    setNewTemplateEmoji('🎨');
    setTemplateTab('custom');
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    await deleteTemplate.mutateAsync({
      templateId: templateToDelete.id,
      storeId: store.id,
    });

    setIsDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

  const handleExportTemplate = (template: CustomTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const exportData = {
      name: template.name,
      description: template.description,
      thumbnail: template.thumbnail,
      global_styles: template.global_styles,
      section_ids: template.section_ids,
      exported_at: new Date().toISOString(),
      version: "1.0",
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plantilla-${template.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Plantilla exportada",
      description: `"${template.name}" se ha descargado como archivo JSON.`,
    });
  };

  const handleExportAllTemplates = () => {
    if (customTemplates.length === 0) {
      toast({
        title: "No hay plantillas",
        description: "No tienes plantillas personalizadas para exportar.",
        variant: "destructive",
      });
      return;
    }

    const exportData = {
      templates: customTemplates.map(t => ({
        name: t.name,
        description: t.description,
        thumbnail: t.thumbnail,
        global_styles: t.global_styles,
        section_ids: t.section_ids,
      })),
      exported_at: new Date().toISOString(),
      version: "1.0",
      count: customTemplates.length,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mis-plantillas-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Plantillas exportadas",
      description: `Se exportaron ${customTemplates.length} plantillas.`,
    });
  };

  const handleImportTemplates = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate the JSON structure
      let templatesToImport: Array<{
        name: string;
        description?: string;
        thumbnail?: string;
        global_styles: GlobalStyles;
        section_ids: string[];
      }> = [];

      if (data.templates && Array.isArray(data.templates)) {
        // Multiple templates export format
        templatesToImport = data.templates;
      } else if (data.name && data.global_styles && data.section_ids) {
        // Single template export format
        templatesToImport = [data];
      } else {
        throw new Error('Formato de archivo no válido');
      }

      // Validate each template
      for (const template of templatesToImport) {
        if (!template.name || !template.global_styles || !Array.isArray(template.section_ids)) {
          throw new Error('Una o más plantillas tienen formato inválido');
        }
      }

      // Import all templates
      let imported = 0;
      for (const template of templatesToImport) {
        await createTemplate.mutateAsync({
          storeId: store.id,
          name: template.name,
          description: template.description,
          thumbnail: template.thumbnail || '🎨',
          globalStyles: template.global_styles,
          sectionIds: template.section_ids,
        });
        imported++;
      }

      toast({
        title: "Plantillas importadas",
        description: `Se importaron ${imported} plantilla${imported !== 1 ? 's' : ''} correctamente.`,
      });

      setTemplateTab('custom');
    } catch (error) {
      console.error('Error importing templates:', error);
      toast({
        title: "Error al importar",
        description: error instanceof Error ? error.message : "El archivo no tiene un formato válido.",
        variant: "destructive",
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getPreviewStyles = (globalStyles: GlobalStyles) => {
    const headingFont = FONT_OPTIONS.find(f => f.value === globalStyles.headingFont)?.label || 'sans-serif';
    const bodyFont = FONT_OPTIONS.find(f => f.value === globalStyles.bodyFont)?.label || 'sans-serif';
    return { headingFont, bodyFont };
  };

  const renderTemplateCard = (
    template: DesignTemplate | CustomTemplate,
    isCustom: boolean = false
  ) => {
    const id = template.id;
    const name = template.name;
    const description = template.description || '';
    const thumbnail = template.thumbnail;
    const globalStyles = isCustom 
      ? (template as CustomTemplate).global_styles 
      : (template as DesignTemplate).globalStyles;
    const sectionIds = isCustom 
      ? (template as CustomTemplate).section_ids 
      : (template as DesignTemplate).sectionIds;
    const category = isCustom ? 'custom' : (template as DesignTemplate).category;
    
    const previewStyles = getPreviewStyles(globalStyles);
    const isHovered = previewTemplate === id;

    return (
      <motion.div
        key={id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg group overflow-hidden ${
            isHovered ? 'ring-2 ring-primary' : ''
          }`}
          onMouseEnter={() => setPreviewTemplate(id)}
          onMouseLeave={() => setPreviewTemplate(null)}
          onClick={() => isCustom 
            ? handleSelectCustomTemplate(template as CustomTemplate) 
            : handleSelectTemplate(template as DesignTemplate)
          }
        >
          {/* Preview Area */}
          <div className="relative h-32 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
            <div className="absolute inset-2 bg-background rounded-lg shadow-sm overflow-hidden border">
              <div 
                className="h-6 flex items-center px-2 gap-1 border-b"
                style={{ backgroundColor: `${primaryColor}10` }}
              >
                <div 
                  className="w-3 h-3 rounded-sm"
                  style={{ 
                    backgroundColor: primaryColor,
                    borderRadius: globalStyles.borderRadius === 'full' ? '9999px' : 
                      globalStyles.borderRadius === 'none' ? '0' : '2px'
                  }}
                />
                <div className="h-2 w-12 bg-muted rounded-sm" />
              </div>
              <div className="p-2 space-y-2">
                <div 
                  className="h-8 bg-gradient-to-r from-primary/20 to-primary/10 rounded"
                  style={{
                    borderRadius: globalStyles.borderRadius === 'full' ? '9999px' : 
                      globalStyles.borderRadius === 'none' ? '0' : '4px'
                  }}
                />
                <div className="grid grid-cols-3 gap-1">
                  {[1, 2, 3].map(i => (
                    <div 
                      key={i}
                      className="aspect-square bg-muted"
                      style={{
                        borderRadius: globalStyles.borderRadius === 'full' ? '9999px' : 
                          globalStyles.borderRadius === 'none' ? '0' : '2px',
                        boxShadow: globalStyles.cardShadow === 'none' ? 'none' :
                          globalStyles.cardShadow === 'sm' ? '0 1px 2px rgba(0,0,0,0.05)' :
                          '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <motion.div 
              className="absolute inset-0 bg-primary/80 flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button variant="secondary" size="sm" className="gap-2">
                <Check className="h-4 w-4" />
                Aplicar
              </Button>
              {isCustom && (
                <>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={(e) => handleExportTemplate(template as CustomTemplate, e)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTemplateToDelete(template as CustomTemplate);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </motion.div>

            <div className="absolute top-1 right-1 text-2xl">{thumbnail}</div>
            {isCustom && (
              <Badge className="absolute top-1 left-1 text-[10px] px-1.5 py-0 bg-green-500">
                <User className="h-3 w-3 mr-1" />
                Mía
              </Badge>
            )}
          </div>

          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 
                  className="font-semibold text-sm line-clamp-1"
                  style={{ fontFamily: `'${previewStyles.headingFont}', sans-serif` }}
                >
                  {name}
                </h4>
                <Badge 
                  variant="outline" 
                  className={`text-[10px] px-1.5 py-0 ${CATEGORY_COLORS[category]}`}
                >
                  {isCustom ? 'Personalizada' : CATEGORY_LABELS[category]}
                </Badge>
              </div>
              <p 
                className="text-xs text-muted-foreground line-clamp-2"
                style={{ fontFamily: `'${previewStyles.bodyFont}', sans-serif` }}
              >
                {description || 'Sin descripción'}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{sectionIds.length} secciones</span>
                <span>•</span>
                <span>{previewStyles.headingFont}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
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
                  Elige una plantilla o guarda tu diseño actual
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsSaveDialogOpen(true)}
              style={{ backgroundColor: primaryColor }}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Guardar diseño actual
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={templateTab} onValueChange={setTemplateTab}>
        <TabsList>
          <TabsTrigger value="predefined" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Predefinidas ({DESIGN_TEMPLATES.length})
          </TabsTrigger>
          <TabsTrigger value="custom" className="gap-2">
            <User className="h-4 w-4" />
            Mis plantillas ({customTemplates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predefined" className="space-y-4 mt-4">
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

          {/* Predefined Templates Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {filteredTemplates.map(template => renderTemplateCard(template, false))}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4 mt-4">
          {/* Import/Export Actions */}
          <div className="flex items-center gap-2 justify-end">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportTemplates}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Importar
            </Button>
            {customTemplates.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportAllTemplates}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar todas
              </Button>
            )}
          </div>

          {isLoadingCustom ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : customTemplates.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <div 
                  className="h-16 w-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <Plus className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h4 className="font-semibold mb-2">No tienes plantillas guardadas</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Personaliza tu tienda y guarda el diseño como plantilla, o importa una existente
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Button 
                    onClick={() => setIsSaveDialogOpen(true)}
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar diseño actual
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Importar plantilla
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {customTemplates.map(template => renderTemplateCard(template, true))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Apply Predefined Template Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedTemplate?.thumbnail}</span>
              Aplicar plantilla "{selectedTemplate?.name}"
            </DialogTitle>
            <DialogDescription>
              Esta acción reemplazará tu configuración actual. Podrás seguir personalizando después.
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="grid grid-cols-2 gap-4 py-4 text-sm">
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

      {/* Apply Custom Template Dialog */}
      <Dialog open={isCustomConfirmOpen} onOpenChange={setIsCustomConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedCustomTemplate?.thumbnail}</span>
              Aplicar plantilla "{selectedCustomTemplate?.name}"
            </DialogTitle>
            <DialogDescription>
              Esta acción reemplazará tu configuración actual con tu plantilla guardada.
            </DialogDescription>
          </DialogHeader>

          {selectedCustomTemplate && (
            <div className="grid grid-cols-2 gap-4 py-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Fuente de títulos</p>
                <p className="font-medium">
                  {FONT_OPTIONS.find(f => f.value === selectedCustomTemplate.global_styles.headingFont)?.label}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Fuente del cuerpo</p>
                <p className="font-medium">
                  {FONT_OPTIONS.find(f => f.value === selectedCustomTemplate.global_styles.bodyFont)?.label}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Bordes</p>
                <p className="font-medium capitalize">{selectedCustomTemplate.global_styles.borderRadius}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Secciones activas</p>
                <p className="font-medium">{selectedCustomTemplate.section_ids.length}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCustomConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApplyCustomTemplate} style={{ backgroundColor: primaryColor }}>
              <Sparkles className="h-4 w-4 mr-2" />
              Aplicar plantilla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Template Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Guardar diseño como plantilla</DialogTitle>
            <DialogDescription>
              Guarda tu configuración actual para reutilizarla en el futuro
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Nombre de la plantilla *</Label>
              <Input
                id="template-name"
                placeholder="Mi diseño personalizado"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-description">Descripción (opcional)</Label>
              <Textarea
                id="template-description"
                placeholder="Describe tu plantilla..."
                value={newTemplateDescription}
                onChange={(e) => setNewTemplateDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Ícono</Label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    className={`text-2xl p-2 rounded-lg transition-all ${
                      newTemplateEmoji === emoji 
                        ? 'bg-primary/20 ring-2 ring-primary' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setNewTemplateEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <p className="text-sm font-medium mb-2">Se guardará:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Fuentes: {FONT_OPTIONS.find(f => f.value === currentStyles.headingFont)?.label} / {FONT_OPTIONS.find(f => f.value === currentStyles.bodyFont)?.label}</li>
                  <li>• Bordes: {currentStyles.borderRadius}</li>
                  <li>• Espaciado: {currentStyles.sectionSpacing}</li>
                  <li>• {currentSections.filter(s => s.enabled).length} secciones activas</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveAsTemplate} 
              disabled={!newTemplateName.trim() || createTemplate.isPending}
              style={{ backgroundColor: primaryColor }}
            >
              {createTemplate.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Guardar plantilla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar plantilla?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La plantilla "{templateToDelete?.name}" será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTemplate.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TemplatesPanel;
