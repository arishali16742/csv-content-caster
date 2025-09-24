import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Calendar, Clock, FileText, Loader2, Plane, User, Users, Phone, MessageSquare, ShoppingCart, BookCheck, Upload, Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FetchedCartItem {
  id: string;
  package_id: string;
  days: number;
  total_price: number;
  price_before_admin_discount?: number | null;
  members?: number;
  with_flights?: boolean;
  selected_date?: string;
  created_at: string;
  updated_at?: string;
  with_visa?: boolean;
  visa_cost?: number;
  user_id: string;
  phone_number?: string | null;
  best_time_to_connect?: string | null;
  booking_type?: string;
  applied_coupon_details?: string | null;
  comments?: string | null;
  admin_response?: string | null;
  admin_response_file_url?: string | null;
  packages?: {
    title: string;
    country: string;
    destinations: string[];
  };
  profile?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email?: string | null;
  } | null;
}

const BookingListItem = ({ booking, onSelect }: { booking: FetchedCartItem; onSelect: (id: string) => void }) => (
  <div className="p-3 rounded-md border hover:bg-accent hover:text-accent-foreground cursor-pointer" onClick={() => onSelect(booking.id)}>
    <div className="flex justify-between items-center">
      <p className="font-semibold text-sm truncate pr-2">
        {booking.profile?.email || 'N/A'}
      </p>
      <div className="flex items-center gap-2">
        {booking.booking_type === 'booked' || booking.booking_type === 'booking' ? (
          <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">Booked</Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">In Cart</Badge>
        )}
      </div>
    </div>
    <p className="text-xs text-muted-foreground mt-1 truncate">{booking.packages?.title || 'Package details not found'}</p>
    <p className="text-xs text-muted-foreground mt-1 font-mono">{booking.id.substring(0,18)}...</p>
  </div>
);

