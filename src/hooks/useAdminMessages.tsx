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
      const { data, error } = await supabase
        .from('cart')
        .select('admin_response')
        .eq('user_id', user.id)
        .not('admin_response', 'is', null);

      if (error) {
        console.error('Error checking admin messages:', error);
        return;
      }

      setHasUnreadMessages(data && data.length > 0);
    } catch (error) {
      console.error('Error in checkForUnreadMessages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkForUnreadMessages();
  }, [user, isAuthenticated]);

  // Set up real-time subscription to cart changes for admin responses
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('admin_messages')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cart',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Check if admin_response was updated
          if (payload.new?.admin_response && payload.new?.admin_response !== payload.old?.admin_response) {
            setHasUnreadMessages(true);
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