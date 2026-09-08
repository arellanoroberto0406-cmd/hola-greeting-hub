import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { STORE_PUBLIC_COLUMNS } from "./storeColumns";

export const useAllStores = () => {
  return useQuery({
    queryKey: ["all-stores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select(STORE_PUBLIC_COLUMNS)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};
