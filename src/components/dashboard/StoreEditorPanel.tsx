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
import { StoreSection, DEFAULT_SECTIONS } from "@/types/storeLayout";
import { Store } from "@/types/store";
import { SortableSection } from "./store-editor/SortableSection";
import { SectionSettingsDialog } from "./store-editor/SectionSettingsDialog";
import { StorePreview } from "./store-editor/StorePreview";
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
  Sparkles
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
  { type: 'custom_text', label: 'Texto Personalizado' },
];

const StoreEditorPanel = ({ store }: StoreEditorPanelProps) => {
  const { data: layout, isLoading } = useStoreLayout(store.id);
  const saveLayout = useSaveStoreLayout();
  
  const [sections, setSections] = useState<StoreSection[]>([]);
  const [editingSection, setEditingSection] = useState<StoreSection | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [hasChanges, setHasChanges] = useState(false);

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

  const handleSaveLayout = async () => {
    await saveLayout.mutateAsync({
      storeId: store.id,
      sections,
    });
    setHasChanges(false);
  };

  const handleResetLayout = () => {
    setSections(DEFAULT_SECTIONS);
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

      <Tabs defaultValue="editor" className="space-y-6">
        <TabsList>
          <TabsTrigger value="editor" className="gap-2">
            <Layers className="h-4 w-4" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="h-4 w-4" />
            Vista previa
          </TabsTrigger>
        </TabsList>

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
                    <div className="flex items-center gap-1">
                      <Button
                        variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPreviewDevice('desktop')}
                      >
                        <Monitor className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPreviewDevice('mobile')}
                      >
                        <Smartphone className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`${previewDevice === 'mobile' ? 'max-w-[280px] mx-auto' : ''}`}>
                    <StorePreview sections={sections} store={store} />
                  </div>
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

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Vista previa de la tienda</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewDevice('desktop')}
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    Escritorio
                  </Button>
                  <Button
                    variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewDevice('mobile')}
                  >
                    <Smartphone className="h-4 w-4 mr-2" />
                    Móvil
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`mx-auto transition-all duration-300 ${
                previewDevice === 'mobile' ? 'max-w-sm' : 'max-w-4xl'
              }`}>
                <StorePreview sections={sections} store={store} />
              </div>
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
