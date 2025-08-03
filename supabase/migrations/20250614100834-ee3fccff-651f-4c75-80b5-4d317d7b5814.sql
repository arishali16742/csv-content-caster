
-- Create unique_experiences table similar to explore_destinations
CREATE TABLE public.unique_experiences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  image TEXT,
  position INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add some sample data
INSERT INTO public.unique_experiences (name, emoji, image, position) VALUES
('Australia', '🇦🇺', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop&crop=center', 1),
('New Zealand', '🇳🇿', 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=200&h=200&fit=crop&crop=center', 2),
('Singapore', '🇸🇬', 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&h=200&fit=crop&crop=center', 3),
('Vietnam', '🇻🇳', 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=200&h=200&fit=crop&crop=center', 4),
('Sri Lanka', '🇱🇰', 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=200&h=200&fit=crop&crop=center', 5);
