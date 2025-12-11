import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getBrandBySlug, getProductsByBrand } from "@/data/brands";
import { Button } from "@/components/ui/button";

const BrandPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const brand = getBrandBySlug(slug || "");
  const products = getProductsByBrand(slug || "");

  if (!brand) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bebas text-foreground mb-4">Marca no encontrada</h1>
          <Link to="/">
            <Button variant="outline">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${brand.bannerImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        
        <div className="relative z-10 h-full flex flex-col justify-end pb-12 px-4">
          <div className="container mx-auto max-w-7xl">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al catálogo
            </Link>
            
            <h1 className="text-5xl md:text-7xl font-bebas text-foreground mb-3 animate-fade-in">
              {brand.name}
            </h1>
            <p className="text-xl md:text-2xl text-primary font-oswald tracking-wide mb-4">
              {brand.tagline}
            </p>
            <p className="text-muted-foreground max-w-2xl text-lg">
              {brand.description}
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl md:text-4xl font-bebas text-foreground">
              Colección {brand.name}
            </h2>
            <span className="text-muted-foreground">
              {products.length} productos
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div 
                key={product.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                No hay productos disponibles en esta colección.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BrandPage;
