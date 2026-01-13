import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, TrendingDown, DollarSign, CreditCard, Building2, Banknote, Wallet } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";

interface PaymentStatsPanelProps {
  storeId: string;
  primaryColor?: string;
}

interface Order {
  id: string;
  created_at: string;
  total: number;
  payment_method: string;
  status: string;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: "Tarjeta",
  transfer: "Transferencia",
  cash: "Efectivo",
  paypal: "PayPal",
  mercadopago: "MercadoPago",
  mercadopago_credit_card: "MP Tarjeta",
  mercadopago_debit_card: "MP Débito",
  mercadopago_ticket: "OXXO/Efectivo",
};

const PAYMENT_METHOD_COLORS: Record<string, string> = {
  card: "#6366f1",
  transfer: "#22c55e",
  cash: "#f59e0b",
  paypal: "#0070ba",
  mercadopago: "#00b1ea",
  mercadopago_credit_card: "#00b1ea",
  mercadopago_debit_card: "#00d4ff",
  mercadopago_ticket: "#ff6b35",
};

const PAYMENT_METHOD_ICONS: Record<string, React.ReactNode> = {
  card: <CreditCard className="h-4 w-4" />,
  transfer: <Building2 className="h-4 w-4" />,
  cash: <Banknote className="h-4 w-4" />,
  paypal: <Wallet className="h-4 w-4" />,
  mercadopago: <div className="h-4 w-4 bg-[#00b1ea] rounded text-white text-[8px] font-bold flex items-center justify-center">MP</div>,
};

