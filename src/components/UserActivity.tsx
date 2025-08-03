
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import Navbar from './Navbar';
import Footer from './Footer';
import { Calendar, MapPin, ShoppingCart, Eye, Filter, Search, Clock, User } from 'lucide-react';

interface UserActivity {
  id: string;
  user_id: string;
  action_type: string;
  item_type: string;
  item_id: string;
  item_name: string;
  created_at: string;
  user_email?: string;
}

const UserActivity = () => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadUserActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('user_activities' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        console.error('Error loading user activities:', error);
        return;
      }

      const typedData = (data || []) as unknown as UserActivity[];
      setActivities(typedData);
      setFilteredActivities(typedData);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserActivities();
  }, []);

  useEffect(() => {
    let filtered = [...activities];

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(activity => activity.action_type === filterType);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredActivities(filtered);
    setCurrentPage(1);
  }, [activities, filterType, sortBy, searchTerm]);

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'view':
        return <Eye className="h-4 w-4" />;
      case 'add_to_cart':
        return <ShoppingCart className="h-4 w-4" />;
      case 'book':
        return <Calendar className="h-4 w-4" />;
      case 'search':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'view':
        return 'secondary';
      case 'add_to_cart':
        return 'default';
      case 'book':
        return 'destructive';
      case 'search':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case 'view':
        return 'Viewed';
      case 'add_to_cart':
        return 'Added to Cart';
      case 'book':
        return 'Booked';
      case 'search':
        return 'Searched';
      default:
        return actionType.replace('_', ' ').toUpperCase();
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const uniqueActionTypes = [...new Set(activities.map(a => a.action_type))];
  
  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = filteredActivities.slice(startIndex, endIndex);

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold">User Activity Dashboard</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Real-time Activity Feed</span>
            </div>
          </div>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8">
            <Card>
              <CardContent className="p-4 md:p-6 text-center">
                <Eye className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-blue-500" />
                <h3 className="font-semibold text-sm md:text-base">Total Views</h3>
                <p className="text-lg md:text-2xl font-bold">
                  {activities.filter(a => a.action_type === 'view').length}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 md:p-6 text-center">
                <ShoppingCart className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-green-500" />
                <h3 className="font-semibold text-sm md:text-base">Cart Adds</h3>
                <p className="text-lg md:text-2xl font-bold">
                  {activities.filter(a => a.action_type === 'add_to_cart').length}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 md:p-6 text-center">
                <Calendar className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-red-500" />
                <h3 className="font-semibold text-sm md:text-base">Bookings</h3>
                <p className="text-lg md:text-2xl font-bold">
                  {activities.filter(a => a.action_type === 'book').length}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 md:p-6 text-center">
                <MapPin className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-purple-500" />
                <h3 className="font-semibold text-sm md:text-base">Searches</h3>
                <p className="text-lg md:text-2xl font-bold">
                  {activities.filter(a => a.action_type === 'search').length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by package name or user email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full sm:w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Activities</SelectItem>
                      {uniqueActionTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {getActionLabel(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Activity Timeline</span>
                <Badge variant="outline">{filteredActivities.length} activities</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <Calendar className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-gray-600">No activities match your current filters.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentActivities.map((activity, index) => (
                    <div 
                      key={activity.id} 
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors relative"
                    >
                      {/* Timeline connector */}
                      {index < currentActivities.length - 1 && (
                        <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200"></div>
                      )}
                      
                      <div className="flex-shrink-0 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                        {getActionIcon(activity.action_type)}
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={getActionColor(activity.action_type) as any} className="text-xs">
                              {getActionLabel(activity.action_type)}
                            </Badge>
                            <span className="text-sm text-gray-500">{activity.item_type}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <User className="h-3 w-3" />
                            <span className="truncate max-w-32">{activity.user_email || 'Anonymous'}</span>
                          </div>
                        </div>
                        
                        <h4 className="font-semibold mt-1 mb-1 text-sm md:text-base">{activity.item_name}</h4>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            {new Date(activity.created_at).toLocaleDateString()} at{' '}
                            {new Date(activity.created_at).toLocaleTimeString()}
                          </div>
                          <div className="text-xs font-medium text-travel-primary">
                            {getTimeAgo(activity.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredActivities.length)} of {filteredActivities.length}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserActivity;
