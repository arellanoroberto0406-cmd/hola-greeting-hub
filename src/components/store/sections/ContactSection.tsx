import { Store } from "@/types/store";
import { StoreSection } from "@/types/storeLayout";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactSectionProps {
  section: StoreSection;
  store: Store;
}

export const ContactSection = ({ section, store }: ContactSectionProps) => {
  const { showMap, showSocial } = section.settings;

  const hasContactInfo = store.phone || store.email || store.address;
  const hasSocialLinks = store.instagram_url || store.facebook_url || (store as any).twitter_url;

  if (!hasContactInfo && !hasSocialLinks) return null;

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
            <h3 className="font-semibold mb-4">Síguenos</h3>
            <div className="flex flex-wrap gap-3">
              {store.instagram_url && (
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  onClick={() => window.open(store.instagram_url, '_blank')}
                >
                  <Instagram className="h-5 w-5" />
                  Instagram
                </Button>
              )}
              {store.facebook_url && (
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  onClick={() => window.open(store.facebook_url, '_blank')}
                >
                  <Facebook className="h-5 w-5" />
                  Facebook
                </Button>
              )}
              {(store as any).twitter_url && (
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  onClick={() => window.open((store as any).twitter_url, '_blank')}
                >
                  <Twitter className="h-5 w-5" />
                  Twitter
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
};
