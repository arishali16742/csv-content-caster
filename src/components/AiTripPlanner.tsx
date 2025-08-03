
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Plane, Calendar, DollarSign, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';


interface TripPlan {
  destination: string;
  duration: number;
  budget: number;
  travelerType: string;
  itinerary: {
    day: number;
    activities: string[];
    meals: string[];
    cost: number;
  }[];
  totalCost: number;
}

const AiTripPlanner: React.FC = () => {
  const [destination, setDestination] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const [travelerType, setTravelerType] = useState<string>('solo');
  const [showResults, setShowResults] = useState<boolean>(false);
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate mock trip plan
    const mockPlan: TripPlan = {
      destination,
      duration: parseInt(duration),
      budget: parseInt(budget),
      travelerType,
      itinerary: Array.from({ length: parseInt(duration) }).map((_, i) => ({
        day: i + 1,
        activities: [
          `🏨 Check in to ${destination} Boutique Hotel`,
          `🚶‍♂️ Explore the local neighborhood`,
          `🍽️ Dinner at a trendy local restaurant`
        ],
        meals: [
          `☕ Continental breakfast at hotel`,
          `🥪 Grab and go lunch at local market`,
          `🍷 Dinner at Marina Bay Restaurant`
        ],
        cost: Math.floor(Math.random() * 100) + 50
      })),
      totalCost: Math.floor(parseInt(budget) * 0.8)
    };
    
    setTripPlan(mockPlan);
    setShowResults(true);
  };

  return (
    <section className="py-6 md:py-8 bg-gradient-to-br from-accent-50 to-secondary-50">

      <div className="container mx-auto px-4">
        <div className="text-center mb-6 md:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-sm mb-3 md:mb-4"
          >
            <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-accent-500 mr-1.5 md:mr-2" />
            <span className="text-gray-700 font-medium text-[rgb(6,97,244)] text-sm md:text-base">Human + AI-Powered Trip Planning</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-3 md:mb-4"
          >
            Let Human Plan Your Perfect Trip ✨
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-base md:text-lg lg:text-xl text-gray-600 max-w-[63rem] mx-auto px-4"
          >
            Tell us where you want to go, how long you're staying, and your budget. 
            Our Human + AI will craft a personalized day-by-day itinerary just for you!
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto px-2">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-4 md:p-6 lg:p-8">
                <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Your Trip Preferences</h3>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="destination" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                        <Plane className="h-3 w-3 md:h-4 md:w-4 inline mr-1 md:mr-2" />
                        Destination
                      </label>
                      <input
                        type="text"
                        id="destination"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="e.g., Bali, Tokyo, Paris"
                        className="w-full p-2.5 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-sm md:text-base"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="duration" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                        <Calendar className="h-3 w-3 md:h-4 md:w-4 inline mr-1 md:mr-2" />
                        Duration (days)
                      </label>
                      <input
                        type="number"
                        id="duration"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="e.g., 7"
                        min="1"
                        max="30"
                        className="w-full p-2.5 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-sm md:text-base"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="budget" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                        <DollarSign className="h-3 w-3 md:h-4 md:w-4 inline mr-1 md:mr-2" />
                        Budget (USD)
                      </label>
                      <input
                        type="number"
                        id="budget"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="e.g., 1500"
                        min="100"
                        className="w-full p-2.5 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-sm md:text-base"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                        <Users className="h-3 w-3 md:h-4 md:w-4 inline mr-1 md:mr-2" />
                        Traveler Type
                      </label>
                      <div className="grid grid-cols-2 gap-2 md:gap-3">
                        <label className={`flex items-center justify-center p-2 md:p-3 border rounded-lg cursor-pointer text-sm md:text-base ${travelerType === 'solo' ? 'bg-accent-50 border-accent-500' : 'border-gray-300 hover:bg-gray-50'}`}>
                          <input
                            type="radio"
                            name="travelerType"
                            value="solo"
                            checked={travelerType === 'solo'}
                            onChange={() => setTravelerType('solo')}
                            className="sr-only"
                          />
                          <span>👤 Solo</span>
                        </label>
                        
                        <label className={`flex items-center justify-center p-2 md:p-3 border rounded-lg cursor-pointer text-sm md:text-base ${travelerType === 'couple' ? 'bg-accent-50 border-accent-500' : 'border-gray-300 hover:bg-gray-50'}`}>
                          <input
                            type="radio"
                            name="travelerType"
                            value="couple"
                            checked={travelerType === 'couple'}
                            onChange={() => setTravelerType('couple')}
                            className="sr-only"
                          />
                          <span>💑 Couple</span>
                        </label>
                        
                        <label className={`flex items-center justify-center p-2 md:p-3 border rounded-lg cursor-pointer text-sm md:text-base ${travelerType === 'family' ? 'bg-accent-50 border-accent-500' : 'border-gray-300 hover:bg-gray-50'}`}>
                          <input
                            type="radio"
                            name="travelerType"
                            value="family"
                            checked={travelerType === 'family'}
                            onChange={() => setTravelerType('family')}
                            className="sr-only"
                          />
                          <span>👨‍👩‍👧 Family</span>
                        </label>
                        
                        <label className={`flex items-center justify-center p-2 md:p-3 border rounded-lg cursor-pointer text-sm md:text-base ${travelerType === 'friends' ? 'bg-accent-50 border-accent-500' : 'border-gray-300 hover:bg-gray-50'}`}>
                          <input
                            type="radio"
                            name="travelerType"
                            value="friends"
                            checked={travelerType === 'friends'}
                            onChange={() => setTravelerType('friends')}
                            className="sr-only"
                          />
                          <span>👯 Friends</span>
                        </label>
                      </div>
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full text-white font-semibold py-2.5 md:py-3 px-4 md:px-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 transition text-sm md:text-base"
                    >
                      Generate Trip Plan
                    </Button>
                  </div>
                </form>
              </div>

              <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700 text-white overflow-y-auto max-h-[400px] md:max-h-[600px]">
                {!showResults ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="text-white mb-4">
                      <svg className="h-12 w-12 md:h-16 md:w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5-5 5M6 12h12" />
                      </svg>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold mb-2">Enter your trip details</h3>
                    <p className="opacity-90 text-sm md:text-base">
                      We'll show you how much you can save by booking with us!
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-2">Your {tripPlan?.duration}-Day {tripPlan?.destination} Adventure</h3>
                      <p className="opacity-90 text-sm md:text-base">
                        Perfect for: {travelerType === 'solo' ? 'Solo Traveler' : 
                          travelerType === 'couple' ? 'Couples' : 
                          travelerType === 'family' ? 'Families' : 'Friend Groups'}
                      </p>
                    </div>

                    <div className="space-y-4 md:space-y-6">
                      {tripPlan?.itinerary.map((day) => (
                        <div key={day.day} className="bg-white/10 rounded-lg p-3 md:p-4">
                          <h4 className="font-bold mb-2 text-sm md:text-base">Day {day.day}</h4>
                          <ul className="space-y-1 md:space-y-2 mb-2 md:mb-3">
                            {day.activities.map((activity, i) => (
                              <li key={i} className="flex items-start text-xs md:text-sm">
                                <span className="mr-2">{activity.split(' ')[0]}</span>
                                <span>{activity.split(' ').slice(1).join(' ')}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="text-xs md:text-sm opacity-80 border-t border-white/20 pt-2 mt-2 flex justify-between">
                            <span>Estimated cost:</span>
                            <span>${day.cost}/day</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 md:mt-6 bg-white/20 rounded-lg p-3 md:p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm md:text-base">Total Estimated Cost:</span>
                        <span className="text-lg md:text-xl font-bold">${tripPlan?.totalCost}</span>
                      </div>
                      <p className="text-xs md:text-sm mt-2 opacity-80">
                        This is approximately {Math.round((tripPlan?.totalCost || 0) / (parseInt(budget) || 1) * 100)}% of your budget
                      </p>
                    </div>

                    <div className="mt-4 md:mt-6 text-center">
                      <Link to="/planner">
                        <Button 
                          variant="outline" 
                          className="border-white text-white hover:bg-white/10 text-sm md:text-base px-4 md:px-6 py-2 md:py-3"
                        >
                          For More Details...
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiTripPlanner;
