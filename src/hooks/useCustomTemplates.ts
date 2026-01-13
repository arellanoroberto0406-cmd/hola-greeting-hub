import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GlobalStyles } from "@/types/storeLayout";
import { useToast } from "@/hooks/use-toast";

export interface CustomTemplate {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  thumbnail: string;
  global_styles: GlobalStyles;
  section_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateData {
  storeId: string;
  name: string;
  description?: string;
  thumbnail?: string;
  globalStyles: GlobalStyles;
  sectionIds: string[];
}

export const useCustomTemplates = (storeId: string) => {
  return useQuery({
    queryKey: ['custom-templates', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_templates')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(template => ({
        ...template,
        global_styles: template.global_styles as unknown as GlobalStyles,
      })) as CustomTemplate[];
    },
    enabled: !!storeId,
  });
};

export const useCreateCustomTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTemplateData) => {
      const { data: result, error } = await supabase
        .from('custom_templates')
        .insert({
          store_id: data.storeId,
          name: data.name,
          description: data.description || null,
          thumbnail: data.thumbnail || '🎨',
          global_styles: data.globalStyles as any,
          section_ids: data.sectionIds,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['custom-templates', variables.storeId] });
      toast({
        title: "Plantilla guardada",
        description: "Tu plantilla personalizada ha sido guardada exitosamente.",
      });
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la plantilla. Intenta de nuevo.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteCustomTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ templateId, storeId }: { templateId: string; storeId: string }) => {
      const { error } = await supabase
        .from('custom_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      return { templateId, storeId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['custom-templates', variables.storeId] });
      toast({
        title: "Plantilla eliminada",
        description: "La plantilla ha sido eliminada.",
      });
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la plantilla.",
        variant: "destructive",
      });
    },
  });
};
