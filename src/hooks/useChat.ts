import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export interface ChatConversation {
  id: string;
  store_id: string;
  customer_name: string | null;
  customer_email: string | null;
  user_id: string | null;
  status: 'active' | 'closed' | 'archived';
  last_message_at: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_type: 'customer' | 'store';
  message: string;
  is_read: boolean;
  created_at: string;
}

// Hook for store owners to get all conversations
export function useStoreConversations(storeId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["chat-conversations", storeId],
    queryFn: async () => {
      if (!storeId) return [];
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("*")
        .eq("store_id", storeId)
        .order("last_message_at", { ascending: false });
      
      if (error) throw error;
      return data as ChatConversation[];
    },
    enabled: !!storeId,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!storeId) return;

    const channel = supabase
      .channel(`conversations-${storeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_conversations',
          filter: `store_id=eq.${storeId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["chat-conversations", storeId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storeId, queryClient]);

  return query;
}

// Hook to get messages for a conversation
export function useConversationMessages(conversationId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["chat-messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!conversationId,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["chat-messages", conversationId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  return query;
}

// Hook to send a message
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      message, 
      senderType 
    }: { 
      conversationId: string; 
      message: string; 
      senderType: 'customer' | 'store';
    }) => {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          conversation_id: conversationId,
          message,
          sender_type: senderType,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", variables.conversationId] });
    },
  });
}

// Hook to create or get existing conversation for a customer
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      storeId, 
      customerName, 
      customerEmail,
      userId 
    }: { 
      storeId: string; 
      customerName?: string; 
      customerEmail?: string;
      userId?: string;
    }) => {
      const { data, error } = await supabase
        .from("chat_conversations")
        .insert({
          store_id: storeId,
          customer_name: customerName || null,
          customer_email: customerEmail || null,
          user_id: userId || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as ChatConversation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversations", data.store_id] });
    },
  });
}

// Hook to mark messages as read
export function useMarkMessagesAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      // Update unread count in conversation
      const { error: convError } = await supabase
        .from("chat_conversations")
        .update({ unread_count: 0 })
        .eq("id", conversationId);
      
      if (convError) throw convError;

      // Mark messages as read
      const { error: msgError } = await supabase
        .from("chat_messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .eq("sender_type", "customer")
        .eq("is_read", false);
      
      if (msgError) throw msgError;
    },
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
    },
  });
}

// Hook to close a conversation
export function useCloseConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from("chat_conversations")
        .update({ status: 'closed' })
        .eq("id", conversationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
    },
  });
}

// Hook to get total unread count for a store
export function useUnreadCount(storeId: string | undefined) {
  return useQuery({
    queryKey: ["chat-unread-count", storeId],
    queryFn: async () => {
      if (!storeId) return 0;
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("unread_count")
        .eq("store_id", storeId)
        .eq("status", "active");
      
      if (error) throw error;
      return data?.reduce((acc, conv) => acc + (conv.unread_count || 0), 0) || 0;
    },
    enabled: !!storeId,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}
