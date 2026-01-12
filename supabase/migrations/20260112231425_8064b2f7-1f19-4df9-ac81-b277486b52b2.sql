-- Create storage bucket for store assets (logos and banners)
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-assets', 'store-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view store assets
CREATE POLICY "Anyone can view store assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-assets');

-- Store owners can upload their store assets
CREATE POLICY "Store owners can upload store assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'store-assets'
  AND auth.uid() IS NOT NULL
);

-- Store owners can update their store assets
CREATE POLICY "Store owners can update store assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'store-assets'
  AND auth.uid() IS NOT NULL
);

-- Store owners can delete their store assets
CREATE POLICY "Store owners can delete store assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'store-assets'
  AND auth.uid() IS NOT NULL
);