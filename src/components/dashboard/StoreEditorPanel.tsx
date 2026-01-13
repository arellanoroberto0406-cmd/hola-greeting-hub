import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useStoreLayout, useSaveStoreLayout } from "@/hooks/useStoreLayout";
import { StoreSection, GlobalStyles, DEFAULT_SECTIONS, DEFAULT_GLOBAL_STYLES } from "@/types/storeLayout";
import { Store } from "@/types/store";
import { SortableSection } from "./store-editor/SortableSection";
import { SectionSettingsDialog } from "./store-editor/SectionSettingsDialog";
import { StorePreview } from "./store-editor/StorePreview";
import { LivePreviewPanel } from "./store-editor/LivePreviewPanel";
import GlobalStylesPanel from "./store-editor/GlobalStylesPanel";
import TemplatesPanel from "./store-editor/TemplatesPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  Save, 
  RotateCcw, 
  Eye, 
  Layers, 
  Smartphone, 
  Monitor,
  Plus,
  Sparkles,
  Palette,
  PanelLeftClose,
  PanelLeft,
  LayoutTemplate
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionType } from "@/types/storeLayout";

interface StoreEditorPanelProps {
  store: Store;
}

const availableSectionTypes: { type: SectionType; label: string }[] = [
  { type: 'hero', label: 'Banner Principal' },
  { type: 'featured_products', label: 'Productos Destacados' },
  { type: 'categories', label: 'Categorías' },
  { type: 'banner', label: 'Banner Promocional' },
  { type: 'products_grid', label: 'Grilla de Productos' },
  { type: 'newsletter', label: 'Newsletter' },
  { type: 'about', label: 'Sobre Nosotros' },
  { type: 'contact', label: 'Contacto' },
  { type: 'testimonials', label: 'Testimonios' },
  { type: 'image_slider', label: 'Slider de Imágenes' },
  { type: 'video', label: 'Video de Presentación' },
  { type: 'faq', label: 'Preguntas Frecuentes' },
  { type: 'custom_text', label: 'Texto Personalizado' },
];

