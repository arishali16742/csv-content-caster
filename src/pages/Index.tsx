import React, { useState } from 'react';
import FestivalPopup from '@/components/FestivalPopup';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Benefits from '../components/Benefits';
import CounterSection from '../components/CounterSection';
import Explore from '../components/Explore';
import UniqueExperiences from '../components/UniqueExperiences';
import MiddleEast from '../components/MiddleEast';
import Oceania from '../components/Oceania';
import Dubs from '../components/Dubs';
import Dub from '../components/Dub';
import Dubsss from '../components/Dubsss';
import Dubs2 from '../components/Dubs2';
import UnitedStates from '../components/UnitedStates';
import SouthEastAsian from '../components/SouthEastAsian';
import Scandinavia from '../components/Scandinavia';
import VisaFreeDestinations from '../components/VisaFreeDestinations';
import BudgetFriendlyDestinations from '../components/BudgetFriendlyDestinations';
import ImageLayout1 from '../components/ImageLayout1';
import ImageLayout2 from '../components/ImageLayout2';
import ImageLayout3 from '../components/ImageLayout3';
import ImageLayout4 from '../components/ImageLayout4';
import TrendingDestinations from '../components/TrendingDestinations';
import PopularDestinations from '../components/PopularDestinations';
import HotDestinations from '../components/HotDestinations';

import Visa from '../components/Visa';
import TripComparison from '../components/TripComparison';
import AiTripPlanner from '../components/AiTripPlanner';
import TravelInspiration from '../components/TravelInspiration';
import DiscountWheel from '../components/DiscountWheel';
import CallToAction from '../components/CallToAction';
import Footer from '../components/Footer';
import TripPlanner from '../components/TripPlanner';
import { useHomepageConfig } from '../hooks/useHomepageConfig';

