import { useState } from "react";
import { useStoreOrders, useUpdateOrderStatus, OrderWithItems } from "@/hooks/useStoreOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Loader2, Package, Eye, Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface OrdersPanelProps {
  storeId: string;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente", color: "bg-yellow-500/20 text-yellow-600", icon: Clock },
  { value: "confirmed", label: "Confirmado", color: "bg-blue-500/20 text-blue-600", icon: CheckCircle },
  { value: "shipped", label: "Enviado", color: "bg-purple-500/20 text-purple-600", icon: Truck },
  { value: "delivered", label: "Entregado", color: "bg-green-500/20 text-green-600", icon: CheckCircle },
  { value: "cancelled", label: "Cancelado", color: "bg-red-500/20 text-red-600", icon: XCircle },
];

const getStatusInfo = (status: string) => {
  return STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
};

const OrdersPanel = ({ storeId }: OrdersPanelProps) => {
  const { data: orders, isLoading } = useStoreOrders(storeId);
  const updateStatus = useUpdateOrderStatus();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading">Pedidos</h2>
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
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Método de pago:</span>{" "}
                {selectedOrder.payment_method === "cash" ? "Efectivo" : 
                 selectedOrder.payment_method === "card" ? "Tarjeta" : 
                 selectedOrder.payment_method}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPanel;
