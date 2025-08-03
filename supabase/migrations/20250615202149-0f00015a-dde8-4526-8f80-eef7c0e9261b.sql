
-- Add duration column to trending_destinations
ALTER TABLE public.trending_destinations ADD COLUMN duration TEXT;

-- Add duration column to popular_destinations
ALTER TABLE public.popular_destinations ADD COLUMN duration TEXT;

-- Add duration column to hot_destinations
ALTER TABLE public.hot_destinations ADD COLUMN duration TEXT;
