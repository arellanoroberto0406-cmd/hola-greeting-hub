import { useState } from "react";
import { useStoreOrders, useUpdateOrderStatus, OrderWithItems } from "@/hooks/useStoreOrders";
import { useMercadoPagoRefund } from "@/hooks/useMercadoPagoRefund";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Package, Eye, Clock, Truck, CheckCircle, XCircle, ExternalLink, RotateCcw, CreditCard, Printer, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import TrackingInput from "./TrackingInput";
import ExportOrdersButton from "./ExportOrdersButton";
import OrderInvoice from "./OrderInvoice";

interface OrdersPanelProps {
  storeId: string;
  store?: {
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    logo_url?: string | null;
    primary_color?: string | null;
  };
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente", color: "bg-yellow-500/20 text-yellow-600", icon: Clock },
  { value: "awaiting_payment", label: "Esperando pago", color: "bg-orange-500/20 text-orange-600", icon: CreditCard },
  { value: "paid", label: "Pagado", color: "bg-emerald-500/20 text-emerald-600", icon: CheckCircle },
  { value: "confirmed", label: "Confirmado", color: "bg-blue-500/20 text-blue-600", icon: CheckCircle },
  { value: "shipped", label: "Enviado", color: "bg-purple-500/20 text-purple-600", icon: Truck },
  { value: "delivered", label: "Entregado", color: "bg-green-500/20 text-green-600", icon: CheckCircle },
  { value: "cancelled", label: "Cancelado", color: "bg-red-500/20 text-red-600", icon: XCircle },
  { value: "refunded", label: "Reembolsado", color: "bg-gray-500/20 text-gray-600", icon: RotateCcw },
  { value: "payment_failed", label: "Pago fallido", color: "bg-red-500/20 text-red-600", icon: XCircle },
];

const getStatusInfo = (status: string) => {
  return STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
};

const isMercadoPagoPayment = (paymentMethod: string) => {
  return paymentMethod?.startsWith('mercadopago');
};

const canRefund = (order: OrderWithItems) => {
  return isMercadoPagoPayment(order.payment_method) && 
    (order.status === 'paid' || order.status === 'confirmed' || order.status === 'shipped');
};

