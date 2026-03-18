
-- Create chat-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload chat images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'chat-images');

-- Allow public read access
CREATE POLICY "Public read access for chat images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'chat-images');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own chat images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'chat-images' AND (storage.foldername(name))[1] = auth.uid()::text);
