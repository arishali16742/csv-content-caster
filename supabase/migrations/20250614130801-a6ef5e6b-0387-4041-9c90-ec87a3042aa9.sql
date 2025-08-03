
-- Create Oceania destinations table
CREATE TABLE public.oceania_destinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_line TEXT,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  image TEXT,
  discount TEXT,
  position INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create United States destinations table
CREATE TABLE public.united_states_destinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_line TEXT,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  image TEXT,
  discount TEXT,
  position INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create South East Asian Vacations destinations table
CREATE TABLE public.south_east_asian_destinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_line TEXT,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  image TEXT,
  discount TEXT,
  position INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Scandinavia destinations table
CREATE TABLE public.scandinavia_destinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_line TEXT,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  image TEXT,
  discount TEXT,
  position INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Budget Friendly destinations table (similar to visa free destinations)
CREATE TABLE public.budget_friendly_destinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_line TEXT NOT NULL,
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  price TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
