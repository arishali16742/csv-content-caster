import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useHomepageConfig } from '@/hooks/useHomepageConfig';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SouthEastAsianDestination {
  id: string;
  name: string;
  emoji: string;
  image: string | null;
  title_line: string | null;
  discount: string | null;
  status: string | null;
  position: number | null;
}

const SouthEastAsian = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<SouthEastAsianDestination[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const { getSectionTitle, getSectionSubtitle } = useHomepageConfig();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const ITEMS_PER_PAGE = isMobile ? 2 : 6;

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    const { data, error } = await supabase
      .from('south_east_asian_destinations')
      .select('*')
      .eq('status', 'published')
      .order('position', { ascending: true });
    
    if (data && !error) {
      setDestinations(data);
    }
  };

  const handleDestinationClick = (destination: string) => {
    navigate(`/packages?destination=${encodeURIComponent(destination)}`);
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - ITEMS_PER_PAGE));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(destinations.length - ITEMS_PER_PAGE, prev + ITEMS_PER_PAGE));
  };

  if (destinations.length === 0) {
    return null;
  }

  const currentDestinations = destinations.slice(currentIndex, currentIndex + ITEMS_PER_PAGE);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex + ITEMS_PER_PAGE < destinations.length;

  const sectionTitle = getSectionTitle('south-east-asian', 'EXPLORE SOUTH EAST ASIAN VACATIONS');
  const sectionSubtitle = getSectionSubtitle('south-east-asian', 'Discover amazing destinations in the South East Asian collection');

  return (
    <section className="py-12 md:pt-4 md:pb-4 bg-white-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-8 space-y-4 md:space-y-0">
          <div className="text-left">
            <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              {sectionTitle}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl">
              {sectionSubtitle}
            </p>
          </div>
          
          <div className="flex gap-2 mx-auto md:mx-0">
            <button 
              onClick={handlePrevious} 
              disabled={!canGoPrev} 
              className={`p-2 rounded-full border ${canGoPrev ? 'border-gray-300 hover:bg-gray-50 text-gray-600' : 'border-gray-200 text-gray-300 cursor-not-allowed'} transition-colors`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button 
              onClick={handleNext} 
              disabled={!canGoNext} 
              className={`p-2 rounded-full border ${canGoNext ? 'border-gray-300 hover:bg-gray-50 text-gray-600' : 'border-gray-200 text-gray-300 cursor-not-allowed'} transition-colors`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
          {currentDestinations.map((destination) => (
            <div 
              key={destination.id} 
              onClick={() => handleDestinationClick(destination.name)}
              className="group relative rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 h-32 md:h-48"
            >
              <div className="relative w-full h-full">
                {destination.image ? (
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-travel-primary/10 to-travel-accent/10 flex items-center justify-center">
                    <span className="text-3xl md:text-4xl">{destination.emoji}</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>
                
                {destination.discount && (
                  <div className="absolute top-1 md:top-2 right-1 md:right-2 bg-orange-500 text-white px-1 md:px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    🔥 {destination.discount}
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 top-0 flex flex-col justify-center p-2 md:p-4">
                  {destination.title_line && (
                    <p className="text-xs md:text-sm text-white/80 mb-1 group-hover:text-travel-accent transition-colors text-center">
                      {destination.title_line}
                    </p>
                  )}
                  <h3 className="text-sm md:text-lg font-bold text-white group-hover:text-travel-accent transition-colors text-center">
                    {destination.name}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SouthEastAsian;