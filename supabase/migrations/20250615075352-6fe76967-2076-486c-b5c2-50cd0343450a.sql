
-- Add new columns to cart table to store complete package configuration
ALTER TABLE public.cart 
ADD COLUMN IF NOT EXISTS members INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS with_flights BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS selected_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create or replace function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_cart_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at when cart is modified
DROP TRIGGER IF EXISTS cart_updated_at_trigger ON public.cart;
CREATE TRIGGER cart_updated_at_trigger
    BEFORE UPDATE ON public.cart
    FOR EACH ROW
    EXECUTE FUNCTION update_cart_updated_at();
