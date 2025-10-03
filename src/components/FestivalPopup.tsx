import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FestivalAnimationData {
  id: string;
  festival_name: string;
  animation_type: string;
  offer_text: string | null;
  coupon_code: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

const FestivalPopup = () => {
  const [animation, setAnimation] = useState<FestivalAnimationData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('festival_popup_seen');
    console.log('FestivalPopup mounted, hasSeenPopup:', hasSeenPopup);
    if (!hasSeenPopup) {
      loadActiveAnimation();
    }

    const channel = supabase
      .channel('festival-popup-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'festival_animations'
        },
        () => {
          console.log('Festival animation changed, reloading popup...');
          loadActiveAnimation();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadActiveAnimation = async () => {
    const now = new Date();
    console.log('Loading active animation, current time:', now);
    
    const { data, error } = await supabase
      .from('festival_animations' as any)
      .select('*')
      .eq('is_active', true);

    console.log('Festival animations data:', data);
    console.log('Query error:', error);

    if (data && data.length > 0) {
      const activeAnimation = data.find((anim: any) => {
        const startDate = new Date(anim.start_date);
        const endDate = new Date(anim.end_date);
        const isInRange = startDate <= now && endDate >= now;
        console.log(`Animation ${anim.festival_name}:`, {
          startDate,
          endDate,
          isInRange,
          hasCoupon: !!anim.coupon_code
        });
        return isInRange;
      });

      if (activeAnimation && (activeAnimation as any).coupon_code) {
        console.log('Setting active animation:', activeAnimation);
        setAnimation(activeAnimation as unknown as FestivalAnimationData);
        setIsOpen(true);
      } else {
        console.log('No active animation with coupon found');
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('festival_popup_seen', 'true');
  };

  const handleCopy = async () => {
    if (animation?.coupon_code) {
      try {
        await navigator.clipboard.writeText(animation.coupon_code);
        setCopied(true);
        
        // Add coupon to user_coupons table
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const expiresAt = new Date(animation.end_date);
          
          await supabase.from('user_coupons').insert({
            user_id: user.id,
            coupon_code: animation.coupon_code,
            offer_title: animation.offer_text || animation.festival_name,
            discount: '10%', // You can adjust this or get from animation data
            expires_at: expiresAt.toISOString(),
            used: false
          });
        }
        
        toast.success('Coupon code copied and added to your account!');
        setTimeout(() => {
          handleClose();
        }, 1000);
      } catch (err) {
        console.error('Copy error:', err);
        toast.error('Failed to copy coupon code');
      }
    }
  };

  if (!animation || !isOpen) return null;

  const getCardStyle = () => {
    switch (animation.animation_type) {
      case 'christmas':
        return {
          gradient: 'from-red-600 via-red-700 to-green-700',
          pattern: '🎄',
          accentColor: 'text-red-100',
        };
      case 'holi':
        return {
          gradient: 'from-pink-500 via-purple-500 to-yellow-500',
          pattern: '🎨',
          accentColor: 'text-white',
        };
      case 'diwali':
        return {
          gradient: 'from-orange-600 via-yellow-600 to-amber-700',
          pattern: '🪔',
          accentColor: 'text-yellow-100',
        };
      case 'eid':
        return {
          gradient: 'from-green-600 via-teal-600 to-emerald-700',
          pattern: '🌙',
          accentColor: 'text-green-100',
        };
      default:
        return {
          gradient: 'from-primary via-primary-glow to-primary',
          pattern: '🎉',
          accentColor: 'text-white',
        };
    }
  };

  const cardStyle = getCardStyle();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Popup Card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotateY: -15 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotateY: 15 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="relative w-full max-w-md pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute -top-4 -right-4 z-10 bg-white hover:bg-gray-100 text-gray-800 rounded-full p-2 shadow-lg transition-transform hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Card Content */}
            <div className={`bg-gradient-to-br ${cardStyle.gradient} rounded-3xl shadow-2xl overflow-hidden`}>
              {/* Decorative Pattern */}
              <div className="absolute inset-0 opacity-10 text-6xl">
                {Array.from({ length: 20 }).map((_, i) => (
                  <span
                    key={i}
                    className="absolute"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      transform: `rotate(${Math.random() * 360}deg)`,
                    }}
                  >
                    {cardStyle.pattern}
                  </span>
                ))}
              </div>

              {/* Content */}
              <div className="relative p-8 text-center space-y-6">
                {/* Festival Icon */}
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="text-8xl"
                >
                  {cardStyle.pattern}
                </motion.div>

                {/* Festival Title */}
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {animation.festival_name}
                  </h2>
                  <div className={`text-xl md:text-2xl font-semibold ${cardStyle.accentColor}`}>
                    Special Celebration! 🎉
                  </div>
                </div>

                {/* Offer Text */}
                {animation.offer_text && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/30">
                    <p className="text-xl md:text-2xl font-bold text-white">
                      {animation.offer_text}
                    </p>
                  </div>
                )}

                {/* Coupon Code */}
                {animation.coupon_code && (
                  <div className="space-y-3">
                    <p className={`text-sm font-medium ${cardStyle.accentColor}`}>
                      Your Exclusive Coupon Code:
                    </p>
                    <div className="bg-white rounded-xl p-4 shadow-lg">
                      <div className="flex items-center justify-between gap-3">
                        <code className="text-2xl font-bold text-gray-800 tracking-wider flex-1">
                          {animation.coupon_code}
                        </code>
                        <Button
                          onClick={handleCopy}
                          size="sm"
                          className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Message */}
                <p className={`text-sm ${cardStyle.accentColor} italic`}>
                  Apply this code at checkout to enjoy your special discount!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FestivalPopup;
