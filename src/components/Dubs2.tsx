
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHomepageConfig } from '@/hooks/useHomepageConfig';

interface Dubs2Destination {
  id: string;
  title_line: string | null;
  name: string;
  emoji: string;
  image: string | null;
  discount?: string;
  status: string | null;
}

const Dubs2 = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<Dubs2Destination[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { getSectionTitle } = useHomepageConfig();
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const loadDestinations = async () => {
      const { data, error } = await supabase
        .from('dubs2_destinations')
        .select('*')
        .eq('status', 'published')
        .order('position', { ascending: true });
      
      if (data && !error) {
        setDestinations(data);
      } else if (error) {
        console.error('Error loading dubs2 destinations:', error);
      }
    };

    loadDestinations();
  }, []);

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

  const sectionTitle = getSectionTitle('dubs2', 'EXPLORE DUBS');

  return (
    <section className="pt-8 pb-8 bg-white">

      <div className="max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center mb-8">

          <div>
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#f857a6] to-[#a75fff] bg-clip-text text-transparent">
                {sectionTitle}
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl">
              Discover amazing destinations in the DUBS collection
            </p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handlePrevious}
              disabled={!canGoPrev}
              className={`p-2 rounded-full border ${
                canGoPrev 
                  ? 'border-gray-300 hover:bg-gray-50 text-gray-600' 
                  : 'border-gray-200 text-gray-300 cursor-not-allowed'
              } transition-colors`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button 
              onClick={handleNext}
              disabled={!canGoNext}
              className={`p-2 rounded-full border ${
                canGoNext 
                  ? 'border-gray-300 hover:bg-gray-50 text-gray-600' 
                  : 'border-gray-200 text-gray-300 cursor-not-allowed'
              } transition-colors`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-4">
          {currentDestinations.map((destination) => (
            <div 
              key={destination.id}
              onClick={() => handleDestinationClick(destination.name)}
              className="group relative rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 h-48"
            >
              {destination.image && (
                <div className="relative w-full h-full">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>
                  
                  {destination.discount && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      🔥 {destination.discount}
                    </div>
                  )}
                  
                  <div className="absolute bottom-0 left-0 top-0 flex flex-col justify-center p-4">
                    {destination.title_line && (
                      <p className="text-sm text-white/80 mb-1 group-hover:text-travel-accent transition-colors text-center">
                        {destination.title_line}
                      </p>
                    )}
                    <h3 className="text-lg font-bold text-white group-hover:text-travel-accent transition-colors text-center" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      {destination.name}
                    </h3>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Dubs2;
