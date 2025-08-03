import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNavigate } from 'react-router-dom';

interface BookingPopupSettings {
  image_url: string;
  title: string | null;
  subtitle: string | null;
}

interface PackageData {
  id: string;
  nights: number | null;
}

interface BookingPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageData: PackageData | null;
  members: number;
  totalPrice: number;
  withFlights: boolean;
  selectedDate?: Date;
  visaCost: number;
  cartItemId?: string;
  appliedCouponDetails?: string | null;
}

const BookingPopup = ({
  open,
  onOpenChange,
  packageData,
  members,
  totalPrice,
  withFlights,
  selectedDate,
  visaCost,
  cartItemId,
  appliedCouponDetails,
}: BookingPopupProps) => {
  const [settings, setSettings] = useState<BookingPopupSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bestTimeDate, setBestTimeDate] = useState<Date>();
  const [bestTimeValue, setBestTimeValue] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [finalPrice, setFinalPrice] = useState(totalPrice);
  const [couponMessage, setCouponMessage] = useState({ text: '', type: 'info' });
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [hasExistingCoupon, setHasExistingCoupon] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      if (!open) return;
      setLoadingSettings(true);
      try {
        const { data, error } = await supabase
          .from('booking_popup_settings')
          .select('*')
          .eq('is_active', true)
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        setSettings(data);
      } catch (error: any) {
        console.error('Error fetching booking popup settings:', error);
      } finally {
        setLoadingSettings(false);
      }
    };

    fetchSettings();
  }, [open]);

  useEffect(() => {
    setFinalPrice(totalPrice);
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponMessage({ text: '', type: 'info' });
    setHasExistingCoupon(!!appliedCouponDetails);
    if (appliedCouponDetails) {
        setCouponMessage({ text: `Coupon already applied: ${appliedCouponDetails}`, type: 'info' });
    }
  }, [totalPrice, open, appliedCouponDetails]);

  useEffect(() => {
    const fetchCartItemDetails = async () => {
      if (cartItemId && open) {
        setSubmitting(true);
        try {
          const { data, error } = await supabase
            .from('cart')
            .select('phone_number, best_time_to_connect, applied_coupon_details')
            .eq('id', cartItemId)
            .single();

          if (error) throw error;

          if (data) {
            setPhoneNumber(data.phone_number || '');
            if (data.applied_coupon_details) {
              setCouponMessage({ text: `Coupon already applied: ${data.applied_coupon_details}`, type: 'info' });
              setHasExistingCoupon(true);
            }
            if (data.best_time_to_connect) {
              const fullString = data.best_time_to_connect;
              const timeRegex = /\d{1,2}:\d{2}/;
              const timeMatch = fullString.match(timeRegex);
              let time = '';
              let dateStr = fullString;
              if (timeMatch) {
                time = timeMatch[0];
                dateStr = fullString.replace(time, '').trim();
              }
              try {
                const parsedDate = new Date(dateStr);
                if (!isNaN(parsedDate.getTime())) {
                  setBestTimeDate(parsedDate);
                }
              } catch (e) {
                console.error('Could not parse date', e);
              }
              setBestTimeValue(time);
            }
          }
        } catch (error) {
          console.error('Error fetching cart item details for popup', error);
          toast({
            title: 'Error',
            description: 'Could not load existing booking details.',
            variant: 'destructive',
          });
        } finally {
            setSubmitting(false);
        }
      }
    };
    fetchCartItemDetails();
  }, [cartItemId, open, toast]);

  const handleAddToCart = async () => {
    if (!user) {
      toast({ title: 'Not Logged In', description: 'Please log in to add items to your cart.', variant: 'destructive' });
      onOpenChange(false);
      return;
    }

    if (!packageData) {
      toast({ title: 'Error', description: 'Package data is missing.', variant: 'destructive' });
      return;
    }

    setIsAddingToCart(true);

    try {
        const { error } = await supabase.from('cart').insert({
          package_id: packageData.id,
          user_id: user.id,
          days: packageData.nights || 0,
          total_price: totalPrice,
          members: members,
          with_flights: withFlights,
          selected_date: selectedDate ? selectedDate.toISOString() : null,
          with_visa: visaCost > 0,
          visa_cost: visaCost,
          booking_type: 'cart', // Explicitly set as 'cart'
        });

        if (error) throw error;

        toast({
          title: 'Added to Cart!',
          description: 'The package has been added to your cart.',
        });
      
        onOpenChange(false);
        setPhoneNumber('');
        setBestTimeDate(undefined);
        setBestTimeValue('');

    } catch (error: any) {
      toast({
        title: 'Failed to Add to Cart',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      setCouponMessage({ text: 'Please enter a coupon code.', type: 'error' });
      return;
    }
    if (!user) {
      toast({ title: 'Not Logged In', description: 'Please log in to apply coupons.', variant: 'destructive' });
      return;
    }

    setIsApplyingCoupon(true);
    setCouponMessage({ text: '', type: 'info' });

    try {
      const { data: couponData, error } = await supabase
        .from('user_coupons')
        .select('*')
        .eq('coupon_code', couponCode.trim().toUpperCase())
        .eq('user_id', user.id)
        .single();

      if (error || !couponData) {
        setCouponMessage({ text: 'Invalid or expired coupon code.', type: 'error' });
        return;
      }

      if (couponData.used) {
        setCouponMessage({ text: 'This coupon has already been used.', type: 'error' });
        return;
      }

      if (new Date(couponData.expires_at) < new Date()) {
        setCouponMessage({ text: 'This coupon has expired.', type: 'error' });
        return;
      }

      const discountString = couponData.discount;
      const percentageMatch = discountString.match(/(\d+)%/);
      if (percentageMatch) {
        const percentage = parseInt(percentageMatch[1], 10);
        const discountAmount = (totalPrice * percentage) / 100;
        setFinalPrice(totalPrice - discountAmount);
        setAppliedCoupon(couponData);
        setCouponMessage({ text: `Success! ${couponData.discount} applied.`, type: 'success' });
        toast({
          title: 'Coupon Applied!',
          description: `You've received a ${couponData.discount} discount.`,
        });
      } else {
        setCouponMessage({ text: 'This coupon is not a percentage discount and cannot be applied here.', type: 'error' });
      }
    } catch (e) {
      setCouponMessage({ text: 'Error while validating coupon.', type: 'error' });
      console.error('Coupon application error:', e);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: 'Not Logged In', description: 'Please log in to book a trip.', variant: 'destructive' });
      onOpenChange(false);
      return;
    }

    if (!cartItemId && !packageData) {
      toast({ title: 'Error', description: 'Package data is missing.', variant: 'destructive' });
      return;
    }

    if (!phoneNumber) {
      toast({ title: 'Missing Information', description: 'Please provide your phone number.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    const bestTimeToConnect = bestTimeDate ? `${format(bestTimeDate, 'PPP')} ${bestTimeValue}`.trim() : '';

    try {
      let error;
      const bookingData: any = {
        phone_number: phoneNumber,
        best_time_to_connect: bestTimeToConnect,
        booking_type: 'booked',
      };

      if (appliedCoupon) {
        bookingData.total_price = finalPrice;
        bookingData.applied_coupon_details = `${appliedCoupon.offer_title} (${appliedCoupon.discount})`;
      }

      if (cartItemId) {
        bookingData.updated_at = new Date().toISOString();
        const { error: updateError } = await supabase
          .from('cart')
          .update(bookingData)
          .eq('id', cartItemId);
        error = updateError;
        
      } else if (packageData) {
        const insertData = {
          ...bookingData,
          package_id: packageData.id,
          user_id: user.id,
          days: packageData.nights || 0,
          total_price: appliedCoupon ? finalPrice : totalPrice,
          members: members,
          with_flights: withFlights,
          selected_date: selectedDate ? selectedDate.toISOString() : null,
          with_visa: visaCost > 0,
          visa_cost: visaCost,
        };
        const { error: insertError } = await supabase.from('cart').insert(insertData);
        error = insertError;
      }

      if (error) throw error;
      
      toast({
        title: 'Thank You!',
        description: 'Our team will surely contact you with amazing deals.',
      });

      onOpenChange(false);
      setPhoneNumber('');
      setBestTimeDate(undefined);
      setBestTimeValue('');
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="hidden md:block">
            {loadingSettings ? (
              <div className="h-full w-full bg-gray-200 animate-pulse"></div>
            ) : settings?.image_url ? (
              <img
                src={settings.image_url}
                alt={settings.title || 'Booking'}
                className="h-full w-full object-cover"
              />
            ) : (
                <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-500">Image not available</p>
                </div>
            )}
          </div>
          <div className="p-8 flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Thanks for Choosing Us!</DialogTitle>
              <DialogDescription>
                You can add this to your cart or provide your number to submit a booking request.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4 flex flex-col flex-grow">
              <div className="flex-grow space-y-4">
                <div>
                  <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="time" className="block mb-1 text-sm font-medium">Best time to connect (optional)</label>
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[60%] justify-start text-left font-normal",
                            !bestTimeDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {bestTimeDate ? format(bestTimeDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={bestTimeDate}
                          onSelect={setBestTimeDate}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      id="time"
                      type="time"
                      className="w-[40%]"
                      value={bestTimeValue}
                      onChange={(e) => setBestTimeValue(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="coupon" className="text-sm font-medium">Have a coupon?</label>
                   <div className="flex items-center gap-2">
                      <Input
                        id="coupon"
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={!!appliedCoupon || isApplyingCoupon || hasExistingCoupon}
                      />
                      <Button type="button" onClick={handleApplyCoupon} disabled={!!appliedCoupon || isApplyingCoupon || hasExistingCoupon}>
                        {isApplyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : appliedCoupon ? 'Applied' : 'Apply'}
                      </Button>
                    </div>
                  {couponMessage.text && <p className={`text-sm mt-1 ${couponMessage.type === 'error' ? 'text-destructive' : couponMessage.type === 'success' ? 'text-green-600' : 'text-muted-foreground'}`}>{couponMessage.text}</p>}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total Price</span>
                    {appliedCoupon ? (
                        <div className="text-right">
                            <span className="text-sm text-gray-500 line-through">₹{totalPrice.toLocaleString()}</span>
                            <span className="text-lg font-bold text-travel-primary ml-2">₹{finalPrice.toLocaleString()}</span>
                        </div>
                    ) : (
                        <span className="text-lg font-bold">₹{totalPrice.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t">
                {!cartItemId && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={handleAddToCart}
                    disabled={submitting || isAddingToCart}
                  >
                    {isAddingToCart && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add to Cart
                  </Button>
                )}
                <Button type="submit" className="w-full" disabled={submitting || isAddingToCart}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {cartItemId ? 'Update Request' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingPopup;
