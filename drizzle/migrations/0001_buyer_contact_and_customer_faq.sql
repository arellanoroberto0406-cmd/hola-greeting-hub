CREATE TABLE public.store_buyer_contacts (
 store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
 user_id uuid NOT NULL,
 full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 120),
 email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
 phone text NOT NULL DEFAULT '' CHECK (char_length(phone) <= 30),
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (store_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_buyer_contacts TO authenticated;
GRANT ALL ON public.store_buyer_contacts TO service_role;
REVOKE ALL ON public.store_buyer_contacts FROM anon;
ALTER TABLE public.store_buyer_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY buyer_contact_read ON public.store_buyer_contacts FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_store_owner(auth.uid(), store_id));
CREATE POLICY buyer_contact_insert ON public.store_buyer_contacts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND is_active));
CREATE POLICY buyer_contact_update ON public.store_buyer_contacts FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY buyer_contact_delete ON public.store_buyer_contacts FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE TABLE public.store_customer_faqs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
 question text NOT NULL CHECK (char_length(question) BETWEEN 1 AND 200),
 answer text NOT NULL CHECK (char_length(answer) BETWEEN 1 AND 2000),
 sort_order integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.store_customer_faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_customer_faqs TO authenticated;
GRANT ALL ON public.store_customer_faqs TO service_role;
ALTER TABLE public.store_customer_faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY customer_faq_read ON public.store_customer_faqs FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND is_active) OR public.is_store_owner(auth.uid(), store_id));
CREATE POLICY customer_faq_insert ON public.store_customer_faqs FOR INSERT TO authenticated WITH CHECK (public.is_store_owner(auth.uid(), store_id));
CREATE POLICY customer_faq_update ON public.store_customer_faqs FOR UPDATE TO authenticated USING (public.is_store_owner(auth.uid(), store_id)) WITH CHECK (public.is_store_owner(auth.uid(), store_id));
CREATE POLICY customer_faq_delete ON public.store_customer_faqs FOR DELETE TO authenticated USING (public.is_store_owner(auth.uid(), store_id));
CREATE INDEX store_customer_faqs_order ON public.store_customer_faqs(store_id, sort_order);