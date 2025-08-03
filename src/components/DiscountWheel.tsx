
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Offer {
  id: string;
  title: string;
  discount: string;
  color: string;
  active: boolean;
  position: number;
}

interface GeneratedCoupon {
  code: string;
  offer_title: string;
  discount: string;
  expires_at: string;
}

const DiscountWheel = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpunToday, setHasSpunToday] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);
  const [generatedCoupon, setGeneratedCoupon] = useState<GeneratedCoupon | null>(null);
  const [rotation, setRotation] = useState(0);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadOffers();
    checkDailySpinStatus();
  }, []);

  const loadOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('wheel_offers')
        .select('*')
        .eq('active', true)
        .order('position', { ascending: true })
        .limit(6);
      
      if (data) {
        setOffers(data);
      } else if (error) {
        console.error('Error loading offers:', error);
      }
    } catch (error) {
      console.error('Error in loadOffers:', error);
    }
  };

  const checkDailySpinStatus = () => {
    const today = new Date().toDateString();
    const lastSpin = localStorage.getItem('lastWheelSpin');
    setHasSpunToday(lastSpin === today);
  };

  const generateCouponCode = () => {
    const prefix = 'TRAVELGENZ';
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${randomSuffix}`;
  };

  const spinWheel = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to be logged in to spin the wheel.",
        variant: "destructive"
      });
      return;
    }

    if (isSpinning || hasSpunToday || offers.length === 0) return;

    setIsSpinning(true);
    
    // Random rotation between 1800-2520 degrees (5-7 full rotations)
    const spins = Math.floor(Math.random() * 3) + 5;
    const finalRotation = spins * 360 + Math.random() * 360;
    setRotation(prev => prev + finalRotation);

    // Calculate which offer was selected
    const normalizedRotation = finalRotation % 360;
    const segmentSize = 360 / offers.length;
    const selectedIndex = Math.floor((360 - normalizedRotation) / segmentSize) % offers.length;
    const selectedOffer = offers[selectedIndex];

    setTimeout(async () => {
      setIsSpinning(false);
      
      // Generate coupon
      const couponCode = generateCouponCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days validity

      const coupon: GeneratedCoupon = {
        code: couponCode,
        offer_title: selectedOffer.title,
        discount: selectedOffer.discount,
        expires_at: expiresAt.toISOString()
      };

      // Store coupon in database
      try {
        await supabase
          .from('user_coupons')
          .insert({
            coupon_code: couponCode,
            offer_title: selectedOffer.title,
            discount: selectedOffer.discount,
            expires_at: expiresAt.toISOString(),
            used: false,
            user_id: user.id
          });
      } catch (error) {
        console.error('Error storing coupon:', error);
      }

      setGeneratedCoupon(coupon);
      setShowCoupon(true);
      
      // Mark as spun today
      const today = new Date().toDateString();
      localStorage.setItem('lastWheelSpin', today);
      setHasSpunToday(true);

      toast({
        title: "Congratulations! 🎉",
        description: `You won ${selectedOffer.discount} discount!`,
      });
    }, 3000);
  };

  const copyCouponCode = () => {
    if (generatedCoupon) {
      navigator.clipboard.writeText(generatedCoupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Coupon code copied to clipboard",
      });
    }
  };

  const handleSaveCoupon = async () => {
    if (!user || !generatedCoupon) return;

    setShowCoupon(false);

    try {
      const { data: cartItems, error: cartError } = await supabase
        .from('cart')
        .select('id, total_price')
        .eq('user_id', user.id);

      if (cartError || !cartItems || cartItems.length === 0) {
        toast({ title: 'Coupon Saved', description: 'Your coupon is saved to your account for future use.' });
        return;
      }
      
      const { data: existingDiscountedItems } = await supabase
        .from('cart')
        .select('id')
        .eq('user_id', user.id)
        .not('price_before_admin_discount', 'is', null);

      if (existingDiscountedItems && existingDiscountedItems.length > 0) {
        toast({ title: 'Coupon Saved', description: 'A discount is already applied to your cart. This coupon has been saved for later use.' });
        return;
      }

      const discountMatch = generatedCoupon.discount.match(/(\d+)\s*%/);
      if (!discountMatch) {
        toast({ title: 'Error', description: 'Could not apply coupon discount.', variant: 'destructive' });
        return;
      }
      const discountPercentage = parseInt(discountMatch[1], 10);
      const cartTotal = cartItems.reduce((total, item) => total + Number(item.total_price), 0);
      const totalDiscountValue = cartTotal * (discountPercentage / 100);
      
      const couponDetailsString = `${generatedCoupon.code} (${generatedCoupon.discount})`;

      const updates = cartItems.map(item => {
        const itemPrice = Number(item.total_price);
        const itemDiscount = (itemPrice / cartTotal) * totalDiscountValue;
        const newPrice = itemPrice - itemDiscount;

        return supabase.from('cart').update({
          total_price: newPrice,
          price_before_admin_discount: itemPrice,
          applied_coupon_details: couponDetailsString
        }).eq('id', item.id);
      });

      await Promise.all(updates);
      
      const { data: couponInDb } = await supabase.from('user_coupons').select('id').eq('coupon_code', generatedCoupon.code).single();
      if (couponInDb) {
        await supabase.from('user_coupons').update({
          used: true,
          used_at: new Date().toISOString()
        }).eq('id', couponInDb.id);
      }

      toast({ title: 'Discount Applied!', description: `A ${generatedCoupon.discount} discount has been applied to your cart!` });
      
    } catch (e: any) {
      console.error('Error applying coupon to cart:', e);
      toast({ title: 'Error', description: 'Could not apply coupon to cart.', variant: 'destructive' });
    }
  };

  if (offers.length === 0) return null;

  const segmentAngle = 360 / offers.length;

  return (
    <section className="py-8 md:py-12 lg:py-8 bg-gradient-to-br from-purple-50 to-pink-50">

      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-6 md:mb-8 lg:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-sm mb-3 md:mb-4"
          >
            <Gift className="h-4 w-4 md:h-5 md:w-5 text-purple-500 mr-1.5 md:mr-2" />
            <span className="text-gray-700 font-medium text-sm md:text-base">Daily Rewards</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl lg:text-4xl font-bold mb-2 md:mb-4"
          >
            Spin the Wheel{" "}
            <span className="bg-gradient-to-r from-[#f857a6] to-[#a75fff] bg-clip-text text-transparent">
              🎰
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4"
          >
            Spin once daily for exclusive travel discounts and save on your next adventure!
          </motion.p>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative">
            {/* Wheel Container */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96">
              {/* Wheel */}
              <motion.div
                className="w-full h-full rounded-full border-8 border-white shadow-2xl relative overflow-hidden"
                animate={{ rotate: rotation }}
                transition={{ duration: 3, ease: "easeOut" }}
              >
                {offers.map((offer, index) => {
                  const startAngle = index * segmentAngle;
                  const endAngle = (index + 1) * segmentAngle;
                  const midAngle = startAngle + segmentAngle / 2;
                  
                  return (
                    <div
                      key={offer.id}
                      className="absolute inset-0"
                      style={{
                        background: `conic-gradient(from ${startAngle}deg, ${offer.color} 0deg, ${offer.color} ${segmentAngle}deg, transparent ${segmentAngle}deg)`,
                        clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((endAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((endAngle - 90) * Math.PI / 180)}%)`
                      }}
                    >
                      <div
                        className="absolute text-white font-bold text-sm md:text-base text-center"
                        style={{
                          top: `${50 + 20 * Math.sin((midAngle - 90) * Math.PI / 180)}%`,
                          left: `${50 + 20 * Math.cos((midAngle - 90) * Math.PI / 180)}%`,
                          transform: `translate(-50%, -50%) rotate(${midAngle}deg)`,
                          transformOrigin: 'center'
                        }}
                      >
                        <div className="whitespace-nowrap text-xs md:text-sm">
                          {offer.discount}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>

              {/* Center Circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-white rounded-full border-4 border-purple-500 flex items-center justify-center">
                <Gift className="h-5 w-5 md:h-6 md:w-6 text-purple-500" />
              </div>

              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 md:-translate-y-2">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-purple-500"></div>
              </div>
            </div>
          </div>

          {/* Spin Button */}
          <motion.button
            onClick={spinWheel}
            disabled={isSpinning || hasSpunToday}
            className={`mt-6 md:mt-8 px-6 md:px-8 py-3 md:py-4 rounded-full text-white font-bold text-base md:text-lg transition-all duration-300 ${
              hasSpunToday 
                ? 'bg-gray-400 cursor-not-allowed' 
                : isSpinning 
                  ? 'bg-purple-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
            }`}
            whileHover={!isSpinning && !hasSpunToday ? { scale: 1.05 } : {}}
            whileTap={!isSpinning && !hasSpunToday ? { scale: 0.95 } : {}}
          >
            {hasSpunToday ? 'Come Back Tomorrow!' : isSpinning ? 'Spinning...' : 'Spin Now!'}
          </motion.button>

          {hasSpunToday && (
            <p className="mt-3 md:mt-4 text-gray-600 text-center text-sm md:text-base px-4">
              You've already spun today. Come back tomorrow for another chance!
            </p>
          )}
        </div>

        {/* Coupon Modal */}
        <AnimatePresence>
          {showCoupon && generatedCoupon && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="bg-white rounded-2xl p-6 md:p-8 max-w-sm md:max-w-md w-full relative mx-4"
              >
                <button
                  onClick={() => setShowCoupon(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>

                <div className="text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Congratulations!
                  </h3>
                  
                  <p className="text-gray-600 mb-4 text-sm md:text-base">
                    You won {generatedCoupon.discount} discount!
                  </p>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-xs md:text-sm text-gray-600 mb-2">Your Coupon Code:</p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="text-base md:text-lg font-bold text-purple-600 bg-white px-2 md:px-3 py-1.5 md:py-2 rounded border">
                        {generatedCoupon.code}
                      </code>
                      <button
                        onClick={copyCouponCode}
                        className="p-2 text-purple-500 hover:text-purple-700"
                      >
                        {copied ? <Check className="h-4 w-4 md:h-5 md:w-5" /> : <Copy className="h-4 w-4 md:h-5 md:w-5" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mb-3 md:mb-4">
                    Valid until {new Date(generatedCoupon.expires_at).toLocaleDateString()}
                  </p>

                  <button
                    onClick={handleSaveCoupon}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 md:py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors text-sm md:text-base"
                  >
                    Save Coupon
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default DiscountWheel;
