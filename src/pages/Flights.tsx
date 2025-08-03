
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, MapPin, Users, Plane, Search } from 'lucide-react';

const Flights = () => {
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    departure: '',
    return: '',
    passengers: '1'
  });

  const popularFlights = [
    { from: 'New York', to: 'London', price: '₹24,915', duration: '7h 30m' },
    { from: 'Los Angeles', to: 'Tokyo', price: '₹49,835', duration: '11h 45m' },
    { from: 'Miami', to: 'Paris', price: '₹37,335', duration: '8h 15m' },
    { from: 'Chicago', to: 'Rome', price: '₹32,335', duration: '9h 20m' },
    { from: 'San Francisco', to: 'Dubai', price: '₹58,165', duration: '14h 30m' },
    { from: 'Boston', to: 'Barcelona', price: '₹29,835', duration: '7h 45m' }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        {/* Hero Section with Video */}
        <div className="relative bg-gradient-to-r from-travel-primary to-travel-accent py-16 overflow-hidden">
          <video
            autoPlay
            muted
            loop
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          >
            <source 
              src="https://player.vimeo.com/external/419231364.sd.mp4?s=e24f5ff8e6a7c3f8b8c5c4c4c1c4c8c8c1c1c1c1&profile_id=164" 
              type="video/mp4" 
            />
          </video>
          <div className="relative max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Find Your Perfect Flight
              </h1>
              <p className="text-xl text-travel-light max-w-2xl mx-auto">
                Compare prices from hundreds of airlines and travel sites
              </p>
            </div>

            {/* Search Form */}
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="From"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-travel-primary focus:border-transparent"
                    value={searchData.from}
                    onChange={(e) => setSearchData({...searchData, from: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="To"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-travel-primary focus:border-transparent"
                    value={searchData.to}
                    onChange={(e) => setSearchData({...searchData, to: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-travel-primary focus:border-transparent"
                    value={searchData.departure}
                    onChange={(e) => setSearchData({...searchData, departure: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-travel-primary focus:border-transparent"
                    value={searchData.return}
                    onChange={(e) => setSearchData({...searchData, return: e.target.value})}
                  />
                </div>
                <button className="bg-travel-primary text-white px-6 py-3 rounded-lg hover:bg-travel-primary/90 transition-colors flex items-center justify-center gap-2">
                  <Search className="h-5 w-5" />
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Flights */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Popular Flight Routes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularFlights.map((flight, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <Plane className="h-8 w-8 text-travel-primary" />
                    <div>
                      <h3 className="font-semibold text-lg">{flight.from} → {flight.to}</h3>
                      <p className="text-gray-600">{flight.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-travel-primary">{flight.price}</span>
                    <button className="bg-travel-accent text-white px-4 py-2 rounded-lg hover:bg-travel-accent/90 transition-colors">
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-travel-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-travel-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Search</h3>
                <p className="text-gray-600">Compare prices across hundreds of airlines and booking sites</p>
              </div>
              <div className="text-center">
                <div className="bg-travel-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-travel-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Flexible Dates</h3>
                <p className="text-gray-600">Find the cheapest days to fly with our flexible date options</p>
              </div>
              <div className="text-center">
                <div className="bg-travel-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-travel-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Group Bookings</h3>
                <p className="text-gray-600">Special rates and easy management for group travel</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Flights;
