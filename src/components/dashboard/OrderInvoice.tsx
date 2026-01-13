import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  selected_color?: string | null;
}

interface Order {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  payment_method: string;
  status: string;
  created_at: string;
  order_items: OrderItem[];
  tracking_number?: string;
  carrier?: string;
}

interface Store {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  logo_url?: string | null;
}

interface OrderInvoiceProps {
  order: Order;
  store: Store;
  primaryColor?: string;
}

const OrderInvoice = ({ order, store, primaryColor = "#8B4513" }: OrderInvoiceProps) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = invoiceRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Factura #${order.id.slice(0, 8)}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #333; }
            .invoice-header { display: flex; justify-content: space-between; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid ${primaryColor}; }
            .store-info h1 { color: ${primaryColor}; font-size: 24px; margin-bottom: 8px; }
            .store-info p { font-size: 12px; color: #666; margin-bottom: 2px; }
            .invoice-meta { text-align: right; }
            .invoice-meta h2 { font-size: 28px; color: ${primaryColor}; margin-bottom: 8px; }
            .invoice-meta p { font-size: 12px; color: #666; margin-bottom: 2px; }
            .addresses { display: flex; gap: 40px; margin-bottom: 30px; }
            .address-block { flex: 1; }
            .address-block h3 { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
            .address-block p { font-size: 14px; margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: ${primaryColor}; color: white; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; }
            td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
            .text-right { text-align: right; }
            .totals { margin-left: auto; width: 280px; }
            .totals-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .totals-row.total { border-top: 2px solid ${primaryColor}; border-bottom: none; font-weight: bold; font-size: 18px; color: ${primaryColor}; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #666; }
            .status-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; }
            .logo { max-height: 60px; max-width: 150px; object-fit: contain; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Efectivo';
      case 'card': return 'Tarjeta';
      case 'transfer': return 'Transferencia';
      default: return method.startsWith('mercadopago') ? 'MercadoPago' : method;
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Pendiente',
      awaiting_payment: 'Esperando pago',
      paid: 'Pagado',
      confirmed: 'Confirmado',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado',
    };
    return statusMap[status] || status;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={handlePrint} className="gap-2" style={{ backgroundColor: primaryColor }}>
          <Printer className="h-4 w-4" />
          Imprimir Factura
        </Button>
      </div>

      {/* Invoice Preview (hidden in normal view, used for printing) */}
      <div ref={invoiceRef} className="hidden">
        <div className="invoice-header">
          <div className="store-info">
            {store.logo_url && <img src={store.logo_url} alt={store.name} className="logo" style={{ marginBottom: '10px' }} />}
            <h1>{store.name}</h1>
            {store.email && <p>{store.email}</p>}
            {store.phone && <p>{store.phone}</p>}
            {store.address && <p>{store.address}</p>}
          </div>
          <div className="invoice-meta">
            <h2>FACTURA</h2>
            <p><strong>N°:</strong> {order.id.slice(0, 8).toUpperCase()}</p>
            <p><strong>Fecha:</strong> {format(new Date(order.created_at), "d 'de' MMMM, yyyy", { locale: es })}</p>
            <p><strong>Estado:</strong> <span className="status-badge" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>{getStatusLabel(order.status)}</span></p>
          </div>
        </div>

        <div className="addresses">
          <div className="address-block">
            <h3>Facturar a</h3>
            <p><strong>{order.first_name} {order.last_name}</strong></p>
            <p>{order.email}</p>
            <p>{order.phone}</p>
          </div>
          <div className="address-block">
            <h3>Enviar a</h3>
            <p>{order.address}</p>
            <p>{order.city}, {order.state}</p>
            <p>CP: {order.zip_code}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th className="text-right">Precio Unit.</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.product_name}
                  {item.selected_color && <span style={{ color: '#666', fontSize: '12px' }}> - {item.selected_color}</span>}
                </td>
                <td>{item.quantity}</td>
                <td className="text-right">${item.price.toFixed(2)}</td>
                <td className="text-right">${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="totals">
          <div className="totals-row">
            <span>Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="totals-row">
            <span>Envío</span>
            <span>${order.shipping_cost.toFixed(2)}</span>
          </div>
          <div className="totals-row total">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="footer">
          <p><strong>Método de pago:</strong> {getPaymentMethodLabel(order.payment_method)}</p>
          {order.tracking_number && (
            <p style={{ marginTop: '8px' }}><strong>N° de seguimiento:</strong> {order.tracking_number} {order.carrier && `(${order.carrier})`}</p>
          )}
          <p style={{ marginTop: '16px' }}>¡Gracias por tu compra!</p>
        </div>
      </div>
    </div>
  );
};

export default OrderInvoice;
