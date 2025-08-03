
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user || authLoading) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        console.log('Checking admin role for:', user.email);
        
        // Use the security definer function instead of direct table query
        const { data, error } = await supabase
          .rpc('is_user_admin', { user_email: user.email });

        console.log('Admin check result:', { data, error });

        if (data === true && !error) {
          console.log('User is admin');
          setIsAdmin(true);
        } else {
          console.log('User is not admin');
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, [user, authLoading]);

  return { isAdmin, loading };
};
