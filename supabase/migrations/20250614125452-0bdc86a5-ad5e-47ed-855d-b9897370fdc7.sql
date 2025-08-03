
-- Create middle_east_destinations table
CREATE TABLE public.middle_east_destinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_line TEXT,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  image TEXT,
  position INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  discount TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
