
-- Create a new table for booking popup settings
CREATE TABLE public.booking_popup_settings (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    image_url text NOT NULL,
    title text,
    subtitle text,
    is_active boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT booking_popup_settings_pkey PRIMARY KEY (id)
);

-- Add read access policies for the new table
CREATE POLICY "Allow public read access to active booking setting"
  ON public.booking_popup_settings
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage booking popup settings"
  ON public.booking_popup_settings
  FOR ALL
  USING (public.is_user_admin(auth.jwt() ->> 'email'))
  WITH CHECK (public.is_user_admin(auth.jwt() ->> 'email'));

-- Add new columns to the cart table
ALTER TABLE public.cart
ADD COLUMN phone_number text,
ADD COLUMN best_time_to_connect text;
