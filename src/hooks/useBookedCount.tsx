import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useAdmin } from './useAdmin';

export const useBookedCount = () => {
  const { user, isAuthenticated } = useAuth();
  const { isAdmin } = useAdmin();
  const [bookedCount, setBookedCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadBookedCount = async () => {
    if (!user || !isAuthenticated) {
      setBookedCount(0);
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from('cart')
        .select('*', { count: 'exact', head: true })
        .eq('booking_type', 'booking');
      
      // For regular users, filter by user_id. For admins, show all bookings
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      const { count, error } = await query;

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
  }, [user, isAuthenticated, isAdmin]);

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
          filter: isAdmin ? undefined : `user_id=eq.${user.id}`,
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
  }, [user, isAdmin]);

  return {
    bookedCount,
    loading,
    refreshBookedCount: loadBookedCount,
  };
};