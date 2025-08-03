
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BudgetFriendlyDestination {
  id: string;
  title_line: string;
  name: string;
  image: string;
  price: string;
  status: string | null;
}

const BudgetFriendlyDestinations = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<BudgetFriendlyDestination[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const ITEMS_PER_PAGE = isMobile ? 2 : 5;

  useEffect(() => {
    const loadDestinations = async () => {
      const { data, error } = await supabase
        .from('budget_friendly_destinations')
        .select('*')
        .eq('status', 'published')
        .order('position', { ascending: true });
      
      if (data && !error) {
        setDestinations(data);
      } else if (error) {
        console.error('Error loading budget friendly destinations:', error);
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

  return (
    <section className="py-12 md:pt-4 md:pb-4 bg-gray-50">

<div className="max-w-7xl mx-auto px-0">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">
              <span className="bg-gradient-to-r from-[#f857a6] to-[#a75fff] bg-clip-text text-transparent">
                BUDGET FRIENDLY DESTINATIONS
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl">
              Travel budget - friendly to these amazing destinations without visa requirements
            </p>
          </div>
          
          <div className="flex gap-2 mx-auto md:mx-0">
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

        {/* Mobile Layout */}
        <div className="block md:hidden">
          <div className="grid grid-cols-2 gap-3">
            {currentDestinations.map((destination) => (
              <div 
                key={destination.id}
                onClick={() => handleDestinationClick(destination.name)}
                className="group relative rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 h-48"
              >
                <img 
                  src={destination.image} 
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white/80 text-xs mb-1">
                    {destination.title_line}
                  </p>
                  <h3 className="text-white text-sm font-bold mb-1">
                    {destination.name}
                  </h3>
                  <p className="text-white text-sm font-semibold">
                    {destination.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="grid grid-cols-12 gap-4" style={{ height: '400px' }}>
            {/* First card - spans 3 columns, full height */}
            {currentDestinations[0] && (
              <div 
                onClick={() => handleDestinationClick(currentDestinations[0].name)}
                className="col-span-3 group relative rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 h-full"
              >
                <img 
                  src={currentDestinations[0].image} 
                  alt={currentDestinations[0].name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-white/80 text-sm mb-1">
                    {currentDestinations[0].title_line}
                  </p>
                  <h3 className="text-white text-xl font-bold mb-2">
                    {currentDestinations[0].name}
                  </h3>
                  <p className="text-white text-lg font-semibold">
                    {currentDestinations[0].price}
                  </p>
                </div>
              </div>
            )}

            {/* Second column - two stacked cards */}
            <div className="col-span-3 flex flex-col gap-4 h-full">
              {/* Second card - top half */}
              {currentDestinations[1] && (
                <div 
                  onClick={() => handleDestinationClick(currentDestinations[1].name)}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 flex-1"
                >
                  <img 
                    src={currentDestinations[1].image} 
                    alt={currentDestinations[1].name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white/80 text-xs mb-1">
                      {currentDestinations[1].title_line}
                    </p>
                    <h3 className="text-white text-lg font-bold mb-1">
                      {currentDestinations[1].name}
                    </h3>
                    <p className="text-white text-sm font-semibold">
                      {currentDestinations[1].price}
                    </p>
                  </div>
                </div>
              )}

              {/* Third card - bottom half */}
              {currentDestinations[2] && (
                <div 
                  onClick={() => handleDestinationClick(currentDestinations[2].name)}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 flex-1"
                >
                  <img 
                    src={currentDestinations[2].image} 
                    alt={currentDestinations[2].name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white/80 text-xs mb-1">
                      {currentDestinations[2].title_line}
                    </p>
                    <h3 className="text-white text-lg font-bold mb-1">
                      {currentDestinations[2].name}
                    </h3>
                    <p className="text-white text-sm font-semibold">
                      {currentDestinations[2].price}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Fourth card - spans 3 columns, full height */}
            {currentDestinations[3] && (
              <div 
                onClick={() => handleDestinationClick(currentDestinations[3].name)}
                className="col-span-3 group relative rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 h-full"
              >
                <img 
                  src={currentDestinations[3].image} 
                  alt={currentDestinations[3].name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-white/80 text-sm mb-1">
                    {currentDestinations[3].title_line}
                  </p>
                  <h3 className="text-white text-xl font-bold mb-2">
                    {currentDestinations[3].name}
                  </h3>
                  <p className="text-white text-lg font-semibold">
                    {currentDestinations[3].price}
                  </p>
                </div>
              </div>
            )}

            {/* Fifth card - spans 3 columns, full height */}
            {currentDestinations[4] && (
              <div 
                onClick={() => handleDestinationClick(currentDestinations[4].name)}
                className="col-span-3 group relative rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 h-full"
              >
                <img 
                  src={currentDestinations[4].image} 
                  alt={currentDestinations[4].name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent md:mb-16"></div>

                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-white/80 text-sm mb-1">
                    {currentDestinations[4].title_line}
                  </p>
                  <h3 className="text-white text-xl font-bold mb-2">
                    {currentDestinations[4].name}
                  </h3>
                  <p className="text-white text-lg font-semibold">
                    {currentDestinations[4].price}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BudgetFriendlyDestinations;
