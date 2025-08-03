
import React from 'react';
const Benefits = () => {
  const benefits = [{
    title: "Luxury for Less",
    description: "Premium experiences at prices 10-20% lower than major booking sites.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-travel-primary">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M16 8h-6.5a2.5 2.5 0 0 0 0 5h1a2.5 2.5 0 0 1 0 5H6"></path>
          <path d="M12 18v2"></path>
          <path d="M12 6V4"></path>
        </svg>
  }, {
    title: "Human Touch",
    description: "No bots, just expert travel planners who craft each experience.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-travel-secondary">
          <circle cx="12" cy="8" r="5"></circle>
          <path d="M20 21a8 8 0 0 0-16 0"></path>
        </svg>
  }, {
    title: "Curated Trips",
    description: "Handpicked destinations and hotels that offer the best value.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-travel-accent">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
        </svg>
  }, {
    title: "Gen Z Approved",
    description: "Experiences designed for the modern traveler with Instagrammable moments.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-travel-primary">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
        </svg>
  }];
  return <section className="bg-white mx-0 my-0 px-[16px] pt-[26px] pb-[36px]">


      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-[#f857a6] to-[#a75fff] bg-clip-text text-transparent">
              TravelGenZ?
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            We're reimagining travel for the next generation. Here's how we're different.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {benefits.map((benefit, index) => <div key={index} className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition-all">
              <div className="flex justify-center mb-6">
                <div className="p-3 md:p-4 bg-white rounded-full shadow-sm">
                  {benefit.icon}
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-3">{benefit.title}</h3>
              <p className="text-sm md:text-base text-gray-600">{benefit.description}</p>
            </div>)}
        </div>
      </div>
    </section>;
};
export default Benefits;
