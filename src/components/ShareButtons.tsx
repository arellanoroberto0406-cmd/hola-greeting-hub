import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Facebook, Twitter, Link2, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  variant?: "icon" | "full";
  className?: string;
}

const ShareButtons = ({ 
  url, 
  title, 
  description, 
  variant = "icon",
  className 
}: ShareButtonsProps) => {
  const { toast } = useToast();
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || "");

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Enlace copiado",
        description: "El enlace se copió al portapapeles",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo copiar el enlace",
      });
    }
  };

  const openShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], "_blank", "width=600,height=400");
  };

  if (variant === "full") {
    return (
      <div className={`flex gap-2 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => openShare("facebook")}
          className="flex-1"
        >
          <Facebook className="h-4 w-4 mr-2" />
          Facebook
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => openShare("twitter")}
          className="flex-1"
        >
          <Twitter className="h-4 w-4 mr-2" />
          Twitter
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => openShare("whatsapp")}
          className="flex-1"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          WhatsApp
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={copyLink}
        >
          <Link2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => openShare("facebook")}>
          <Facebook className="h-4 w-4 mr-2" />
          Compartir en Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openShare("twitter")}>
          <Twitter className="h-4 w-4 mr-2" />
          Compartir en Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openShare("whatsapp")}>
          <MessageCircle className="h-4 w-4 mr-2" />
          Compartir en WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyLink}>
          <Link2 className="h-4 w-4 mr-2" />
          Copiar enlace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButtons;
