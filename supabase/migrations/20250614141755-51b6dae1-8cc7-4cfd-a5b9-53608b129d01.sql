
-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can manage login popup settings" ON public.login_popup_settings;

-- Update the admin check policy to use the existing security definer function
CREATE POLICY "Admins can manage login popup settings" 
  ON public.login_popup_settings 
  FOR ALL 
  USING (
    public.is_user_admin(auth.jwt() ->> 'email')
  );