const CartReviewManagement = () => {
  const [bookingId, setBookingId] = useState('');
  const [cartItem, setCartItem] = useState<FetchedCartItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [allBookings, setAllBookings] = useState<FetchedCartItem[]>([]);
  const [fetchingAll, setFetchingAll] = useState(true);
  const [discountPercent, setDiscountPercent] = useState<number | ''>('');
  const [updating, setUpdating] = useState(false);
  const [bookingTypeFilter, setBookingTypeFilter] = useState('all');
  const [adminResponse, setAdminResponse] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [sendingResponse, setSendingResponse] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Real-time subscription for conversations
  useEffect(() => {
    if (!cartItem?.id) return;

    const channel = supabase
      .channel(`conversations_${cartItem.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `cart_item_id=eq.${cartItem.id}`,
        },
        (payload) => {
          console.log('Conversation updated:', payload);
          loadConversations(cartItem.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cartItem?.id]);

  // Real-time subscription for all bookings
  useEffect(() => {
    const channel = supabase
      .channel('cart_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart',
        },
        () => {
          fetchAllBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAllBookings = async () => {
    setFetchingAll(true);
    try {
      const { data, error } = await supabase.rpc('get_all_bookings_with_details');
      if (error) {
        if (error.message.includes('User is not an admin')) {
          toast({
            title: 'Permission Denied',
            description: "You don't have permission to view bookings.",
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        return;
      }
      if (data) {
        const bookingsWithProfiles = data.map((item: any) => ({
          ...item,
          packages: item.package_title ? {
            title: item.package_title,
            country: item.package_country,
            destinations: item.package_destinations,
          } : null,
          profile: item.profile_email ? {
            id: item.user_id,
            first_name: item.profile_first_name,
            last_name: item.profile_last_name,
            email: item.profile_email,
          } : null,
        }));
        setAllBookings(bookingsWithProfiles as FetchedCartItem[]);
      }
    } catch (error: any) {
      toast({
        title: 'Error fetching bookings',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setFetchingAll(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, [toast]);

  // Set up real-time subscription for cart updates
  useEffect(() => {
    const channel = supabase
      .channel('cart_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart',
        },
        (payload) => {
          console.log('Cart update received:', payload);
          fetchAllBookings(); // Refresh the bookings list
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadConversations = async (cartItemId: string) => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('cart_item_id', cartItemId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading conversations:', error);
        return;
      }
      setConversations(data || []);
      
      // Auto-scroll to bottom after conversations are loaded
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
      
      // Do NOT mark messages as read just by viewing - only when admin replies
      // This will be handled in the handleSendAdminResponse function
    } catch (error) {
      console.error('Error in loadConversations:', error);
    }
  };

  const handleSearch = async (id?: string) => {
    const searchId = id || bookingId;
    if (!searchId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter or select a Booking ID.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    setCartItem(null);
    setDiscountPercent('');
    try {
      const { data: cartData, error: cartError } = await supabase
        .from('cart')
        .select('*, packages(*)')
        .eq('id', searchId.trim())
        .maybeSingle();

      if (cartError) {
        throw new Error(cartError.message);
      }

      if (!cartData) {
        toast({
          title: 'Not Found',
          description: 'No booking found with that ID.',
        });
        return;
      }

      let profileData = null;
      if (cartData.user_id) {
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', cartData.user_id)
          .maybeSingle();

        if (profileError) {
          console.warn('Could not fetch user profile:', profileError.message);
        } else {
          profileData = userProfile;
        }
      }

      setCartItem({
        ...cartData,
        profile: profileData
      });
      
      // Load conversations for this cart item
      await loadConversations(cartData.id);
    } catch (error: any) {
      console.error('Search failed:', error);
      toast({
        title: 'Search Failed',
        description: error.message || 'Could not retrieve booking details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBooking = async (id: string) => {
    setBookingId(id);
    const booking = allBookings.find(b => b.id === id);
    if (booking) {
      setCartItem(booking);
      setDiscountPercent('');
      await loadConversations(booking.id);
      
      // Only mark non-message admin notifications as read when viewing a booking
      try {
        const { error } = await supabase
          .from('admin_notifications')
          .update({ is_read: true })
          .eq('cart_item_id', id)
          .neq('notification_type', 'new_message') // Don't mark message notifications as read
          .eq('is_read', false);
        
        if (error) {
          console.error('Error marking non-message notifications as read:', error);
        }
      } catch (error) {
        console.error('Error in marking non-message notifications as read:', error);
      }
    } else {
      // Fallback to search if not found in the list
      handleSearch(id);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type (PDFs only)
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid File Type',
        description: 'Only PDF files are allowed.',
        variant: 'destructive',
      });
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'File size must be less than 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingFile(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `admin-responses/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('package-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('package-images')
        .getPublicUrl(filePath);

      // Send response with file
      await handleSendAdminResponse(urlData.publicUrl);
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSendAdminResponse = async (fileUrl?: string) => {
    if (!cartItem || (!adminResponse.trim() && !fileUrl)) {
      toast({
        title: 'Invalid Response',
        description: 'Please enter a message or attach a file.',
        variant: 'destructive',
      });
      return;
    }

    setSendingResponse(true);
    try {
      // Insert new conversation message
      const { error } = await supabase
        .from('conversations')
        .insert({
          cart_item_id: cartItem.id,
          message: adminResponse.trim(),
          sender_type: 'admin',
          sender_name: 'Support Team',
          attachment_url: fileUrl || null
        });

      if (error) throw error;

      // Mark customer messages as read ONLY when admin replies (not just views)
      await supabase.rpc('mark_messages_as_read', {
        p_cart_item_id: cartItem.id,
        p_reader_type: 'admin'
      });
      
      // Mark related admin notifications as read when admin replies
      try {
        const { error: notifError } = await supabase
          .from('admin_notifications')
          .update({ is_read: true })
          .eq('cart_item_id', cartItem.id)
          .eq('notification_type', 'new_message')
          .eq('is_read', false);
        
        if (notifError) {
          console.error('Error marking message notifications as read:', notifError);
        }
      } catch (error) {
        console.error('Error in marking message notifications as read:', error);
      }

      setAdminResponse('');
      toast({
        title: 'Response Sent',
        description: 'Your response has been sent to the customer.',
      });

      // Reload conversations to show the new message
      await loadConversations(cartItem.id);
      
      // Force refresh of unread messages count after a short delay
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('refreshMessageCount'));
      }, 500);
    } catch (error: any) {
      toast({
        title: 'Send Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSendingResponse(false);
    }
  };

  const handleApplyDiscount = async () => {
    if (!cartItem || discountPercent === '' || +discountPercent < 0 || +discountPercent > 100) {
      toast({
        title: 'Invalid discount',
        description: 'Please enter a valid discount percentage (0-100).',
        variant: 'destructive'
      });
      return;
    }

    setUpdating(true);
    const originalPrice = cartItem.price_before_admin_discount || cartItem.total_price;
    const discountAmount = originalPrice * (Number(discountPercent) / 100);
    const newPrice = originalPrice - discountAmount;

    try {
      const { data, error } = await supabase
        .from('cart')
        .update({
          total_price: newPrice,
          price_before_admin_discount: originalPrice,
          updated_at: new Date().toISOString()
        })
        .eq('id', cartItem.id)
        .select('id, total_price, price_before_admin_discount, updated_at')
        .single();

      if (error) throw error;

      if (data) {
        const updatedCartItem: FetchedCartItem = {
          ...cartItem,
          total_price: data.total_price,
          price_before_admin_discount: data.price_before_admin_discount,
          updated_at: data.updated_at,
        };
        setCartItem(updatedCartItem);
        const updatedBookings = allBookings.map(b => b.id === data.id ? updatedCartItem : b);
        setAllBookings(updatedBookings);
      }

      setDiscountPercent('');
      toast({
        title: 'Success',
        description: 'Discount applied successfully.'
      });
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  };

  const filteredBookings = allBookings.filter(booking => {
    if (bookingTypeFilter === 'all') return true;
    if (bookingTypeFilter === 'cart') return booking.booking_type === 'cart';
    if (bookingTypeFilter === 'booked') return booking.booking_type === 'booking';
    return booking.booking_type === bookingTypeFilter;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Review a Booking</CardTitle>
            <p className="text-sm text-muted-foreground">Enter the booking ID or select from the list to retrieve details.</p>
          </CardHeader>
          <CardContent>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                type="text"
                placeholder="Booking ID"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={() => handleSearch()} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Search
              </Button>
            </div>

            {cartItem && (
              <Card className="mt-6">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{cartItem.packages?.title}</CardTitle>
                      <p className="text-sm text-gray-500">Booking ID: {cartItem.id}</p>
                    </div>
                    <Badge
                      variant={cartItem.booking_type === 'booked' ? 'default' : 'secondary'}
                      className={cartItem.booking_type === 'booked' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                    >
                      {cartItem.booking_type === 'booked' ? 'Booked' : 'In Cart'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border p-3 rounded-lg bg-slate-50/50">
                    <h4 className="font-semibold text-md mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      {cartItem.profile?.email && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-600" />
                          <strong>User:</strong>
                          <span> {cartItem.profile.email} </span>
                          <span className="text-xs text-gray-500">(ID: {cartItem.user_id})</span>
                        </div>
                      )}
                      {cartItem.phone_number && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-600" />
                          <strong>Phone:</strong>
                          <span>{cartItem.phone_number}</span>
                        </div>
                      )}
                      {cartItem.best_time_to_connect && (
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-600" />
                          <strong>Best time to connect:</strong>
                          <span>{cartItem.best_time_to_connect}</span>
                          <Badge variant="outline">{format(new Date(cartItem.updated_at || cartItem.created_at), 'Pp')}</Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Badge variant="outline" className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {cartItem.days} Days</Badge>
                    <Badge variant="outline" className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {cartItem.members || 1} Members</Badge>
                    <Badge variant="outline" className="flex items-center gap-1.5"><Plane className="h-4 w-4" /> {cartItem.with_flights ? 'With Flights' : 'No Flights'}</Badge>
                    {cartItem.with_visa && <Badge variant="outline" className="flex items-center gap-1.5"><FileText className="h-4 w-4" /> Visa Included</Badge>}
                  </div>

                  {cartItem.selected_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <strong>Travel Date:</strong>
                      <span>{format(new Date(cartItem.selected_date), 'PPP')}</span>
                    </div>
                  )}

                  <div>
  <h4 className="font-semibold text-md mb-2">Pricing Details</h4>
  <div className="text-sm space-y-1 pl-4 border-l-2">
    {(() => {
      // Calculate original price and coupon details
      let originalPrice = cartItem.total_price;
      let couponPercentage = 0;
      let priceAfterCoupon = cartItem.total_price;
      
      if (cartItem.applied_coupon_details) {
        const couponMatch = cartItem.applied_coupon_details.match(/(\d+)%/);
        if (couponMatch) {
          couponPercentage = parseInt(couponMatch[1]);
          // Calculate original price before any discounts
          if (cartItem.price_before_admin_discount) {
            // Has admin discount: final_price = (original_price * (1 - coupon/100)) * (1 - admin_discount/100)
            // So original_price = final_price / ((1 - coupon/100) * (1 - admin_discount/100))
            const adminDiscountAmount = cartItem.price_before_admin_discount - cartItem.total_price;
            const adminDiscountPercent = (adminDiscountAmount / cartItem.price_before_admin_discount) * 100;
            originalPrice = cartItem.total_price / ((1 - couponPercentage / 100) * (1 - adminDiscountPercent / 100));
            priceAfterCoupon = originalPrice * (1 - couponPercentage / 100);
          } else {
            // No admin discount: final_price = original_price * (1 - coupon/100)
            originalPrice = cartItem.total_price / (1 - couponPercentage / 100);
            priceAfterCoupon = cartItem.total_price;
          }
        }
      } else if (cartItem.price_before_admin_discount) {
        // No coupon but has admin discount
        originalPrice = cartItem.price_before_admin_discount;
        priceAfterCoupon = cartItem.price_before_admin_discount;
      }

      const finalPrice = cartItem.total_price + (cartItem.visa_cost || 0);
      const hasAdminDiscount = cartItem.price_before_admin_discount && 
                              cartItem.price_before_admin_discount !== cartItem.total_price;
      
      const adminDiscountAmount = hasAdminDiscount ? 
        priceAfterCoupon - cartItem.total_price : 0;
      
      const adminDiscountPercent = hasAdminDiscount ? 
        (adminDiscountAmount / priceAfterCoupon * 100) : 0;

      return (
        <>
          <p>Original Price: ₹{Math.round(originalPrice).toLocaleString()}</p>
          
          {cartItem.applied_coupon_details && couponPercentage > 0 && (
            <>
              <p>
                <strong>Coupon: </strong>
                <span className="font-bold text-blue-600">{cartItem.applied_coupon_details}</span>
                <span> (-₹{Math.round(originalPrice * couponPercentage / 100).toLocaleString()})</span>
              </p>
              <p>Price after coupon: ₹{Math.round(priceAfterCoupon).toLocaleString()}</p>
            </>
          )}
          
          {hasAdminDiscount && (
            <p>Admin Discount: {Math.round(adminDiscountPercent)}% (-₹{Math.round(adminDiscountAmount).toLocaleString()})</p>
          )}
          
          {cartItem.with_visa && <p>Visa Cost: ₹{(cartItem.visa_cost || 0).toLocaleString()}</p>}
          
          {/* Final Price - always shown in green as the last item */}
          <p className="text-green-600 font-bold text-base">
            Final Price: ₹{finalPrice.toLocaleString()}
          </p>
        </>
      );
    })()}
  </div>
</div>

                  <div>
                    <h4 className="font-semibold text-md mb-2">Admin Discount</h4>
                    <div className="flex items-center space-x-2 max-w-sm">
                      <Input
                        type="number"
                        placeholder="Discount %"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-32"
                        min="0"
                        max="100"
                      />
                      <Button onClick={handleApplyDiscount} disabled={updating}>
                        {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Apply Discount
                      </Button>
                    </div>
                  </div>

                  {/* WhatsApp-style Communication Interface */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 p-3 border-b">
                      <h4 className="font-semibold text-md">Customer Communication</h4>
                    </div>
                    
                    <div 
                      ref={chatContainerRef}
                      className="h-80 overflow-y-auto p-4 space-y-4"
                    >
                      {conversations.length > 0 ? (
                        conversations.map((message) => (
                          <div key={message.id} className={`flex ${message.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-lg max-w-[80%] text-sm ${
                              message.sender_type === 'customer' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-200 text-gray-800'
                            }`}>
                              <p>{message.message}</p>
                              {message.attachment_url && (
                                <a
                                  href={message.attachment_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs hover:underline mt-1 block"
                                >
                                  📎 View Attachment
                                </a>
                              )}
                              <div className="flex items-center justify-between mt-1">
                                <p className={`text-xs ${
                                  message.sender_type === "customer" ? "opacity-75" : "text-gray-500"
                                }`}>
                                  {message.sender_type === "customer" 
                                    ? `Customer | ${format(new Date(message.created_at), "MMM dd, HH:mm")}` 
                                    : `Admin | ${format(new Date(message.created_at), "MMM dd, HH:mm")}`
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No conversation yet.</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3 border-t bg-gray-50">
                      <Textarea
                        placeholder="Type your response to the customer..."
                        value={adminResponse}
                        onChange={(e) => setAdminResponse(e.target.value)}
                        rows={2}
                        className="resize-none mb-2"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleSendAdminResponse()}
                          disabled={sendingResponse || (!adminResponse.trim())}
                          size="sm"
                        >
                          {sendingResponse ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="mr-2 h-4 w-4" />
                          )}
                          Send Response
                        </Button>
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingFile}
                          size="sm"
                          variant="outline"
                        >
                          {uploadingFile ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="mr-2 h-4 w-4" />
                          )}
                          Upload PDF
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept=".pdf"
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
            <div className="pt-2">
              <div className="flex items-center space-x-2">
                <Button
                  variant={bookingTypeFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBookingTypeFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={bookingTypeFilter === 'booked' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBookingTypeFilter('booked')}
                  className={bookingTypeFilter === 'booked' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                >
                  <BookCheck className="mr-2 h-4 w-4" />
                  Booked
                </Button>
                <Button
                  variant={bookingTypeFilter === 'cart' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBookingTypeFilter('cart')}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  In Cart
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {fetchingAll ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {filteredBookings.map((booking) => (
                    <BookingListItem
                      key={booking.id}
                      booking={booking}
                      onSelect={handleSelectBooking}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CartReviewManagement;