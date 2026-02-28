
-- Allow authenticated users to upload to property-media bucket
CREATE POLICY "auth_upload_property_media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-media');

-- Allow public read
CREATE POLICY "public_read_property_media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-media');

-- Allow users to delete own files
CREATE POLICY "auth_delete_own_property_media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-media' AND owner = auth.uid());
