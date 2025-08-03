
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

interface PackageBannerProps {
  searchQuery?: string;
}

interface Banner {
  id: string;
  destination_name: string;
  description: string | null;
  banner_image: string;
  total_packages: number | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

const PackageBanner = ({ searchQuery }: PackageBannerProps) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [defaultBanners, setDefaultBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    fetchBanners();
  }, []);

  // Auto-rotate default banners every 3 seconds
  useEffect(() => {
    if (defaultBanners.length > 1 && !searchQuery) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prevIndex) => 
          (prevIndex + 1) % defaultBanners.length
        );
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [defaultBanners.length, searchQuery]);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('destination_banners')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const allBanners = data || [];
      const defaultBannersData = allBanners.filter(banner => banner.is_default === true);
      const destinationBanners = allBanners.filter(banner => banner.is_default !== true);
      
      setBanners(destinationBanners);
      setDefaultBanners(defaultBannersData);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-64 bg-gray-200 animate-pulse"></div>
    );
  }

  // If there's a search query, look for matching destination banner
  if (searchQuery) {
    const matchingBanner = banners.find(banner => 
      banner.destination_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (matchingBanner) {
      return (
        <div className="w-full relative" style={{ height: '30rem' }}>

          <img 
            src={matchingBanner.banner_image} 
            alt={matchingBanner.destination_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-left text-white px-4">
              <h1 className="text-4xl font-bold mb-4">{matchingBanner.destination_name}</h1>
              <p className="text-xl mb-2">{matchingBanner.description}</p>
              {matchingBanner.total_packages && matchingBanner.total_packages > 0 && (
                <p className="text-lg"> Amazing Packages Available</p>
              )}
            </div>
          </div>
        </div>
      );
    }
  }

  // Show rotating default banners if available
  if (defaultBanners.length > 0) {
    const currentBanner = defaultBanners[currentBannerIndex];
    
    return (
      <div className="w-full h-[25rem] relative">

        <img 
          src={currentBanner.banner_image} 
          alt={currentBanner.destination_name}
          className="w-full h-full object-cover transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl font-bold mb-4">{currentBanner.destination_name}</h1>
            <p className="text-xl mb-2">{currentBanner.description}</p>
            {currentBanner.total_packages && currentBanner.total_packages > 0 && (
              <p className="text-lg">{currentBanner.total_packages} Amazing Packages Available</p>
            )}
          </div>
        </div>
        
        {/* Dots indicator for multiple banners */}
        {defaultBanners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {defaultBanners.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentBannerIndex ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={() => setCurrentBannerIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Fallback banner
  return (
    <div className="w-full h-64 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="text-center text-white px-4">
        <h1 className="text-4xl font-bold mb-4">Discover Amazing Packages</h1>
        <p className="text-xl">Find your perfect travel destination</p>
      </div>
    </div>
  );
};

export default PackageBanner;
