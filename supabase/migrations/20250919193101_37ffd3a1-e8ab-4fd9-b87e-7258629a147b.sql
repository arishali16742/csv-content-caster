-- Add package_id column to videos table to tag videos to specific packages
ALTER TABLE public.videos 
ADD COLUMN package_id uuid REFERENCES public.packages(id);