-- Create refund audit log table
CREATE TABLE public.refund_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  performed_by UUID NOT NULL,
  performed_by_email TEXT,
  amount NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  mp_refund_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.refund_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Store owners can view their refund logs
CREATE POLICY "Store owners can view refund logs"
  ON public.refund_audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = refund_audit_logs.store_id
      AND stores.owner_id = auth.uid()
    )
  );

-- Create index for faster queries
CREATE INDEX idx_refund_audit_logs_store_id ON public.refund_audit_logs(store_id);
CREATE INDEX idx_refund_audit_logs_order_id ON public.refund_audit_logs(order_id);
CREATE INDEX idx_refund_audit_logs_created_at ON public.refund_audit_logs(created_at DESC);