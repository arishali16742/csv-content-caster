
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useHomepageConfig } from '@/hooks/useHomepageConfig';
import { ChevronLeft, ChevronRight } from 'lucide-react';
interface UniqueExperience {
  id: string;
  title_line: string | null;
  name: string;
  emoji: string;
  image: string | null;
  discount?: string;
  status: string | null;
}
const UniqueExperiences = () => {
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState<UniqueExperience[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const {
    getSectionTitle,
    getSectionSubtitle
  } = useHomepageConfig();

  // Check if mobile
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
    const loadExperiences = async () => {
      const {
        data,
        error
      } = await supabase.from('unique_experiences').select('*').eq('status', 'published').order('position', {
        ascending: true
      });
      if (data) {
        setExperiences(data);
      } else if (error) {
        console.error('Error loading unique experiences:', error);
      }
    };
    loadExperiences();
  }, []);
  const handleExperienceClick = (experience: string) => {
  navigate(`/packages?destination=${encodeURIComponent(experience)}`);
  window.scrollTo({ top: 0, behavior: 'smooth' }); // Add this line
};
  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - ITEMS_PER_PAGE));
  };
  const handleNext = () => {
    setCurrentIndex(prev => Math.min(experiences.length - ITEMS_PER_PAGE, prev + ITEMS_PER_PAGE));
  };
  if (experiences.length === 0) {
    return null;
  }
  const currentExperiences = experiences.slice(currentIndex, currentIndex + ITEMS_PER_PAGE);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex + ITEMS_PER_PAGE < experiences.length;
  const sectionTitle = getSectionTitle('unique-experiences', 'FOR UNIQUE EXPERIENCES');
  const sectionSubtitle = getSectionSubtitle('unique-experiences', 'Discover extraordinary adventures and create memories that will last a lifetime');
  return <section className="bg-white py-8 md:pt-8 md:pb-0">

      <div className="max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-[2rem] space-y-4 md:space-y-0">
      <div className="text-left md:text-left">
            <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">
              <span className="bg-gradient-to-r from-[#f857a6] to-[#a75fff] bg-clip-text text-transparent">
                {sectionTitle}
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl">
              {sectionSubtitle}
            </p>
          </div>
          
          <div className="flex gap-2 mx-auto md:mx-0">
            <button onClick={handlePrevious} disabled={!canGoPrev} className={`p-2 rounded-full border ${canGoPrev ? 'border-gray-300 hover:bg-gray-50 text-gray-600' : 'border-gray-200 text-gray-300 cursor-not-allowed'} transition-colors`}>
              <ChevronLeft className="h-5 w-[2rem]" />
            </button>
            <button onClick={handleNext} disabled={!canGoNext} className={`p-2 rounded-full border ${canGoNext ? 'border-gray-300 hover:bg-gray-50 text-gray-600' : 'border-gray-200 text-gray-300 cursor-not-allowed'} transition-colors`}>
              <ChevronRight className="h-5 w-[2rem]" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
          {currentExperiences.map(experience => <div key={experience.id} onClick={() => handleExperienceClick(experience.name)} className="group relative rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 h-32 md:h-48">
              {experience.image && <div className="relative w-full h-full">
                  <img src={experience.image} alt={experience.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>
                  
                  {experience.discount && <div className="absolute top-1 md:top-2 right-1 md:right-2 bg-orange-500 text-white px-1 md:px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      🔥 {experience.discount}
                    </div>}
                  
                  <div className="absolute bottom-0 left-0 top-0 flex flex-col justify-center p-2 md:p-4">
                    {/* {experience.title_line && <p className="text-xs md:text-sm text-white/80 mb-1 group-hover:text-travel-accent transition-colors text-center">
                        {experience.title_line}
                      </p>} */}
                    <h3 className="text-sm md:text-lg font-bold text-white group-hover:text-travel-accent transition-colors text-center" style={{
                fontFamily: 'Comic Sans MS, cursive'
              }}>
                      {experience.name}
                    </h3>
                  </div>
                </div>}
            </div>)}
        </div>
      </div>
    </section>;
};
export default UniqueExperiences;
