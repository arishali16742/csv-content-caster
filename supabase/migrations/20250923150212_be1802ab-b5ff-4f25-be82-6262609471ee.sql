-- Re-create triggers for admin notifications
CREATE TRIGGER trigger_admin_notification_cart
  AFTER INSERT ON public.cart
  FOR EACH ROW
  EXECUTE FUNCTION public.create_admin_notification();

CREATE TRIGGER trigger_admin_notification_message
  AFTER INSERT ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.create_admin_notification();