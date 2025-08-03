
-- Add author_image column to the blog table
ALTER TABLE public.blog 
ADD COLUMN IF NOT EXISTS author_image text;
