import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  id: string;
  package_id: string;
  days: number;
  total_price: number;
  original_price?: number;
  members?: number;
  with_flights?: boolean;
  selected_date?: string;
  with_visa?: boolean;
  visa_cost?: number;
  applied_coupon_details?: string | null;
  phone_number?: string;
  updated_at?: string;
  packages?: {
    id: string;
    title: string;
    price: string;
    image: string;
    destinations: string[];
    mood: string;
    trip_type: string;
    includes: string[];
    rating: number;
    duration: string;
    country: string;
  };
}

interface MultiPackageBookingPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: CartItem[];
  onBookingComplete: () => void;
}

const MultiPackageBookingPopup = ({
  open,
  onOpenChange,
  cartItems,
  onBookingComplete,
}: MultiPackageBookingPopupProps) => {
  const [selectedPackages, setSelectedPackages] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bestTimeDate, setBestTimeDate] = useState<Date>();
  const [bestTimeValue, setBestTimeValue] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [finalPrice, setFinalPrice] = useState(0);
  const [couponMessage, setCouponMessage] = useState({ text: '', type: 'info' });
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [showReplaceCouponDialog, setShowReplaceCouponDialog] = useState(false);
  const [pendingCoupon, setPendingCoupon] = useState<any>(null);

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const calculateOriginalPrice = (item: CartItem): number => {
    if (item.original_price) return item.original_price;
    
    if (item.applied_coupon_details) {
      const couponMatch = item.applied_coupon_details.match(/(\d+)%/);
      if (couponMatch) {
        const discountPercentage = parseInt(couponMatch[1], 10);
        const discountedPrice = item.total_price + (item.visa_cost || 0);
        const originalPrice = discountedPrice / (1 - discountPercentage / 100);
        return Math.round(originalPrice);
      }
    }
    
    return item.total_price + (item.visa_cost || 0);
  };

  const getSelectedItems = () => {
    return cartItems.filter(item => selectedPackages.has(item.id));
  };

  const getNewItems = () => {
    return getSelectedItems().filter(item => !item.phone_number);
  };

  const getAlreadyBookedItems = () => {
    return getSelectedItems().filter(item => item.phone_number);
  };

  const getTotalPriceFromItems = (items: CartItem[]) => {
    return items.reduce((total, item) => total + item.total_price + (item.visa_cost || 0), 0);
  };

  const getTotalPrice = () => {
    return getTotalPriceFromItems(getSelectedItems());
  };

  const getOriginalTotalPrice = () => {
    return getSelectedItems().reduce((total, item) => {
      return total + calculateOriginalPrice(item);
    }, 0);
  };

  const getOriginalTotalPriceForNew = () => {
    return getNewItems().reduce((total, item) => {
      return total + calculateOriginalPrice(item);
    }, 0);
  };

  const hasPackageLevelCoupons = () => {
    return getSelectedItems().some(item => item.applied_coupon_details);
  };

  const hasPackageLevelCouponsOnNew = () => {
    return getNewItems().some(item => item.applied_coupon_details);
  };

  useEffect(() => {
    if (open && cartItems.length > 0) {
      setSelectedPackages(new Set(cartItems.map(item => item.id)));
      const totalPrice = getTotalPrice();
      setFinalPrice(totalPrice);
      setAppliedCoupon(null);
      setCouponCode('');
      setCouponMessage({ text: '', type: 'info' });
    }
  }, [open, cartItems]);

  const handlePackageSelection = (packageId: string, checked: boolean) => {
    const newSelected = new Set(selectedPackages);
    if (checked) {
      newSelected.add(packageId);
    } else {
      newSelected.delete(packageId);
    }
    setSelectedPackages(newSelected);
    
    const totalPrice = getTotalPriceFromItems(cartItems.filter(item => newSelected.has(item.id)));
    setFinalPrice(totalPrice);
    
    if (appliedCoupon) {
      setAppliedCoupon(null);
      setCouponMessage({ text: 'Coupon removed due to package selection change.', type: 'info' });
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

    const selectedItems = getSelectedItems();
    const alreadyBookedItems = selectedItems.filter(item => item.phone_number);
    
    if (alreadyBookedItems.length > 0) {
      setCouponMessage({ 
        text: `Cannot apply coupon. ${alreadyBookedItems.length} package(s) are already booked.`, 
        type: 'error' 
      });
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
        if (appliedCoupon) {
          setPendingCoupon(couponData);
          setShowReplaceCouponDialog(true);
        } else {
          applyCouponDiscount(couponData);
        }
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

  const applyCouponDiscount = (couponData: any) => {
    const percentageMatch = couponData.discount.match(/(\d+)%/);
    if (!percentageMatch) return;

    const percentage = parseInt(percentageMatch[1], 10);
    const newItems = getNewItems();
    const alreadyBookedItems = getAlreadyBookedItems();
    
    if (newItems.length === 0) {
      setCouponMessage({ 
        text: 'No new packages selected for coupon application.', 
        type: 'error' 
      });
      return;
    }

    const originalTotalNewPackages = getOriginalTotalPriceForNew();
    const discountAmount = (originalTotalNewPackages * percentage) / 100;
    const discountedNewPackagesPrice = Math.max(0, originalTotalNewPackages - discountAmount);
    
    const alreadyBookedPrice = alreadyBookedItems.reduce((total, item) => {
      return total + (item.total_price + (item.visa_cost || 0));
    }, 0);
    
    const newFinalPrice = discountedNewPackagesPrice + alreadyBookedPrice;
    
    setFinalPrice(newFinalPrice);
    setAppliedCoupon(couponData);
    setCouponMessage({ 
      text: `Success! ${couponData.discount} applied to ${newItems.length} new package(s).`, 
      type: 'success' 
    });
    
    toast({
      title: 'Coupon Applied!',
      description: `Discount applied to ${newItems.length} new package(s).`,
    });
  };

  const handleReplaceCoupon = () => {
    if (pendingCoupon) {
      applyCouponDiscount(pendingCoupon);
    }
    setShowReplaceCouponDialog(false);
    setPendingCoupon(null);
  };

  const handleCancelReplace = () => {
    setShowReplaceCouponDialog(false);
    setPendingCoupon(null);
    setCouponMessage({ text: 'Coupon application cancelled.', type: 'info' });
  };

  const handleRemoveCoupon = () => {
    const currentPackagePrice = getTotalPrice();
    setFinalPrice(currentPackagePrice);
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponMessage({ text: 'Booking coupon removed.', type: 'info' });
  };

  const getTotalDays = () => {
    return getSelectedItems().reduce((total, item) => total + item.days, 0);
  };

  const getTotalMembers = () => {
    return getSelectedItems().reduce((total, item) => total + (item.members || 1), 0);
  };

  const formatIndianCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: 'Not Logged In', description: 'Please log in to book a trip.', variant: 'destructive' });
      onOpenChange(false);
      return;
    }

    if (selectedPackages.size === 0) {
      toast({ title: 'No Packages Selected', description: 'Please select at least one package to book.', variant: 'destructive' });
      return;
    }

    if (!phoneNumber) {
      toast({ title: 'Missing Information', description: 'Please provide your phone number.', variant: 'destructive' });
      return;
    }

    const selectedItems = getSelectedItems();
    const newItems = getNewItems();
    const alreadyBookedItems = getAlreadyBookedItems();

    if (newItems.length === 0) {
      toast({
        title: 'All Packages Already Booked',
        description: 'All selected packages have already been booked. Please select new packages.',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    const bestTimeToConnect = bestTimeDate ? `${format(bestTimeDate, 'PPP')} ${bestTimeValue}`.trim() : '';

    try {
      const bookingData: any = {
        phone_number: phoneNumber,
        best_time_to_connect: bestTimeToConnect,
        booking_type: 'booking',
        updated_at: new Date().toISOString(),
      };

      // Use the existing applied_coupon_details column instead of booking_coupon_details
      if (appliedCoupon) {
        // Combine existing package coupons with booking coupon
        bookingData.applied_coupon_details = `Booking: ${appliedCoupon.offer_title} (${appliedCoupon.discount})`;
      }

      const updatePromises = newItems.map(item =>
        supabase
          .from('cart')
          .update(bookingData)
          .eq('id', item.id)
      );

      const results = await Promise.all(updatePromises);
      const errors = results.filter(result => result.error);

      if (errors.length > 0) {
        console.error('Detailed booking errors:', errors);
        const errorMessages = errors.map(err => err.error?.message).join(', ');
        throw new Error(`Failed to book ${errors.length} package(s): ${errorMessages}`);
      }

      let description = `Successfully booked ${newItems.length} new package(s).`;
      if (alreadyBookedItems.length > 0) {
        description += ` ${alreadyBookedItems.length} package(s) were already booked.`;
      }
      description += ' Our team will contact you soon with amazing deals.';

      toast({
        title: 'Thank You!',
        description: description,
      });

      onBookingComplete();
      onOpenChange(false);
      window.dispatchEvent(new Event('cart-updated'));
      setPhoneNumber('');
      setBestTimeDate(undefined);
      setBestTimeValue('');
      navigate('/booked');
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking Failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (selectedPackages.size > 0) {
      const totalPrice = getTotalPrice();
      if (!appliedCoupon) {
        setFinalPrice(totalPrice);
      }
    }
  }, [selectedPackages, cartItems]);

  const newItems = getNewItems();
  const alreadyBookedItems = getAlreadyBookedItems();
  const alreadyBookedPrice = getTotalPriceFromItems(alreadyBookedItems);
  const originalTotalNewPackages = getOriginalTotalPriceForNew();
  const newItemsPrice = getTotalPriceFromItems(newItems);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Book Your Packages</DialogTitle>
            <DialogDescription>
              Select the packages you want to book and provide your contact details.
              {hasPackageLevelCoupons() && (
                <span className="text-green-600 font-medium ml-2">
                  Some packages already have discounts applied!
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Packages</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {cartItems.map((item) => {
                  const originalPrice = calculateOriginalPrice(item);
                  const currentPrice = item.total_price + (item.visa_cost || 0);
                  const hasPackageCoupon = item.applied_coupon_details;
                  const isAlreadyBooked = !!item.phone_number;
                  
                  return (
                    <div key={item.id} className={`flex items-start space-x-3 p-3 border rounded-lg ${isAlreadyBooked ? 'bg-gray-50' : ''}`}>
                      <Checkbox
                        id={item.id}
                        checked={selectedPackages.has(item.id)}
                        onCheckedChange={(checked) => !isAlreadyBooked && handlePackageSelection(item.id, !!checked)}
                        disabled={isAlreadyBooked}
                      />
                      <div className="flex-grow">
                        <div className="flex items-start justify-between">
                          <div className="flex-grow">
                            <label
                              htmlFor={item.id}
                              className={`text-sm font-medium cursor-pointer ${isAlreadyBooked ? 'text-gray-500' : ''}`}
                            >
                              {item.packages?.title || `Package (ID: ${item.package_id})`}
                              {isAlreadyBooked && <span className="ml-2 text-xs text-blue-600">(Already Booked)</span>}
                            </label>
                            <p className="text-xs text-gray-500 mt-1">
                              {item.days} Days • {item.members || 1} Members • {item.with_flights ? 'With Flights' : 'Without Flights'}
                              {item.with_visa && ' • Visa Included'}
                            </p>
                            {hasPackageCoupon && (
                              <p className="text-xs text-green-600 font-medium mt-1">
                                Package Coupon: {item.applied_coupon_details}
                              </p>
                            )}
                            {isAlreadyBooked && item.phone_number && (
                              <p className="text-xs text-blue-600 mt-1">
                                Booked on: {new Date(item.updated_at!).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            {hasPackageCoupon ? (
                              <div>
                                <span className="text-sm text-gray-500 line-through block">
                                  ₹{formatIndianCurrency(originalPrice)}
                                </span>
                                <span className="text-sm font-bold text-travel-primary block">
                                  ₹{formatIndianCurrency(currentPrice)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm font-bold text-travel-primary">
                                ₹{formatIndianCurrency(currentPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedPackages.size > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
                
                {alreadyBookedItems.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded">
                    <h4 className="font-medium text-blue-800">Already Booked Packages</h4>
                    <div className="flex justify-between text-sm mt-1">
                      <span>Packages:</span>
                      <span>{alreadyBookedItems.length} (Coupons locked)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Price:</span>
                      <span>₹{formatIndianCurrency(alreadyBookedPrice)}</span>
                    </div>
                  </div>
                )}
                
                {newItems.length > 0 && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>New Packages:</span>
                      <span>{newItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Days:</span>
                      <span>{getTotalDays()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Members:</span>
                      <span>{getTotalMembers()}</span>
                    </div>
                    
                    {hasPackageLevelCouponsOnNew() && (
                      <div className="flex justify-between text-green-600 text-xs">
                        <span>Package-level discounts applied</span>
                        <span>✓</span>
                      </div>
                    )}
                    <hr className="my-2" />
                    
                    {hasPackageLevelCouponsOnNew() && (
                      <div className="flex justify-between text-sm">
                        <span>Original Total:</span>
                        <span>₹{formatIndianCurrency(originalTotalNewPackages)}</span>
                      </div>
                    )}
                    
                    {hasPackageLevelCouponsOnNew() && (
                      <div className="flex justify-between text-green-600 text-sm">
                        <span>Package Discounts:</span>
                        <span>- ₹{formatIndianCurrency(originalTotalNewPackages - newItemsPrice)}</span>
                      </div>
                    )}
                    
                    {appliedCoupon && (
                      <div className="flex justify-between text-green-600 text-sm">
                        <span>Booking Coupon ({appliedCoupon.discount} on new):</span>
                        <span>- ₹{formatIndianCurrency(originalTotalNewPackages - (finalPrice - alreadyBookedPrice))}</span>
                      </div>
                    )}
                    
                    <hr className="my-2" />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>Final Amount:</span>
                      <div className="text-right">
                        {alreadyBookedItems.length > 0 && (
                          <div className="text-xs text-gray-600">
                            {alreadyBookedItems.length} booked + {newItems.length} new
                          </div>
                        )}
                        <span className="text-travel-primary">
                          ₹{formatIndianCurrency(finalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <div>
                <label htmlFor="phone" className="text-sm font-medium">Phone Number *</label>
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
                        type="button"
                        variant="outline"
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
                <label htmlFor="coupon" className="text-sm font-medium">
                  {appliedCoupon ? 'Booking Coupon Applied' : 'Apply booking coupon'}
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    id="coupon"
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={isApplyingCoupon}
                  />
                  {appliedCoupon ? (
                    <Button type="button" onClick={handleRemoveCoupon} variant="outline">
                      Remove
                    </Button>
                  ) : (
                    <Button type="button" onClick={handleApplyCoupon} disabled={isApplyingCoupon}>
                      {isApplyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                    </Button>
                  )}
                </div>
                {couponMessage.text && (
                  <p className={`text-sm mt-1 ${couponMessage.type === 'error' ? 'text-destructive' : couponMessage.type === 'success' ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {couponMessage.text}
                  </p>
                )}
                {appliedCoupon && (
                  <p className="text-xs text-blue-600 mt-1">
                    Only one booking coupon can be applied at a time. Remove the current coupon to apply a different one.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting || selectedPackages.size === 0}
                className="min-w-[120px]"
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Book {selectedPackages.size > 1 ? `${selectedPackages.size} Packages` : 'Package'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showReplaceCouponDialog} onOpenChange={setShowReplaceCouponDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace Coupon?</DialogTitle>
            <DialogDescription>
              You already have a coupon applied ({appliedCoupon?.discount}). 
              Applying a new coupon will replace the current one. Do you want to continue?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancelReplace}>
              Cancel
            </Button>
            <Button onClick={handleReplaceCoupon}>
              Replace Coupon
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MultiPackageBookingPopup;