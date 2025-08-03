
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useHomepageConfig } from '@/hooks/useHomepageConfig';

interface ImageLayout3Destination {
  id: string;
  title_line: string;
  name: string;
  image: string;
  price: string;
  position: number;
  status: string;
}

const ImageLayout3 = () => {
  const [destinations, setDestinations] = useState<ImageLayout3Destination[]>([]);
  const { getSectionTitle, getSectionSubtitle } = useHomepageConfig();

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    const { data, error } = await supabase
      .from('image_layout3_destinations')
      .select('*')
      .eq('status', 'published')
      .order('position', { ascending: true })
      .limit(6);
    
    if (data && !error) {
      setDestinations(data);
    }
  };

  if (destinations.length === 0) return null;

  return (
   <section className="pt-8 pb-12 md:pt-8 md:pb-12 bg-white-50">

      <div className="max-w-7xl mx-auto px-4">
        <div className="text-left mb-8 md:mb-[16px]">

          <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            {getSectionTitle('image-layout3', 'IMAGE LAYOUT3')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl">
            {getSectionSubtitle('image-layout3', 'Adventure awaits at these destinations')}
          </p>
        </div>
        
        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="grid grid-cols-12 gap-4" style={{ height: '500px' }}>
            {/* Left column - 3 stacked images */}
            <div className="col-span-3 flex flex-col gap-4 h-full">
              {destinations.slice(0, 3).map((destination) => (
                <div 
                  key={destination.id}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 flex-1"
                >
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white/80 text-xs mb-1">
                      {destination.title_line}
                    </p>
                    <h3 className="text-white text-sm font-bold mb-1">
                      {destination.name}
                    </h3>
                    <p className="text-yellow-400 text-xs font-semibold">
                      {destination.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Middle column - 1 large image */}
            {destinations[3] && (
              <div className="col-span-6 group relative rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 h-full">
                <img 
                  src={destinations[3].image} 
                  alt={destinations[3].name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <p className="text-white/80 text-lg mb-2">
                    {destinations[3].title_line}
                  </p>
                  <h3 className="text-white text-3xl font-bold mb-3">
                    {destinations[3].name}
                  </h3>
                  <p className="text-yellow-400 text-2xl font-semibold">
                    {destinations[3].price}
                  </p>
                </div>
              </div>
            )}

            {/* Right column - 2 stacked images */}
            <div className="col-span-3 flex flex-col gap-4 h-full">
              {destinations.slice(4, 6).map((destination) => (
                <div 
                  key={destination.id}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 flex-1"
                >
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white/80 text-xs mb-1">
                      {destination.title_line}
                    </p>
                    <h3 className="text-white text-sm font-bold mb-1">
                      {destination.name}
                    </h3>
                    <p className="text-yellow-400 text-xs font-semibold">
                      {destination.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="block md:hidden">
          <div className="grid grid-cols-2 gap-3">
            {destinations.slice(0, 6).map((destination) => (
              <div 
                key={destination.id}
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
                  <p className="text-yellow-400 text-xs font-semibold">
                    {destination.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageLayout3;
