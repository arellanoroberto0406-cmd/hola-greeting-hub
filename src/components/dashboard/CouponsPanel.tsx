import { useState } from "react";
import { useStoreCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon, Coupon } from "@/hooks/useCoupons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2, Edit2, Tag, Percent, DollarSign, Copy, Check } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface CouponsPanelProps {
  storeId: string;
}

const CouponsPanel = ({ storeId }: CouponsPanelProps) => {
  const { toast } = useToast();
  const { data: coupons, isLoading } = useStoreCoupons(storeId);
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minPurchase, setMinPurchase] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setEditingCoupon(null);
    setCode("");
    setDiscountType("percentage");
    setDiscountValue("");
    setMinPurchase("");
    setMaxUses("");
    setExpiresAt("");
    setIsActive(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDiscountType(coupon.discount_type);
    setDiscountValue(String(coupon.discount_value));
    setMinPurchase(coupon.min_purchase ? String(coupon.min_purchase) : "");
    setMaxUses(coupon.max_uses ? String(coupon.max_uses) : "");
    setExpiresAt(coupon.expires_at ? coupon.expires_at.split("T")[0] : "");
    setIsActive(coupon.is_active);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!code || !discountValue) {
      toast({ variant: "destructive", title: "Completa los campos requeridos" });
      return;
    }

    try {
      const couponData = {
        store_id: storeId,
        code: code.toUpperCase().trim(),
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        min_purchase: minPurchase ? parseFloat(minPurchase) : 0,
        max_uses: maxUses ? parseInt(maxUses) : null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        is_active: isActive,
      };

      if (editingCoupon) {
        await updateCoupon.mutateAsync({ id: editingCoupon.id, ...couponData });
        toast({ title: "Cupón actualizado" });
      } else {
        await createCoupon.mutateAsync(couponData);
        toast({ title: "Cupón creado" });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message.includes("duplicate") ? "Este código ya existe" : error.message,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este cupón?")) return;
    await deleteCoupon.mutateAsync(id);
    toast({ title: "Cupón eliminado" });
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading">Cupones</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cupón
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCoupon ? "Editar Cupón" : "Nuevo Cupón"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Código *</Label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="DESCUENTO20"
                  className="uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de descuento</Label>
                  <Select value={discountType} onValueChange={(v: "percentage" | "fixed") => setDiscountType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                      <SelectItem value="fixed">Monto fijo ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Valor *</Label>
                  <Input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === "percentage" ? "20" : "100"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Compra mínima</Label>
                  <Input
                    type="number"
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Usos máximos</Label>
                  <Input
                    type="number"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    placeholder="Sin límite"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Fecha de expiración</Label>
                <Input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Cupón activo</Label>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>

              <Button onClick={handleSubmit} className="w-full" disabled={createCoupon.isPending || updateCoupon.isPending}>
                {(createCoupon.isPending || updateCoupon.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {editingCoupon ? "Guardar cambios" : "Crear cupón"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!coupons?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay cupones creados</p>
            <p className="text-sm text-muted-foreground mt-1">
              Crea códigos de descuento para tus clientes
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {coupons.map((coupon) => (
            <Card key={coupon.id} className={!coupon.is_active ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {coupon.discount_type === "percentage" ? (
                        <Percent className="h-4 w-4 text-primary" />
                      ) : (
                        <DollarSign className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold text-lg">{coupon.code}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyCode(coupon.code, coupon.id)}
                        >
                          {copiedId === coupon.id ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {coupon.discount_type === "percentage"
                          ? `${coupon.discount_value}% de descuento`
                          : `$${coupon.discount_value} de descuento`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(coupon)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {!coupon.is_active && (
                    <Badge variant="secondary">Inactivo</Badge>
                  )}
                  {coupon.min_purchase > 0 && (
                    <Badge variant="outline">Min: ${coupon.min_purchase}</Badge>
                  )}
                  {coupon.max_uses && (
                    <Badge variant="outline">
                      {coupon.uses_count}/{coupon.max_uses} usos
                    </Badge>
                  )}
                  {coupon.expires_at && (
                    <Badge variant="outline">
                      Expira: {format(new Date(coupon.expires_at), "PP", { locale: es })}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CouponsPanel;
