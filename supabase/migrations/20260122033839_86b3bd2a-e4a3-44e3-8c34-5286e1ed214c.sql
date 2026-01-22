-- 1) Tighten overly-permissive INSERT policies

-- newsletter_subscribers: allow public subscribe only for active stores
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscribers
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.stores s
    WHERE s.id = newsletter_subscribers.store_id
      AND s.is_active = true
  )
);

-- chat_conversations: allow creating conversations only for active stores
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.chat_conversations;
CREATE POLICY "Anyone can create conversations"
ON public.chat_conversations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.stores s
    WHERE s.id = chat_conversations.store_id
      AND s.is_active = true
  )
);