const Index = () => {
  const [showTripPlanner, setShowTripPlanner] = useState(false);
  const [showTripComparison, setShowTripComparison] = useState(false);
  const { sections, loading, isSectionVisible, getSectionTitle } = useHomepageConfig();

  const homepageStructuredData = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "Travellata",
    "description": "Luxury travel packages 10-20% cheaper than major booking sites with expert human curation",
    "url": "https://travellata.com",
    "logo": "https://travellata.com/logo.png",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "Global"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "English"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Travel Packages",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Luxury Travel Packages",
            "description": "Handcrafted travel packages with flights and hotels"
          }
        }
      ]
    },
    "sameAs": [
      "https://www.facebook.com/travellata",
      "https://www.instagram.com/travellata",
      "https://twitter.com/travellata"
    ]
  };

  // Section configuration
  const sectionComponents = [
    { key: 'benefits', component: <Benefits /> },
    { key: 'counter', component: <CounterSection /> },
    { key: 'explore', component: <Explore /> },
    { key: 'unique-experiences', component: <UniqueExperiences /> },
    { key: 'middle-east', component: <MiddleEast /> },
    { key: 'oceania', component: <Oceania /> },
    { key: 'dubs', component: <Dubs /> },
    { key: 'dub', component: <Dub /> },
    { key: 'dubsss', component: <Dubsss /> },
    { key: 'dubs2', component: <Dubs2 /> },
    { key: 'united-states', component: <UnitedStates /> },
    { key: 'south-east-asian', component: <SouthEastAsian /> },
    { key: 'scandinavia', component: <Scandinavia /> },
    { key: 'visa-free', component: <VisaFreeDestinations /> },
    { key: 'budget-friendly', component: <BudgetFriendlyDestinations /> },
    { key: 'image-layout1', component: <ImageLayout1 /> },
    { key: 'image-layout2', component: <ImageLayout2 /> },
    { key: 'image-layout3', component: <ImageLayout3 /> },
    { key: 'image-layout4', component: <ImageLayout4 /> },
    { key: 'trending', component: <TrendingDestinations /> },
    { key: 'popular', component: <PopularDestinations /> },
    { key: 'hot', component: <HotDestinations /> },
    { key: 'visa', component: <Visa /> },
    { key: 'trip-comparison', component: <TripComparison /> },
    { key: 'ai-trip-planner', component: <AiTripPlanner /> },
    { key: 'travel-inspiration', component: <TravelInspiration /> },
    { key: 'discount-wheel', component: <DiscountWheel /> }
  ];

  // Filter and sort visible sections
  const visibleSections = sectionComponents
    .filter(({ key }) => {
      const section = sections.find(s => s.section_key === key);
      return section?.is_visible; // Only include if explicitly marked visible
    })
    .sort((a, b) => {
      const aPos = sections.find(s => s.section_key === a.key)?.position || 999;
      const bPos = sections.find(s => s.section_key === b.key)?.position || 999;
      return aPos - bPos;
    });

  if (loading) {
    return (
      <>
        <SEOHead
          title="Loading - Travellata Travel Packages"
          description="Loading luxury travel packages..."
          canonical="https://travellata.com/"
          structuredData={homepageStructuredData}
        />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-grow flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-travel-primary"></div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Travellata - Luxury Travel Packages 20% Cheaper | Book Best Travel Deals"
        description="Discover handcrafted luxury travel packages 10-20% cheaper than major booking sites. Expert human curation, no bots. Book Bali, Dubai, Europe trips with flights & hotels."
        keywords="travel packages, luxury travel, cheap flights, hotel booking, vacation deals, travel agency, Bali packages, Dubai tours, Europe trips, budget travel"
        canonical="https://travellata.com/"
        structuredData={homepageStructuredData}
      />
      <div className="min-h-screen flex flex-col">
        <FestivalPopup />
        <Navbar />
        <main className="flex-grow">
          <Hero />
          
          {/* Render only visible sections */}
          <section className="space-y-0 md:space-y-0">
            {visibleSections.map(({ key, component }) => (
              <div key={key}>{component}</div>
            ))}
          </section>
        
        {/* Smart Travel Tools Section - handled separately */}
        {sections.find(s => s.section_key === 'smart-tools')?.is_visible && (
          <section className="py-12 md:pt-0 md:pb-16 bg-white mt-8 md:mt-16" aria-labelledby="smart-tools-heading">
            <div className="max-w-7xl mx-auto px-4">
              <header className="text-center mb-8 md:mb-12">
                <h2 id="smart-tools-heading" className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  {getSectionTitle('smart-tools', 'Smart Travel Tools 🚀')}
                </h2>
                <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                  Use our AI-powered tools to plan your perfect trip and compare prices
                </p>
              </header>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <article className="bg-gradient-to-br from-travel-primary/10 to-travel-accent/10 rounded-xl p-4 md:p-6 text-center">
                  <div className="bg-travel-primary/20 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <span className="text-xl md:text-2xl" role="img" aria-label="Robot">🤖</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">AI Trip Planner</h3>
                  <p className="text-gray-600 mb-3 md:mb-4 text-sm md:text-base">
                    Get a personalized day-by-day itinerary created by AI based on your preferences
                  </p>
                  <button 
                    onClick={() => setShowTripPlanner(true)}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 md:px-6 py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-colors text-sm md:text-base"
                    aria-label="Open AI Trip Planner"
                  >
                    Plan My Trip
                  </button>
                </article>
                
                <article className="bg-gradient-to-br from-travel-secondary/10 to-travel-primary/10 rounded-xl p-4 md:p-6 text-center">
                  <div className="bg-travel-secondary/20 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <span className="text-xl md:text-2xl" role="img" aria-label="Money">💰</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Price Comparison</h3>
                  <p className="text-gray-600 mb-3 md:mb-4 text-sm md:text-base">
                    Compare costs with other booking sites and see how much you can save
                  </p>
                  <button 
                    onClick={() => setShowTripComparison(true)}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 md:px-6 py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-colors text-sm md:text-base"
                    aria-label="Open Price Comparison Tool"
                  >
                    Compare Prices
                  </button>
                </article>
              </div>
            </div>
          </section>
        )}

        {/* Modals */}
        {showTripPlanner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="trip-planner-title">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <header className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h2 id="trip-planner-title" className="text-lg md:text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">AI Trip Planner</h2>
                <button 
                  onClick={() => setShowTripPlanner(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl md:text-2xl"
                  aria-label="Close trip planner"
                >
                  ×
                </button>
              </header>
              <TripPlanner onClose={() => setShowTripPlanner(false)} />
            </div>
          </div>
        )}

        {showTripComparison && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="trip-comparison-title">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <header className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h2 id="trip-comparison-title" className="text-lg md:text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Trip Cost Comparison</h2>
                <button 
                  onClick={() => setShowTripComparison(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl md:text-2xl"
                  aria-label="Close price comparison"
                >
                  ×
                </button>
              </header>
              <TripComparison />
            </div>
          </div>
        )}

        <CallToAction />
      </main>
      <Footer />
    </div>
    </>
  );
};

export default Index;