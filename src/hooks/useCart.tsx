import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useCart = () => {
  const { user, isAuthenticated } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadCartCount = async () => {
    if (!user || !isAuthenticated) {
      setCartCount(0);
      return;
    }

    setLoading(true);
    try {
      const { count, error } = await supabase
        .from('cart')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

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
  }, [user, isAuthenticated]);

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
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadCartCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    cartCount,
    loading,
    refreshCartCount: loadCartCount,
  };
};