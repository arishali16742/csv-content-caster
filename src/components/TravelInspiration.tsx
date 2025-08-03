import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
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

const TravelInspiration = () => {
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const loadHomepageBlogPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('blog')
          .select('*')
          .eq('published', true)
          .eq('show_on_homepage', true)
          .order('position', { ascending: true })
          .limit(6); // Load more for mobile scrolling
        
        if (data) {
          setBlogPosts(data);
        } else if (error) {
          console.error('Error loading homepage blog posts:', error);
        }
      } catch (error) {
        console.error('Error in loadHomepageBlogPosts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHomepageBlogPosts();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const scrollToIndex = (index: number) => {
    if (containerRef.current) {
      const container = containerRef.current;
      const cardWidth = container.children[0]?.clientWidth || 0;
      const scrollAmount = cardWidth * index;
      container.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  const nextSlide = () => {
    const newIndex = Math.min(currentIndex + 1, blogPosts.length - (isMobile ? 1 : 2));
    scrollToIndex(newIndex);
  };

  const prevSlide = () => {
    const newIndex = Math.max(currentIndex - 1, 0);
    scrollToIndex(newIndex);
  };

  if (loading || blogPosts.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12 lg:pt-8 lg:pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-6 md:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-sm mb-3 md:mb-4"
          >
            <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-accent-500 mr-1.5 md:mr-2" />
            <span className="text-gray-700 font-medium text-sm md:text-base">Because every trip leaves footprints on the heart❤️</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl lg:text-4xl font-bold mb-2 md:mb-4"
          >
            Travel Inspiration{" "}
            <span className="bg-gradient-to-r from-[#f857a6] to-[#a75fff] bg-clip-text text-transparent">
              ✨
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4"
          >
            Discover travel tips, hidden gems, and budget-friendly hacks from our expert travelers.
          </motion.p>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {blogPosts.slice(0, 3).map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              onClick={() => navigate(`/blog/${post.id}`)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <div className="relative">
                {post.image && (
                  <img 
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 lg:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-blue-600">
                  {post.categories && post.categories.length > 0 ? post.categories[0] : post.category || 'Travel Tips'}
                </div>
              </div>
              <div className="p-5 lg:p-6">
                <h3 className="text-lg lg:text-xl font-bold mb-3 text-gray-900 line-clamp-2 leading-tight group-hover:text-travel-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3 text-sm lg:text-base leading-relaxed">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="w-6 h-6 lg:w-8 lg:h-8 mr-3">
                      {post.author_image ? (
                        <AvatarImage 
                          src={post.author_image} 
                          alt={post.author}
                          className="object-cover"
                        />
                      ) : null}
                      <AvatarFallback className="bg-travel-primary/20 text-travel-primary text-xs">
                        <User className="h-3 w-3 lg:h-4 lg:w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700 truncate">{post.author}</span>
                  </div>
                  <div className="flex items-center text-gray-500 text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(post.date_written || post.created_at)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Layout with horizontal scrolling */}
        <div className="md:hidden relative">
          {blogPosts.length > 1 && (
            <>
              <button 
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ChevronLeft className="h-4 w-[2rem] text-travel-primary" />
              </button>
              
              <button 
                onClick={nextSlide}
                disabled={currentIndex >= blogPosts.length - 1}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${currentIndex >= blogPosts.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ChevronRight className="h-4 w-[2rem] text-travel-primary" />
              </button>
            </>
          )}

          <div 
            ref={containerRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 px-2 pt-[0.5rem] pb-[2.1rem]"

          >
            {blogPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => navigate(`/blog/${post.id}`)}
                className="flex-shrink-0 w-[calc(100%-32px)] snap-center bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                <div className="relative">
                  {post.image && (
                    <img 
                      src={post.image}
                      alt={post.title}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-blue-600">
                    {post.categories && post.categories.length > 0 ? post.categories[0] : post.category || 'Travel Tips'}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold mb-2 text-gray-900 line-clamp-2 leading-tight group-hover:text-travel-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-3 line-clamp-2 text-xs leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="w-5 h-5 mr-2">
                        {post.author_image ? (
                          <AvatarImage 
                            src={post.author_image} 
                            alt={post.author}
                            className="object-cover"
                          />
                        ) : null}
                        <AvatarFallback className="bg-travel-primary/20 text-travel-primary text-xs">
                          <User className="h-2 w-2" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-gray-700 truncate">{post.author}</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-xxs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(post.date_written || post.created_at)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center mt-6 md:mt-8 lg:mt-12">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            onClick={() => navigate('/blog')}
            className="inline-flex items-center justify-center px-5 md:px-6 lg:px-8 py-2.5 md:py-3 border-2 border-travel-primary text-travel-primary font-semibold rounded-full hover:bg-travel-primary hover:text-white transition-colors text-sm md:text-base"
          >
            Explore All Articles
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default TravelInspiration;