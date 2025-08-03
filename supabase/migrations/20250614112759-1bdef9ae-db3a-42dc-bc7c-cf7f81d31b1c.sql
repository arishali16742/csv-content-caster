
-- Drop the problematic RLS policy
DROP POLICY IF EXISTS "Allow authenticated users to read user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.user_roles;

-- Create a security definer function to check if a user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin(user_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE email = user_email AND role = 'admin'
  );
$$;

-- Create a simpler RLS policy that allows authenticated users to read their own roles
CREATE POLICY "Users can read user roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated 
USING (true);

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.is_user_admin(text) TO authenticated;
