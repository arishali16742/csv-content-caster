import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from './Navbar';
import Footer from './Footer';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Trash2, Plus, Minus, ShoppingCart, Calendar, Eye, X, Users, Plane, Clock, FileText, Copy, Tag, BookCheck } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { format } from 'date-fns';
import BookingPopup from './BookingPopup';

interface CartItem {
  id: string;
  package_id: string;
  days: number;
  total_price: number;
  members?: number;
  with_flights?: boolean;
  selected_date?: string;
  created_at: string;
  updated_at?: string;
  with_visa?: boolean;
  visa_cost?: number;
  price_before_admin_discount?: number | null;
  booking_type?: string;
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

const Cart = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<CartItem | null>(null);
  const [showPackageDetail, setShowPackageDetail] = useState(false);
  const [isBookingPopupOpen, setIsBookingPopupOpen] = useState(false);

  const loadCartItems = async () => {
    if (!user) {
      console.log('No user found, skipping cart load');
      setLoading(false);
      return;
    }

    console.log('Loading cart items for user:', user.id);

    try {
      // Get cart items with updated fields
      const { data: cartData, error: cartError } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (cartError) {
        console.error('Error loading cart items:', cartError);
        setLoading(false);
        return;
      }

      console.log('Cart data:', cartData);

      if (!cartData || cartData.length === 0) {
        console.log('No cart items found');
        setCartItems([]);
        setLoading(false);
        return;
      }

      // Get package details for each cart item
      const packageIds = cartData.map(item => item.package_id);
      console.log('Package IDs to fetch:', packageIds);

      const { data: packagesData, error: packagesError } = await supabase
        .from('packages')
        .select('*')
        .in('id', packageIds);

      if (packagesError) {
        console.error('Error loading packages:', packagesError);
      }

      console.log('Packages data:', packagesData);

      // Combine cart items with package data
      const combinedData = cartData.map(cartItem => ({
        ...cartItem,
        packages: packagesData?.find(pkg => pkg.id === cartItem.package_id) || null
      }));

      console.log('Combined cart data:', combinedData);
      setCartItems(combinedData);

    } catch (error) {
      console.error('Error in loadCartItems:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      loadCartItems();
    } else {
      setLoading(false);
    }
  }, [user, isAuthenticated]);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: "Booking ID copied to clipboard.",
      });
    }).catch(err => {
      console.error('Failed to copy ID:', err);
      toast({
        title: "Error",
        description: "Could not copy Booking ID.",
        variant: "destructive",
      });
    });
  };

  const updateCartItem = async (itemId: string, newDays: number) => {
    const item = cartItems.find(item => item.id === itemId);
    if (!item?.packages) return;

    // Admin discounts are separate. This update recalculates based on base price.
    // If an admin discount exists, we should probably warn the user or disable this.
    // For now, we assume this action resets any admin discount.
    const basePrice = parseInt(item.packages.price.replace(/[₹,]/g, ''));
    const members = item.members || 1;
    const newTotalPrice = basePrice * newDays * members;

    try {
      const { error } = await supabase
        .from('cart')
        .update({
          days: newDays,
          total_price: newTotalPrice,
          price_before_admin_discount: null, // Reset admin discount on manual update
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) {
        console.error('Error updating cart item:', error);
        toast({
          title: "Error",
          description: "Failed to update cart item",
          variant: "destructive",
        });
        return;
      }

      setCartItems(items =>
        items.map(i =>
          i.id === itemId
            ? { ...i, days: newDays, total_price: newTotalPrice, price_before_admin_discount: null }
            : i
        )
      );

      toast({
        title: "Updated",
        description: "Cart item updated successfully. Any special discounts have been removed.",
      });
    } catch (error) {
      console.error('Error updating cart item:', error);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Error removing from cart:', error);
        toast({
          title: "Error",
          description: "Failed to remove item from cart",
          variant: "destructive",
        });
        return;
      }

      setCartItems(items => items.filter(item => item.id !== itemId));
      toast({
        title: "Removed",
        description: "Item removed from cart",
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.total_price + (item.visa_cost || 0), 0);
  };

  const viewPackageDetails = (item: CartItem) => {
    console.log('Viewing package details for:', item);
    setSelectedPackage(item);
    setShowPackageDetail(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center px-4">
          <div className="text-center">
            <ShoppingCart className="h-16 w-16 md:h-24 md:w-24 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl md:text-2xl font-bold mb-2">Please Sign In</h2>
            <p className="text-gray-600 text-sm md:text-base">You need to be signed in to view your cart</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-travel-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Your Cart</h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <ShoppingCart className="h-16 w-16 md:h-24 md:w-24 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl md:text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-4 text-sm md:text-base">Start adding some amazing travel packages!</p>
              <Button onClick={() => window.location.href = '/packages'} className="text-sm md:text-base">
                Browse Packages
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                {cartItems.map((item) => {
                  const packageData = item.packages;
                  console.log('Rendering cart item:', item, 'Package data:', packageData);
                  
                  return (
                    <Card key={item.id} className="overflow-hidden">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <img
                            src={packageData?.image || '/placeholder.svg'}
                            alt={packageData?.title || 'Package'}
                            className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-lg"
                          />
                          <div className="flex-grow space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                              <div className="flex-grow">
                                <h3 className="text-lg font-semibold pr-2">
                                  {packageData?.title || `Package (ID: ${item.package_id})`}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500">Booking ID:</span>
                                  <Badge variant="secondary" className="font-mono text-xs">{item.id}</Badge>
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(item.id)}>
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewPackageDetails(item)}
                                className="self-start flex-shrink-0"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">View Details</span>
                                <span className="sm:hidden">Details</span>
                              </Button>
                            </div>
                            
                            {packageData?.destinations && (
                              <p className="text-gray-600 text-sm">
                                {packageData.destinations.join(' → ')}
                              </p>
                            )}
                            
                            {/* Configuration Details */}
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {item.days} Days
                              </Badge>
                              <Badge variant="outline" className="text-xs flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {item.members || 1} Members
                              </Badge>
                              {item.with_flights !== undefined && (
                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                  <Plane className="h-3 w-3" />
                                  {item.with_flights ? 'With Flights' : 'Without Flights'}
                                </Badge>
                              )}
                              {item.selected_date && (
                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(item.selected_date), 'MMM dd, yyyy')}
                                </Badge>
                              )}
                              {item.with_visa && (
                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  Visa Included
                                </Badge>
                              )}
                              {item.applied_coupon_details && (
                                <Badge variant="outline" className="text-xs flex items-center gap-1 text-blue-600 border-blue-600">
                                  <Tag className="h-3 w-3" />
                                  {item.applied_coupon_details}
                                </Badge>
                              )}
                            </div>
                            
                            {packageData && (
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="text-xs">{packageData.mood}</Badge>
                                <Badge variant="outline" className="text-xs">{packageData.trip_type}</Badge>
                              </div>
                            )}
                            
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium">Days:</span>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateCartItem(item.id, Math.max(1, item.days - 1))}
                                    disabled={item.days <= 1}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="font-semibold w-8 text-center">
                                    {item.days}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateCartItem(item.id, item.days + 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between sm:justify-end gap-3">
                                {item.price_before_admin_discount && item.price_before_admin_discount > 0 ? (
                                  <div className="text-right">
                                    <div className="flex items-center gap-1.5 justify-end">
                                        <Tag className="h-3 w-3 text-green-600" />
                                        <p className="text-xs text-green-600 font-semibold">Special Discount Applied!</p>
                                    </div>
                                    <span className="text-sm text-gray-500 line-through">
                                      ₹{(item.price_before_admin_discount + (item.visa_cost || 0)).toLocaleString()}
                                    </span>
                                    <span className="text-lg md:text-xl font-bold text-travel-primary ml-2">
                                      ₹{(item.total_price + (item.visa_cost || 0)).toLocaleString()}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-lg md:text-xl font-bold text-travel-primary">
                                    ₹{(item.total_price + (item.visa_cost || 0)).toLocaleString()}
                                  </span>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Cart Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm md:text-base">
                      <span>Total Items:</span>
                      <span>{cartItems.length}</span>
                    </div>
                    <div className="flex justify-between text-sm md:text-base">
                      <span>Total Days:</span>
                      <span>{cartItems.reduce((total, item) => total + item.days, 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm md:text-base">
                      <span>Total Members:</span>
                      <span>{cartItems.reduce((total, item) => total + (item.members || 1), 0)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount:</span>
                      <span className="text-travel-primary">
                        ₹{getTotalPrice().toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full" onClick={() => window.location.href = '/packages'}>
                        Continue Shopping
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Package Detail Modal */}
      <Dialog open={showPackageDetail} onOpenChange={setShowPackageDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPackage?.packages?.title || 'Package Details'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPackage?.packages && (
            <div className="space-y-6">
              <img
                src={selectedPackage.packages.image}
                alt={selectedPackage.packages.title}
                className="w-full h-32 object-cover rounded-lg"
              />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Country:</strong> {selectedPackage.packages.country}
                </div>
                <div>
                  <strong>Package Orig. Duration:</strong> {selectedPackage.packages.duration}
                </div>
                <div>
                  <strong>Rating:</strong> ⭐ {selectedPackage.packages.rating}
                </div>
                <div>
                  <strong>Days Selected:</strong> {selectedPackage.days}
                </div>
                <div>
                  <strong>Members:</strong> {selectedPackage.members || 1}
                </div>
                <div>
                  <strong>Flights:</strong> {selectedPackage.with_flights ? 'Included' : 'Not Included'}
                </div>
                {selectedPackage.with_visa && (
                  <div>
                    <strong>Visa Assistance:</strong> Included (₹{selectedPackage.visa_cost?.toLocaleString()})
                  </div>
                )}
                {selectedPackage.applied_coupon_details && (
                  <div className="col-span-2">
                    <strong>Coupon Applied:</strong> <span className="font-bold text-blue-600">{selectedPackage.applied_coupon_details}</span>
                  </div>
                )}
              </div>

              {selectedPackage.selected_date && (
                <div>
                  <strong className="block mb-2">Selected Date:</strong>
                  <p className="text-gray-600">{format(new Date(selectedPackage.selected_date), 'MMMM dd, yyyy')}</p>
                </div>
              )}

              <div>
                <strong className="block mb-2">Destinations:</strong>
                <p className="text-gray-600">{selectedPackage.packages.destinations?.join(' → ')}</p>
              </div>

              <div>
                <strong className="block mb-2">What's Included:</strong>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedPackage.packages.includes?.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className="text-green-500">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
  <div>
    <p className="text-sm text-gray-600">
      Total Price ({selectedPackage.days} days, {selectedPackage.members || 1} members)
    </p>

    {selectedPackage.price_before_admin_discount && selectedPackage.price_before_admin_discount > 0 ? (
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <Tag className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-600 font-semibold">Special Discount Applied!</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 line-through text-sm">
            ₹{(selectedPackage.price_before_admin_discount + (selectedPackage.visa_cost || 0)).toLocaleString()}
          </span>
          <span className="text-2xl font-bold text-travel-primary">
            ₹{(selectedPackage.total_price + (selectedPackage.visa_cost || 0)).toLocaleString()}
          </span>
        </div>
      </div>
    ) : (
      <p className="text-2xl font-bold text-travel-primary">
        ₹{(selectedPackage.total_price + (selectedPackage.visa_cost || 0)).toLocaleString()}
      </p>
    )}
  </div>

                <div className="flex gap-2">
                  {selectedPackage.booking_type === 'booked' ? (
                    <Button disabled>
                      <BookCheck className="h-4 w-4 mr-1" />
                      Booked
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        if (selectedPackage) {
                          setShowPackageDetail(false);
                          setIsBookingPopupOpen(true);
                        }
                      }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Book this trip
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      if (selectedPackage) {
                        navigate(`/package/${selectedPackage.package_id}?cart_item_id=${selectedPackage.id}`);
                        setShowPackageDetail(false);
                      }
                    }}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (selectedPackage) {
                        removeFromCart(selectedPackage.id);
                        setShowPackageDetail(false);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {selectedPackage && (
        <BookingPopup
          open={isBookingPopupOpen}
          onOpenChange={setIsBookingPopupOpen}
          packageData={{
            id: selectedPackage.package_id,
            nights: selectedPackage.days,
          }}
          members={selectedPackage.members || 1}
          totalPrice={selectedPackage.total_price}
          withFlights={!!selectedPackage.with_flights}
          selectedDate={
            selectedPackage.selected_date
              ? new Date(selectedPackage.selected_date)
              : undefined
          }
          visaCost={selectedPackage.visa_cost || 0}
          cartItemId={selectedPackage.id}
          appliedCouponDetails={selectedPackage.applied_coupon_details}
        />
      )}

      <Footer />
    </div>
  );
};

export default Cart;
