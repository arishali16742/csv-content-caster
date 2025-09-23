-- Fix the create_admin_notification function to handle missing sender_type field
CREATE OR REPLACE FUNCTION public.create_admin_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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

  -- Create notification for new messages from customers (only for conversations table)
  IF TG_TABLE_NAME = 'conversations' AND TG_OP = 'INSERT' THEN
    -- Only check sender_type if we're in the conversations table
    IF NEW.sender_type = 'customer' THEN
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
  END IF;

  RETURN NEW;
END;
$function$