-- Create the "assets" storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to all files in the assets bucket
CREATE POLICY "Public read access on assets bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'assets');
