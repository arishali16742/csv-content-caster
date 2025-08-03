import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useHomepageConfig } from '@/hooks/useHomepageConfig';

interface ExploreDestination {
  id: string;
  name: string;
  emoji: string;
  image: string | null;
  status: string | null;
}

const Explore = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<ExploreDestination[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { getSectionTitle, getSectionSubtitle } = useHomepageConfig();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadDestinations = async () => {
      const { data, error } = await supabase
        .from('explore_destinations')
        .select('*')
        .eq('status', 'published')
        .order('position', { ascending: true });
      
      if (data) {
        setDestinations(data);
      } else if (error) {
        console.error('Error loading explore destinations:', error);
      }
    };

    loadDestinations();
  }, []);

  const handleDestinationClick = (destination: string) => {
    navigate(`/packages?destination=${encodeURIComponent(destination)}`);
    window.scrollTo(0, 0);
  };

  const handleExploreMore = () => {
    navigate('/packages');
  };

  if (destinations.length === 0) {
    return null;
  }

  const sectionTitle = getSectionTitle('explore', 'Explore Dream Destinations ✈️');
  const sectionSubtitle = getSectionSubtitle('explore', 'Where will your next adventure take you? Discover amazing places waiting to be explored!');

  return (
    <section className="bg-gradient-to-br from-travel-light to-white pt-5 md:pt-[26px] pb-7 md:pb-[36px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
            <span className="bg-gradient-to-r from-[#f857a6] to-[#a75fff] bg-clip-text text-transparent">
              {sectionTitle}
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-[50rem] mx-auto px-2 sm:px-4">
            {sectionSubtitle}
          </p>
        </div>

        {isMobile ? (
          <div className="mb-4">
            <div className="grid grid-cols-4 gap-3 mb-4">
              {destinations.slice(0, 4).map((destination) => (
                <DestinationCard 
                  key={destination.id} 
                  destination={destination} 
                  onClick={handleDestinationClick} 
                  size="small"
                />
              ))}
            </div>
            <div className="grid grid-cols-4 gap-3 mb-6">
              {destinations.slice(4, 8).map((destination) => (
                <DestinationCard 
                  key={destination.id} 
                  destination={destination} 
                  onClick={handleDestinationClick} 
                  size="small"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-6 lg:gap-8 mb-4 md:mb-[0.8rem]">
            {destinations.map((destination) => (
              <DestinationCard 
                key={destination.id} 
                destination={destination} 
                onClick={handleDestinationClick} 
                size="large"
              />
            ))}
          </div>
        )}

        <div className="flex justify-center">
          <button 
            onClick={handleExploreMore}
            className="bg-travel-primary text-white px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full font-bold text-sm sm:text-base md:text-lg hover:bg-travel-primary/90 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-300"
          >
            Explore More Destinations
          </button>
        </div>
      </div>
    </section>
  );
};

const DestinationCard = ({ destination, onClick, size }: { 
  destination: ExploreDestination, 
  onClick: (name: string) => void,
  size: 'small' | 'large'
}) => {
  const dimensions = {
    small: {
      container: 'w-14 h-14 sm:w-16 sm:h-16',
      text: 'text-xs',
      emoji: 'text-xl'
    },
    large: {
      container: 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28',
      text: 'text-xs sm:text-sm',
      emoji: 'text-2xl sm:text-3xl md:text-4xl'
    }
  };

  return (
    <div 
      onClick={() => onClick(destination.name)}
      className="group text-center cursor-pointer"
    >
      {destination.image ? (
        <div className={`relative ${dimensions[size].container} mx-auto mb-2 md:mb-3 rounded-full overflow-hidden group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
          <img 
            src={destination.image} 
            alt={destination.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <h3 className={`font-semibold text-white ${dimensions[size].text} text-center px-1 sm:px-2 group-hover:text-travel-accent transition-colors`}>
              {destination.name}
            </h3>
          </div>
        </div>
      ) : (
        <div className={`relative ${dimensions[size].container} mx-auto mb-2 md:mb-3 rounded-full bg-gradient-to-br from-travel-primary to-travel-accent flex items-center justify-center ${dimensions[size].emoji} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
          {destination.emoji}
          <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
            <h3
  style={{ fontSize: '0.65rem' }}
  className="font-semibold text-white text-center px-1 sm:px-2 group-hover:text-travel-accent transition-colors"
>

              {destination.name}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;