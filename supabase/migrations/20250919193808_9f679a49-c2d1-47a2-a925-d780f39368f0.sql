-- Add comments column to cart table for user comments
ALTER TABLE public.cart 
ADD COLUMN comments text;