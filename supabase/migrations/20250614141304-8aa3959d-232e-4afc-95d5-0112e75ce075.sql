
-- Create a table for login popup settings
CREATE TABLE public.login_popup_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  discount_text TEXT,
  terms_text TEXT DEFAULT '*T&C Apply',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.login_popup_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can view login popup settings" 
  ON public.login_popup_settings 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage login popup settings" 
  ON public.login_popup_settings 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE email = (auth.jwt() ->> 'email') AND role = 'admin'
    )
  );

-- Insert default data
INSERT INTO public.login_popup_settings (
  image_url,
  title,
  subtitle,
  discount_text,
  terms_text
) VALUES (
  '/lovable-uploads/de6b2442-d97a-487d-91d9-87103bc8b6f4.png',
  'Check-In TO A BREAK',
  'Up to 40% OFF* on Hotels, Homestays & Villas in India for your last-minute summer getaway plan!',
  'Up to 40% OFF*',
  '*T&C Apply'
);
