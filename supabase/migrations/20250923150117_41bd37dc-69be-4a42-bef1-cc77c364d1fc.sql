-- Fix the admin notification trigger to remove sender_type check for cart table
DROP TRIGGER IF EXISTS trigger_admin_notification_cart ON public.cart;
DROP TRIGGER IF EXISTS trigger_admin_notification_message ON public.conversations;

-- Create updated function without sender_type reference for cart table
CREATE OR REPLACE FUNCTION public.create_admin_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for new cart items
  IF TG_TABLE_NAME = 'cart' AND TG_OP = 'INSERT' THEN
    INSERT INTO public.admin_notifications (
      notification_type,
      cart_item_id,
      user_email,
      message
    ) VALUES (
      CASE 
        WHEN NEW.booking_type = 'booking' THEN 'new_booking'
        ELSE 'new_cart'
      END,
      NEW.id,
      (SELECT email FROM public.profiles WHERE id = NEW.user_id),
      CASE 
        WHEN NEW.booking_type = 'booking' THEN 'New booking received'
        ELSE 'New item added to cart'
      END
    );
  END IF;

  -- Create notification for new messages from customers
  IF TG_TABLE_NAME = 'conversations' AND TG_OP = 'INSERT' AND NEW.sender_type = 'customer' THEN
    INSERT INTO public.admin_notifications (
      notification_type,
      cart_item_id,
      user_email,
      message
    ) VALUES (
      'new_message',
      NEW.cart_item_id,
      (SELECT p.email FROM public.profiles p 
       JOIN public.cart c ON p.id = c.user_id 
       WHERE c.id = NEW.cart_item_id),
      'New message from customer'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;