import { createClient } from "npm:@supabase/supabase-js@2";
import { createOpenAI } from "npm:@ai-sdk/openai";
import { Output, NoObjectGeneratedError, streamText } from "npm:ai";
import { z } from "npm:zod";
import { createRunIdFetch, requestRunId } from "../_shared/ai-run-id.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-lovable-aig-run-id",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};

const FONT_IDS = ["inter", "montserrat", "playfair", "poppins", "roboto", "lora", "oswald", "raleway", "merriweather", "nunito", "dm-sans", "space-grotesk", "crimson-pro", "outfit", "archivo-black", "hind"] as const;
const SECTION_IDS = ["hero", "featured_products", "categories", "banner", "testimonials", "newsletter", "about", "contact", "products_grid", "custom_text", "image_slider", "video", "faq", "countdown_timer", "instagram_feed", "brand_logos", "comparison_table", "popup_banner", "parallax_hero", "interactive_gallery", "animated_stats", "customer_reviews_carousel", "loyalty_program", "premium_video"] as const;

const proposalSchema = z.object({
  name: z.string(),
  rationale: z.string(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  accentColor: z.string(),
  headingFont: z.string(),
  bodyFont: z.string(),
  sections: z.array(z.string()),
});

const isHex = (value: string) => /^#[0-9a-f]{6}$/i.test(value);

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "Método no permitido." }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    const cloudUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!apiKey || !cloudUrl || !serviceKey) throw new Error("Falta la configuración del asistente de diseño.");

    const token = request.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
    const cloud = createClient(cloudUrl, serviceKey);
    const { data: { user }, error: authError } = await cloud.auth.getUser(token);
    if (authError || !user) return new Response(JSON.stringify({ error: "Inicia sesión para diseñar tu tienda." }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await request.json() as { storeId?: string; description?: string; planTier?: string; currentSections?: string[] };
    const storeId = typeof body.storeId === "string" ? body.storeId : "";
    const description = typeof body.description === "string" ? body.description.trim().slice(0, 1200) : "";
    if (!storeId || description.length < 10) return new Response(JSON.stringify({ error: "Describe con un poco más de detalle el estilo que buscas." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: store } = await cloud.from("stores").select("id, owner_id, name, description").eq("id", storeId).maybeSingle();
    if (!store || store.owner_id !== user.id) return new Response(JSON.stringify({ error: "No tienes permiso para diseñar esta tienda." }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const run = createRunIdFetch(requestRunId(request));
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: run.fetch,
    });
    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      instructions: "Eres un director de arte para tiendas online mexicanas. Genera una propuesta comercial, coherente y fácil de aplicar. Responde en español. No menciones modelos ni proveedores. Usa solamente identificadores permitidos suministrados por el usuario.",
      messages: [{ role: "user", content: `Tienda: ${store.name}. Descripción de la tienda: ${store.description || "Sin descripción"}. Plan: ${body.planTier || "basic"}. Estilo solicitado: ${description}. Secciones actuales: ${(body.currentSections || []).join(", ")}. Fuentes permitidas: ${FONT_IDS.join(", ")}. Secciones permitidas: ${SECTION_IDS.join(", ")}. Propón exactamente 3 colores hexadecimales, 2 fuentes y entre 5 y 9 secciones, en orden.` }],
      output: Output.object({ schema: proposalSchema }),
      abortSignal: request.signal,
      providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } },
    });

    let raw: z.infer<typeof proposalSchema>;
    try {
      raw = await result.output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) throw new Error("La propuesta recibida no tuvo un formato válido. Intenta describir el estilo de otra manera.");
      throw error;
    }

    const proposal = {
      name: raw.name.trim().slice(0, 80),
      rationale: raw.rationale.trim().slice(0, 320),
      primaryColor: isHex(raw.primaryColor) ? raw.primaryColor.toUpperCase() : "#E92E67",
      secondaryColor: isHex(raw.secondaryColor) ? raw.secondaryColor.toUpperCase() : "#FFF5F8",
      accentColor: isHex(raw.accentColor) ? raw.accentColor.toUpperCase() : "#23B5A5",
      headingFont: FONT_IDS.includes(raw.headingFont as typeof FONT_IDS[number]) ? raw.headingFont : "archivo-black",
      bodyFont: FONT_IDS.includes(raw.bodyFont as typeof FONT_IDS[number]) ? raw.bodyFont : "hind",
      sections: [...new Set(raw.sections.filter((section) => SECTION_IDS.includes(section as typeof SECTION_IDS[number])))].slice(0, 9),
    };
    const headers = { ...corsHeaders, "Content-Type": "application/json", ...(run.getRunId() ? { "X-Lovable-AIG-Run-ID": run.getRunId() as string } : {}) };
    return new Response(JSON.stringify({ proposal }), { headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo generar la propuesta.";
    console.error("generate-store-design", message);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