const PaymentStatsPanel = ({ storeId, primaryColor = "#8B4513" }: PaymentStatsPanelProps) => {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["store-orders-stats", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, total, payment_method, status")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!storeId,
  });

  const stats = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrder: 0,
        byPaymentMethod: [],
        dailySales: [],
        revenueByMethod: [],
        weekComparison: { current: 0, previous: 0, percentChange: 0 },
      };
    }

    // Filter completed orders (paid, confirmed, shipped, delivered)
    const completedOrders = orders.filter(o => 
      !['cancelled', 'payment_failed', 'awaiting_payment'].includes(o.status)
    );

    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = completedOrders.length;
    const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Group by payment method
    const methodCounts: Record<string, { count: number; revenue: number }> = {};
    completedOrders.forEach(order => {
      const method = order.payment_method || 'unknown';
      if (!methodCounts[method]) {
        methodCounts[method] = { count: 0, revenue: 0 };
      }
      methodCounts[method].count++;
      methodCounts[method].revenue += order.total;
    });

    const byPaymentMethod = Object.entries(methodCounts)
      .map(([method, data]) => ({
        name: PAYMENT_METHOD_LABELS[method] || method,
        value: data.count,
        revenue: data.revenue,
        color: PAYMENT_METHOD_COLORS[method] || "#94a3b8",
      }))
      .sort((a, b) => b.value - a.value);

    const revenueByMethod = Object.entries(methodCounts)
      .map(([method, data]) => ({
        name: PAYMENT_METHOD_LABELS[method] || method,
        revenue: data.revenue,
        orders: data.count,
        color: PAYMENT_METHOD_COLORS[method] || "#94a3b8",
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Daily sales for the last 14 days
    const today = startOfDay(new Date());
    const twoWeeksAgo = subDays(today, 13);
    const days = eachDayOfInterval({ start: twoWeeksAgo, end: today });

    const dailySales = days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayOrders = completedOrders.filter(o => 
        format(new Date(o.created_at), "yyyy-MM-dd") === dayStr
      );
      return {
        date: format(day, "dd MMM", { locale: es }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
      };
    });

    // Week over week comparison
    const oneWeekAgo = subDays(today, 7);
    const twoWeeksAgoDate = subDays(today, 14);

    const currentWeekOrders = completedOrders.filter(o => 
      new Date(o.created_at) >= oneWeekAgo
    );
    const previousWeekOrders = completedOrders.filter(o => {
      const date = new Date(o.created_at);
      return date >= twoWeeksAgoDate && date < oneWeekAgo;
    });

    const currentWeekRevenue = currentWeekOrders.reduce((sum, o) => sum + o.total, 0);
    const previousWeekRevenue = previousWeekOrders.reduce((sum, o) => sum + o.total, 0);
    const percentChange = previousWeekRevenue > 0 
      ? ((currentWeekRevenue - previousWeekRevenue) / previousWeekRevenue) * 100 
      : currentWeekRevenue > 0 ? 100 : 0;

    return {
      totalRevenue,
      totalOrders,
      averageOrder,
      byPaymentMethod,
      dailySales,
      revenueByMethod,
      weekComparison: {
        current: currentWeekRevenue,
        previous: previousWeekRevenue,
        percentChange,
      },
    };
  }, [orders]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isPositiveChange = stats.weekComparison.percentChange >= 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: primaryColor }}>
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              De {stats.totalOrders} pedidos completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.averageOrder.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground">Por pedido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            {isPositiveChange ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.weekComparison.current.toLocaleString()}
            </div>
            <p className={`text-xs ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`}>
              {isPositiveChange ? '+' : ''}{stats.weekComparison.percentChange.toFixed(1)}% vs semana anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Método Favorito</CardTitle>
            {stats.byPaymentMethod[0] && (
              PAYMENT_METHOD_ICONS[stats.byPaymentMethod[0].name.toLowerCase()] || 
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.byPaymentMethod[0]?.name || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.byPaymentMethod[0]?.value || 0} pedidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Methods Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Método de Pago</CardTitle>
            <CardDescription>Cantidad de pedidos por método</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.byPaymentMethod.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={stats.byPaymentMethod}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.byPaymentMethod.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} pedidos`, 'Cantidad']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                Sin datos de pedidos
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Ingresos por Método</CardTitle>
            <CardDescription>Total de ventas por cada método de pago</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.revenueByMethod.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.revenueByMethod} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tickFormatter={(v) => `$${v.toLocaleString()}`} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ingresos']}
                  />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                    {stats.revenueByMethod.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                Sin datos de ingresos
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas Diarias</CardTitle>
          <CardDescription>Ingresos y pedidos de los últimos 14 días</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.dailySales.some(d => d.revenue > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.dailySales}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" tickFormatter={(v) => `$${v}`} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? `$${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Ingresos' : 'Pedidos'
                  ]}
                />
                <Legend 
                  formatter={(value) => value === 'revenue' ? 'Ingresos' : 'Pedidos'}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke={primaryColor}
                  strokeWidth={2}
                  dot={{ fill: primaryColor }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: "#22c55e" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Sin ventas en los últimos 14 días
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Desglose de Métodos de Pago</CardTitle>
          <CardDescription>Estadísticas detalladas por método</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Método</th>
                  <th className="text-right py-3 px-4 font-medium">Pedidos</th>
                  <th className="text-right py-3 px-4 font-medium">Ingresos</th>
                  <th className="text-right py-3 px-4 font-medium">% del Total</th>
                  <th className="text-right py-3 px-4 font-medium">Ticket Promedio</th>
                </tr>
              </thead>
              <tbody>
                {stats.revenueByMethod.length > 0 ? (
                  stats.revenueByMethod.map((method, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: method.color }}
                          />
                          {method.name}
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">{method.orders}</td>
                      <td className="text-right py-3 px-4 font-medium">
                        ${method.revenue.toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-4">
                        {stats.totalRevenue > 0 
                          ? ((method.revenue / stats.totalRevenue) * 100).toFixed(1)
                          : 0}%
                      </td>
                      <td className="text-right py-3 px-4">
                        ${method.orders > 0 
                          ? (method.revenue / method.orders).toLocaleString(undefined, { maximumFractionDigits: 0 })
                          : 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
                      No hay datos de pagos aún
                    </td>
                  </tr>
                )}
              </tbody>
              {stats.revenueByMethod.length > 0 && (
                <tfoot>
                  <tr className="bg-muted/30 font-medium">
                    <td className="py-3 px-4">Total</td>
                    <td className="text-right py-3 px-4">{stats.totalOrders}</td>
                    <td className="text-right py-3 px-4">${stats.totalRevenue.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">100%</td>
                    <td className="text-right py-3 px-4">
                      ${stats.averageOrder.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentStatsPanel;
