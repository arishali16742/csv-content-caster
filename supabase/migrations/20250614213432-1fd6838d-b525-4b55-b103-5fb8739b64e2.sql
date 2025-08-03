
-- Create wheel_offers table for storing discount wheel offers
CREATE TABLE public.wheel_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  discount TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#8B5CF6',
  active BOOLEAN NOT NULL DEFAULT true,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_coupons table for storing generated coupons
CREATE TABLE public.user_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_code TEXT NOT NULL UNIQUE,
  offer_title TEXT NOT NULL,
  discount TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert some default wheel offers
INSERT INTO public.wheel_offers (title, discount, color, position, active) VALUES
('Flight Discount', '15% OFF', '#8B5CF6', 0, true),
('Hotel Savings', '20% OFF', '#EC4899', 1, true),
('Package Deal', '10% OFF', '#10B981', 2, true),
('Weekend Special', '25% OFF', '#F59E0B', 3, true),
('Early Bird', '12% OFF', '#EF4444', 4, true),
('Last Minute', '30% OFF', '#3B82F6', 5, true);
