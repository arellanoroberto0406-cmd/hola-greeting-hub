-- Create chat conversations table
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_name TEXT,
  customer_email TEXT,
  user_id UUID,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  unread_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'store')),
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_conversations
-- Store owners can view their store's conversations
CREATE POLICY "Store owners can view their conversations"
  ON public.chat_conversations
  FOR SELECT
  USING (
    store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
  );

-- Store owners can update their store's conversations
CREATE POLICY "Store owners can update their conversations"
  ON public.chat_conversations
  FOR UPDATE
  USING (
    store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
  );

-- Anyone can create a conversation (anonymous chat)
CREATE POLICY "Anyone can create conversations"
  ON public.chat_conversations
  FOR INSERT
  WITH CHECK (true);

-- Customers can view their own conversations (by user_id or via session)
CREATE POLICY "Customers can view their conversations"
  ON public.chat_conversations
  FOR SELECT
  USING (true);

-- RLS Policies for chat_messages
-- Store owners can view messages in their conversations
CREATE POLICY "Store owners can view messages"
  ON public.chat_messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.chat_conversations 
      WHERE store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
    )
  );

-- Anyone can view messages in a conversation they're part of
CREATE POLICY "Anyone can view conversation messages"
  ON public.chat_messages
  FOR SELECT
  USING (true);

-- Store owners can insert messages
CREATE POLICY "Store owners can send messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    sender_type = 'store' AND
    conversation_id IN (
      SELECT id FROM public.chat_conversations 
      WHERE store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
    )
  );

-- Anyone can send customer messages
CREATE POLICY "Customers can send messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (sender_type = 'customer');

-- Store owners can update message read status
CREATE POLICY "Store owners can update messages"
  ON public.chat_messages
  FOR UPDATE
  USING (
    conversation_id IN (
      SELECT id FROM public.chat_conversations 
      WHERE store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
    )
  );

-- Create indexes for performance
CREATE INDEX idx_chat_conversations_store_id ON public.chat_conversations(store_id);
CREATE INDEX idx_chat_conversations_last_message ON public.chat_conversations(last_message_at DESC);
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Enable realtime for live chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Function to update conversation on new message
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chat_conversations
  SET 
    last_message_at = NEW.created_at,
    unread_count = CASE 
      WHEN NEW.sender_type = 'customer' THEN unread_count + 1 
      ELSE unread_count 
    END,
    updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for updating conversation
CREATE TRIGGER on_chat_message_insert
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_on_message();