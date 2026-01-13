import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Order {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  payment_method: string;
  tracking_number?: string;
  carrier?: string;
  order_items: Array<{
    product_name: string;
    quantity: number;
    price: number;
    selected_color?: string;
  }>;
}

interface ExportOrdersButtonProps {
  orders: Order[];
  storeName: string;
}

const ExportOrdersButton = ({ orders, storeName }: ExportOrdersButtonProps) => {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendiente",
      confirmed: "Confirmado",
      processing: "En proceso",
      shipped: "Enviado",
      delivered: "Entregado",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  const exportToCSV = () => {
    setExporting(true);
    try {
      const headers = [
        "ID Pedido",
        "Fecha",
        "Cliente",
        "Email",
        "Teléfono",
        "Dirección",
        "Ciudad",
        "Estado",
        "CP",
        "Estado del pedido",
        "Productos",
        "Subtotal",
        "Envío",
        "Total",
        "Método de pago",
        "Número de guía",
        "Paquetería",
      ];

      const rows = orders.map((order) => [
        order.id.substring(0, 8).toUpperCase(),
        format(new Date(order.created_at), "dd/MM/yyyy HH:mm", { locale: es }),
        `${order.first_name} ${order.last_name}`,
        order.email,
        order.phone,
        order.address,
        order.city,
        order.state,
        order.zip_code,
        getStatusLabel(order.status),
        order.order_items.map(i => `${i.product_name} (x${i.quantity})`).join("; "),
        order.subtotal.toFixed(2),
        order.shipping_cost.toFixed(2),
        order.total.toFixed(2),
        order.payment_method,
        order.tracking_number || "",
        order.carrier || "",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `pedidos-${storeName}-${format(new Date(), "yyyy-MM-dd")}.csv`;
      link.click();

      toast({ title: "Exportación completada" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo exportar los pedidos",
      });
    }
    setExporting(false);
  };

  const exportToJSON = () => {
    setExporting(true);
    try {
      const jsonContent = JSON.stringify(orders, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `pedidos-${storeName}-${format(new Date(), "yyyy-MM-dd")}.json`;
      link.click();

      toast({ title: "Exportación completada" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo exportar los pedidos",
      });
    }
    setExporting(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={exporting || !orders?.length}>
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar a CSV (Excel)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          <FileText className="h-4 w-4 mr-2" />
          Exportar a JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportOrdersButton;
