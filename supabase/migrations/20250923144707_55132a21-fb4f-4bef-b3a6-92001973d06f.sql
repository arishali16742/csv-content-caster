-- Add read tracking to conversations table
ALTER TABLE public.conversations 
ADD COLUMN read_by_admin BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN read_by_customer BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance on read status queries
CREATE INDEX idx_conversations_read_status ON public.conversations(cart_item_id, read_by_admin, read_by_customer);

-- Create function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(
  p_cart_item_id UUID,
  p_reader_type TEXT
) 
RETURNS VOID AS $$
BEGIN
  IF p_reader_type = 'admin' THEN
    UPDATE public.conversations 
    SET read_by_admin = true, read_at = now()
    WHERE cart_item_id = p_cart_item_id 
    AND sender_type = 'customer'
    AND read_by_admin = false;
  ELSIF p_reader_type = 'customer' THEN
    UPDATE public.conversations 
    SET read_by_customer = true, read_at = now()
    WHERE cart_item_id = p_cart_item_id 
    AND sender_type = 'admin'
    AND read_by_customer = false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policy for the new function
CREATE POLICY "Users can mark their own messages as read"
ON public.conversations
FOR UPDATE
USING (
  (auth.uid() IN (SELECT user_id FROM cart WHERE id = conversations.cart_item_id))
  OR 
  is_user_admin((auth.jwt() ->> 'email'))
);

-- Create notification tracking table for admin
CREATE TABLE public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_type TEXT NOT NULL, -- 'new_booking', 'new_cart', 'new_message'
  cart_item_id UUID REFERENCES public.cart(id) ON DELETE CASCADE,
  user_email TEXT,
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_notifications
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view all notifications
CREATE POLICY "Admins can view all notifications"
ON public.admin_notifications
FOR ALL
USING (is_user_admin((auth.jwt() ->> 'email')))
WITH CHECK (is_user_admin((auth.jwt() ->> 'email')));

-- Function to create admin notifications
CREATE OR REPLACE FUNCTION create_admin_notification()
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

-- Create triggers for admin notifications
CREATE TRIGGER trigger_admin_notification_cart
  AFTER INSERT ON public.cart
  FOR EACH ROW
  EXECUTE FUNCTION create_admin_notification();

CREATE TRIGGER trigger_admin_notification_message
  AFTER INSERT ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION create_admin_notification();

-- Enable realtime for admin_notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;