const OrdersPanel = ({ storeId, store }: OrdersPanelProps) => {
  const { data: orders, isLoading } = useStoreOrders(storeId);
  const updateStatus = useUpdateOrderStatus();
  const refundMutation = useMercadoPagoRefund();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [refundReason, setRefundReason] = useState("");
  const [showRefundDialog, setShowRefundDialog] = useState(false);

  const handleRefund = async (orderId: string) => {
    if (!refundReason.trim()) return;
    await refundMutation.mutateAsync({ storeId, orderId, reason: refundReason });
    setRefundReason("");
    setShowRefundDialog(false);
  };

  const filteredOrders = orders?.filter((order) =>
    statusFilter === "all" ? true : order.status === statusFilter
  );

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await updateStatus.mutateAsync({ orderId, status: newStatus });
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ExportOrdersButton orders={filteredOrders || []} storeName="tienda" />
      </div>

      {!filteredOrders?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay pedidos todavía</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-muted-foreground">
                          #{order.id.slice(0, 8)}
                        </span>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <p className="font-medium">
                        {order.first_name} {order.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.created_at), "PPp", { locale: es })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.order_items.length} producto(s) · ${order.total.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Pedido #{selectedOrder?.id.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Cliente</h4>
                  <p>{selectedOrder.first_name} {selectedOrder.last_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.email}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.phone}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Dirección de envío</h4>
                  <p className="text-sm">{selectedOrder.address}</p>
                  <p className="text-sm">{selectedOrder.city}, {selectedOrder.state}</p>
                  <p className="text-sm">CP: {selectedOrder.zip_code}</p>
                </div>
              </div>

              {/* Products */}
              <div>
                <h4 className="font-medium mb-3">Productos</h4>
                <div className="space-y-3">
                  {selectedOrder.order_items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        {item.selected_color && (
                          <p className="text-sm text-muted-foreground">
                            Color: {item.selected_color}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Cantidad: {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium">
                        ${(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Envío</span>
                  <span>${selectedOrder.shipping_cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Método de pago:</span>{" "}
                  {selectedOrder.payment_method === "cash" ? "Efectivo" : 
                   selectedOrder.payment_method === "card" ? "Tarjeta" : 
                   selectedOrder.payment_method?.startsWith('mercadopago') ? (
                     <Badge variant="outline" className="ml-1">
                       <CreditCard className="h-3 w-3 mr-1" />
                       MercadoPago
                     </Badge>
                   ) : selectedOrder.payment_method}
                </div>
                
                {/* Refund Button */}
                {canRefund(selectedOrder) && (
                  <AlertDialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        disabled={refundMutation.isPending}
                        onClick={() => {
                          setRefundReason("");
                          setShowRefundDialog(true);
                        }}
                      >
                        {refundMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4 mr-1" />
                        )}
                        Reembolsar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Confirmar reembolso?</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                          <div className="space-y-4">
                            <p>
                              Esta acción procesará un reembolso completo de ${selectedOrder.total.toFixed(2)} 
                              a través de MercadoPago. Esta acción no se puede deshacer.
                            </p>
                            <div className="space-y-2">
                              <Label htmlFor="refund-reason" className="text-foreground font-medium">
                                Motivo del reembolso *
                              </Label>
                              <Textarea
                                id="refund-reason"
                                placeholder="Ej: Producto defectuoso, cliente solicitó cancelación..."
                                value={refundReason}
                                onChange={(e) => setRefundReason(e.target.value)}
                                className="min-h-[80px]"
                              />
                              <p className="text-xs text-muted-foreground">
                                Este motivo quedará registrado en el historial de auditoría.
                              </p>
                            </div>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setRefundReason("")}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleRefund(selectedOrder.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={!refundReason.trim() || refundMutation.isPending}
                        >
                          {refundMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : null}
                          Confirmar reembolso
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                
                {selectedOrder.status === 'refunded' && (
                  <Badge variant="outline" className="bg-gray-100 text-gray-600">
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reembolsado
                  </Badge>
                )}
              </div>

              {/* Payment Proof */}
              {(selectedOrder as any).payment_proof_url && (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Comprobante de pago
                  </h4>
                  <a 
                    href={(selectedOrder as any).payment_proof_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img 
                      src={(selectedOrder as any).payment_proof_url} 
                      alt="Comprobante de pago" 
                      className="max-w-full max-h-64 rounded-lg border object-contain mx-auto"
                    />
                    <p className="text-xs text-center text-muted-foreground mt-2 hover:underline">
                      Click para ver en tamaño completo
                    </p>
                  </a>
                </div>
              )}
              {selectedOrder.payment_method === 'transfer' && !(selectedOrder as any).payment_proof_url && (
                <div className="border rounded-lg p-3 bg-yellow-50 dark:bg-yellow-900/10">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    El cliente aún no ha subido comprobante de pago
                  </p>
                </div>
              )}

              {/* Print Invoice */}
              {store && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Factura</h4>
                  <OrderInvoice 
                    order={{
                      ...selectedOrder,
                      tracking_number: (selectedOrder as any).tracking_number,
                      carrier: (selectedOrder as any).carrier,
                    }}
                    store={store}
                    primaryColor={store.primary_color || "#8B4513"}
                  />
                </div>
              )}

              {/* Tracking */}
              <div className="border-t pt-4 space-y-3">
                <h4 className="font-medium">Información de envío</h4>
                <TrackingInput 
                  orderId={selectedOrder.id}
                  currentTracking={{
                    tracking_number: (selectedOrder as any).tracking_number,
                    tracking_url: (selectedOrder as any).tracking_url,
                    carrier: (selectedOrder as any).carrier,
                    estimated_delivery: (selectedOrder as any).estimated_delivery,
                  }}
                />
                {(selectedOrder as any).tracking_number && (
                  <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                    <p className="text-sm"><strong>Guía:</strong> {(selectedOrder as any).tracking_number}</p>
                    {(selectedOrder as any).carrier && (
                      <p className="text-sm"><strong>Paquetería:</strong> {(selectedOrder as any).carrier}</p>
                    )}
                    {(selectedOrder as any).tracking_url && (
                      <a 
                        href={(selectedOrder as any).tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary flex items-center gap-1 hover:underline"
                      >
                        Ver rastreo <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPanel;
