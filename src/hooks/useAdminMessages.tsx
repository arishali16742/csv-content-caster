import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useAdmin } from './useAdmin';

export const useAdminMessages = () => {
  const { user, isAuthenticated } = useAuth();
  const { isAdmin } = useAdmin();
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const checkForUnreadMessages = async () => {
    if (!user || !isAuthenticated) {
      setHasUnreadMessages(false);
      return;
    }

    setLoading(true);
    try {
      if (isAdmin) {
        // Admin users: check for unread customer messages grouped by cart_item_id
        const { data: unreadMessages, error: messagesError } = await supabase
          .from('conversations')
          .select('cart_item_id')
          .eq('sender_type', 'customer')
          .eq('read_by_admin', false);

        if (messagesError) {
          console.error('Error checking customer messages:', messagesError);
          return;
        }

        // Count unique cart_item_ids (individual chats)
        const uniqueChats = new Set(unreadMessages?.map(msg => msg.cart_item_id) || []);
        const chatCount = uniqueChats.size;
        
        setHasUnreadMessages(chatCount > 0);
        setUnreadChatCount(chatCount);
      } else {
        // Regular users: check for unread admin messages
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
          setUnreadChatCount(0);
          return;
        }

        const cartItemIds = cartItems.map(item => item.id);
        const { data: adminMessages, error: messagesError } = await supabase
          .from('conversations')
          .select('cart_item_id')
          .in('cart_item_id', cartItemIds)
          .eq('sender_type', 'admin')
          .eq('read_by_customer', false);

        if (messagesError) {
          console.error('Error checking admin messages:', messagesError);
          return;
        }

        // Count unique cart_item_ids (individual chats)
        const uniqueChats = new Set(adminMessages?.map(msg => msg.cart_item_id) || []);
        const chatCount = uniqueChats.size;
        
        setHasUnreadMessages(chatCount > 0);
        setUnreadChatCount(chatCount);
      }
    } catch (error) {
      console.error('Error in checkForUnreadMessages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async (cartItemId: string) => {
    if (!user || !isAuthenticated) return;

    try {
      const readerType = isAdmin ? 'admin' : 'customer';
      const { error } = await supabase.rpc('mark_messages_as_read', {
        p_cart_item_id: cartItemId,
        p_reader_type: readerType
      });

      if (error) {
        console.error('Error marking messages as read:', error);
        return;
      }

      // Refresh the unread status
      await checkForUnreadMessages();
    } catch (error) {
      console.error('Error in markMessagesAsRead:', error);
    }
  };

  useEffect(() => {
    checkForUnreadMessages();
    
    // Listen for forced message count refresh
    const handleForceRefresh = () => {
      checkForUnreadMessages();
    };
    
    window.addEventListener('refreshMessageCount', handleForceRefresh);
    
    return () => {
      window.removeEventListener('refreshMessageCount', handleForceRefresh);
    };
  }, [user, isAuthenticated, isAdmin]);

  // Set up real-time subscription for new messages
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
          checkForUnreadMessages();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
        },
        (payload: any) => {
          // Always refresh when conversations are updated (read status changed)
          checkForUnreadMessages();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notifications',
        },
        (payload: any) => {
          // Extra safety: when a new customer message notification arrives, refresh counts
          try {
            const notif = payload?.new as { notification_type?: string } | undefined;
            if (!notif || notif.notification_type === 'new_message') {
              checkForUnreadMessages();
            }
          } catch (e) {
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
    unreadChatCount,
    loading,
    refreshMessages: checkForUnreadMessages,
    markMessagesAsRead,
  };
};