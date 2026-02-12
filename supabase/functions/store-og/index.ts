import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return new Response("Missing slug parameter", { status: 400 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: store, error } = await supabase
      .from("stores")
      .select("name, description, logo_url, banner_url, primary_color, secondary_color")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !store) {
      return new Response("Store not found", { status: 404 });
    }

    // Determine the app URL from the Referer or use a default
    const appUrl = Deno.env.get("APP_URL") || "https://apptienda.lovable.app";
    const storeUrl = `${appUrl}/tienda/${slug}`;
    
    // Use store logo/banner for OG image, or generate a dynamic SVG
    const ogImage = store.logo_url || store.banner_url || `${appUrl}/og-image.png`;
    const storeName = store.name || "Tienda Online";
    const storeDescription = store.description || `Visita ${storeName} y descubre nuestros productos exclusivos.`;
    const primaryColor = store.primary_color || "#8B4513";
    const secondaryColor = store.secondary_color || "#D4A574";

    // Generate a dynamic OG image as SVG data URI if no logo/banner
    const dynamicOgImageSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.3"/>
          </filter>
        </defs>
        <rect width="1200" height="630" fill="url(#bg)" rx="0"/>
        <rect x="40" y="40" width="1120" height="550" rx="24" fill="white" fill-opacity="0.12" filter="url(#shadow)"/>
        <circle cx="600" cy="220" r="70" fill="white" fill-opacity="0.2"/>
        <text x="600" y="240" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="48" fill="white" opacity="0.9">🏪</text>
        <text x="600" y="360" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" font-size="56" fill="white" letter-spacing="1">${escapeXml(storeName.substring(0, 30))}</text>
        <text x="600" y="420" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="white" opacity="0.85">${escapeXml(storeDescription.substring(0, 80))}</text>
        <rect x="450" y="470" width="300" height="50" rx="25" fill="white" fill-opacity="0.25"/>
        <text x="600" y="502" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="white" font-weight="600">Visitar Tienda →</text>
      </svg>
    `;

    // If no custom image, serve the SVG as OG image via a data URI won't work for crawlers.
    // Instead, if requested as image, return the SVG directly
    const wantsImage = url.searchParams.get("image") === "true";
    if (wantsImage) {
      return new Response(dynamicOgImageSvg.trim(), {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=3600",
          ...corsHeaders,
        },
      });
    }

    // Build the OG image URL - use store's image or dynamic SVG endpoint
    const ogImageUrl = (store.logo_url || store.banner_url) 
      ? ogImage 
      : `${supabaseUrl}/functions/v1/store-og?slug=${slug}&image=true`;

    // Return HTML with proper OG tags + instant redirect
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(storeName)} - Tienda Online</title>
  <meta name="description" content="${escapeHtml(storeDescription)}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${escapeHtml(storeName)}">
  <meta property="og:description" content="${escapeHtml(storeDescription)}">
  <meta property="og:image" content="${escapeHtml(ogImageUrl)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${escapeHtml(storeUrl)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${escapeHtml(storeName)}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(storeName)}">
  <meta name="twitter:description" content="${escapeHtml(storeDescription)}">
  <meta name="twitter:image" content="${escapeHtml(ogImageUrl)}">
  
  <!-- Instant redirect for real users -->
  <meta http-equiv="refresh" content="0;url=${escapeHtml(storeUrl)}">
  <link rel="canonical" href="${escapeHtml(storeUrl)}">
  
  <style>
    body {
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    a {
      color: white;
      text-decoration: underline;
      font-size: 1.1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${escapeHtml(storeName)}</h1>
    <p>Redirigiendo a la tienda...</p>
    <p><a href="${escapeHtml(storeUrl)}">Haz clic aquí si no eres redirigido</a></p>
  </div>
  <script>window.location.replace("${storeUrl.replace(/"/g, '\\"')}");</script>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error in store-og:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
