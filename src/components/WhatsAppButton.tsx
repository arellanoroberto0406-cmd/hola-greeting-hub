import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WhatsAppButtonProps {
  phone: string;
  storeName: string;
  primaryColor?: string;
  message?: string;
  productName?: string;
}

const WhatsAppButton = ({ 
  phone, 
  storeName, 
  primaryColor = "#25D366",
  message,
  productName,
}: WhatsAppButtonProps) => {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "").replace(/^\+/, "");
  
  const defaultMessage = `¡Hola! Me interesa conocer más sobre los productos de ${storeName}`;
  const whatsappMessage = encodeURIComponent(message || defaultMessage);
  
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappMessage}`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 group flex items-center gap-2"
          >
            {/* Contextual product label — desktop only */}
            {productName && (
              <span className="hidden sm:flex items-center max-w-[200px] bg-card/95 backdrop-blur-sm text-foreground text-xs font-medium px-3 py-2 rounded-full shadow-lg border border-border/50 truncate animate-fade-in">
                💬 Preguntar por {productName}
              </span>
            )}
            <span className="relative">
              <Button
                size="lg"
                className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                style={{ 
                  backgroundColor: "#25D366",
                  color: "white"
                }}
              >
                <MessageCircle className="h-7 w-7 fill-current" />
              </Button>
              <span 
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full animate-ping"
                style={{ backgroundColor: primaryColor }}
              />
              <span 
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
            </span>
          </a>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-card border shadow-lg">
          <p className="font-medium">
            {productName ? `Preguntar por ${productName}` : "¿Necesitas ayuda?"}
          </p>
          <p className="text-sm text-muted-foreground">Chatea con nosotros por WhatsApp</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default WhatsAppButton;
