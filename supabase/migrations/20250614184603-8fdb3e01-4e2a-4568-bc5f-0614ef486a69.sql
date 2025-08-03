
-- Add new columns to the blog table for additional images, price, and itinerary
ALTER TABLE public.blog 
ADD COLUMN additional_images text[] DEFAULT ARRAY[]::text[],
ADD COLUMN price text,
ADD COLUMN itinerary text;
