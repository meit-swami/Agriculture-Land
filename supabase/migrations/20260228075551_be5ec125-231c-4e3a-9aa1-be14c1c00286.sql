
-- Create a SECURITY DEFINER function to insert bucket
CREATE OR REPLACE FUNCTION public.ensure_property_media_bucket()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  INSERT INTO storage.buckets (id, name)
  VALUES ('property-media', 'property-media')
  ON CONFLICT (id) DO NOTHING;
$$;
