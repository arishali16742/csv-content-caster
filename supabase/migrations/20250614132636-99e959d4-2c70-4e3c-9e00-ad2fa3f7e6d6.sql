
-- Create the partners table
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access (since this is for displaying partner logos)
CREATE POLICY "Allow public read access to partners" 
  ON public.partners 
  FOR SELECT 
  TO public
  USING (true);

-- Create policy for authenticated users to manage partners (admin functionality)
CREATE POLICY "Allow authenticated users to manage partners" 
  ON public.partners 
  FOR ALL 
  TO authenticated
  USING (true);
