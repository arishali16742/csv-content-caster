
-- Create storage bucket for package images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'package-images',
  'package-images',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Create storage policies for package images bucket
CREATE POLICY "Allow public uploads to package-images bucket" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'package-images');

CREATE POLICY "Allow public access to package-images bucket" ON storage.objects
FOR SELECT USING (bucket_id = 'package-images');

CREATE POLICY "Allow public updates to package-images bucket" ON storage.objects
FOR UPDATE USING (bucket_id = 'package-images');

CREATE POLICY "Allow public deletes from package-images bucket" ON storage.objects
FOR DELETE USING (bucket_id = 'package-images');

-- Add gallery_images column to packages table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'packages' AND column_name = 'gallery_images') THEN
    ALTER TABLE packages ADD COLUMN gallery_images text[] DEFAULT ARRAY[]::text[];
  END IF;
END $$;
