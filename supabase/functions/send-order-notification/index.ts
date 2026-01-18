import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
  selected_color?: string;
}

interface OrderNotificationRequest {
  order_id: string;
  store_name: string;
  store_email: string;
  store_logo?: string;
  primary_color?: string;
  whatsapp_number?: string;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  total: number;
  payment_method: string;
  notify_store?: boolean;
  notify_customer?: boolean;
  notify_whatsapp?: boolean;
}

const getPaymentMethodLabel = (method: string) => {
  switch (method) {
    case 'cash': return 'Efectivo';
    case 'card': return 'Tarjeta';
    case 'transfer': return 'Transferencia';
    default: return method.startsWith('mercadopago') ? 'MercadoPago' : method;
  }
};

const generateOrderItemsHTML = (items: OrderItem[], primaryColor: string) => {
  return items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        ${item.product_name}
        ${item.selected_color ? `<span style="color: #666; font-size: 12px;"> - ${item.selected_color}</span>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `).join('');
};

const generateStoreEmailHTML = (data: OrderNotificationRequest) => {
  const primaryColor = data.primary_color || '#8B4513';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          ${data.store_logo ? `<img src="${data.store_logo}" alt="${data.store_name}" style="max-height: 60px; margin-bottom: 10px;">` : ''}
          <h1 style="color: ${primaryColor}; margin: 0;">🎉 ¡Nuevo Pedido!</h1>
        </div>
        
        <div style="background: ${primaryColor}15; border-left: 4px solid ${primaryColor}; padding: 15px; margin-bottom: 25px;">
          <p style="margin: 0; font-size: 18px;"><strong>Pedido #${data.order_id.slice(0, 8).toUpperCase()}</strong></p>
          <p style="margin: 5px 0 0; color: #666;">Total: <strong style="color: ${primaryColor}; font-size: 20px;">$${data.total.toFixed(2)}</strong></p>
        </div>

        <h2 style="color: #333; font-size: 16px; border-bottom: 2px solid ${primaryColor}; padding-bottom: 10px;">👤 Datos del Cliente</h2>
        <table style="width: 100%; margin-bottom: 25px;">
          <tr>
            <td style="padding: 8px 0; color: #666;">Nombre:</td>
            <td style="padding: 8px 0;"><strong>${data.customer.first_name} ${data.customer.last_name}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Email:</td>
            <td style="padding: 8px 0;"><a href="mailto:${data.customer.email}" style="color: ${primaryColor};">${data.customer.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Teléfono:</td>
            <td style="padding: 8px 0;"><a href="tel:${data.customer.phone}" style="color: ${primaryColor};">${data.customer.phone}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Dirección:</td>
            <td style="padding: 8px 0;">${data.customer.address}, ${data.customer.city}, ${data.customer.state} CP: ${data.customer.zip_code}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Método de pago:</td>
            <td style="padding: 8px 0;">${getPaymentMethodLabel(data.payment_method)}</td>
          </tr>
        </table>

        <h2 style="color: #333; font-size: 16px; border-bottom: 2px solid ${primaryColor}; padding-bottom: 10px;">📦 Productos</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: ${primaryColor}; color: white;">
              <th style="padding: 12px; text-align: left;">Producto</th>
              <th style="padding: 12px; text-align: center;">Cant.</th>
              <th style="padding: 12px; text-align: right;">Precio</th>
              <th style="padding: 12px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${generateOrderItemsHTML(data.items, primaryColor)}
          </tbody>
        </table>

        <table style="width: 250px; margin-left: auto;">
          <tr>
            <td style="padding: 8px 0; color: #666;">Subtotal:</td>
            <td style="padding: 8px 0; text-align: right;">$${data.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Envío:</td>
            <td style="padding: 8px 0; text-align: right;">$${data.shipping_cost.toFixed(2)}</td>
          </tr>
          <tr style="border-top: 2px solid ${primaryColor};">
            <td style="padding: 12px 0; font-weight: bold; font-size: 18px;">Total:</td>
            <td style="padding: 12px 0; text-align: right; font-weight: bold; font-size: 18px; color: ${primaryColor};">$${data.total.toFixed(2)}</td>
          </tr>
        </table>

        <div style="margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: #666;">¡No olvides confirmar el pedido y preparar el envío!</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateCustomerEmailHTML = (data: OrderNotificationRequest) => {
  const primaryColor = data.primary_color || '#8B4513';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          ${data.store_logo ? `<img src="${data.store_logo}" alt="${data.store_name}" style="max-height: 60px; margin-bottom: 10px;">` : ''}
          <h1 style="color: ${primaryColor}; margin: 0;">¡Gracias por tu compra!</h1>
          <p style="color: #666; margin-top: 10px;">Hola ${data.customer.first_name}, hemos recibido tu pedido</p>
        </div>
        
        <div style="background: ${primaryColor}15; border-radius: 8px; padding: 20px; margin-bottom: 25px; text-align: center;">
          <p style="margin: 0; color: #666;">Número de pedido</p>
          <p style="margin: 5px 0 0; font-size: 24px; font-weight: bold; color: ${primaryColor};">#${data.order_id.slice(0, 8).toUpperCase()}</p>
        </div>

        <h2 style="color: #333; font-size: 16px; border-bottom: 2px solid ${primaryColor}; padding-bottom: 10px;">📦 Tu pedido</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: ${primaryColor}; color: white;">
              <th style="padding: 12px; text-align: left;">Producto</th>
              <th style="padding: 12px; text-align: center;">Cant.</th>
              <th style="padding: 12px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">
                  ${item.product_name}
                  ${item.selected_color ? `<span style="color: #666; font-size: 12px;"> - ${item.selected_color}</span>` : ''}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <table style="width: 250px; margin-left: auto; margin-bottom: 25px;">
          <tr>
            <td style="padding: 8px 0; color: #666;">Subtotal:</td>
            <td style="padding: 8px 0; text-align: right;">$${data.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Envío:</td>
            <td style="padding: 8px 0; text-align: right;">$${data.shipping_cost.toFixed(2)}</td>
          </tr>
          <tr style="border-top: 2px solid ${primaryColor};">
            <td style="padding: 12px 0; font-weight: bold; font-size: 18px;">Total:</td>
            <td style="padding: 12px 0; text-align: right; font-weight: bold; font-size: 18px; color: ${primaryColor};">$${data.total.toFixed(2)}</td>
          </tr>
        </table>

        <h2 style="color: #333; font-size: 16px; border-bottom: 2px solid ${primaryColor}; padding-bottom: 10px;">📍 Dirección de envío</h2>
        <p style="color: #666; line-height: 1.6;">
          ${data.customer.first_name} ${data.customer.last_name}<br>
          ${data.customer.address}<br>
          ${data.customer.city}, ${data.customer.state}<br>
          CP: ${data.customer.zip_code}
        </p>

        <div style="margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px; text-align: center;">
          <p style="margin: 0 0 10px; color: #333; font-weight: bold;">¿Tienes preguntas?</p>
          <p style="margin: 0; color: #666;">Contáctanos y te ayudaremos con gusto.</p>
        </div>

        <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px;">
          <p>Gracias por comprar en <strong>${data.store_name}</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate WhatsApp message for store notification
const generateWhatsAppMessage = (data: OrderNotificationRequest) => {
  const orderId = data.order_id.slice(0, 8).toUpperCase();
  const itemsList = data.items.map(item => 
    `• ${item.product_name} x${item.quantity} - $${(item.quantity * item.price).toFixed(2)}${item.selected_color ? ` (${item.selected_color})` : ''}`
  ).join('\n');
  
  const message = `🎉 *¡NUEVO PEDIDO!*

📦 *Pedido #${orderId}*

👤 *Cliente:*
${data.customer.first_name} ${data.customer.last_name}
📱 ${data.customer.phone}
📧 ${data.customer.email}

📍 *Dirección de envío:*
${data.customer.address}
${data.customer.city}, ${data.customer.state}
CP: ${data.customer.zip_code}

🛒 *Productos:*
${itemsList}

💰 *Resumen:*
Subtotal: $${data.subtotal.toFixed(2)}
Envío: $${data.shipping_cost.toFixed(2)}
*TOTAL: $${data.total.toFixed(2)}*

💳 *Método de pago:* ${getPaymentMethodLabel(data.payment_method)}

¡Revisa tu panel de control para gestionar este pedido!`;

  return message;
};

// Clean phone number for WhatsApp
const cleanPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with 0, remove it
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // If doesn't start with country code, assume Mexico (+52)
  if (cleaned.length === 10) {
    cleaned = '52' + cleaned;
  }
  
  return cleaned;
};

async function sendEmail(apiKey: string, params: {
  from: string;
  to: string[];
  subject: string;
  html: string;
}) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  try {
    const data: OrderNotificationRequest = await req.json();
    console.log("Processing order notification for order:", data.order_id);
    
    const results: { store?: any; customer?: any; whatsapp?: any } = {};

    // Send email to store owner (if Resend API key is configured)
    if (resendApiKey && data.notify_store !== false && data.store_email) {
      console.log("Sending notification to store:", data.store_email);
      try {
        const storeEmailResponse = await sendEmail(resendApiKey, {
          from: `${data.store_name} <onboarding@resend.dev>`,
          to: [data.store_email],
          subject: `🎉 Nuevo pedido #${data.order_id.slice(0, 8).toUpperCase()} - $${data.total.toFixed(2)}`,
          html: generateStoreEmailHTML(data),
        });
        console.log("Store email sent:", storeEmailResponse);
        results.store = storeEmailResponse;
      } catch (emailError: unknown) {
        console.error("Error sending store email:", emailError);
        results.store = { error: emailError instanceof Error ? emailError.message : String(emailError) };
      }
    }

    // Send confirmation email to customer (if Resend API key is configured)
    if (resendApiKey && data.notify_customer !== false && data.customer.email) {
      console.log("Sending confirmation to customer:", data.customer.email);
      try {
        const customerEmailResponse = await sendEmail(resendApiKey, {
          from: `${data.store_name} <onboarding@resend.dev>`,
          to: [data.customer.email],
          subject: `¡Gracias por tu pedido! #${data.order_id.slice(0, 8).toUpperCase()}`,
          html: generateCustomerEmailHTML(data),
        });
        console.log("Customer email sent:", customerEmailResponse);
        results.customer = customerEmailResponse;
      } catch (emailError: unknown) {
        console.error("Error sending customer email:", emailError);
        results.customer = { error: emailError instanceof Error ? emailError.message : String(emailError) };
      }
    }

    // Generate WhatsApp notification URL for the store owner
    if (data.notify_whatsapp !== false && data.whatsapp_number) {
      console.log("Generating WhatsApp notification for:", data.whatsapp_number);
      const cleanedPhone = cleanPhoneNumber(data.whatsapp_number);
      const message = generateWhatsAppMessage(data);
      const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`;
      
      results.whatsapp = {
        success: true,
        phone: cleanedPhone,
        url: whatsappUrl,
        message: message,
      };
      console.log("WhatsApp URL generated:", whatsappUrl);
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending order notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
