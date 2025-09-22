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
  members?: number;
  with_flights?: boolean;
  selected_date?: string;
  with_visa?: boolean;
  visa_cost?: number;
  applied_coupon_details?: string | null;
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

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize all packages as selected by default
  useEffect(() => {
    if (open && cartItems.length > 0) {
      setSelectedPackages(new Set(cartItems.map(item => item.id)));
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
  };

  const getSelectedItems = () => {
    return cartItems.filter(item => selectedPackages.has(item.id));
  };

  const getTotalPrice = () => {
    return getSelectedItems().reduce((total, item) => total + item.total_price + (item.visa_cost || 0), 0);
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

    setSubmitting(true);
    const bestTimeToConnect = bestTimeDate ? `${format(bestTimeDate, 'PPP')} ${bestTimeValue}`.trim() : '';

    try {
      const selectedItems = getSelectedItems();
      const bookingData = {
        phone_number: phoneNumber,
        best_time_to_connect: bestTimeToConnect,
        booking_type: 'booked',
        updated_at: new Date().toISOString(),
      };

      // Update all selected packages to booked status
      const updatePromises = selectedItems.map(item =>
        supabase
          .from('cart')
          .update(bookingData)
          .eq('id', item.id)
      );

      const results = await Promise.all(updatePromises);
      const errors = results.filter(result => result.error);

      if (errors.length > 0) {
        throw new Error(`Failed to book ${errors.length} package(s)`);
      }

      toast({
        title: 'Thank You!',
        description: `Successfully booked ${selectedItems.length} package(s). Our team will contact you soon with amazing deals.`,
      });

      onBookingComplete();
      onOpenChange(false);
      setPhoneNumber('');
      setBestTimeDate(undefined);
      setBestTimeValue('');
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Booking Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Book Your Packages</DialogTitle>
          <DialogDescription>
            Select the packages you want to book and provide your contact details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Package Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Packages</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={item.id}
                    checked={selectedPackages.has(item.id)}
                    onCheckedChange={(checked) => handlePackageSelection(item.id, !!checked)}
                  />
                  <div className="flex-grow">
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <label
                          htmlFor={item.id}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {item.packages?.title || `Package (ID: ${item.package_id})`}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.days} Days • {item.members || 1} Members • {item.with_flights ? 'With Flights' : 'Without Flights'}
                          {item.with_visa && ' • Visa Included'}
                        </p>
                        {item.applied_coupon_details && (
                          <p className="text-xs text-blue-600 font-medium mt-1">
                            Coupon: {item.applied_coupon_details}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-travel-primary">
                          ₹{formatIndianCurrency(item.total_price + (item.visa_cost || 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          {selectedPackages.size > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Selected Packages:</span>
                  <span>{selectedPackages.size}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Days:</span>
                  <span>{getTotalDays()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Members:</span>
                  <span>{getTotalMembers()}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-travel-primary">₹{formatIndianCurrency(getTotalPrice())}</span>
                </div>
              </div>
            </div>
          )}

          {/* Contact Information */}
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
          </div>

          {/* Submit Button */}
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
  );
};

export default MultiPackageBookingPopup;