import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, Users, Clock, MessageCircle, FileText, ChevronDown, ChevronUp, Info, Bell } from 'lucide-react';
import { toast } from "sonner";
import Navbar from '@/components/Navbar';

interface BookedPackage {
  id: string;
  package_id: string;
  days: number;
  total_price: number;
  price_before_admin_discount?: number | null;
  members: number;
  with_flights: boolean;
  selected_date: string;
  created_at: string;
  with_visa: boolean;
  visa_cost: number;
  phone_number: string;
  best_time_to_connect: string;
  comments: string;
  admin_response: string;
  admin_response_file_url: string;
  applied_coupon_details?: string | null;
  packages: {
    title: string;
    image: string;
    country: string;
    destinations: string[];
  };
}

// Helper function to calculate days left until travel and trip status
const getTripStatus = (selectedDate: string): { text: string; color: string; status: 'upcoming' | 'completed' | 'today' | 'soon' | 'future' } => {
  if (!selectedDate || selectedDate === '1970-01-01' || selectedDate === '0001-01-01') {
    return { text: 'Date not set', color: 'bg-gray-500', status: 'future' };
  }
  
  const travelDate = new Date(selectedDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if date is invalid
  if (isNaN(travelDate.getTime()) || travelDate.getFullYear() <= 1970) {
    return { text: 'Date not set', color: 'bg-gray-500', status: 'future' };
  }
  
  // Calculate difference in days
  const diffTime = travelDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // If trip is in the past
  if (diffDays < 0) {
    return { text: 'Trip completed', color: 'bg-green-500', status: 'completed' };
  }
  
  // If trip is today
  if (diffDays === 0) {
    return { text: 'Departing today!', color: 'bg-red-500', status: 'today' };
  }
  
  // If less than a week
  if (diffDays < 7) {
    return { text: 'Pack your bags!', color: 'bg-red-500', status: 'soon' };
  }
  
  // If less than a month (30 days)
  if (diffDays < 30) {
    return { text: `${diffDays} day${diffDays !== 1 ? 's' : ''} left`, color: 'bg-orange-500', status: 'upcoming' };
  }
  
  // If more than a month
  const weeks = Math.floor(diffDays / 7);
  const remainingDays = diffDays % 7;
  
  if (remainingDays === 0) {
    return { text: `${weeks} week${weeks !== 1 ? 's' : ''} left`, color: 'bg-blue-500', status: 'upcoming' };
  } else {
    return { text: `${diffDays} day${diffDays !== 1 ? 's' : ''} left`, color: 'bg-blue-500', status: 'upcoming' };
  }
};

interface Conversation {
  id: string;
  message: string;
  sender_type: string;
  sender_name: string | null;
  attachment_url: string | null;
  created_at: string;
}

type TripFilter = 'all' | 'upcoming' | 'completed';

const Booked = () => {
  const { user, isAuthenticated } = useAuth();
  const [bookedPackages, setBookedPackages] = useState<BookedPackage[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<BookedPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<{ [key: string]: Conversation[] }>({});
  const [newMessages, setNewMessages] = useState<{ [key: string]: string }>({});
  const [expandedPackages, setExpandedPackages] = useState<{ [key: string]: boolean }>({});
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<TripFilter>('all');

  const calculateOriginalPrice = (booking: BookedPackage): number => {
    if (!booking.applied_coupon_details) {
      return booking.price_before_admin_discount || booking.total_price;
    }
    
    const match = booking.applied_coupon_details.match(/(\d+)%/);
    if (match) {
      const discountPercent = parseInt(match[1]);
      const priceAfterCoupon = booking.price_before_admin_discount || booking.total_price;
      const originalPrice = priceAfterCoupon / (1 - discountPercent / 100);
      return Math.round(originalPrice);
    }
    
    return booking.price_before_admin_discount || booking.total_price;
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (selectedPackage) {
        const target = event.target as HTMLElement;
        if (target.classList.contains('fixed') && target.classList.contains('inset-0')) {
          setSelectedPackage(null);
        }
      }
    };

    if (selectedPackage) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [selectedPackage]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBookedPackages();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    filterPackages();
  }, [bookedPackages, activeFilter]);

  const filterPackages = () => {
    if (activeFilter === 'all') {
      setFilteredPackages(bookedPackages);
      return;
    }

    const filtered = bookedPackages.filter(booking => {
      const status = getTripStatus(booking.selected_date);
      if (activeFilter === 'upcoming') {
        return status.status !== 'completed';
      }
      if (activeFilter === 'completed') {
        return status.status === 'completed';
      }
      return true;
    });

    setFilteredPackages(filtered);
  };

  const fetchBookedPackages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cart')
        .select(`
          *,
          packages (
            title,
            image,
            country,
            destinations
          )
        `)
        .eq('user_id', user.id)
        .eq('booking_type', 'booking')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching booked packages:', error);
        toast.error('Failed to load booked packages');
        return;
      }

      setBookedPackages(data || []);
      
      if (data) {
        const conversationPromises = data.map(pkg => fetchConversations(pkg.id));
        await Promise.all(conversationPromises);
      }
    } catch (error) {
      console.error('Error in fetchBookedPackages:', error);
      toast.error('Failed to load booked packages');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async (cartItemId: string) => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('cart_item_id', cartItemId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      setConversations(prev => ({
        ...prev,
        [cartItemId]: data || []
      }));
      
      // Mark admin messages as read when customer views conversations
      try {
        await supabase.rpc('mark_messages_as_read', {
          p_cart_item_id: cartItemId,
          p_reader_type: 'customer'
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    } catch (error) {
      console.error('Error in fetchConversations:', error);
    }
  };

  const sendMessage = async (cartItemId: string) => {
    const message = newMessages[cartItemId]?.trim();
    if (!message || !user) return;

    try {
      const { error } = await supabase
        .from('conversations')
        .insert({
          cart_item_id: cartItemId,
          message,
          sender_type: 'customer',
          sender_name: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || user.email
        });

      if (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
        return;
      }

      setNewMessages(prev => ({ ...prev, [cartItemId]: '' }));

      // Mark admin messages as read when customer sends a message (customer has seen the conversation)
      try {
        await supabase.rpc('mark_messages_as_read', {
          p_cart_item_id: cartItemId,
          p_reader_type: 'customer'
        });
        
        // Force refresh of unread messages count after a short delay
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('refreshMessageCount'));
        }, 500);
      } catch (markError) {
        console.error('Error marking admin messages as read:', markError);
      }

      await fetchConversations(cartItemId);
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast.error('Failed to send message');
    }
  };

  const togglePackage = (packageId: string) => {
    setSelectedPackage(prev => prev === packageId ? null : packageId);
  };

  const toggleExpanded = (packageId: string) => {
    setExpandedPackages(prev => ({
      ...prev,
      [packageId]: !prev[packageId]
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="pt-32 flex items-center justify-center">
          <Card className="w-full max-w-md border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Info className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
              <p className="text-gray-600">You need to be logged in to view your booked packages.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-6"></div>
            <p className="text-xl text-gray-700 font-medium">Loading your booked packages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <div className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Your Booked Adventures
            </h1>
            <p className="text-lg text-gray-600 whitespace-nowrap mb-8">
  Explore your confirmed journeys through our interactive calendar view. Click on any destination to view details.
</p>

            
            {/* Navigation Tabs */}
            <div className="flex justify-center mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-gray-200 shadow-lg">
                <div className="flex space-x-2">
                  <Button
                    variant={activeFilter === 'all' ? 'default' : 'ghost'}
                    onClick={() => setActiveFilter('all')}
                    className={`rounded-xl px-6 py-2 font-medium transition-all duration-300 ${
                      activeFilter === 'all' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All Trips
                  </Button>
                  <Button
                    variant={activeFilter === 'upcoming' ? 'default' : 'ghost'}
                    onClick={() => setActiveFilter('upcoming')}
                    className={`rounded-xl px-6 py-2 font-medium transition-all duration-300 ${
                      activeFilter === 'upcoming' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Upcoming Travel
                  </Button>
                  <Button
                    variant={activeFilter === 'completed' ? 'default' : 'ghost'}
                    onClick={() => setActiveFilter('completed')}
                    className={`rounded-xl px-6 py-2 font-medium transition-all duration-300 ${
                      activeFilter === 'completed' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Trips Completed
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {filteredPackages.length === 0 ? (
            <div className="flex justify-center">
              <Card className="w-full max-w-2xl border-0 shadow-xl">
                <CardContent className="p-12 text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="h-12 w-12 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {activeFilter === 'all' 
                      ? 'No Booked Packages Yet' 
                      : activeFilter === 'upcoming' 
                        ? 'No Upcoming Trips' 
                        : 'No Completed Trips'}
                  </h3>
                  <p className="text-gray-600 mb-8 text-lg">
                    {activeFilter === 'all' 
                      ? 'Your travel calendar is empty. Start planning your next adventure!' 
                      : activeFilter === 'upcoming' 
                        ? 'You have no upcoming trips scheduled.' 
                        : 'You have no completed trips yet.'}
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/packages'}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-full text-lg font-medium transition-all duration-300 transform hover:scale-105"
                  >
                    Browse Amazing Packages
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Calendar View with Circular Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredPackages.map((booking) => {
                  const tripStatus = getTripStatus(booking.selected_date);
                  
                  return (
                    <div 
                      key={booking.id} 
                      className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                      onClick={() => togglePackage(booking.id)}
                    >
                      <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="aspect-square relative">
                          <img
                            src={booking.packages?.image || "/placeholder-image.jpg"}
                            alt={booking.packages?.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                          
                          {/* Animated Clock Badge */}
                          <div className="absolute top-4 right-4 z-10">
                            <div className={`flex items-center gap-1 ${tripStatus.color} bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 border border-white/30`}>
                              <div className="relative">
                                <Bell className="h-4 w-4 text-red-400 animate-bounce" />
                                <div className="absolute inset-0">
                                  <Bell className="h-4 w-4 text-red-300 animate-ping" />
                                </div>
                              </div>
                              <span className="text-white text-xs font-medium">
                                {tripStatus.text}
                              </span>
                            </div>
                          </div>
                          
                          {/* Country Name */}
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white font-bold text-xl mb-1">{booking.packages?.country}</h3>
                            <p className="text-white/90 text-sm">{booking.packages?.title}</p>
                            <div className="flex items-center text-white/80 text-xs mt-2">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>
                                {booking.selected_date && booking.selected_date !== '1970-01-01' && booking.selected_date !== '0001-01-01' && new Date(booking.selected_date).getFullYear() > 1970 
                                  ? new Date(booking.selected_date).toLocaleDateString() 
                                  : 'Not selected'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Expand Indicator */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                              <ChevronDown className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Expanded Package Details */}
              {selectedPackage && (
                <div 
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setSelectedPackage(null);
                    }
                  }}
                >
                  <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn"
                       onClick={(e) => e.stopPropagation()}
                  >
                    <div className="sticky top-0 bg-white rounded-t-3xl p-6 border-b border-gray-100 flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {bookedPackages.find(pkg => pkg.id === selectedPackage)?.packages?.title}
                      </h2>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setSelectedPackage(null)}
                        className="hover:bg-gray-100"
                      >
                        <ChevronUp className="h-6 w-6" />
                      </Button>
                    </div>
                    
                    <div className="p-6">
                      {bookedPackages.map((booking) => {
                        if (booking.id !== selectedPackage) return null;
                        
                        return (
                          <div key={booking.id}>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                              <div className="lg:col-span-1">
                                <img
                                  src={booking.packages?.image}
                                  alt={booking.packages?.title}
                                  className="w-full h-64 object-cover rounded-2xl shadow-lg"
                                />
                              </div>
                              <div className="lg:col-span-2 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="flex items-center p-4 bg-blue-50 rounded-xl">
                                    <MapPin className="h-5 w-5 text-blue-600 mr-3" />
                                    <div>
                                      <p className="text-sm text-gray-500">Destinations</p>
                                      <p className="font-medium text-gray-900">{booking.packages?.destinations?.join(', ')}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center p-4 bg-emerald-50 rounded-xl">
                                    <Calendar className="h-5 w-5 text-emerald-600 mr-3" />
                                    <div>
                                      <p className="text-sm text-gray-500">Travel Date</p>
                                      <p className="font-medium text-gray-900">
                                        {booking.selected_date && booking.selected_date !== '1970-01-01' && booking.selected_date !== '0001-01-01' && new Date(booking.selected_date).getFullYear() > 1970 
                                          ? new Date(booking.selected_date).toLocaleDateString() 
                                          : 'Not selected'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center p-4 bg-purple-50 rounded-xl">
                                    <Clock className="h-5 w-5 text-purple-600 mr-3" />
                                    <div>
                                      <p className="text-sm text-gray-500">Duration</p>
                                      <p className="font-medium text-gray-900">{booking.days} Days</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center p-4 bg-orange-50 rounded-xl">
                                    <Clock className="h-5 w-5 text-orange-600 mr-3" />
                                    <div>
                                      <p className="text-sm text-gray-500">Booked On</p>
                                      <p className="font-medium text-gray-900">{new Date(booking.created_at).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center p-4 bg-green-50 rounded-xl md:col-span-2">
                                    <Users className="h-5 w-5 text-green-600 mr-3" />
                                    <div>
                                      <p className="text-sm text-gray-500">Travelers</p>
                                      <p className="font-medium text-gray-900">{booking.members} Member{booking.members > 1 ? 's' : ''}</p>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Pricing Details Section */}
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl">
                                  <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                                    <span>Pricing Details</span>
                                  </h4>
                                  <div className="space-y-3">
                                    {booking.applied_coupon_details && (
                                      <>
                                        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                          <span className="text-gray-600">Original Price:</span>
                                          <span className="line-through text-gray-500 font-medium">
                                            ₹{calculateOriginalPrice(booking).toLocaleString()}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-blue-100 rounded-lg">
                                          <span className="text-blue-700">Coupon Discount:</span>
                                          <span className="text-blue-600 font-bold">
                                            {booking.applied_coupon_details}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                          <span className="text-gray-600">Price after coupon:</span>
                                          <span className="font-medium">
                                            ₹{(booking.price_before_admin_discount || booking.total_price).toLocaleString()}
                                          </span>
                                        </div>
                                      </>
                                    )}
                                    
                                    {!booking.applied_coupon_details && (
                                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                        <span className="text-gray-600">Original Price:</span>
                                        <span className="font-medium">
                                          ₹{(booking.price_before_admin_discount || booking.total_price).toLocaleString()}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {booking.price_before_admin_discount && booking.price_before_admin_discount !== booking.total_price && (
                                      <div className="flex justify-between items-center p-3 bg-red-100 rounded-lg">
                                        <span className="text-red-700">Admin Discount:</span>
                                        <span className="text-red-600 font-bold">
                                          -{Math.round((1 - booking.total_price / booking.price_before_admin_discount) * 100)}%
                                        </span>
                                      </div>
                                    )}
                                    
                                    {booking.with_visa && (
                                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                        <span className="text-gray-600">Visa Cost:</span>
                                        <span className="font-medium">
                                          ₹{(booking.visa_cost || 0).toLocaleString()}
                                        </span>
                                      </div>
                                    )}
                                    
                                    <div className="flex justify-between items-center p-4 bg-green-100 rounded-lg border-t-2 border-green-200 mt-2">
                                      <span className="font-bold text-green-800">Final Price:</span>
                                      <span className="text-green-600 font-bold text-xl">
                                        ₹{(booking.total_price + (booking.visa_cost || 0)).toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Conversation Section */}
                            <div className="border-t pt-6">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-lg text-gray-900 flex items-center">
                                  <MessageCircle className="h-5 w-5 mr-2" />
                                  Conversation
                                </h4>
                                <Button
                                  variant="outline"
                                  onClick={() => toggleExpanded(booking.id)}
                                  className="flex items-center gap-2"
                                >
                                  {expandedPackages[booking.id] ? 'Hide Messages' : 'View Messages'}
                                </Button>
                              </div>
                              
                              {expandedPackages[booking.id] && (
                                <div className="space-y-4">
                                  <div className="max-h-64 overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-xl">
                                    {conversations[booking.id]?.map((conv) => (
                                      <div
                                        key={conv.id}
                                        className={`p-4 rounded-xl ${
                                          conv.sender_type === 'customer'
                                            ? 'bg-blue-100 border-l-4 border-blue-500'
                                            : 'bg-gray-100 border-l-4 border-gray-400'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="font-medium text-sm text-gray-800">
                                            {conv.sender_type === 'customer' ? 'You' : 'Admin'}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {new Date(conv.created_at).toLocaleString()}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">{conv.message}</p>
                                        {conv.attachment_url && (
                                          <div className="mt-3">
                                            <a
                                              href={conv.attachment_url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                              <FileText className="h-4 w-4" />
                                              View Attachment
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                  
                                  <div className="flex gap-3 mt-4">
                                    <Textarea
                                      placeholder="Type your message to the travel team..."
                                      value={newMessages[booking.id] || ''}
                                      onChange={(e) => setNewMessages(prev => ({
                                        ...prev,
                                        [booking.id]: e.target.value
                                      }))}
                                      className="min-h-[80px] rounded-xl"
                                    />
                                    <Button
                                      onClick={() => sendMessage(booking.id)}
                                      disabled={!newMessages[booking.id]?.trim()}
                                      className="self-end px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300"
                                    >
                                      Send
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booked;