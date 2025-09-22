import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, Users, Clock, MessageCircle, FileText } from 'lucide-react';
import { toast } from "sonner";
import Navbar from '@/components/Navbar';

interface BookedPackage {
  id: string;
  package_id: string;
  days: number;
  total_price: number;
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
  packages: {
    title: string;
    image: string;
    country: string;
    destinations: string[];
  };
}

interface Conversation {
  id: string;
  message: string;
  sender_type: string;
  sender_name: string | null;
  attachment_url: string | null;
  created_at: string;
}

const Booked = () => {
  const { user, isAuthenticated } = useAuth();
  const [bookedPackages, setBookedPackages] = useState<BookedPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<{ [key: string]: Conversation[] }>({});
  const [newMessages, setNewMessages] = useState<{ [key: string]: string }>({});
  const [expandedPackages, setExpandedPackages] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBookedPackages();
    }
  }, [isAuthenticated, user]);

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
      
      // Fetch conversations for each booked package
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
      await fetchConversations(cartItemId);
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast.error('Failed to send message');
    }
  };

  const toggleExpanded = (packageId: string) => {
    setExpandedPackages(prev => ({
      ...prev,
      [packageId]: !prev[packageId]
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-32 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Please Login</h2>
              <p className="text-gray-600">You need to be logged in to view your booked packages.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-travel-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your booked packages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Booked Packages</h1>
            <p className="text-gray-600">Manage and track your confirmed bookings</p>
          </div>

          {bookedPackages.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Booked Packages</h3>
                <p className="text-gray-600 mb-6">You haven't booked any packages yet.</p>
                <Button onClick={() => window.location.href = '/packages'}>
                  Browse Packages
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {bookedPackages.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <div className="relative">
                    <div className="absolute top-4 right-4 z-10">
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                        BOOKED
                      </Badge>
                    </div>
                    <div className="md:flex">
                      <div className="md:w-1/3">
                        <img
                          src={booking.packages?.image}
                          alt={booking.packages?.title}
                          className="w-full h-48 md:h-full object-cover"
                        />
                      </div>
                      <div className="md:w-2/3 p-6">
                        <CardHeader className="p-0 mb-4">
                          <CardTitle className="text-xl font-bold text-gray-900">
                            {booking.packages?.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span>{booking.packages?.destinations?.join(', ')}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{booking.days} Days</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Users className="h-4 w-4 mr-2" />
                              <span>{booking.members} Member{booking.members > 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>Booked on {new Date(booking.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <div className="text-2xl font-bold text-travel-primary">
                              ₹{booking.total_price.toLocaleString()}
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => toggleExpanded(booking.id)}
                              className="flex items-center gap-2"
                            >
                              <MessageCircle className="h-4 w-4" />
                              {expandedPackages[booking.id] ? 'Hide' : 'View'} Messages
                            </Button>
                          </div>

                          {expandedPackages[booking.id] && (
                            <div className="border-t pt-4">
                              <h4 className="font-semibold mb-3 text-gray-900">Conversation</h4>
                              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                                {conversations[booking.id]?.map((conv) => (
                                  <div
                                    key={conv.id}
                                    className={`p-3 rounded-lg ${
                                      conv.sender_type === 'customer'
                                        ? 'bg-blue-50 ml-4'
                                        : 'bg-gray-50 mr-4'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-medium text-sm">
                                        {conv.sender_type === 'customer' ? 'You' : 'Admin'}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(conv.created_at).toLocaleString()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700">{conv.message}</p>
                                    {conv.attachment_url && (
                                      <div className="mt-2">
                                        <a
                                          href={conv.attachment_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                        >
                                          <FileText className="h-3 w-3" />
                                          View Attachment
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <div className="flex gap-2">
                                <Textarea
                                  placeholder="Type your message..."
                                  value={newMessages[booking.id] || ''}
                                  onChange={(e) => setNewMessages(prev => ({
                                    ...prev,
                                    [booking.id]: e.target.value
                                  }))}
                                  className="min-h-[60px]"
                                />
                                <Button
                                  onClick={() => sendMessage(booking.id)}
                                  disabled={!newMessages[booking.id]?.trim()}
                                  className="self-end"
                                >
                                  Send
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booked;