
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, User, Clock, ArrowLeft, Share2, Bookmark, MapPin, IndianRupee } from 'lucide-react';
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
  editor_name?: string;
  date_written?: string;
  additional_images?: string[];
  price?: string;
  itinerary?: string;
}

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const loadBlogPost = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('blog')
        .select('*')
        .eq('id', id)
        .eq('published', true)
        .single();
      
      if (data) {
        setPost(data);
        // Load related posts
        const { data: related } = await supabase
          .from('blog')
          .select('*')
          .eq('published', true)
          .neq('id', id)
          .limit(3);
        
        if (related) {
          setRelatedPosts(related);
        }
      } else if (error) {
        console.error('Error loading blog post:', error);
      }
      setLoading(false);
    };

    loadBlogPost();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-6 text-gray-700 leading-relaxed text-lg">
        {paragraph}
      </p>
    ));
  };

  const formatItinerary = (itinerary: string) => {
    // Split by day markers and clean up
    const dayPattern = /📅\s*Day\s*\d+:/gi;
    const parts = itinerary.split(dayPattern);
    const dayHeaders = itinerary.match(dayPattern) || [];
    
    const formattedDays = [];
    
    for (let i = 1; i < parts.length; i++) {
      const dayHeader = dayHeaders[i - 1];
      const dayContent = parts[i].trim();
      
      // Parse the day content
      const lines = dayContent.split('\n').filter(line => line.trim());
      let dayTitle = '';
      let activities = [];
      let overnight = '';
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.includes('–') && !dayTitle) {
          dayTitle = trimmedLine;
        } else if (trimmedLine.startsWith('Activities:') || trimmedLine.startsWith('Activity:')) {
          continue; // Skip the "Activities:" header
        } else if (trimmedLine.startsWith('Overnight Stay:')) {
          overnight = trimmedLine.replace('Overnight Stay:', '').trim();
        } else if (trimmedLine.startsWith('Morning:') || trimmedLine.startsWith('Arrival:') || trimmedLine.startsWith('En Route:')) {
          activities.push(trimmedLine);
        } else if (trimmedLine.startsWith('Visit') || trimmedLine.startsWith('Check') || trimmedLine.startsWith('Drive') || trimmedLine.startsWith('Cruise') || trimmedLine.startsWith('Enjoy') || trimmedLine.startsWith('Evening:') || trimmedLine.startsWith('Optional:')) {
          activities.push(trimmedLine);
        }
      }
      
      formattedDays.push({
        dayNumber: i,
        header: dayHeader,
        title: dayTitle,
        activities,
        overnight
      });
    }
    
    return formattedDays.map((day, index) => (
      <div key={index} className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
            {day.dayNumber}
          </div>
          <div>
            <h4 className="font-bold text-xl text-blue-800 mb-1">{day.header?.replace('📅', '').trim()}</h4>
            {day.title && <p className="text-blue-600 font-medium">{day.title}</p>}
          </div>
        </div>
        
        {day.activities.length > 0 && (
          <div className="mb-4">
            <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Activities & Highlights
            </h5>
            <ul className="space-y-2">
              {day.activities.map((activity, actIndex) => (
                <li key={actIndex} className="text-gray-700 leading-relaxed pl-4 border-l-2 border-blue-300">
                  {activity}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {day.overnight && (
          <div className="bg-white/70 rounded-lg p-3 border border-blue-200">
            <span className="font-semibold text-gray-800">🏨 Overnight Stay:</span>
            <span className="text-gray-700 ml-2">{day.overnight}</span>
          </div>
        )}
      </div>
    ));
  };

  const renderImageLayout = (images: string[]) => {
    const validImages = images.filter(img => img && img.trim() !== '');
    if (validImages.length === 0) return null;

    return (
      <div className="w-full">
        <div className="grid grid-cols-12 gap-4 h-96">
          {validImages.map((img, index) => {
            let className = "";
            if (validImages.length === 1) {
              className = "col-span-12 h-full";
            } else if (validImages.length === 2) {
              className = "col-span-6 h-full";
            } else if (validImages.length === 3) {
              className = index === 0 ? "col-span-8 h-full" : "col-span-4 h-full";
            } else if (validImages.length === 4) {
              className = index === 0 ? "col-span-8 h-full" : "col-span-4 h-32";
            } else {
              className = index === 0 ? "col-span-8 h-full" : "col-span-2 h-32";
            }

            return (
              <div key={index} className={className}>
                <img 
                  src={img} 
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
                />
              </div>
            );
          })}
        </div>
      </div>
    );
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

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog post not found</h1>
            <button 
              onClick={() => navigate('/blog')}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              ← Back to Blog
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <div className="relative h-96 overflow-hidden">
          {post.image && (
            <img 
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white max-w-4xl px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-4"
              >
                {post.category || 'Blog'}
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl md:text-5xl font-bold mb-6 leading-tight"
              >
                {post.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-gray-200 max-w-2xl mx-auto"
              >
                {post.excerpt}
              </motion.p>
            </div>
          </div>
          
          {/* Price Badge in Top Right */}
          {post.price && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg"
            >
              <div className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-green-600" />
                <span className="font-bold text-gray-900">{post.price}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Article Content */}
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="lg:w-2/3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-8"
              >
                <button 
                  onClick={() => navigate('/blog')}
                  className="flex items-center text-blue-600 hover:text-blue-700 font-semibold mb-8 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Blog
                </button>

                {/* Author and Meta Info */}
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
                  <div className="flex items-center">
                    <Avatar className="w-16 h-16 mr-4">
                      {post.author_image ? (
                        <AvatarImage 
                          src={post.author_image} 
                          alt={post.author}
                          className="object-cover"
                        />
                      ) : null}
                      <AvatarFallback className="bg-travel-primary/20 text-travel-primary">
                        <User className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-bold text-lg text-gray-900">{post.author}</div>
                      {post.editor_name && (
                        <div className="text-gray-600">Edited by {post.editor_name}</div>
                      )}
                      <div className="flex items-center text-gray-500 text-sm mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(post.date_written || post.created_at)}
                        <Clock className="h-4 w-4 ml-4 mr-1" />
                        5 min read
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                      <Share2 className="h-5 w-5 text-gray-600" />
                    </button>
                    <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                      <Bookmark className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Excerpt Section - Standalone */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mb-16"
              >
                <div className="text-xl font-semibold text-gray-800 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  {post.excerpt}
                </div>
              </motion.div>

              {/* Gallery Section - Completely Standalone */}
              {post.additional_images && post.additional_images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="mb-20"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Photo Gallery</h3>
                    <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    {renderImageLayout(post.additional_images)}
                  </div>
                </motion.div>
              )}
              
              {/* Main Content Section - Completely Standalone */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mb-20"
              >
                <div className="bg-white border rounded-lg p-8 shadow-sm">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Article Details</h2>
                  <div className="prose prose-lg max-w-none space-y-8">
                    {formatContent(post.content)}
                  </div>
                </div>
              </motion.div>

              {/* Itinerary Section - Completely Standalone */}
              {post.itinerary && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="mb-20"
                >
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full shadow-lg">
                      <MapPin className="h-6 w-6" />
                      <h2 className="text-2xl font-bold">Detailed Itinerary</h2>
                    </div>
                    <p className="text-gray-600 mt-4 text-lg">Your day-by-day travel guide</p>
                  </div>
                  <div className="space-y-6">
                    {formatItinerary(post.itinerary)}
                  </div>
                </motion.div>
              )}

              {/* Pro Tip Section - Standalone */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="mb-16"
              >
                <div className="bg-gray-50 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Pro Tip</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Always research local customs and traditions before visiting a new destination. 
                    This not only shows respect for the local culture but also enhances your travel experience 
                    by helping you connect more meaningfully with the places and people you encounter.
                  </p>
                </div>
              </motion.div>

              {/* Call to Action - Standalone */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="mb-12"
              >
                <div className="bg-gradient-to-r from-travel-primary to-travel-accent text-white p-8 rounded-lg text-center">
                  <h3 className="text-2xl font-bold mb-4">Ready to Start Your Adventure?</h3>
                  <p className="text-xl mb-6">Discover amazing travel packages and start planning your next journey today!</p>
                  <button 
                    onClick={() => navigate('/packages')}
                    className="bg-white text-travel-primary font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    Explore Packages
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:w-1/3">
              <div className="sticky top-24">
                {/* Price Card */}
                {post.price && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-white border rounded-lg p-6 shadow-sm mb-6"
                  >
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Package Pricing</h3>
                      <div className="flex items-center justify-center gap-2 text-2xl font-bold text-green-600 mb-4">
                        <IndianRupee className="h-6 w-6" />
                        <span>{post.price}</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">Best deal available for this destination</p>
                      <button className="w-full bg-travel-primary text-white py-3 rounded-lg font-semibold hover:bg-travel-primary/90 transition-colors">
                        Book Now
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="bg-white border rounded-lg p-6 shadow-sm"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Related Articles</h3>
                    <div className="space-y-4">
                      {relatedPosts.map((relatedPost) => (
                        <div 
                          key={relatedPost.id}
                          className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                          onClick={() => navigate(`/blog/${relatedPost.id}`)}
                        >
                          <div className="flex gap-3">
                            {relatedPost.image && (
                              <img 
                                src={relatedPost.image}
                                alt={relatedPost.title}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium text-sm line-clamp-2 mb-1">{relatedPost.title}</h4>
                              <div className="flex items-center text-gray-500 text-xs">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(relatedPost.date_written || relatedPost.created_at)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
