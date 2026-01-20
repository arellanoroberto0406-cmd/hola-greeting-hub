import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "product" | "article";
  price?: number;
  currency?: string;
  availability?: "in stock" | "out of stock";
  brand?: string;
}

const SEOHead = ({
  title,
  description,
  image,
  url,
  type = "website",
  price,
  currency = "MXN",
  availability,
  brand,
}: SEOHeadProps) => {
  useEffect(() => {
    // Update title
    document.title = title;

    // Helper to update or create meta tag
    const updateMeta = (property: string, content: string, isName = false) => {
      const attr = isName ? "name" : "property";
      let meta = document.querySelector(`meta[${attr}="${property}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, property);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Basic meta
    if (description) {
      updateMeta("description", description, true);
      updateMeta("og:description", description);
      updateMeta("twitter:description", description);
    }

    // Open Graph
    updateMeta("og:title", title);
    updateMeta("og:type", type);
    if (url) {
      updateMeta("og:url", url);
      // Also update canonical link
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", url);
    }
    if (image) {
      // Use absolute URL for images
      const absoluteImage = image.startsWith('http') ? image : `${window.location.origin}${image}`;
      updateMeta("og:image", absoluteImage);
      updateMeta("og:image:width", "1200");
      updateMeta("og:image:height", "630");
      updateMeta("twitter:image", absoluteImage);
    }

    // Twitter Card
    updateMeta("twitter:card", image ? "summary_large_image" : "summary", true);
    updateMeta("twitter:title", title);

    // Product specific
    if (type === "product" && price !== undefined) {
      updateMeta("product:price:amount", price.toString());
      updateMeta("product:price:currency", currency);
      if (availability) {
        updateMeta("product:availability", availability);
      }
      if (brand) {
        updateMeta("product:brand", brand);
      }
    }

    // JSON-LD for products
    if (type === "product" && price !== undefined) {
      const existingScript = document.querySelector('script[data-seo-jsonld]');
      if (existingScript) {
        existingScript.remove();
      }

      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: title,
        description: description || "",
        image: image || "",
        offers: {
          "@type": "Offer",
          price: price,
          priceCurrency: currency,
          availability: availability === "in stock" 
            ? "https://schema.org/InStock" 
            : "https://schema.org/OutOfStock",
        },
        ...(brand && { brand: { "@type": "Brand", name: brand } }),
      };

      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-jsonld", "true");
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup JSON-LD on unmount
      const script = document.querySelector('script[data-seo-jsonld]');
      if (script) script.remove();
    };
  }, [title, description, image, url, type, price, currency, availability, brand]);

  return null;
};

export default SEOHead;
