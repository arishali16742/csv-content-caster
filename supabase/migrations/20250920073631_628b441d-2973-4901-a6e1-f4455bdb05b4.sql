-- Add admin response fields to cart table for admin replies to customer comments
ALTER TABLE public.cart 
ADD COLUMN admin_response text,
ADD COLUMN admin_response_file_url text;