import { Store } from "@/types/store";
import { StoreSection } from "@/types/storeLayout";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactSectionProps {
  section: StoreSection;
  store: Store;
}

export const ContactSection = ({ section, store }: ContactSectionProps) => {
  const { showMap, showSocial } = section.settings;

  const hasContactInfo = store.phone || store.email || store.address || (store as any).whatsapp_number;
  const hasSocialLinks = store.instagram_url || store.facebook_url || store.twitter_url || store.tiktok_url;

  if (!hasContactInfo && !hasSocialLinks) return null;

  const whatsappNumber = (store as any).whatsapp_number;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="py-12 px-6 rounded-2xl"
      style={{ backgroundColor: `${store.primary_color}05` }}
    >
      <h2 className="text-2xl md:text-3xl font-bold font-heading mb-8 text-center" style={{ color: store.primary_color }}>
        {section.title}
      </h2>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Contact Info */}
        {hasContactInfo && (
          <div className="space-y-4">
            <h3 className="font-semibold mb-4">Información de contacto</h3>
            
            {/* WhatsApp - Destacado */}
            {whatsappNumber && (
              <motion.a
                href={`https://wa.me/${whatsappNumber.replace(/[\s\-\(\)\+]/g, "")}?text=${encodeURIComponent(`¡Hola! Me interesa conocer más sobre los productos de ${store.name}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 hover:shadow-md transition-all"
                whileHover={{ x: 5, scale: 1.02 }}
              >
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center bg-green-500"
                >
                  <MessageCircle className="h-6 w-6 text-white fill-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">WhatsApp</p>
                  <p className="font-semibold">{whatsappNumber}</p>
                  <p className="text-xs text-muted-foreground">Haz clic para chatear</p>
                </div>
              </motion.a>
            )}

            {store.phone && (
              <motion.a
                href={`tel:${store.phone}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-background transition-colors"
                whileHover={{ x: 5 }}
              >
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${store.primary_color}15` }}
                >
                  <Phone className="h-5 w-5" style={{ color: store.primary_color }} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{store.phone}</p>
                </div>
              </motion.a>
            )}

            {store.email && (
              <motion.a
                href={`mailto:${store.email}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-background transition-colors"
                whileHover={{ x: 5 }}
              >
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${store.primary_color}15` }}
                >
                  <Mail className="h-5 w-5" style={{ color: store.primary_color }} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{store.email}</p>
                </div>
              </motion.a>
            )}

            {store.address && (
              <div className="flex items-center gap-3 p-3 rounded-xl">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${store.primary_color}15` }}
                >
                  <MapPin className="h-5 w-5" style={{ color: store.primary_color }} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dirección</p>
                  <p className="font-medium">{store.address}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Social Links */}
        {showSocial && hasSocialLinks && (
          <div className="space-y-4">
            <h3 className="font-semibold mb-4">Síguenos en redes</h3>
            <div className="flex flex-wrap gap-3">
              {store.instagram_url && (
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 hover:bg-pink-50 hover:border-pink-300 dark:hover:bg-pink-950/30"
                  onClick={() => window.open(store.instagram_url, '_blank')}
                >
                  <Instagram className="h-5 w-5 text-pink-600" />
                  Instagram
                </Button>
              )}
              {store.facebook_url && (
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950/30"
                  onClick={() => window.open(store.facebook_url, '_blank')}
                >
                  <Facebook className="h-5 w-5 text-blue-600" />
                  Facebook
                </Button>
              )}
              {store.twitter_url && (
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 hover:bg-sky-50 hover:border-sky-300 dark:hover:bg-sky-950/30"
                  onClick={() => window.open(store.twitter_url, '_blank')}
                >
                  <Twitter className="h-5 w-5 text-sky-500" />
                  Twitter / X
                </Button>
              )}
              {store.tiktok_url && (
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => window.open(store.tiktok_url, '_blank')}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                  TikTok
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Síguenos para estar al día con nuestras novedades y ofertas exclusivas.
            </p>
          </div>
        )}
      </div>
    </motion.section>
  );
};
