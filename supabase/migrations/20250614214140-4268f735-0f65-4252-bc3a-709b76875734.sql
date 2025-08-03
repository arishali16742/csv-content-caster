
-- Create homepage_sections table for managing homepage section visibility and order
CREATE TABLE public.homepage_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert all the homepage sections with their default names and positions
INSERT INTO public.homepage_sections (section_key, display_name, position, is_visible) VALUES
('benefits', 'Why Choose TravelGenZ?', 1, true),
('counter', 'Our Achievements', 2, true),
('explore', 'Explore Dream Destinations ✈️', 3, true),
('unique-experiences', 'FOR UNIQUE EXPERIENCES', 4, true),
('middle-east', 'EXPLORE MIDDLE EAST', 5, true),
('oceania', 'EXPLORE OCEANIA', 6, true),
('united-states', 'EXPLORE UNITED STATES', 7, true),
('south-east-asian', 'EXPLORE SOUTH EAST ASIAN VACATIONS', 8, true),
('scandinavia', 'EXPLORE SCANDINAVIA', 9, true),
('visa-free', 'VISA FREE DESTINATIONS', 10, true),
('budget-friendly', 'BUDGET FRIENDLY DESTINATIONS', 11, true),
('trending', 'Trending Destinations', 12, true),
('popular', 'Popular Destinations', 13, true),
('hot', 'Hot Happening Destinations', 14, true),
('visa', 'Visa Information', 15, true),
('trip-comparison', 'Compare & Save', 16, true),
('ai-trip-planner', 'Let Human Plan Your Perfect Trip', 17, true),
('travel-inspiration', 'Travel Inspiration', 18, true),
('discount-wheel', 'Spin the Wheel', 19, true),
('smart-tools', 'Smart Travel Tools', 20, true);
