import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RotateCcw, CreditCard, Calendar, DollarSign, TrendingDown, Package } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface RefundsHistoryPanelProps {
  storeId: string;
}

interface RefundedOrder {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  total: number;
  payment_method: string;
  created_at: string;
  updated_at: string;
  order_items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

const RefundsHistoryPanel = ({ storeId }: RefundsHistoryPanelProps) => {
  const { data: refundedOrders, isLoading } = useQuery({
    queryKey: ['refunded-orders', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('store_id', storeId)
        .eq('status', 'refunded')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as RefundedOrder[];
    },
    enabled: !!storeId,
  });

  const totalRefunded = refundedOrders?.reduce((sum, order) => sum + order.total, 0) || 0;
  const refundCount = refundedOrders?.length || 0;

  // Calculate refunds this month
  const currentMonth = new Date();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const refundsThisMonth = refundedOrders?.filter(
    order => new Date(order.updated_at) >= firstDayOfMonth
  ) || [];
  const totalRefundedThisMonth = refundsThisMonth.reduce((sum, order) => sum + order.total, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reembolsado</p>
                <p className="text-2xl font-bold text-destructive">${totalRefunded.toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reembolsos Totales</p>
                <p className="text-2xl font-bold">{refundCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <RotateCcw className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Este Mes</p>
                <p className="text-2xl font-bold text-orange-600">${totalRefundedThisMonth.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{refundsThisMonth.length} reembolso(s)</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refunds List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Historial de Reembolsos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!refundedOrders?.length ? (
            <div className="text-center py-12">
              <RotateCcw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay reembolsos registrados</p>
              <p className="text-sm text-muted-foreground mt-1">
                Los reembolsos procesados aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {refundedOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm text-muted-foreground">
                          #{order.id.slice(0, 8)}
                        </span>
                        <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Reembolsado
                        </Badge>
                        {order.payment_method?.startsWith('mercadopago') && (
                          <Badge variant="secondary" className="text-xs">
                            <CreditCard className="h-3 w-3 mr-1" />
                            MercadoPago
                          </Badge>
                        )}
                      </div>
                      
                      <p className="font-medium">
                        {order.first_name} {order.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{order.email}</p>
                      
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {order.order_items.length} producto(s)
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(order.updated_at), "PPp", { locale: es })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-destructive">
                        -${order.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Pedido original: {format(new Date(order.created_at), "PP", { locale: es })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Products Summary */}
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Productos reembolsados:</p>
                    <div className="flex flex-wrap gap-2">
                      {order.order_items.map((item) => (
                        <Badge key={item.id} variant="outline" className="text-xs">
                          {item.product_name} x{item.quantity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RefundsHistoryPanel;
