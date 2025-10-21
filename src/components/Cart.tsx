import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from './Navbar';
import Footer from './Footer';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Trash2, Plus, Minus, ShoppingCart, Calendar, Eye, X, Users, Plane, Clock, FileText, Copy, Tag, BookCheck, ArrowLeft, MessageSquare } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from './ui/use-toast';
import { format } from 'date-fns';
import BookingPopup from './BookingPopup';
import MultiPackageBookingPopup from './MultiPackageBookingPopup';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Loader2 } from 'lucide-react';
import CouponBrowser from './CouponBrowser';

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
  comments?: string | null;
  admin_response?: string | null;
  admin_response_file_url?: string | null;
  packages?: {
    id: string;
    title: string;
    price: string;
    original_price?: string;
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
  const [isMultiBookingPopupOpen, setIsMultiBookingPopupOpen] = useState(false);
  const [comments, setComments] = useState('');
  const [savingComments, setSavingComments] = useState(false);
  const [selectedPackageForComments, setSelectedPackageForComments] = useState<string>('');
  const [conversations, setConversations] = useState<Record<string, any[]>>({});
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Coupon state variables
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [finalPrice, setFinalPrice] = useState(0);
  const [couponMessage, setCouponMessage] = useState({ text: '', type: 'info' });
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [hasExistingCoupon, setHasExistingCoupon] = useState(false);
  const [cartCouponDetails, setCartCouponDetails] = useState<string | null>(null);
  const [showCouponBrowser, setShowCouponBrowser] = useState(false);

  // Auto-scroll to bottom when conversations change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversations]);

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
        .eq('booking_type', 'cart')
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

      // Initialize final price with total price
      const totalPrice = combinedData.reduce((total, item) => total + item.total_price + (item.visa_cost || 0), 0);
      setFinalPrice(totalPrice);

    } catch (error) {
      console.error('Error in loadCartItems:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load conversations for all cart items
  const loadConversations = async () => {
    if (!user || cartItems.length === 0) return;

    try {
      const cartItemIds = cartItems.map(item => item.id);
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .in('cart_item_id', cartItemIds)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading conversations:', error);
        return;
      }

      // Group conversations by cart item id
      const groupedConversations: Record<string, any[]> = {};
      data?.forEach(conversation => {
        if (!groupedConversations[conversation.cart_item_id]) {
          groupedConversations[conversation.cart_item_id] = [];
        }
        groupedConversations[conversation.cart_item_id].push(conversation);
      });

      setConversations(groupedConversations);
      
      // Mark admin messages as read for all cart items when viewing conversations
      for (const cartItemId of cartItemIds) {
        try {
          await supabase.rpc('mark_messages_as_read', {
            p_cart_item_id: cartItemId,
            p_reader_type: 'customer'
          });
        } catch (error) {
          console.error('Error marking messages as read for cart item:', cartItemId, error);
        }
      }
    } catch (error) {
      console.error('Error in loadConversations:', error);
    }
  };

  // Load initial state and set default selected package
  useEffect(() => {
    if (cartItems.length > 0) {
      setComments('');
      if (!selectedPackageForComments) {
        setSelectedPackageForComments(cartItems[0].id);
      }
      loadConversations();
    }
  }, [cartItems]);

  // Set up real-time subscription for conversations
  useEffect(() => {
    if (!user || cartItems.length === 0) return;

    const cartItemIds = cartItems.map(item => item.id);
    
    const channel = supabase
      .channel('conversations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        (payload: any) => {
          if (cartItemIds.includes(payload.new?.cart_item_id || payload.old?.cart_item_id)) {
            loadConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, cartItems]);

  const handleSaveComments = async () => {
    if (!user || cartItems.length === 0 || !comments.trim() || !selectedPackageForComments) return;

    setSavingComments(true);
    try {
      // Get user name from metadata or email
      const firstName = user.user_metadata?.first_name || '';
      const lastName = user.user_metadata?.last_name || '';
      const senderName = firstName && lastName ? `${firstName} ${lastName}` : user.email;

      // Insert new conversation message
      const { error } = await supabase
        .from('conversations')
        .insert({
          cart_item_id: selectedPackageForComments,
          message: comments.trim(),
          sender_type: 'customer',
          sender_name: senderName
        });

      if (error) throw error;

      setComments(''); // Clear input after successful save

      // Mark admin messages as read when customer sends a message (customer has seen the conversation)
      try {
        await supabase.rpc('mark_messages_as_read', {
          p_cart_item_id: selectedPackageForComments,
          p_reader_type: 'customer'
        });
        
        // Force refresh of unread messages count after a short delay
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('refreshMessageCount'));
        }, 500);
      } catch (markError) {
        console.error('Error marking admin messages as read:', markError);
      }

      toast({
        title: "Message Sent",
        description: "Your message has been sent to our support team for the selected package.",
      });

      // Refresh conversations to show the new message
      loadConversations();
    } catch (error) {
      console.error('Error saving message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSavingComments(false);
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
  return cartItems.reduce((total, item) => {
    const itemTotal = item.total_price + (item.visa_cost || 0);
    return total + itemTotal;
  }, 0);
};

  // Calculate original price per item using getItemOriginalPrice (pre-coupon/current discounts)
  const getOriginalPrice = () => {
    return cartItems.reduce((total, item) => total + getItemOriginalPrice(item), 0);
  };

  const formatIndianCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const viewPackageDetails = (item: CartItem) => {
    console.log('Viewing package details for:', item);
    setSelectedPackage(item);
    setShowPackageDetail(true);
  };

  const handleBookThisTrip = () => {
    if (cartItems.length > 0) {
      setIsMultiBookingPopupOpen(true);
    }
  };

  const handleBookingComplete = () => {
    loadCartItems(); // Reload to show updated booking status
  };

  // Calculate original price for a single cart item based on configuration
  const getItemOriginalPrice = (item: CartItem) => {
    if (!item.packages) return 0;
    
    const visaCost = item.visa_cost || 0;

    // Prefer explicit original captured at add-to-cart time
    if (item.price_before_admin_discount) {
      return item.price_before_admin_discount + visaCost;
    }

    // Parse package prices
    const pkgPrice = parseInt(item.packages.price.replace(/[₹,]/g, '') || '0');
    const pkgOriginal = parseInt(
      item.packages.original_price?.replace(/[₹,]/g, '') || item.packages.price.replace(/[₹,]/g, '')
    );
    const ratio = pkgPrice > 0 ? (pkgOriginal / pkgPrice) : 1;

    // Recover pre-coupon package portion if a coupon is applied
    let basePackagePortion = item.total_price; // package portion only (visa excluded)
    if (item.applied_coupon_details) {
      const match = item.applied_coupon_details.match(/(\d+)%/);
      if (match) {
        const pct = parseInt(match[1], 10) / 100;
        if (pct >= 0 && pct < 1) {
          basePackagePortion = Math.round(item.total_price / (1 - pct));
        }
      }
    }

    // Without flights: derive original using discount ratio
    if (item.with_flights === false) {
      const originalWithoutFlights = Math.round(basePackagePortion * ratio);
      return originalWithoutFlights + visaCost;
    }

    // With flights (or unknown): use package original (with flights)
    return pkgOriginal + visaCost;
  };

  // Return the pre-coupon current price (base used for coupon), not the original MRP
  const getItemPriceAfterCoupon = (item: CartItem) => {
    if (!item.packages) return 0;

    const visaCost = item.visa_cost || 0;

    if (item.applied_coupon_details) {
      const couponMatch = item.applied_coupon_details.match(/(\d+)%/);
      if (couponMatch) {
        const pct = parseInt(couponMatch[1], 10) / 100;
        if (pct >= 0 && pct < 1) {
          const discountedTotal = item.total_price + visaCost; // current stored total after coupon
          // Recover pre-coupon current total to display alongside coupon info
          return Math.round(discountedTotal / (1 - pct));
        }
      }
    }

    // If no coupon, the base is just the current price (package + visa)
    return item.total_price + visaCost;
  };

  // Coupon logic from BookingPopup - UPDATED to save to cart items
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
        const totalPrice = getTotalPrice();
        const discountAmount = (totalPrice * percentage) / 100;
        const newFinalPrice = totalPrice - discountAmount;
        
        setFinalPrice(newFinalPrice);
        setAppliedCoupon(couponData);
        
        // Create coupon details string like BookingPopup does
        const couponDetails = `${couponData.offer_title} (${couponData.discount})`;
        setCartCouponDetails(couponDetails);
        
        setCouponMessage({ text: `Success! ${couponData.discount} applied.`, type: 'success' });
        
        // Update all cart items with the coupon discount proportionally
        await updateCartItemsWithCoupon(couponData, couponDetails, percentage);
        
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

  // Function to remove applied coupon
// Function to remove applied coupon
const handleRemoveCoupon = async () => {
  if (!user) return;

  setIsApplyingCoupon(true);
  
  try {
    const updates = cartItems.map(async (item) => {
      if (!item.packages) return item;

      let percentage = 0;
      const match = item.applied_coupon_details?.match(/(\d+)%/);
      if (match) {
        percentage = parseInt(match[1], 10);
      } else if (appliedCoupon?.discount) {
        const m2 = appliedCoupon.discount.match(/(\d+)%/);
        if (m2) percentage = parseInt(m2[1], 10);
      }

      if (percentage > 0 && percentage < 100) {
        const visaCost = item.visa_cost || 0;
        const discountedTotal = item.total_price + visaCost; // what we currently store/display
        const baseTotalBeforeCoupon = Math.round(discountedTotal / (1 - percentage / 100));
        const newPackagePortion = Math.max(0, baseTotalBeforeCoupon - visaCost);

        const { error } = await supabase
          .from('cart')
          .update({
            total_price: newPackagePortion,
            applied_coupon_details: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);

        if (error) throw error;

        return {
          ...item,
          total_price: newPackagePortion,
          applied_coupon_details: null
        };
      } else {
        // No valid percentage found; just clear coupon flag
        const { error } = await supabase
          .from('cart')
          .update({
            applied_coupon_details: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);
        if (error) throw error;
        return { ...item, applied_coupon_details: null };
      }
    });

    const updatedItems = await Promise.all(updates);
    setCartItems(updatedItems);
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponMessage({ text: 'Coupon removed successfully.', type: 'success' });
    setCartCouponDetails(null);
    setHasExistingCoupon(false);

    const totalPrice = updatedItems.reduce((total, item) => {
      const itemTotal = item.total_price + (item.visa_cost || 0);
      return total + itemTotal;
    }, 0);
    setFinalPrice(totalPrice);

    toast({
      title: 'Coupon Removed',
      description: 'The coupon has been removed from your cart.',
    });

    setTimeout(() => {
      setCouponMessage({ text: '', type: 'info' });
    }, 3000);
    
  } catch (error) {
    console.error('Error removing coupon:', error);
    setCouponMessage({ text: 'Failed to remove coupon. Please try again.', type: 'error' });
    toast({
      title: 'Error',
      description: 'Failed to remove coupon',
      variant: 'destructive',
    });
  } finally {
    setIsApplyingCoupon(false);
  }
};

  // Update all cart items with coupon discount proportionally
  const updateCartItemsWithCoupon = async (couponData: any, couponDetails: string, percentage: number) => {
    try {
      const updates = cartItems.map(async (item) => {
        const itemTotal = item.total_price + (item.visa_cost || 0);
        const discountAmount = (itemTotal * percentage) / 100;
        const newItemPrice = itemTotal - discountAmount;
        
        const { error } = await supabase
          .from('cart')
          .update({
            total_price: Math.round(newItemPrice - (item.visa_cost || 0)), // Subtract visa cost to get package price only
            applied_coupon_details: couponDetails,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);

        if (error) throw error;

        return {
          ...item,
          total_price: Math.round(newItemPrice - (item.visa_cost || 0)),
          applied_coupon_details: couponDetails
        };
      });

      const updatedItems = await Promise.all(updates);
      setCartItems(updatedItems);
      
    } catch (error) {
      console.error('Error updating cart items with coupon:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply coupon to cart items',
        variant: 'destructive',
      });
    }
  };

  // Reset coupon state when cart items change
useEffect(() => {
  const totalPrice = getTotalPrice();
  const originalPrice = getOriginalPrice();
  setFinalPrice(totalPrice);
  
  // Check if any cart item already has a coupon applied
  const hasCoupon = cartItems.some(item => !!item.applied_coupon_details);
  setHasExistingCoupon(hasCoupon);
  
  if (hasCoupon) {
    // If cart items already have coupons, use the first one found
    const firstCouponItem = cartItems.find(item => !!item.applied_coupon_details);
    if (firstCouponItem) {
      setCartCouponDetails(firstCouponItem.applied_coupon_details);
      setCouponMessage({ text: `Coupon already applied: ${firstCouponItem.applied_coupon_details}`, type: 'info' });
    }
  } else {
    // Only reset coupon state if no existing coupons
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponMessage({ text: '', type: 'info' });
    setCartCouponDetails(null);
  }
}, [cartItems]);

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
          {/* Back Navigation */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

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
                  const itemOriginalPrice = getItemOriginalPrice(item);
                  const itemCurrentPrice = item.total_price + (item.visa_cost || 0);
                  const hasDiscount = itemOriginalPrice > itemCurrentPrice;
                  
                  console.log('Rendering cart item:', item, 'Package data:', packageData);
                  
                  return (
                    <Card key={item.id} className={`overflow-hidden relative ${item.booking_type === 'booked' ? 'ring-2 ring-green-500' : ''}`}>
                      {/* Booked Status Indicator */}
                      {item.booking_type === 'booked' && (
                        <div className="absolute top-4 right-4 z-10">
                          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                            <BookCheck className="h-3 w-3" />
                            BOOKED
                          </div>
                        </div>
                      )}
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
                                <span className="text-sm font-medium">Stay Duration:</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold w-16 text-center">
                                    {item.days} {item.days === 1 ? "Day" : "Days"}
                                  </span>
                                </div>
                              </div>
                              
                            <div className="flex flex-col text-right">
                              {/* Show pricing breakdown */}
                              {hasDiscount ? (
                                <div>
                                  <div className="flex items-center gap-1.5 justify-end mb-1">
                                    <Tag className="h-3 w-3 text-green-600" />
                                    <p className="text-xs text-green-600 font-semibold">Discounts Applied!</p>
                                  </div>
                                  
                                  {/* Phase 1: Original price */}
                                  <div className="text-sm text-gray-500 line-through">
                                    ₹{formatIndianCurrency(itemOriginalPrice)}
                                  </div>
                                  
                                  {/* Phase 2: Show coupon discount if applied */}
                                  {item.applied_coupon_details && (
                                    <>
                                      <div className="text-xs text-blue-600">
                                        Coupon: {item.applied_coupon_details}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        ₹{formatIndianCurrency(getItemPriceAfterCoupon(item))}
                                      </div>
                                    </>
                                  )}
                                  
                                  {/* Phase 3: Show admin discount if applied */}
                                  {item.price_before_admin_discount && item.price_before_admin_discount > item.total_price && (
                                    <div className="text-xs text-purple-600">
                                      Admin Discount Applied
                                    </div>
                                  )}
                                  
                                  {/* Final discounted price */}
                                  <div className="text-lg md:text-xl font-bold text-travel-primary">
                                    ₹{formatIndianCurrency(itemCurrentPrice)}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-lg md:text-xl font-bold text-travel-primary">
                                  ₹{formatIndianCurrency(itemCurrentPrice)}
                                </div>
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



                    {/* Coupon Section */}
                    <div className="space-y-3">
  <label htmlFor="coupon" className="text-sm font-medium">Have a coupon?</label>
  
  {appliedCoupon || hasExistingCoupon ? (
    <div className="space-y-2">
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            {appliedCoupon?.offer_title || cartCouponDetails}
          </span>
        </div>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={handleRemoveCoupon}
          disabled={isApplyingCoupon}
        >
          Remove
        </Button>
      </div>
      {couponMessage.text && (
        <p className={`text-sm ${couponMessage.type === 'error' ? 'text-destructive' : couponMessage.type === 'success' ? 'text-green-600' : 'text-muted-foreground'}`}>
          {couponMessage.text}
        </p>
      )}
    </div>
  ) : (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          id="coupon"
          type="text"
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          disabled={isApplyingCoupon}
          className="flex-1"
        />
        <Button 
  type="button" 
  onClick={handleApplyCoupon} 
  disabled={!!appliedCoupon || isApplyingCoupon || hasExistingCoupon}
  size="sm"
>
  {isApplyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : appliedCoupon ? 'Applied' : 'Apply'}
</Button>
      </div>
      <button 
        onClick={() => setShowCouponBrowser(true)}
        className="text-sm text-primary hover:underline"
      >
        No worries...browse coupons
      </button>
      {couponMessage.text && (
        <p className={`text-sm ${couponMessage.type === 'error' ? 'text-destructive' : couponMessage.type === 'success' ? 'text-green-600' : 'text-muted-foreground'}`}>
          {couponMessage.text}
        </p>
      )}
    </div>
  )}
</div>
                    
                    <hr />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount:</span>
                      {appliedCoupon || hasExistingCoupon ? (
                        <div className="text-right">
                          <span className="text-sm text-gray-500 line-through block">
                            ₹{formatIndianCurrency(getOriginalPrice())}
                          </span>
                          <span className="text-travel-primary text-xl">
                            ₹{formatIndianCurrency(finalPrice)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-travel-primary text-xl">
                          ₹{formatIndianCurrency(getTotalPrice())}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <Button 
                        className="w-full" 
                        onClick={handleBookThisTrip}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Book this trip
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Comments Section */}
              <div className="lg:col-span-2 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Communication Center
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Package Selector */}
                    {cartItems.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Select Package for Conversation:</label>
                        <Select value={selectedPackageForComments} onValueChange={setSelectedPackageForComments}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a package" />
                          </SelectTrigger>
                          <SelectContent>
                            {cartItems.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.packages?.title || `Package (ID: ${item.package_id})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Chat Messages */}
                    <div 
                      ref={chatContainerRef}
                      className="max-h-60 overflow-y-auto space-y-3 border rounded-lg p-4 bg-gray-50"
                    >
                      {cartItems.length > 0 && selectedPackageForComments ? (
                        (() => {
                          const packageConversations = conversations[selectedPackageForComments] || [];
                          return (
                            <>
                              {/* Conversation Messages */}
                              {packageConversations.length > 0 ? (
                                packageConversations.map((message) => (
                                  <div 
                                    key={message.id} 
                                    className={`flex ${message.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}
                                  >
                                    <div 
                                      className={`p-3 rounded-lg max-w-[80%] shadow-sm ${
                                        message.sender_type === 'customer' 
                                          ? 'bg-primary text-primary-foreground' 
                                          : 'bg-white border'
                                      }`}
                                    >
                                      <p className="text-sm">{message.message}</p>
                                      {message.attachment_url && (
                                        <a 
                                          href={message.attachment_url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-xs hover:underline mt-2 block flex items-center gap-1"
                                        >
                                          📎 View Attachment
                                        </a>
                                      )}
                                      <div className="flex items-center justify-between mt-1">
                                        <p
                                          className={`text-xs ${
                                            message.sender_type === "customer"
                                              ? "opacity-75"
                                              : "text-muted-foreground"
                                          }`}
                                        >
                                          {message.sender_type === "customer"
                                            ? ""
                                            : `Support Team | ${format(new Date(message.created_at), "MMM dd, HH:mm")}`}
                                        </p>

                                        {message.sender_type === "customer" && (
                                          <p
                                            className={`text-xs ${
                                              message.sender_type === "customer"
                                                ? "opacity-75"
                                                : "text-muted-foreground"
                                            }`}
                                          >
                                            {format(new Date(message.created_at), "MMM dd, HH:mm")}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                /* Empty state */
                                <div className="text-center text-gray-500 py-8">
                                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">No messages yet for this package. Start a conversation with our team!</p>
                                </div>
                              )}
                            </>
                          );
                        })()
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          <p className="text-sm">Select a package to start messaging</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Message Input */}
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Type your message here... Ask questions, make special requests, or share any concerns about your trip."
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                      <Button 
                        onClick={handleSaveComments}
                        disabled={savingComments || !comments.trim() || cartItems.length === 0 || !selectedPackageForComments}
                        size="sm"
                        className="w-full"
                      >
                        {savingComments ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sending Message...
                          </>
                        ) : (
                          <>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Send Message
                          </>
                        )}
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
                  
                  {(() => {
                    const itemOriginalPrice = getItemOriginalPrice(selectedPackage);
                    const itemPriceAfterCoupon = getItemPriceAfterCoupon(selectedPackage);
                    const itemCurrentPrice = selectedPackage.total_price + (selectedPackage.visa_cost || 0);
                    const hasDiscount = itemOriginalPrice > itemCurrentPrice;
                    const hasCoupon = selectedPackage.applied_coupon_details;
                    const hasAdminDiscount = selectedPackage.price_before_admin_discount && selectedPackage.price_before_admin_discount > selectedPackage.total_price;
                    
                    return hasDiscount ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Tag className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600 font-semibold">Discount Applied!</span>
                        </div>
                        
                        {/* Phase 1: Original Price */}
                        <div className="text-gray-500 line-through text-sm">
                          Original: ₹{formatIndianCurrency(itemOriginalPrice)}
                        </div>
                        
                        {/* Phase 2: After Coupon */}
                        {hasCoupon && (
                          <div className="text-sm text-blue-600">
                            After Coupon ({selectedPackage.applied_coupon_details}): ₹{formatIndianCurrency(itemPriceAfterCoupon)}
                          </div>
                        )}
                        
                        {/* Phase 3: After Admin Discount */}
                        {hasAdminDiscount && (
                          <div className="text-sm text-purple-600">
                            Admin Discount Applied
                          </div>
                        )}
                        
                        {/* Final Price */}
                        <div className="text-2xl font-bold text-travel-primary">
                          Final: ₹{formatIndianCurrency(itemCurrentPrice)}
                        </div>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-travel-primary">
                        ₹{formatIndianCurrency(itemCurrentPrice)}
                      </p>
                    );
                  })()}
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

      <MultiPackageBookingPopup
        open={isMultiBookingPopupOpen}
        onOpenChange={setIsMultiBookingPopupOpen}
        cartItems={cartItems}
        onBookingComplete={handleBookingComplete}
      />

      <CouponBrowser
        open={showCouponBrowser}
        onOpenChange={setShowCouponBrowser}
        onSelectCoupon={(code) => {
          setCouponCode(code);
          setShowCouponBrowser(false);
        }}
      />

      <Footer />
    </div>
  );
};

export default Cart;