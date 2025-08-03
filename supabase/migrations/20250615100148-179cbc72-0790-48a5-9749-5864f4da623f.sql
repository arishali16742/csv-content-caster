
-- This ensures Row Level Security is active on the cart table.
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

-- This new policy allows anyone identified as an 'admin' to view all items in the cart.
CREATE POLICY "Admins can view all cart items"
ON public.cart
FOR SELECT
TO authenticated
USING (public.is_user_admin(auth.jwt() ->> 'email'));

-- This new policy allows 'admin' users to update any item in the cart, for example, to apply a discount.
CREATE POLICY "Admins can update all cart items"
ON public.cart
FOR UPDATE
TO authenticated
USING (public.is_user_admin(auth.jwt() ->> 'email'));
