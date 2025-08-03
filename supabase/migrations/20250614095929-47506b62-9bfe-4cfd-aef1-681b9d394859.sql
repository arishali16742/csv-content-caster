
-- Add image column to explore_destinations table
ALTER TABLE explore_destinations 
ADD COLUMN image TEXT;

-- Update the table to have some default placeholder images for existing entries
UPDATE explore_destinations 
SET image = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop&crop=center'
WHERE image IS NULL;
