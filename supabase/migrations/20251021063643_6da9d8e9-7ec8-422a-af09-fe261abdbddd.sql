-- Create IATA codes table for flight search mapping
CREATE TABLE IF NOT EXISTS public.iata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destinations text NOT NULL UNIQUE,
  country text NOT NULL,
  iata text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.iata ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (anyone can search for IATA codes)
CREATE POLICY "Allow public read access to iata"
  ON public.iata
  FOR SELECT
  TO public
  USING (true);

-- Create policy for authenticated users to insert/update
CREATE POLICY "Allow authenticated users to manage iata"
  ON public.iata
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for faster lookups
CREATE INDEX idx_iata_destinations ON public.iata(destinations);
CREATE INDEX idx_iata_iata ON public.iata(iata);

-- Insert initial sample data
INSERT INTO public.iata (destinations, country, iata) VALUES
('Ravello;Amalfi;Positano', 'Italy', 'NAP'),
('Positano;Ravello;Amalfi', 'Italy', 'NAP'),
('Ravello;Positano;Amalfi', 'Italy', 'NAP'),
('Buenos Aires;Recoleta', 'Argentina', 'EZE'),
('Buenos Aires;Palermo', 'Argentina', 'EZE'),
('Delhi', 'India', 'DEL'),
('Mumbai', 'India', 'BOM')
ON CONFLICT (destinations) DO NOTHING;