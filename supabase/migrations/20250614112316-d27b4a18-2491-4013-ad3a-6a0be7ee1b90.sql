
-- First, let's check the current structure and add a unique constraint
ALTER TABLE public.user_roles ADD CONSTRAINT unique_email_role UNIQUE (email, role);

-- Now insert your admin role
INSERT INTO public.user_roles (email, role, user_id) 
VALUES ('arishali1674@gmail.com', 'admin', null)
ON CONFLICT (email, role) DO NOTHING;

-- Add some discount values to unique experiences to test the fire emoji
UPDATE public.unique_experiences 
SET discount = '25% OFF' 
WHERE name = 'Australia';

UPDATE public.unique_experiences 
SET discount = '30% OFF' 
WHERE name = 'Singapore';

-- Ensure we have a clean RLS policy
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to read user roles" ON public.user_roles;

CREATE POLICY "Allow authenticated users to read user roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated 
USING (true);
