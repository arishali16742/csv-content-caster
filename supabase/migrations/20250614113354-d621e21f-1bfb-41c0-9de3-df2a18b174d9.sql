
-- Create visa_rates table for managing visa costs
CREATE TABLE public.visa_rates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  origin_country text NOT NULL,
  destination_country text NOT NULL,
  price_15_days integer NOT NULL DEFAULT 0,
  price_30_days integer NOT NULL DEFAULT 0,
  price_yearly integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(origin_country, destination_country)
);

-- Enable RLS on visa_rates table
ALTER TABLE public.visa_rates ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading visa rates for everyone
CREATE POLICY "Anyone can read visa rates" 
ON public.visa_rates 
FOR SELECT 
USING (true);

-- Create policy to allow authenticated users to manage visa rates
CREATE POLICY "Authenticated users can manage visa rates" 
ON public.visa_rates 
FOR ALL 
TO authenticated 
USING (true);

-- Insert some sample data
INSERT INTO public.visa_rates (origin_country, destination_country, price_15_days, price_30_days, price_yearly) VALUES
('India', 'Afghanistan', 4000, 7000, 20000),
('India', 'Albania', 3500, 6000, 18000),
('India', 'United States', 8000, 15000, 45000),
('India', 'United Kingdom', 7500, 14000, 40000),
('India', 'Canada', 7000, 13000, 38000),
('India', 'Australia', 6500, 12000, 35000),
('India', 'Germany', 5500, 10000, 30000),
('India', 'France', 5500, 10000, 30000),
('India', 'Japan', 6000, 11000, 32000),
('India', 'Singapore', 4500, 8000, 25000);