const StoreEditorPanel = ({ store }: StoreEditorPanelProps) => {
  const { data: layout, isLoading } = useStoreLayout(store.id);
  const saveLayout = useSaveStoreLayout();
  
  const [sections, setSections] = useState<StoreSection[]>([]);
  const [globalStyles, setGlobalStyles] = useState<GlobalStyles>(DEFAULT_GLOBAL_STYLES);
  const [editingSection, setEditingSection] = useState<StoreSection | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [hasChanges, setHasChanges] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (layout?.sections) {
      setSections(layout.sections);
    }
    if (layout?.globalStyles) {
      setGlobalStyles(layout.globalStyles);
    }
  }, [layout]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        setHasChanges(true);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleToggleSection = (id: string) => {
    setSections((items) =>
      items.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
    setHasChanges(true);
  };

  const handleEditSection = (section: StoreSection) => {
    setEditingSection(section);
    setIsSettingsOpen(true);
  };

  const handleSaveSection = (updatedSection: StoreSection) => {
    setSections((items) =>
      items.map((item) =>
        item.id === updatedSection.id ? updatedSection : item
      )
    );
    setHasChanges(true);
  };

  const handleGlobalStylesChange = (newStyles: GlobalStyles) => {
    setGlobalStyles(newStyles);
    setHasChanges(true);
  };

  const handleSaveLayout = async () => {
    await saveLayout.mutateAsync({
      storeId: store.id,
      sections,
      globalStyles,
    });
    setHasChanges(false);
  };

  const handleResetLayout = () => {
    setSections(DEFAULT_SECTIONS);
    setGlobalStyles(DEFAULT_GLOBAL_STYLES);
    setHasChanges(true);
  };

  const handleAddSection = (type: SectionType) => {
    const defaultSection = DEFAULT_SECTIONS.find(s => s.type === type);
    if (defaultSection) {
      const newSection: StoreSection = {
        ...defaultSection,
        id: `${type}-${Date.now()}`,
        title: `${defaultSection.title} (nuevo)`,
      };
      setSections([...sections, newSection]);
      setHasChanges(true);
    }
  };

  const handleDuplicateSection = (section: StoreSection) => {
    const duplicatedSection: StoreSection = {
      ...section,
      id: `${section.type}-${Date.now()}`,
      title: `${section.title} (copia)`,
      settings: { ...section.settings },
    };
    const index = sections.findIndex(s => s.id === section.id);
    const newSections = [...sections];
    newSections.splice(index + 1, 0, duplicatedSection);
    setSections(newSections);
    setHasChanges(true);
  };

  const handleDeleteSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading flex items-center gap-2">
            <Layers className="h-6 w-6" style={{ color: store.primary_color }} />
            Editor de Tienda
          </h2>
          <p className="text-muted-foreground">
            Arrastra y suelta las secciones para reorganizar tu tienda
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetLayout}
            disabled={saveLayout.isPending}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restablecer
          </Button>
          <Button
            size="sm"
            onClick={handleSaveLayout}
            disabled={saveLayout.isPending || !hasChanges}
            style={{ backgroundColor: store.primary_color }}
          >
            {saveLayout.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {hasChanges ? 'Guardar cambios' : 'Guardado'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates" className="gap-2">
            <LayoutTemplate className="h-4 w-4" />
            Plantillas
          </TabsTrigger>
          <TabsTrigger value="editor" className="gap-2">
            <Layers className="h-4 w-4" />
            Secciones
          </TabsTrigger>
          <TabsTrigger value="styles" className="gap-2">
            <Palette className="h-4 w-4" />
            Estilos
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="h-4 w-4" />
            Vista previa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <TemplatesPanel
            currentStyles={globalStyles}
            currentSections={sections}
            onApplyTemplate={(newStyles, newSections) => {
              setGlobalStyles(newStyles);
              setSections(newSections);
              setHasChanges(true);
            }}
            primaryColor={store.primary_color}
            store={store}
          />
        </TabsContent>

        <TabsContent value="editor" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Sections List */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Secciones</CardTitle>
                      <CardDescription>
                        Activa, desactiva y reordena las secciones de tu tienda
                      </CardDescription>
                    </div>
                    <Select onValueChange={(value) => handleAddSection(value as SectionType)}>
                      <SelectTrigger className="w-[180px]">
                        <Plus className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Agregar sección" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSectionTypes.map((item) => (
                          <SelectItem key={item.type} value={item.type}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={sections.map((s) => s.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        <AnimatePresence>
                          {sections.map((section) => (
                            <SortableSection
                              key={section.id}
                              section={section}
                              onToggle={handleToggleSection}
                              onEdit={handleEditSection}
                              onDuplicate={handleDuplicateSection}
                              onDelete={handleDeleteSection}
                              primaryColor={store.primary_color}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </SortableContext>
                  </DndContext>
                </CardContent>
              </Card>
            </div>

            {/* Mini Preview */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Vista previa</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <LivePreviewPanel
                    sections={sections}
                    store={store}
                    globalStyles={globalStyles}
                    device={previewDevice === 'tablet' ? 'mobile' : previewDevice}
                    onDeviceChange={(d) => setPreviewDevice(d === 'tablet' ? 'mobile' : d)}
                    showDeviceControls={false}
                  />
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div 
                      className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: store.primary_color }}
                    >
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Consejos</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Arrastra las secciones para reordenarlas</li>
                        <li>• Usa el interruptor para mostrar/ocultar</li>
                        <li>• Haz clic en ⚙️ para configurar cada sección</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="styles" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Personaliza el estilo visual</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLivePreview(!showLivePreview)}
              className="gap-2"
            >
              {showLivePreview ? (
                <>
                  <PanelLeftClose className="h-4 w-4" />
                  Ocultar vista previa
                </>
              ) : (
                <>
                  <PanelLeft className="h-4 w-4" />
                  Mostrar vista previa
                </>
              )}
            </Button>
          </div>
          
          <div className={`grid gap-6 ${showLivePreview ? 'lg:grid-cols-2' : ''}`}>
            <div className="space-y-6">
              <GlobalStylesPanel
                styles={globalStyles}
                onChange={handleGlobalStylesChange}
                primaryColor={store.primary_color}
              />
            </div>
            
            {showLivePreview && (
              <div className="lg:sticky lg:top-4 h-fit">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Eye className="h-4 w-4" style={{ color: store.primary_color }} />
                      Vista previa en tiempo real
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Los cambios se reflejan instantáneamente
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LivePreviewPanel
                      sections={sections}
                      store={store}
                      globalStyles={globalStyles}
                      device={previewDevice}
                      onDeviceChange={setPreviewDevice}
                      showDeviceControls={true}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Vista previa de la tienda</CardTitle>
                  <CardDescription>
                    Así se verá tu tienda con los estilos aplicados
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <LivePreviewPanel
                sections={sections}
                store={store}
                globalStyles={globalStyles}
                device={previewDevice}
                onDeviceChange={setPreviewDevice}
                showDeviceControls={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Section Settings Dialog */}
      <SectionSettingsDialog
        section={editingSection}
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        onSave={handleSaveSection}
        primaryColor={store.primary_color}
      />
    </div>
  );
};

export default StoreEditorPanel;
