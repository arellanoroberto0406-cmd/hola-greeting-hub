import { Store } from "@/types/store";
import { motion } from "framer-motion";
import { 
  Facebook, Instagram, Twitter, Youtube, Mail, Phone, 
  MapPin, CreditCard, Shield, Truck, Heart, Sparkles,
  ArrowUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface PremiumFooterSectionProps {
  store: Store;
  planTier?: "basic" | "professional" | "enterprise";
}

export const PremiumFooterSection = ({
  store,
  planTier = "basic"
}: PremiumFooterSectionProps) => {
  const [email, setEmail] = useState("");
  
  const isBasic = planTier === "basic";
  const isProfessional = planTier === "professional";
  const isEnterprise = planTier === "enterprise";

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
    { icon: Facebook, url: store.facebook_url, label: "Facebook" },
    { icon: Instagram, url: store.instagram_url, label: "Instagram" },
    { icon: Twitter, url: store.twitter_url, label: "Twitter" },
    { icon: Youtube, url: store.tiktok_url, label: "TikTok" },
  ].filter(link => link.url);

  const paymentMethods = ["visa", "mastercard", "amex", "paypal", "mercadopago"];

  // Enterprise premium footer
  if (isEnterprise) {
    return (
      <footer className="relative overflow-hidden">
        {/* Gradient background */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, transparent 0%, ${store.primary_color}08 100%)`
          }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                backgroundColor: store.primary_color,
                opacity: 0.2,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Newsletter section */}
        <div className="border-b border-border/50">
          <div className="container mx-auto px-4 py-16">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge 
                variant="outline" 
                className="mb-4"
                style={{ borderColor: store.primary_color, color: store.primary_color }}
              >
                <Sparkles className="h-3 w-3 mr-1.5" />
                Únete a nuestra comunidad
              </Badge>
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Sé el primero en enterarte
              </h3>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                Suscríbete para recibir ofertas exclusivas, novedades y un 10% de descuento en tu primera compra.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Tu email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-background/50 backdrop-blur-sm border-border/50"
                />
                <Button 
                  className="h-12 px-8 font-semibold"
                  style={{ backgroundColor: store.primary_color }}
                >
                  Suscribirme
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main footer */}
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1 lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                {store.logo_url ? (
                  <img src={store.logo_url} alt={store.name} className="h-12 mb-6" />
                ) : (
                  <h2 
                    className="text-2xl font-bold mb-6"
                    style={{ color: store.primary_color }}
                  >
                    {store.name}
                  </h2>
                )}
                <p className="text-muted-foreground mb-6 max-w-sm">
                  {store.description || "Tu tienda de confianza para los mejores productos."}
                </p>
                
                {/* Social links */}
                <div className="flex gap-3">
                  {socialLinks.map((social, i) => (
                    <motion.a
                      key={i}
                      href={social.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-primary/10 transition-colors"
                      style={{ color: store.primary_color }}
                    >
                      <social.icon className="h-5 w-5" />
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="font-semibold mb-4">Tienda</h4>
              <ul className="space-y-3 text-muted-foreground">
                {["Nuevos", "Ofertas", "Populares", "Categorías"].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-foreground transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Ayuda</h4>
              <ul className="space-y-3 text-muted-foreground">
                {["Envíos", "Devoluciones", "FAQ", "Contacto"].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-foreground transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <ul className="space-y-4 text-muted-foreground">
                {store.email && (
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4" style={{ color: store.primary_color }} />
                    <span className="text-sm">{store.email}</span>
                  </li>
                )}
                {store.phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4" style={{ color: store.primary_color }} />
                    <span className="text-sm">{store.phone}</span>
                  </li>
                )}
                {store.address && (
                  <li className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5" style={{ color: store.primary_color }} />
                    <span className="text-sm">{store.address}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Trust badges */}
          <motion.div
            className="flex flex-wrap justify-center gap-8 mt-16 py-8 border-t border-b border-border/50"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {[
              { icon: Truck, label: "Envío rápido" },
              { icon: Shield, label: "Pago seguro" },
              { icon: CreditCard, label: "Múltiples métodos" },
              { icon: Heart, label: "Garantía de satisfacción" },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 text-muted-foreground"
                whileHover={{ scale: 1.05 }}
              >
                <item.icon className="h-5 w-5" style={{ color: store.primary_color }} />
                <span className="text-sm font-medium">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 pt-8">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {store.name}. Todos los derechos reservados.
            </p>
            
            {/* Payment methods */}
            <div className="flex items-center gap-3">
              {paymentMethods.map((method, i) => (
                <div
                  key={i}
                  className="h-8 w-12 bg-muted/50 rounded flex items-center justify-center text-xs font-bold text-muted-foreground uppercase"
                >
                  {method.slice(0, 4)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll to top button */}
        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg flex items-center justify-center z-50"
          style={{ backgroundColor: store.primary_color }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ArrowUp className="h-5 w-5 text-white" />
        </motion.button>
      </footer>
    );
  }

  // Professional footer
  if (isProfessional) {
    return (
      <footer className="bg-muted/30 border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <h2 
                className="text-xl font-bold mb-4"
                style={{ color: store.primary_color }}
              >
                {store.name}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {store.description?.slice(0, 100) || "Tu tienda de confianza."}
              </p>
              <div className="flex gap-2">
                {socialLinks.map((social, i) => (
                  <a
                    key={i}
                    href={social.url || "#"}
                    className="h-9 w-9 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors"
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Tienda</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {["Productos", "Categorías", "Ofertas", "Nuevos"].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-foreground">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Información</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {["Envíos", "Devoluciones", "Términos", "Privacidad"].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-foreground">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {store.email && <li>{store.email}</li>}
                {store.phone && <li>{store.phone}</li>}
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} {store.name}. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    );
  }

  // Basic simple footer
  return (
    <footer className="bg-muted/30 border-t py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span 
              className="font-bold"
              style={{ color: store.primary_color }}
            >
              {store.name}
            </span>
          </div>
          
          <div className="flex gap-3">
            {socialLinks.slice(0, 3).map((social, i) => (
              <a
                key={i}
                href={social.url || "#"}
                className="h-8 w-8 rounded-full bg-muted flex items-center justify-center"
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {store.name}
          </p>
        </div>
      </div>
    </footer>
  );
};
