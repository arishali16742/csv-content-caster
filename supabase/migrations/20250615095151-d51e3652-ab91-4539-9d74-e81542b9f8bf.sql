
ALTER TABLE public.cart ADD COLUMN price_before_admin_discount NUMERIC;
COMMENT ON COLUMN public.cart.price_before_admin_discount IS 'Stores the total price before an admin discount is applied. If NULL, no admin discount has been applied.';
