import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, User, Search, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  author: string;
  author_image?: string;
  published: boolean;
  created_at: string;
  position: number;
  category?: string;
  categories?: string[];
  editor_name?: string;
  date_written?: string;
  show_on_homepage?: boolean;
}

const Blog = () => {
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All Categories');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    'All Categories',
    'Destination Guides',
    'Food Trails',
    'Budget Hacks',
    'Hidden Gems',
    'Travel Tips'
  ];

  const popularTags = [
    '#BaliVibes',
    '#BudgetTravel',
    '#FoodieTravel',
    '#SoloTrip',
    '#IslandLife',
    '#CityBreak',
    '#Backpacking',
    '#LuxuryTravel'
  ];

  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('blog')
          .select('*')
          .eq('published', true)
          .order('position', { ascending: true });
        
        if (data) {
          setBlogPosts(data);
          setFilteredPosts(data);
        } else if (error) {
          console.error('Error loading blog posts:', error);
        }
      } catch (error) {
        console.error('Error in loadBlogPosts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBlogPosts();
  }, []);

  useEffect(() => {
    let filtered = blogPosts;

    // Filter by search term (search in title)
    if (searchTerm.trim()) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (activeFilter !== 'All Categories') {
      filtered = filtered.filter(post => {
        if (post.categories && post.categories.length > 0) {
          return post.categories.includes(activeFilter);
        }
        return post.category === activeFilter;
      });
    }

    setFilteredPosts(filtered);
  }, [searchTerm, activeFilter, blogPosts]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleNavigateToPost = (postId: string) => {
    navigate(`/blog/${postId}`);
  };

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

  const featuredPost = filteredPosts[0];
  const regularPosts = filteredPosts.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-travel-primary to-travel-accent text-white py-8 md:py-16">
          <div className="container mx-auto px-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-center"
            >
              Travel Blog & Inspiration
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base md:text-xl mb-6 md:mb-8 text-center max-w-3xl mx-auto px-2"
            >
              Explore travel guides, tips, and stories from our experienced travelers.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-3xl mx-auto relative px-2 md:px-0"
            >
              <input
                type="text"
                placeholder="Search for blog posts by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 md:px-5 py-3 md:py-4 pr-10 md:pr-12 rounded-full focus:outline-none focus:ring-2 focus:ring-travel-accent shadow-lg text-gray-800 text-sm md:text-base"
              />
              <Search className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8">
            {/* Sidebar */}
            <div className="lg:w-1/4 order-2 lg:order-1">
              <div className="sticky top-20 md:top-24">
                <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4 lg:p-6 mb-4 md:mb-6">
                  <h3 className="text-sm md:text-base lg:text-lg font-bold mb-3 md:mb-4 lg:mb-6 text-gray-900">Categories</h3>
                  <ul className="space-y-0.5 md:space-y-1">
                    {categories.map((category, index) => (
                      <li key={index}>
                        <button 
                          onClick={() => setActiveFilter(category)}
                          className={`flex items-center w-full py-1.5 md:py-2 lg:py-3 px-2 md:px-3 rounded-lg text-left transition-colors text-xs md:text-sm lg:text-base ${
                            activeFilter === category
                              ? 'bg-blue-50 text-blue-600 font-medium' 
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <Tag className={`h-2.5 w-2.5 md:h-3 md:w-3 lg:h-4 lg:w-4 mr-1.5 md:mr-2 lg:mr-3 ${activeFilter === category ? 'text-blue-600' : 'text-gray-400'}`} />
                          <span className="truncate">{category}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4 lg:p-6">
                  <h3 className="text-sm md:text-base lg:text-lg font-bold mb-3 md:mb-4 lg:mb-6 text-gray-900">Popular Tags</h3>
                  <div className="flex flex-wrap gap-1 md:gap-1.5 lg:gap-2">
                    {popularTags.map((tag, index) => (
                      <span 
                        key={index}
                        className="bg-gray-100 px-1.5 md:px-2 lg:px-3 py-0.5 md:py-1 rounded-full text-xs lg:text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="lg:w-3/4 order-1 lg:order-2">
              <div className="mb-4 md:mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-3">
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
                  {searchTerm ? `Search Results for "${searchTerm}"` : 'Latest Articles'}
                  <span className="text-xs md:text-sm font-normal text-gray-500 ml-2">
                    ({filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''})
                  </span>
                </h2>
                <select className="border border-gray-300 rounded-lg px-2 md:px-3 lg:px-4 py-1 md:py-1.5 lg:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm">
                  <option>Most Recent</option>
                  <option>Most Popular</option>
                  <option>Trending</option>
                </select>
              </div>

              {filteredPosts.length === 0 ? (
                <div className="text-center py-6 md:py-8 lg:py-12">
                  <p className="text-gray-600 text-sm md:text-base lg:text-lg">
                    {searchTerm ? `No blog posts found matching "${searchTerm}"` : 'No blog posts available at the moment.'}
                  </p>
                  <p className="text-gray-500 mt-2 text-xs md:text-sm lg:text-base">
                    {searchTerm ? 'Try searching with different keywords.' : 'Check back soon for exciting travel stories!'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Featured Article - Large Card with Side Image */}
                  {featuredPost && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="mb-4 md:mb-6 lg:mb-8"
                    >
                      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="flex flex-col lg:flex-row">
                          <div className="lg:w-1/2 cursor-pointer" onClick={() => handleNavigateToPost(featuredPost.id)}>
                            {featuredPost.image && (
                              <img 
                                src={featuredPost.image}
                                alt={featuredPost.title}
                                className="w-full h-48 md:h-56 lg:h-full object-cover hover:opacity-95 transition-opacity"
                              />
                            )}
                          </div>
                          <div className="lg:w-1/2 p-3 md:p-4 lg:p-6 xl:p-8">
                            <div className="inline-block bg-purple-100 text-purple-600 text-xs font-medium px-2 py-1 rounded-full mb-2 md:mb-3 lg:mb-4">
                              Featured
                            </div>
                            <h3 className="text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-bold mb-2 md:mb-3 lg:mb-4 text-gray-900 leading-tight cursor-pointer hover:text-blue-600 transition-colors" 
                                onClick={() => handleNavigateToPost(featuredPost.id)}>
                              {featuredPost.title}
                            </h3>
                            <p className="text-gray-600 mb-3 md:mb-4 lg:mb-6 text-xs md:text-sm leading-relaxed">
                              {featuredPost.excerpt ? featuredPost.excerpt.substring(0, 120) + '...' : ''}
                            </p>
                            <div className="flex items-center mb-3 md:mb-4 lg:mb-6">
                              <Avatar className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 mr-2 md:mr-3 lg:mr-4">
                                {featuredPost.author_image ? (
                                  <AvatarImage 
                                    src={featuredPost.author_image} 
                                    alt={featuredPost.author}
                                    className="object-cover"
                                  />
                                ) : null}
                                <AvatarFallback className="bg-travel-primary/20 text-travel-primary">
                                  <User className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 text-xs md:text-sm lg:text-base truncate">{featuredPost.author}</div>
                                <div className="text-gray-500 text-xs lg:text-sm">Travel Writer</div>
                              </div>
                              <div className="ml-2 flex items-center text-gray-500 text-xs lg:text-sm">
                                <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                <span className="hidden sm:inline">{formatDate(featuredPost.date_written || featuredPost.created_at)}</span>
                                <span className="sm:hidden">{new Date(featuredPost.date_written || featuredPost.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleNavigateToPost(featuredPost.id)}
                              className="text-blue-600 font-semibold hover:text-blue-700 transition-colors text-xs md:text-sm lg:text-base"
                            >
                              Read Full Article →
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Regular Posts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
                    {regularPosts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
                      >
                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden h-full hover:shadow-md transition-shadow">
                          <div className="relative cursor-pointer" onClick={() => handleNavigateToPost(post.id)}>
                            {post.image && (
                              <img 
                                src={post.image}
                                alt={post.title}
                                className="w-full h-32 md:h-40 lg:h-48 object-cover hover:opacity-95 transition-opacity"
                              />
                            )}
                            <div className="absolute top-1.5 md:top-2 lg:top-4 left-1.5 md:left-2 lg:left-4 bg-white/95 backdrop-blur-sm px-1.5 md:px-2 lg:px-3 py-0.5 md:py-1 rounded-full text-xs lg:text-sm font-medium text-blue-600">
                              {post.categories && post.categories.length > 0 ? post.categories[0] : post.category || 'Latest'}
                            </div>
                          </div>
                          <div className="p-3 md:p-4 lg:p-6">
                            <h3 className="text-sm md:text-base lg:text-lg xl:text-xl font-bold mb-1.5 md:mb-2 lg:mb-3 text-gray-900 line-clamp-2 leading-tight cursor-pointer hover:text-blue-600 transition-colors"
                                onClick={() => handleNavigateToPost(post.id)}>
                              {post.title}
                            </h3>
                            <p className="text-gray-600 mb-2 md:mb-3 lg:mb-4 line-clamp-2 md:line-clamp-3 leading-relaxed text-xs md:text-sm lg:text-base">
                              {post.excerpt}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center flex-1 min-w-0">
                                <Avatar className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 mr-1.5 md:mr-2 lg:mr-3 flex-shrink-0">
                                  {post.author_image ? (
                                    <AvatarImage 
                                      src={post.author_image} 
                                      alt={post.author}
                                      className="object-cover"
                                    />
                                  ) : null}
                                  <AvatarFallback className="bg-travel-primary/20 text-travel-primary">
                                    <User className="h-2.5 w-2.5 md:h-3 md:w-3 lg:h-4 lg:w-4" />
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs md:text-sm font-medium text-gray-700 truncate">{post.author}</span>
                              </div>
                              <div className="flex items-center text-gray-500 text-xs ml-2 flex-shrink-0">
                                <Calendar className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                                <span className="hidden sm:inline">{formatDate(post.date_written || post.created_at)}</span>
                                <span className="sm:hidden">{new Date(post.date_written || post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              </div>
                            </div>
                            
                            <button 
                              onClick={() => handleNavigateToPost(post.id)}
                              className="mt-2 md:mt-3 lg:mt-4 text-blue-600 font-semibold hover:text-blue-700 transition-colors text-xs md:text-sm lg:text-base"
                            >
                              Read More →
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
              
              {regularPosts.length > 0 && (
                <div className="mt-6 md:mt-8 lg:mt-12 flex justify-center">
                  <button className="inline-flex items-center justify-center px-4 md:px-6 lg:px-8 py-2 md:py-2.5 lg:py-3 border-2 border-travel-primary text-travel-primary font-semibold rounded-full hover:bg-travel-primary hover:text-white transition-colors text-xs md:text-sm lg:text-base">
                    Load More Articles
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;