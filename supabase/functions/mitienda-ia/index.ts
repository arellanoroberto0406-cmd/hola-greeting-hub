const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Msg { role: "user" | "assistant"; content: string }

const SYSTEM = `Eres MiTienda IA, el asistente de negocios de la plataforma MiTienda.
Ayudas a personas que están creando o administrando su tienda en línea en México.
Puedes: crear productos y descripciones, sugerir precios, crear promociones,
analizar ventas, recomendar mejoras de diseño y escribir contenido para redes.
Responde en español, con tono cercano y claro, sin tecnicismos.
Sé breve (máximo 180 palabras), usa listas cortas y termina con una acción concreta sugerida.
Nunca menciones proveedores de IA ni nombres de modelos.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Falta la configuración del asistente." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages = [], context = "" } = (await req.json()) as { messages: Msg[]; context?: string };

    const input = [
      { role: "system", content: [{ type: "input_text", text: SYSTEM + (context ? `\n\nContexto de la tienda: ${context}` : "") }] },
      ...messages.slice(-12).map((message) => ({
        role: message.role,
        content: [
          message.role === "assistant"
            ? { type: "output_text", text: message.content }
            : { type: "input_text", text: message.content },
        ],
      })),
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        input,
        stream: true,
        reasoning: { effort: "low", summary: "auto" },
      }),
    });

    if (!response.ok || !response.body) {
      const detail = await response.text().catch(() => "");
      const message =
        response.status === 402
          ? "El asistente no tiene créditos disponibles por ahora."
          : response.status === 429
            ? "El asistente está muy ocupado. Intenta de nuevo en unos segundos."
            : "El asistente no pudo responder en este momento.";
      console.error("mitienda-ia gateway error", response.status, detail.slice(0, 500));
      return new Response(JSON.stringify({ error: message }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const event = JSON.parse(payload);
          if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
            text += event.delta;
          }
          if (event.type === "response.completed" && !text && event.response?.output_text) {
            text = String(event.response.output_text);
          }
        } catch {
          /* fragmento incompleto */
        }
      }
    }

    return new Response(
      JSON.stringify({ reply: text.trim() || "No pude generar una respuesta. ¿Puedes darme más detalle?" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("mitienda-ia error", error);
    return new Response(JSON.stringify({ error: "El asistente no pudo responder en este momento." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
