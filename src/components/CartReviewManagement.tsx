import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar, Clock, FileText, Loader2, Plane, User, Users, Phone, MessageSquare, ShoppingCart, BookCheck } from 'lucide-react';
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
    <div
        className="p-3 rounded-md border hover:bg-accent hover:text-accent-foreground cursor-pointer"
        onClick={() => onSelect(booking.id)}
    >
        <div className="flex justify-between items-center">
            <p className="font-semibold text-sm truncate pr-2">
                {booking.profile?.email || 'N/A'}
            </p>
            <div className="flex items-center gap-2">
                {booking.booking_type === 'booked' ? (
                     <Badge variant="default" className="text-xs bg-blue-500 hover:bg-blue-600">Booked</Badge>
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
    const [bookingTypeFilter, setBookingTypeFilter] = useState('all'); // 'all', 'booked', 'cart'
    const { toast } = useToast();

    useEffect(() => {
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

        fetchAllBookings();
    }, [toast]);

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

            setCartItem({ ...cartData, profile: profileData });

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
    
    const handleSelectBooking = (id: string) => {
        setBookingId(id);
        const booking = allBookings.find(b => b.id === id);
        if (booking) {
            setCartItem(booking);
            setDiscountPercent('');
        } else {
            // Fallback to search if not found in the list
            handleSearch(id);
        }
    };

    const handleApplyDiscount = async () => {
        if (!cartItem || discountPercent === '' || +discountPercent < 0 || +discountPercent > 100) {
            toast({ title: 'Invalid discount', description: 'Please enter a valid discount percentage (0-100).', variant: 'destructive' });
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
            
            toast({ title: 'Success', description: 'Discount applied successfully.' });
        } catch (error: any) {
            toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
        } finally {
            setUpdating(false);
        }
    };

    const filteredBookings = allBookings.filter(booking => {
        if (bookingTypeFilter === 'all') return true;
        if (bookingTypeFilter === 'cart' && booking.booking_type !== 'booked') return true;
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
                                        <Badge variant={cartItem.booking_type === 'booked' ? 'default' : 'secondary'} className={cartItem.booking_type === 'booked' ? 'bg-blue-500 hover:bg-blue-600' : ''}>
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
                                                    <span>
                                                        {cartItem.profile.email}
                                                    </span>
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
                                            {cartItem.price_before_admin_discount ? (
                                                <>
                                                    <p>Original Price: <span className="line-through">₹{cartItem.price_before_admin_discount.toLocaleString()}</span></p>
                                                    <p className="text-green-600 font-bold">Discounted Price: ₹{cartItem.total_price.toLocaleString()}</p>
                                                </>
                                            ) : (
                                                <p>Package Price: ₹{cartItem.total_price.toLocaleString()}</p>
                                            )}
                                            {cartItem.with_visa && <p>Visa Cost: ₹{(cartItem.visa_cost || 0).toLocaleString()}</p>}
                                            <p>
                                                <strong>Coupon: </strong>
                                                {cartItem.applied_coupon_details ? (
                                                    <span className="font-bold text-blue-600">{cartItem.applied_coupon_details}</span>
                                                ) : (
                                                    <span>None</span>
                                                )}
                                            </p>
                                            <p className="font-bold text-base">Total: ₹{(cartItem.total_price + (cartItem.visa_cost || 0)).toLocaleString()}</p>
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
