
-- Create table for DUBS destinations
CREATE TABLE public.dubs_destinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_line TEXT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  image TEXT NULL,
  discount TEXT NULL,
  status TEXT DEFAULT 'published',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for DUB destinations
CREATE TABLE public.dub_destinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_line TEXT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  image TEXT NULL,
  discount TEXT NULL,
  status TEXT DEFAULT 'published',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for DUBSSS destinations
CREATE TABLE public.dubsss_destinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_line TEXT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  image TEXT NULL,
  discount TEXT NULL,
  status TEXT DEFAULT 'published',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for DUBS2 destinations (since we have two "Explore DUBS")
CREATE TABLE public.dubs2_destinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_line TEXT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  image TEXT NULL,
  discount TEXT NULL,
  status TEXT DEFAULT 'published',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new sections to homepage_sections table
INSERT INTO public.homepage_sections (section_key, display_name, position, is_visible) VALUES
('dubs', 'EXPLORE DUBS', 21, true),
('dub', 'EXPLORE DUB', 22, true),
('dubsss', 'EXPLORE DUBSSS', 23, true),
('dubs2', 'EXPLORE DUBS', 24, true);
