import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Star, Flame, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface HotDestination {
  id: string;
  name: string;
  country: string;
  image: string;
  description: string;
  price: number;
  old_price: number;
  rating: number;
  discount: string;
  status: string;
  duration: string | null;
}

const HotDestinations = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<HotDestination[]>([]);
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
    const loadDestinations = async () => {
      const { data, error } = await supabase
        .from('hot_destinations')
        .select('*')
        .eq('status', 'published')
        .order('position', { ascending: true });
      
      if (data) {
        setDestinations(data);
      } else if (error) {
        console.error('Error loading hot destinations:', error);
      }
    };

    loadDestinations();
  }, []);

  const handleViewPackages = (destination: string) => {
    navigate(`/packages?destination=${encodeURIComponent(destination)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreDestinations = () => {
    navigate('/packages');
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
    const newIndex = Math.min(currentIndex + 1, destinations.length - (isMobile ? 1 : 2));
    scrollToIndex(newIndex);
  };

  const prevSlide = () => {
    const newIndex = Math.max(currentIndex - 1, 0);
    scrollToIndex(newIndex);
  };

  if (destinations.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12 bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 flex items-center justify-center gap-2 md:gap-3">
            <Flame className="h-6 w-6 md:h-8 md:w-8 text-red-500" />
            Hot Happening {" "}
            <span className="bg-gradient-to-r from-[#f857a6] to-[#a75fff] bg-clip-text text-transparent">
              Destinations
            </span>
          </h2>
          <p className="text-sm md:text-lg text-gray-600 max-w-3xl mx-auto px-4">
            The hottest destinations that are creating buzz in the travel world right now
          </p>
        </div>

        <div className="relative">
          {/* Navigation Buttons */}
          {destinations.length > (isMobile ? 1 : 2) && (
            <>
              <button 
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ChevronLeft className="h-4 w-[2rem] md:h-6 md:w-6 text-red-500" />
              </button>
              
              <button 
                onClick={nextSlide}
                disabled={currentIndex >= destinations.length - (isMobile ? 1 : 2)}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${currentIndex >= destinations.length - (isMobile ? 1 : 2) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ChevronRight className="h-4 w-[2rem] md:h-6 md:w-6 text-red-500" />
              </button>
            </>
          )}

          {/* Destinations Container */}
          <div 
            ref={containerRef}
            className={`${isMobile ? 'flex overflow-x-auto snap-x snap-mandatory scrollbar-hide' : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3'} gap-3 md:gap-4 px-2 md:px-0`}
          >
            {destinations.map((destination) => (
              <div 
                key={destination.id}
                className={`${isMobile ? 'flex-shrink-0 w-[calc(100%-16px)] snap-center mx-1' : ''} group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-orange-100 hover:border-orange-300`}
                onClick={() => handleViewPackages(destination.name)}
              >
                <div className="relative h-36 md:h-48 overflow-hidden">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    {destination.discount} OFF
                  </div>
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    HOT
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>

                <div className="p-3 md:p-4">
                  <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2 text-gray-600">
                    <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="text-xs md:text-sm">{destination.country}</span>
                  </div>

                  <h3 className="text-sm md:text-base font-bold mb-1 md:mb-2 group-hover:text-red-500 transition-colors line-clamp-2">
                    {destination.name}
                  </h3>

                  {destination.duration && (
                    <div className="mb-1 md:mb-2 text-xs md:text-sm text-gray-500">
                      <span>{destination.duration}</span>
                    </div>
                  )}

                  <p className="text-gray-600 mb-2 md:mb-3 line-clamp-2 text-xs md:text-sm">{destination.description}</p>

                  <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-400 fill-current" />
                      <span className="font-semibold text-xs md:text-sm">{destination.rating}</span>
                    </div>
                    <span className="text-gray-500 text-xs md:text-sm">• Trending now</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1 md:gap-2">
                        <span className="text-xs md:text-sm line-through text-gray-400">₹{destination.old_price.toLocaleString()}</span>
                        <span className="text-sm md:text-base font-bold text-red-500">₹{destination.price.toLocaleString()}</span>
                      </div>
                      <span className="text-gray-500 text-xs">per person</span>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPackages(destination.name);
                      }}
                      className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 md:px-3 py-1 rounded-lg font-semibold hover:from-red-600 hover:to-orange-600 transition-all flex items-center gap-1 text-xs md:text-sm"
                    >
                      Book Now
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Explore Destinations Button */}
        <div className="text-center mt-6 md:mt-8">
          <button 
            onClick={handleExploreDestinations}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-5 md:px-6 py-2 md:py-2.5 rounded-full font-bold text-sm md:text-base hover:from-red-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 duration-300"
          >
            Explore Destinations
          </button>
        </div>
      </div>
    </section>
  );
};

export default HotDestinations;