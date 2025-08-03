
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, MapPin, Users, Star, Wifi, Car, Coffee, Search } from 'lucide-react';

const Hotels = () => {
  const [searchData, setSearchData] = useState({
    destination: '',
    checkin: '',
    checkout: '',
    guests: '2'
  });

  const featuredHotels = [
    {
      name: 'Grand Plaza Hotel',
      location: 'New York, USA',
      rating: 4.8,
      price: '₹24,915',
      image: '/api/placeholder/300/200',
      amenities: ['Free WiFi', 'Parking', 'Restaurant']
    },
    {
      name: 'Ocean View Resort',
      location: 'Miami, USA',
      rating: 4.6,
      price: '₹15,745',
      image: '/api/placeholder/300/200',
      amenities: ['Beach Access', 'Pool', 'Spa']
    },
    {
      name: 'Mountain Lodge',
      location: 'Aspen, USA',
      rating: 4.9,
      price: '₹33,165',
      image: '/api/placeholder/300/200',
      amenities: ['Ski Access', 'Fireplace', 'Hot Tub']
    },
    {
      name: 'City Center Hotel',
      location: 'Los Angeles, USA',
      rating: 4.5,
      price: '₹19,045',
      image: '/api/placeholder/300/200',
      amenities: ['Gym', 'Rooftop Bar', 'Business Center']
    },
    {
      name: 'Historic Inn',
      location: 'Boston, USA',
      rating: 4.7,
      price: '₹13,245',
      image: '/api/placeholder/300/200',
      amenities: ['Historic Building', 'Restaurant', 'Concierge']
    },
    {
      name: 'Luxury Suites',
      location: 'San Francisco, USA',
      rating: 4.9,
      price: '₹37,335',
      image: '/api/placeholder/300/200',
      amenities: ['City Views', 'Kitchenette', 'Valet Parking']
    }
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
              src="https://player.vimeo.com/external/356135543.sd.mp4?s=e24f5ff8e6a7c3f8b8c5c4c4c1c4c8c8c1c1c1c1&profile_id=164" 
              type="video/mp4" 
            />
          </video>
          <div className="relative max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Find Your Perfect Stay
              </h1>
              <p className="text-xl text-travel-light max-w-2xl mx-auto">
                From budget-friendly rooms to luxury suites, find the perfect accommodation
              </p>
            </div>

            {/* Search Form */}
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Destination"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-travel-primary focus:border-transparent"
                    value={searchData.destination}
                    onChange={(e) => setSearchData({...searchData, destination: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    placeholder="Check-in"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-travel-primary focus:border-transparent"
                    value={searchData.checkin}
                    onChange={(e) => setSearchData({...searchData, checkin: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    placeholder="Check-out"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-travel-primary focus:border-transparent"
                    value={searchData.checkout}
                    onChange={(e) => setSearchData({...searchData, checkout: e.target.value})}
                  />
                </div>
                <button className="bg-travel-primary text-white px-6 py-3 rounded-lg hover:bg-travel-primary/90 transition-colors flex items-center justify-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Hotels
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Hotels */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Featured Hotels</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredHotels.map((hotel, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                  <div className="h-48 bg-gray-200 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-travel-primary/20 to-travel-accent/20"></div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold">{hotel.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{hotel.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{hotel.location}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {hotel.amenities.map((amenity, i) => (
                        <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                          {amenity}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-travel-primary">{hotel.price}</span>
                        <span className="text-gray-600 text-sm">/night</span>
                      </div>
                      <button className="bg-travel-accent text-white px-4 py-2 rounded-lg hover:bg-travel-accent/90 transition-colors">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hotel Types */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Hotel Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-travel-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coffee className="h-8 w-8 text-travel-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Budget Hotels</h3>
                <p className="text-gray-600 text-sm">Comfortable stays at affordable prices</p>
              </div>
              <div className="text-center">
                <div className="bg-travel-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wifi className="h-8 w-8 text-travel-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Business Hotels</h3>
                <p className="text-gray-600 text-sm">Perfect for corporate travelers</p>
              </div>
              <div className="text-center">
                <div className="bg-travel-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-travel-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Luxury Hotels</h3>
                <p className="text-gray-600 text-sm">Premium experience and amenities</p>
              </div>
              <div className="text-center">
                <div className="bg-travel-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-travel-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Family Hotels</h3>
                <p className="text-gray-600 text-sm">Kid-friendly accommodations</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Hotels;
