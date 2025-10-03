import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tag, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface UserCoupon {
  id: string;
  coupon_code: string;
  offer_title: string;
  discount: string;
  expires_at: string;
  used: boolean;
}

interface CouponBrowserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCoupon: (code: string) => void;
}

const CouponBrowser = ({ open, onOpenChange, onSelectCoupon }: CouponBrowserProps) => {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<UserCoupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && user) {
      loadCoupons();
    }
  }, [open, user]);

  const loadCoupons = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_coupons')
        .select('*')
        .eq('user_id', user.id)
        .eq('used', false)
        .gte('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: true });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error loading coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCoupon = (code: string) => {
    onSelectCoupon(code);
    onOpenChange(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-primary" />
            Your Exclusive Deals
          </DialogTitle>
          <p className="text-sm text-muted-foreground italic mt-2">
            "Your journey, your deals—zero card hassles"
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">No coupons available</p>
            <p className="text-sm text-muted-foreground mt-2">
              Check back later for exclusive offers!
            </p>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {coupons.map((coupon) => {
              const daysLeft = getDaysUntilExpiry(coupon.expires_at);
              const isExpiringSoon = daysLeft <= 7;

              return (
                <Card
                  key={coupon.id}
                  className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => handleSelectCoupon(coupon.coupon_code)}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
                  
                  <div className="p-5 relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="w-5 h-5 text-primary" />
                          <h3 className="font-bold text-lg">{coupon.offer_title}</h3>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                            {coupon.discount}
                          </Badge>
                          {isExpiringSoon && (
                            <Badge variant="destructive" className="text-xs">
                              Expiring Soon!
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Expires: {formatDate(coupon.expires_at)}</span>
                        <span className="text-xs">
                          ({daysLeft} {daysLeft === 1 ? 'day' : 'days'} left)
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-dashed">
                      <div className="flex items-center justify-between">
                        <code className="text-sm font-mono bg-muted px-3 py-1 rounded">
                          {coupon.coupon_code}
                        </code>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCoupon(coupon.coupon_code);
                          }}
                          className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        >
                          Apply Coupon
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                </Card>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CouponBrowser;
