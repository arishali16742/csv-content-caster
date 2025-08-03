import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CounterStats {
  packages_booked: number;
  visa_booked: number;
  happy_customers: number;
}

interface BackgroundImage {
  id: string;
  image_url: string;
  alt_text: string | null;
}

const CounterSection = () => {
  const [stats, setStats] = useState<CounterStats>({
    packages_booked: 0,
    visa_booked: 0,
    happy_customers: 0
  });
  const [backgrounds, setBackgrounds] = useState<BackgroundImage[]>([]);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [animatedStats, setAnimatedStats] = useState<CounterStats>({
    packages_booked: 0,
    visa_booked: 0,
    happy_customers: 0
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchStats();
    fetchBackgrounds();
  }, []);

  useEffect(() => {
    if (backgrounds.length > 1) {
      const interval = setInterval(() => {
        setCurrentBgIndex((prev) => (prev + 1) % backgrounds.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [backgrounds]);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    const intervals = Object.keys(stats).map((key) => {
      const finalValue = stats[key as keyof CounterStats];
      const increment = finalValue / steps;
      let currentValue = 0;
      let step = 0;

      return setInterval(() => {
        step++;
        currentValue = Math.min(Math.round(increment * step), finalValue);
        setAnimatedStats(prev => ({
          ...prev,
          [key]: currentValue
        }));

        if (step >= steps) {
          clearInterval(intervals.find(interval => interval === this));
        }
      }, stepDuration);
    });

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [stats]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('counter_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (data && data.length > 0) {
        setStats({
          packages_booked: data[0].packages_booked,
          visa_booked: data[0].visa_booked,
          happy_customers: data[0].happy_customers
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchBackgrounds = async () => {
    try {
      const { data, error } = await supabase
        .from('counter_backgrounds')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });

      if (error) throw error;
      setBackgrounds(data || []);
    } catch (error) {
      console.error('Error fetching backgrounds:', error);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const currentBackground = backgrounds[currentBgIndex];

  return (
    <section className="relative overflow-hidden py-8 md:py-20">
      {/* Background Image */}
      {currentBackground && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
          style={{ backgroundImage: `url(${currentBackground.image_url})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Our Achievements
          </h2>
          <p className="text-sm md:text-base text-gray-200 italic font-serif">
  For Us: Every stamp tells a story
</p>

        </div>
        
        <div className="flex flex-nowrap md:grid md:grid-cols-3 gap-3 md:gap-6 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
          {/* Packages Booked */}
          <div className="flex-shrink-0 w-[180px] md:w-auto bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-white border-opacity-20">
            <div className="text-2xl md:text-4xl font-bold text-white mb-1 animate-pulse">
              {formatNumber(animatedStats.packages_booked)}+
            </div>
            <div className="text-sm md:text-lg text-gray-200 font-semibold">Packages</div>
            <div className="text-xs md:text-sm text-gray-300">Happy travelers</div>
          </div>
          
          {/* Visa Booked */}
          <div className="flex-shrink-0 w-[180px] md:w-auto bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-white border-opacity-20">
            <div className="text-2xl md:text-4xl font-bold text-white mb-1 animate-pulse">
              {formatNumber(animatedStats.visa_booked)}+
            </div>
            <div className="text-sm md:text-lg text-gray-200 font-semibold">Visas</div>
            <div className="text-xs md:text-sm text-gray-300">Successful processing</div>
          </div>
          
          {/* Happy Customers */}
          <div className="flex-shrink-0 w-[180px] md:w-auto bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-white border-opacity-20">
            <div className="text-2xl md:text-4xl font-bold text-white mb-1 animate-pulse">
              {formatNumber(animatedStats.happy_customers)}+
            </div>
            <div className="text-sm md:text-lg text-gray-200 font-semibold">Happy Clients</div>
            <div className="text-xs md:text-sm text-gray-300">Satisfied customers</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CounterSection;