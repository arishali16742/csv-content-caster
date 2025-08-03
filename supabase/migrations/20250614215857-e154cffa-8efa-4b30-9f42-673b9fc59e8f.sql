
-- Create table for Image Layout1 destinations
CREATE TABLE public.image_layout1_destinations (
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

-- Create table for Image Layout2 destinations
CREATE TABLE public.image_layout2_destinations (
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

-- Create table for Image Layout3 destinations
CREATE TABLE public.image_layout3_destinations (
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

-- Create table for Image Layout4 destinations
CREATE TABLE public.image_layout4_destinations (
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

-- Add new sections to homepage_sections table
INSERT INTO public.homepage_sections (section_key, display_name, position, is_visible) VALUES
('image-layout1', 'IMAGE LAYOUT1', 25, true),
('image-layout2', 'IMAGE LAYOUT2', 26, true),
('image-layout3', 'IMAGE LAYOUT3', 27, true),
('image-layout4', 'IMAGE LAYOUT4', 28, true);
