ALTER TABLE public.listings ADD COLUMN images text[] NOT NULL DEFAULT '{}';
CREATE POLICY "Listing images readable" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'listing-images');
CREATE POLICY "Owners upload listing images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'listing-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owners delete listing images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'listing-images' AND (storage.foldername(name))[1] = auth.uid()::text);