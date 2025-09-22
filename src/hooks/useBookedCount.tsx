import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useBookedCount = () => {
  const { user, isAuthenticated } = useAuth();
  const [bookedCount, setBookedCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadBookedCount = async () => {
    if (!user || !isAuthenticated) {
      setBookedCount(0);
      return;
    }

    setLoading(true);
    try {
      const { count, error } = await supabase
        .from('cart')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('booking_type', 'booking');

      if (error) {
        console.error('Error loading booked count:', error);
        return;
      }

      setBookedCount(count || 0);
    } catch (error) {
      console.error('Error in loadBookedCount:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookedCount();
  }, [user, isAuthenticated]);

  // Set up real-time subscription to cart changes for bookings
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('booking_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          // Only update if it's a booking-related change
          if (payload.new?.booking_type === 'booking' || payload.old?.booking_type === 'booking') {
            loadBookedCount();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    bookedCount,
    loading,
    refreshBookedCount: loadBookedCount,
  };
};