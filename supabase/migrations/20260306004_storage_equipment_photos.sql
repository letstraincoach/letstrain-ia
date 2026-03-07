-- ============================================================
-- Migration: Storage bucket for equipment photos
-- Creates public bucket + RLS policies for authenticated uploads
-- ============================================================

-- Create bucket (public — Claude API needs to fetch images via URL)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'equipment-photos',
  'equipment-photos',
  true,
  10485760,  -- 10 MB per file
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

-- Public read (required so Claude API can access image URLs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'equipment photos public read'
  ) THEN
    CREATE POLICY "equipment photos public read"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'equipment-photos');
  END IF;

  -- Authenticated upload — only to user's own folder
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'equipment photos auth upload'
  ) THEN
    CREATE POLICY "equipment photos auth upload"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'equipment-photos'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  -- Authenticated delete — only own files
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'equipment photos auth delete'
  ) THEN
    CREATE POLICY "equipment photos auth delete"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'equipment-photos'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END
$$;
