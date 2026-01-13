import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { useProductVariants, ProductVariant } from "@/hooks/useProductVariants";

interface VariantsManagerProps {
  productId: string;
  trigger?: React.ReactNode;
}

const VariantsManager = ({ productId, trigger }: VariantsManagerProps) => {
  const { variants, isLoading, createVariant, updateVariant, deleteVariant } = useProductVariants(productId);
  const [open, setOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [stock, setStock] = useState("0");
  const [priceAdjustment, setPriceAdjustment] = useState("0");
  const [sku, setSku] = useState("");

  const resetForm = () => {
    setEditingVariant(null);
    setName("");
    setValue("");
    setStock("0");
    setPriceAdjustment("0");
    setSku("");
  };

  const openEdit = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setName(variant.name);
    setValue(variant.value);
    setStock(String(variant.stock));
    setPriceAdjustment(String(variant.price_adjustment || 0));
    setSku(variant.sku || "");
  };

  const handleSave = async () => {
    if (!name.trim() || !value.trim()) return;

    const variantData = {
      product_id: productId,
      name: name.trim(),
      value: value.trim(),
      stock: parseInt(stock) || 0,
      price_adjustment: parseFloat(priceAdjustment) || 0,
      sku: sku.trim() || undefined,
    };

    if (editingVariant) {
      await updateVariant.mutateAsync({ id: editingVariant.id, ...variantData });
    } else {
      await createVariant.mutateAsync(variantData);
    }
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar esta variante?")) {
      await deleteVariant.mutateAsync(id);
    }
  };

  const predefinedVariants = [
    { name: "Talla", values: ["XS", "S", "M", "L", "XL", "XXL"] },
    { name: "Tamaño", values: ["Pequeño", "Mediano", "Grande", "Extra Grande"] },
  ];

  const addPredefined = async (variantName: string, variantValue: string) => {
    await createVariant.mutateAsync({
      product_id: productId,
      name: variantName,
      value: variantValue,
      stock: 10,
      price_adjustment: 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Variantes
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestionar Variantes</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {/* Quick add predefined */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Agregar rápido</Label>
            <div className="space-y-2">
              {predefinedVariants.map((pv) => (
                <div key={pv.name} className="space-y-2">
                  <span className="text-sm text-muted-foreground">{pv.name}:</span>
                  <div className="flex flex-wrap gap-1">
                    {pv.values.map((val) => {
                      const exists = variants?.some(v => v.name === pv.name && v.value === val);
                      return (
                        <Badge
                          key={val}
                          variant={exists ? "secondary" : "outline"}
                          className={`cursor-pointer transition-colors ${exists ? "opacity-50" : "hover:bg-primary hover:text-primary-foreground"}`}
                          onClick={() => !exists && addPredefined(pv.name, val)}
                        >
                          {val}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current variants */}
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : variants && variants.length > 0 ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Variantes actuales</Label>
              <div className="space-y-2">
                {variants.map((variant) => (
                  <div key={variant.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{variant.name}</Badge>
                      <span className="font-medium">{variant.value}</span>
                      <span className="text-sm text-muted-foreground">
                        Stock: {variant.stock}
                      </span>
                      {variant.price_adjustment !== 0 && (
                        <span className="text-sm text-muted-foreground">
                          {variant.price_adjustment > 0 ? "+" : ""}${variant.price_adjustment}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(variant)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(variant.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No hay variantes configuradas</p>
          )}

          {/* Add/Edit form */}
          <div className="space-y-4 pt-4 border-t">
            <Label className="text-sm font-medium">
              {editingVariant ? "Editar variante" : "Agregar variante personalizada"}
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Tipo (ej: Talla, Color)</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Talla"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Valor (ej: M, Rojo)</Label>
                <Input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="M"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Stock</Label>
                <Input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Ajuste de precio</Label>
                <Input
                  type="number"
                  value={priceAdjustment}
                  onChange={(e) => setPriceAdjustment(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">SKU (opcional)</Label>
              <Input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="SKU-001-M"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!name.trim() || !value.trim()}>
                {editingVariant ? "Actualizar" : "Agregar"}
              </Button>
              {editingVariant && (
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VariantsManager;
