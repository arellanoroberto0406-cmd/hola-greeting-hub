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
import { StoreSection, GlobalStyles, DEFAULT_SECTIONS, DEFAULT_GLOBAL_STYLES, SECTION_CONFIGS, getSectionsWithAvailability, canUseSectionType } from "@/types/storeLayout";
import { Store } from "@/types/store";
import { SortableSection } from "./store-editor/SortableSection";
import { SectionSettingsDialog } from "./store-editor/SectionSettingsDialog";
import { StorePreview } from "./store-editor/StorePreview";
import { LivePreviewPanel } from "./store-editor/LivePreviewPanel";
import GlobalStylesPanel from "./store-editor/GlobalStylesPanel";
import TemplatesPanel from "./store-editor/TemplatesPanel";
import ProDesignPanel from "./store-editor/ProDesignPanel";
import HeaderFooterPanel, { HeaderFooterValues, buildHeaderFooterValues } from "./store-editor/HeaderFooterPanel";
import { useUpdateStore } from "@/hooks/useStores";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useStorePlanTier } from "@/hooks/useStorePlanTier";
import { useToast } from "@/hooks/use-toast";
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
  LayoutTemplate,
  ArrowLeftRight,
  X,
  Check,
  Lock,
  Crown
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

const StoreEditorPanel = ({ store }: StoreEditorPanelProps) => {
  const { data: layout, isLoading } = useStoreLayout(store.id);
  const saveLayout = useSaveStoreLayout();
  const updateStore = useUpdateStore();
  const { planTier } = useStorePlanTier(store.id);
  const { toast } = useToast();
  
  const [sections, setSections] = useState<StoreSection[]>([]);
  const [globalStyles, setGlobalStyles] = useState<GlobalStyles>(DEFAULT_GLOBAL_STYLES);
  const [headerFooter, setHeaderFooter] = useState<HeaderFooterValues>(() => buildHeaderFooterValues(store));
  const [editingSection, setEditingSection] = useState<StoreSection | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [hasChanges, setHasChanges] = useState(false);
  
  const sectionsWithAvailability = getSectionsWithAvailability(planTier);
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [templatePreview, setTemplatePreview] = useState<{
    globalStyles: GlobalStyles;
    sectionIds: string[];
  } | null>(null);
  const [compareTemplate, setCompareTemplate] = useState<{
    name: string;
    thumbnail: string;
    globalStyles: GlobalStyles;
    sectionIds: string[];
    isCustom: boolean;
  } | null>(null);

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

  useEffect(() => {
    setHeaderFooter(buildHeaderFooterValues(store));
  }, [store.id]);

  const handleHeaderFooterChange = (v: HeaderFooterValues) => {
    setHeaderFooter(v);
    setHasChanges(true);
  };

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
    await Promise.all([
      saveLayout.mutateAsync({
        storeId: store.id,
        sections,
        globalStyles,
      }),
      updateStore.mutateAsync({ id: store.id, ...headerFooter }),
    ]);
    setHasChanges(false);
    toast({
      title: "Cambios publicados",
      description: "Encabezado, pie, estilos y botones se aplicaron a tu tienda.",
    });
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

  // Get preview sections/styles for template hover
  const getPreviewData = () => {
    if (templatePreview) {
      const previewSections = DEFAULT_SECTIONS.map(section => ({
        ...section,
        enabled: templatePreview.sectionIds.includes(section.id),
      }));
      const orderedSections = templatePreview.sectionIds
        .map(id => previewSections.find(s => s.id === id))
        .filter(Boolean) as StoreSection[];
      const remainingSections = previewSections.filter(
        s => !templatePreview.sectionIds.includes(s.id)
      );
      return {
        sections: [...orderedSections, ...remainingSections],
        styles: templatePreview.globalStyles,
      };
    }
    return { sections, styles: globalStyles };
  };

  // Get comparison sections/styles
  const getCompareData = () => {
    if (!compareTemplate) return null;
    const compareSections = DEFAULT_SECTIONS.map(section => ({
      ...section,
      enabled: compareTemplate.sectionIds.includes(section.id),
    }));
    const orderedSections = compareTemplate.sectionIds
      .map(id => compareSections.find(s => s.id === id))
      .filter(Boolean) as StoreSection[];
    const remainingSections = compareSections.filter(
      s => !compareTemplate.sectionIds.includes(s.id)
    );
    return {
      sections: [...orderedSections, ...remainingSections],
      styles: compareTemplate.globalStyles,
    };
  };

  const previewData = getPreviewData();
  const compareData = getCompareData();

  const handleApplyCompareTemplate = () => {
    if (!compareTemplate) return;
    
    const newSections = DEFAULT_SECTIONS.map(section => ({
      ...section,
      enabled: compareTemplate.sectionIds.includes(section.id),
    }));
    const orderedSections = compareTemplate.sectionIds
      .map(id => newSections.find(s => s.id === id))
      .filter(Boolean) as StoreSection[];
    const remainingSections = newSections.filter(
      s => !compareTemplate.sectionIds.includes(s.id)
    );

    setGlobalStyles(compareTemplate.globalStyles);
    setSections([...orderedSections, ...remainingSections]);
    setHasChanges(true);
    setCompareTemplate(null);
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

      <Tabs defaultValue="all-in-one" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="all-in-one" className="gap-2">
            <Wand2 className="h-4 w-4" />
            Editor Completo
          </TabsTrigger>
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
          <TabsTrigger value="pro" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Diseño Pro
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="h-4 w-4" />
            Vista previa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-in-one" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            <div className="space-y-4 min-w-0">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: store.primary_color }}>
                      <Wand2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Editor Completo</h3>
                      <p className="text-sm text-muted-foreground">
                        Todo lo necesario para personalizar tu tienda en un solo lugar, con vista previa en vivo a la derecha.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Accordion type="multiple" defaultValue={["header-footer", "styles", "pro"]} className="space-y-3">
                <AccordionItem value="header-footer" className="border rounded-xl px-4 bg-card">
                  <AccordionTrigger className="hover:no-underline">
                    <span className="flex items-center gap-2 font-semibold">
                      <Layers className="h-4 w-4" style={{ color: store.primary_color }} />
                      Encabezado y pie de página
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <HeaderFooterPanel store={store} values={headerFooter} onChange={handleHeaderFooterChange} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="styles" className="border rounded-xl px-4 bg-card">
                  <AccordionTrigger className="hover:no-underline">
                    <span className="flex items-center gap-2 font-semibold">
                      <Palette className="h-4 w-4" style={{ color: store.primary_color }} />
                      Estilos globales
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <GlobalStylesPanel
                      styles={globalStyles}
                      onChange={handleGlobalStylesChange}
                      primaryColor={store.primary_color}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="pro" className="border rounded-xl px-4 bg-card">
                  <AccordionTrigger className="hover:no-underline">
                    <span className="flex items-center gap-2 font-semibold">
                      <Sparkles className="h-4 w-4" style={{ color: store.primary_color }} />
                      Diseño Pro: colores, botones e imágenes
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <ProDesignPanel
                      store={store}
                      styles={globalStyles}
                      onChange={handleGlobalStylesChange}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="sections" className="border rounded-xl px-4 bg-card">
                  <AccordionTrigger className="hover:no-underline">
                    <span className="flex items-center gap-2 font-semibold">
                      <Layers className="h-4 w-4" style={{ color: store.primary_color }} />
                      Secciones activas ({sections.filter(s => s.enabled).length}/{sections.length})
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
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
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="lg:sticky lg:top-4 h-fit">
              <Card className="shadow-lg border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="h-4 w-4" style={{ color: store.primary_color }} />
                    Vista previa en vivo
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Los cambios se ven al instante
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
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">

              <TemplatesPanel
                currentStyles={globalStyles}
                currentSections={sections}
                onApplyTemplate={(newStyles, newSections) => {
                  setGlobalStyles(newStyles);
                  setSections(newSections);
                  setHasChanges(true);
                  setTemplatePreview(null);
                }}
                onPreviewTemplate={setTemplatePreview}
                onCompareTemplate={setCompareTemplate}
                primaryColor={store.primary_color}
                store={store}
              />
            </div>
            
            {/* Live Preview Panel for Templates */}
            <div className="hidden lg:block">
              <div className="sticky top-4 space-y-4">
                <Card className={`transition-all duration-300 ${templatePreview ? 'ring-2 ring-primary shadow-lg' : ''}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Eye className="h-4 w-4" style={{ color: store.primary_color }} />
                      {templatePreview ? 'Vista previa de plantilla' : 'Vista previa actual'}
                    </CardTitle>
                    {templatePreview && (
                      <CardDescription className="text-xs text-primary font-medium">
                        Pasa el cursor sobre las plantillas para previsualizar
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <LivePreviewPanel
                      sections={previewData.sections}
                      store={store}
                      globalStyles={previewData.styles}
                      device="desktop"
                      onDeviceChange={() => {}}
                      showDeviceControls={false}
                    />
                  </CardContent>
                </Card>
                
                {templatePreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-primary/10 rounded-lg border border-primary/20"
                  >
                    <p className="text-sm text-center text-primary font-medium">
                      Haz clic en la plantilla para aplicarla
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="editor" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Sections List */}
            <div className="lg:col-span-2 space-y-4">
              {/* Active Sections */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Layers className="h-5 w-5" style={{ color: store.primary_color }} />
                        Secciones Activas
                      </CardTitle>
                      <CardDescription>
                        Arrastra para reordenar • {sections.filter(s => s.enabled).length} de {sections.length} activas
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select onValueChange={(value) => {
                        const section = sectionsWithAvailability.find(s => s.type === value);
                        if (section && !section.available) {
                          toast({
                            title: "Sección bloqueada",
                            description: `Esta sección requiere el plan ${section.requiredPlan === 'professional' ? 'Profesional' : 'Empresarial'}. Actualiza tu suscripción para desbloquearla.`,
                            variant: "destructive",
                          });
                          return;
                        }
                        handleAddSection(value as SectionType);
                      }}>
                        <SelectTrigger className="w-[240px]">
                          <Plus className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Agregar sección" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[400px]">
                          {/* Basic Sections */}
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                            Básico
                          </div>
                          {sectionsWithAvailability
                            .filter(s => s.requiredPlan === 'basic')
                            .map((item) => (
                              <SelectItem 
                                key={item.type} 
                                value={item.type}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-base">{item.icon}</span>
                                  <span>{item.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          
                          {/* Professional Sections */}
                          <div className="px-2 py-1.5 text-xs font-semibold text-blue-600 flex items-center gap-1 mt-2 border-t pt-2">
                            <Crown className="h-3 w-3" />
                            Profesional
                          </div>
                          {sectionsWithAvailability
                            .filter(s => s.requiredPlan === 'professional')
                            .map((item) => (
                              <SelectItem 
                                key={item.type} 
                                value={item.type}
                                className={!item.available ? 'opacity-50' : ''}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-base">{item.icon}</span>
                                  <span>{item.label}</span>
                                  {!item.available && <Lock className="h-3 w-3 text-muted-foreground ml-auto" />}
                                  {item.isNew && item.available && (
                                    <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-green-100 text-green-700">Nuevo</Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          
                          {/* Enterprise Sections */}
                          <div className="px-2 py-1.5 text-xs font-semibold text-amber-600 flex items-center gap-1 mt-2 border-t pt-2">
                            <Crown className="h-3 w-3" />
                            Empresarial
                          </div>
                          {sectionsWithAvailability
                            .filter(s => s.requiredPlan === 'enterprise')
                            .map((item) => (
                              <SelectItem 
                                key={item.type} 
                                value={item.type}
                                className={!item.available ? 'opacity-50' : ''}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-base">{item.icon}</span>
                                  <span>{item.label}</span>
                                  {!item.available && <Lock className="h-3 w-3 text-muted-foreground ml-auto" />}
                                  {item.isNew && item.available && (
                                    <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-green-100 text-green-700">Nuevo</Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                  
                  {sections.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Layers className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No hay secciones configuradas</p>
                      <p className="text-sm">Usa el botón "Agregar sección" para comenzar</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Plan Upgrade Card - Show if user is on basic */}
              {planTier === 'basic' && (
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <Crown className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900">Desbloquea más secciones</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Actualiza a Profesional para acceder a temporizadores, feeds de Instagram, tablas comparativas y más.
                        </p>
                        <Button 
                          size="sm" 
                          className="mt-3 bg-blue-600 hover:bg-blue-700"
                        >
                          Ver planes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Mini Preview & Tips */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Eye className="h-5 w-5" style={{ color: store.primary_color }} />
                      Vista previa
                    </CardTitle>
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

              {/* Stats Card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold" style={{ color: store.primary_color }}>
                        {sections.filter(s => s.enabled).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Secciones activas</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-muted-foreground">
                        {sections.filter(s => !s.enabled).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Secciones ocultas</div>
                    </div>
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
                      <h4 className="font-medium mb-2">Consejos</h4>
                      <ul className="text-sm text-muted-foreground space-y-1.5">
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          Arrastra las secciones para reordenarlas
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          Usa el interruptor para mostrar/ocultar
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          Haz clic en ⋮ para más opciones
                        </li>
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

        <TabsContent value="pro" className="space-y-6">
          <ProDesignPanel
            store={store}
            styles={globalStyles}
            onChange={handleGlobalStylesChange}
          />
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

      {/* Compare Templates Dialog */}
      <AnimatePresence>
        {compareTemplate && compareData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setCompareTemplate(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-background rounded-xl border shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div 
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: store.primary_color }}
                  >
                    <ArrowLeftRight className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">Comparar diseños</h2>
                    <p className="text-sm text-muted-foreground">
                      Tu diseño actual vs. {compareTemplate.thumbnail} {compareTemplate.name}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setCompareTemplate(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Comparison Grid */}
              <div className="grid md:grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {/* Current Design */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-lg">
                        📍
                      </div>
                      <div>
                        <h3 className="font-semibold">Diseño actual</h3>
                        <p className="text-xs text-muted-foreground">Tu configuración guardada</p>
                      </div>
                    </div>
                  </div>
                  <Card className="overflow-hidden border-2 border-muted">
                    <CardContent className="p-0">
                      <LivePreviewPanel
                        sections={sections}
                        store={store}
                        globalStyles={globalStyles}
                        device="desktop"
                        showDeviceControls={false}
                      />
                    </CardContent>
                  </Card>
                  <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/30 rounded-lg">
                    <p><strong>Fuente:</strong> {globalStyles.headingFont}</p>
                    <p><strong>Bordes:</strong> {globalStyles.borderRadius}</p>
                    <p><strong>Secciones:</strong> {sections.filter(s => s.enabled).length} activas</p>
                  </div>
                </div>

                {/* Template Design */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
                        {compareTemplate.thumbnail}
                      </div>
                      <div>
                        <h3 className="font-semibold">{compareTemplate.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {compareTemplate.isCustom ? 'Plantilla personalizada' : 'Plantilla predefinida'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Card className="overflow-hidden border-2 border-primary/50 ring-2 ring-primary/20">
                    <CardContent className="p-0">
                      <LivePreviewPanel
                        sections={compareData.sections}
                        store={store}
                        globalStyles={compareData.styles}
                        device="desktop"
                        showDeviceControls={false}
                      />
                    </CardContent>
                  </Card>
                  <div className="text-xs text-muted-foreground space-y-1 p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <p><strong>Fuente:</strong> {compareTemplate.globalStyles.headingFont}</p>
                    <p><strong>Bordes:</strong> {compareTemplate.globalStyles.borderRadius}</p>
                    <p><strong>Secciones:</strong> {compareTemplate.sectionIds.length} activas</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-4 border-t bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  ¿Te gusta la plantilla? Aplícala a tu tienda
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setCompareTemplate(null)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleApplyCompareTemplate}
                    style={{ backgroundColor: store.primary_color }}
                    className="gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Aplicar {compareTemplate.name}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoreEditorPanel;
