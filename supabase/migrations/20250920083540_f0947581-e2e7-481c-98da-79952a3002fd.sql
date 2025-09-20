-- Create conversations table to store all messages
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_item_id UUID NOT NULL,
  message TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'admin')),
  sender_name TEXT,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for conversations
CREATE POLICY "Users can view conversations for their cart items"
ON public.conversations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cart 
    WHERE cart.id = conversations.cart_item_id 
    AND cart.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages for their cart items"
ON public.conversations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cart 
    WHERE cart.id = conversations.cart_item_id 
    AND cart.user_id = auth.uid()
  )
  AND sender_type = 'customer'
);

CREATE POLICY "Admins can view all conversations"
ON public.conversations
FOR SELECT
USING (is_user_admin((auth.jwt() ->> 'email'::text)));

CREATE POLICY "Admins can insert admin messages"
ON public.conversations
FOR INSERT
WITH CHECK (
  is_user_admin((auth.jwt() ->> 'email'::text))
  AND sender_type = 'admin'
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_conversations_updated_at();

-- Create index for better performance
CREATE INDEX idx_conversations_cart_item_id ON public.conversations(cart_item_id);
CREATE INDEX idx_conversations_created_at ON public.conversations(created_at DESC);