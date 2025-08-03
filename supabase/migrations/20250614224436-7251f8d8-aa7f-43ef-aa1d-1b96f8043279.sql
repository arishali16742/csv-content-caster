
-- Add subtitle column to homepage_sections table
ALTER TABLE public.homepage_sections 
ADD COLUMN subtitle text;

-- Update existing records with default subtitles
UPDATE public.homepage_sections 
SET subtitle = CASE 
  WHEN section_key = 'benefits' THEN 'Why Choose TravelGenZ?'
  WHEN section_key = 'counter' THEN 'Our Achievements'
  WHEN section_key = 'explore' THEN 'Where will your next adventure take you? Discover amazing places waiting to be explored!'
  WHEN section_key = 'unique-experiences' THEN 'Discover amazing destinations in the unique experiences collection'
  WHEN section_key = 'middle-east' THEN 'Discover amazing destinations in the Middle East collection'
  WHEN section_key = 'oceania' THEN 'Discover amazing destinations in the Oceania collection'
  WHEN section_key = 'dubs' THEN 'Discover amazing destinations in the DUBS collection'
  WHEN section_key = 'dub' THEN 'Discover amazing destinations in the DUB collection'
  WHEN section_key = 'dubsss' THEN 'Discover amazing destinations in the DUBSSS collection'
  WHEN section_key = 'dubs2' THEN 'Discover amazing destinations in the DUBS collection'
  WHEN section_key = 'united-states' THEN 'Discover amazing destinations in the United States collection'
  WHEN section_key = 'south-east-asian' THEN 'Discover amazing destinations in the South East Asian collection'
  WHEN section_key = 'scandinavia' THEN 'Discover amazing destinations in the Scandinavia collection'
  WHEN section_key = 'visa-free' THEN 'Travel without visa hassles to these amazing destinations'
  WHEN section_key = 'budget-friendly' THEN 'Amazing destinations that won''t break the bank'
  WHEN section_key = 'image-layout1' THEN 'Discover these amazing destinations'
  WHEN section_key = 'image-layout2' THEN 'Explore these beautiful locations'
  WHEN section_key = 'image-layout3' THEN 'Adventure awaits at these destinations'
  WHEN section_key = 'image-layout4' THEN 'Dream destinations for your next trip'
  WHEN section_key = 'trending' THEN 'The hottest travel destinations right now'
  WHEN section_key = 'popular' THEN 'Most loved destinations by travelers'
  WHEN section_key = 'hot' THEN 'Trending destinations everyone is talking about'
  WHEN section_key = 'visa' THEN 'Get your visa processed quickly and easily'
  WHEN section_key = 'trip-comparison' THEN 'Find the best deals and save money'
  WHEN section_key = 'ai-trip-planner' THEN 'Get personalized itineraries created just for you'
  WHEN section_key = 'travel-inspiration' THEN 'Get inspired for your next adventure'
  WHEN section_key = 'discount-wheel' THEN 'Spin to win amazing discounts on your trip'
  WHEN section_key = 'smart-tools' THEN 'Use our AI-powered tools to plan your perfect trip and compare prices'
  ELSE 'Discover amazing travel experiences'
END;
