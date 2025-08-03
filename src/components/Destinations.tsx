import React, { useState, useEffect } from 'react';
import { MapPin, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface PopularDestination {
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
}

const Destinations = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<PopularDestination[]>([]);

  useEffect(() => {
    const loadDestinations = async () => {
      const { data, error } = await supabase
        .from('popular_destinations')
        .select('*')
        .eq('status', 'published')
        .order('position', { ascending: true });
      
      if (data) {
        setDestinations(data);
      } else if (error) {
        console.error('Error loading popular destinations:', error);
      }
    };

    loadDestinations();
  }, []);

  const handleViewPackages = (destination: string) => {
    navigate(`/packages?destination=${encodeURIComponent(destination)}`);
  };

  if (destinations.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Popular{" "}
            <span className="bg-gradient-to-r from-[#f857a6] to-[#a75fff] bg-clip-text text-transparent">
              Destinations
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the most loved travel destinations around the world
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {destinations.map((destination) => (
            <div 
              key={destination.id} 
              className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
              onClick={() => handleViewPackages(destination.name)}
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={destination.image} 
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                  {destination.discount}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg font-bold">{destination.name}</h3>
                  <p className="text-sm opacity-90 flex items-center gap-1">
                    <MapPin size={12} />
                    {destination.country}
                  </p>
                </div>
              </div>
              
              <div className="p-4">
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{destination.description}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{destination.rating}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 line-through">₹{destination.old_price?.toLocaleString()}</span>
                    <div className="text-lg font-bold text-travel-primary">₹{destination.price.toLocaleString()}</div>
                  </div>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewPackages(destination.name);
                  }}
                  className="w-full bg-travel-primary text-white py-2 rounded-lg hover:bg-travel-primary/90 transition-colors"
                >
                  View Packages
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Destinations;
