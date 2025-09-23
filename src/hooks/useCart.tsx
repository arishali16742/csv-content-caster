import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useAdmin } from './useAdmin';

export const useCart = () => {
  const { user, isAuthenticated } = useAuth();
  const { isAdmin } = useAdmin();
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadCartCount = async () => {
    if (!user || !isAuthenticated) {
      setCartCount(0);
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from('cart')
        .select('*', { count: 'exact', head: true })
        .eq('booking_type', 'cart');
      
      // For regular users, filter by user_id. For admins, show all cart items
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      const { count, error } = await query;

      if (error) {
        console.error('Error loading cart count:', error);
        return;
      }

      setCartCount(count || 0);
    } catch (error) {
      console.error('Error in loadCartCount:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCartCount();
  }, [user, isAuthenticated, isAdmin]);

  // Set up real-time subscription to cart changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('cart_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart',
          filter: isAdmin ? undefined : `user_id=eq.${user.id}`,
        },
        () => {
          loadCartCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin]);

  // Also refresh count on custom cart-updated events
  useEffect(() => {
    const handler = () => {
      loadCartCount();
    };
    window.addEventListener('cart-updated', handler as EventListener);
    return () => window.removeEventListener('cart-updated', handler as EventListener);
  }, []);
 
  return {
    cartCount,
    loading,
    refreshCartCount: loadCartCount,
  };
};