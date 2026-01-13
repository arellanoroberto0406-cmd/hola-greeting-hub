import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoreLayout, StoreSection, DEFAULT_SECTIONS } from "@/types/storeLayout";
import { useToast } from "@/hooks/use-toast";

export const useStoreLayout = (storeId: string | undefined) => {
  return useQuery({
    queryKey: ["store-layout", storeId],
    queryFn: async () => {
      if (!storeId) return null;
      
      const { data, error } = await supabase
        .from("store_layouts")
        .select("*")
        .eq("store_id", storeId)
        .maybeSingle();

      if (error) throw error;
      
      // If no layout exists, return default
      if (!data) {
        return {
          id: '',
          store_id: storeId,
          sections: DEFAULT_SECTIONS,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as StoreLayout;
      }
      
      return {
        ...data,
        sections: (data.sections as unknown as StoreSection[]) || DEFAULT_SECTIONS
      } as StoreLayout;
    },
    enabled: !!storeId,
  });
};

export const useSaveStoreLayout = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ storeId, sections }: { storeId: string; sections: StoreSection[] }) => {
      // Convert sections to JSON-compatible format
      const sectionsJson = JSON.parse(JSON.stringify(sections));
      
      // Try to update first
      const { data: existing } = await supabase
        .from("store_layouts")
        .select("id")
        .eq("store_id", storeId)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from("store_layouts")
          .update({ sections: sectionsJson })
          .eq("store_id", storeId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("store_layouts")
          .insert([{ store_id: storeId, sections: sectionsJson }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["store-layout", variables.storeId] });
      toast({
        title: "Diseño guardado",
        description: "Los cambios en tu tienda han sido guardados.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: error.message,
      });
    },
  });
};
