import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useStoreAssets = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadStoreAsset = async (
    file: File, 
    storeId: string, 
    type: 'logo' | 'banner'
  ): Promise<string | null> => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Tipo de archivo no válido",
        description: "Solo se permiten imágenes (JPG, PNG, WebP, GIF, SVG)",
      });
      return null;
    }

    // Validate file size (max 5MB for logo, 10MB for banner)
    const maxSize = type === 'logo' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "Archivo muy grande",
        description: `El archivo debe ser menor a ${type === 'logo' ? '5MB' : '10MB'}`,
      });
      return null;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${storeId}/${type}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('store-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('store-assets')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al subir",
        description: error.message,
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteStoreAsset = async (url: string): Promise<boolean> => {
    try {
      const path = url.split('/store-assets/')[1];
      if (!path) return false;

      const { error } = await supabase.storage
        .from('store-assets')
        .remove([path]);

      if (error) throw error;
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: error.message,
      });
      return false;
    }
  };

  return { uploadStoreAsset, deleteStoreAsset, uploading };
};
