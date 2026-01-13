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
}

const WhatsAppButton = ({ 
  phone, 
  storeName, 
  primaryColor = "#25D366",
  message 
}: WhatsAppButtonProps) => {
  // Clean phone number - remove spaces, dashes, and ensure proper format
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "").replace(/^\+/, "");
  
  // Default message if not provided
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
            className="fixed bottom-6 right-6 z-50 group"
          >
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
          </a>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-card border shadow-lg">
          <p className="font-medium">¿Necesitas ayuda?</p>
          <p className="text-sm text-muted-foreground">Chatea con nosotros por WhatsApp</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default WhatsAppButton;
