
-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create a new policy that doesn't cause recursion
CREATE POLICY "Enable read access for authenticated users" ON public.user_roles
FOR SELECT USING (true);

-- Also ensure the table has the correct RLS setup
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
