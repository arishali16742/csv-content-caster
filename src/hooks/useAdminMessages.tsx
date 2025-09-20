import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useAdminMessages = () => {
  const { user, isAuthenticated } = useAuth();
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkForUnreadMessages = async () => {
    if (!user || !isAuthenticated) {
      setHasUnreadMessages(false);
      return;
    }

    setLoading(true);
    try {
      // Get user's cart items
      const { data: cartItems, error: cartError } = await supabase
        .from('cart')
        .select('id')
        .eq('user_id', user.id);

      if (cartError) {
        console.error('Error fetching cart items:', cartError);
        return;
      }

      if (!cartItems || cartItems.length === 0) {
        setHasUnreadMessages(false);
        return;
      }

      // Check for admin messages in conversations
      const cartItemIds = cartItems.map(item => item.id);
      const { data: adminMessages, error: messagesError } = await supabase
        .from('conversations')
        .select('id')
        .in('cart_item_id', cartItemIds)
        .eq('sender_type', 'admin');

      if (messagesError) {
        console.error('Error checking admin messages:', messagesError);
        return;
      }

      setHasUnreadMessages(adminMessages && adminMessages.length > 0);
    } catch (error) {
      console.error('Error in checkForUnreadMessages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkForUnreadMessages();
  }, [user, isAuthenticated]);

  // Set up real-time subscription for new admin messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('admin_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
        },
        (payload: any) => {
          // Check if it's an admin message for this user's cart items
          if (payload.new?.sender_type === 'admin') {
            checkForUnreadMessages();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    hasUnreadMessages,
    loading,
    refreshMessages: checkForUnreadMessages,
  };
};