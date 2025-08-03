
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TripComparison from '../components/TripComparison';

const PriceComparison = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16 md:pt-20">
        {/* Hero Section with Video */}
        <div className="relative bg-gradient-to-r from-travel-primary to-travel-accent py-12 md:pt-[2rem] md:pb-[1rem] overflow-hidden">
  <video
            autoPlay
            muted
            loop
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          >
            <source 
              src="https://player.vimeo.com/external/348022100.sd.mp4?s=85c0abe0d9a7e14b6e3a4c3e6a7f5c4d4c6e5d8f&profile_id=164" 
              type="video/mp4" 
            />
          </video>
          <div className="relative max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4">
              Price Comparison Tool 💰
            </h1>
            <p className="text-lg md:text-xl text-travel-light max-w-2xl mx-auto mb-4 md:mb-8">
              Compare travel costs across multiple platforms and save money on your trips
            </p>
          </div>
        </div>

        {/* Trip Comparison Component */}
        <div className="py-8 md:pt-0 md:pb-8">

          <div className="max-w-7xl mx-auto px-4">
            <TripComparison />
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-gray-50 py-12 md:pt-[2rem] md:pb-[2rem]">

          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Why Use Our Price Comparison?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="text-center">
                <div className="bg-travel-primary/10 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <span className="text-xl md:text-2xl">💰</span>
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">Save Money</h3>
                <p className="text-gray-600 text-sm md:text-base">Find the best deals across multiple booking platforms</p>
              </div>
              <div className="text-center">
                <div className="bg-travel-primary/10 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <span className="text-xl md:text-2xl">⚡</span>
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">Quick Compare</h3>
                <p className="text-gray-600 text-sm md:text-base">Get instant price comparisons in seconds</p>
              </div>
              <div className="text-center">
                <div className="bg-travel-primary/10 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <span className="text-xl md:text-2xl">📊</span>
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">Detailed Analysis</h3>
                <p className="text-gray-600 text-sm md:text-base">See breakdown of costs and savings opportunities</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PriceComparison;
