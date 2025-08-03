
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import PackageManagement from '../components/PackageManagement';
import ExploreManagement from '../components/ExploreManagement';
import UniqueExperiencesManagement from '../components/UniqueExperiencesManagement';
import MiddleEastManagement from '../components/MiddleEastManagement';
import OceaniaManagement from '../components/OceaniaManagement';
import DubsManagement from '../components/DubsManagement';
import DubManagement from '../components/DubManagement';
import DubsssManagement from '../components/DubsssManagement';
import Dubs2Management from '../components/Dubs2Management';
import UnitedStatesManagement from '../components/UnitedStatesManagement';
import SouthEastAsianManagement from '../components/SouthEastAsianManagement';
import ScandinaviaManagement from '../components/ScandinaviaManagement';
import TrendingDestinationsManagement from '../components/TrendingDestinationsManagement';
import PopularDestinationsManagement from '../components/PopularDestinationsManagement';
import HotDestinationsManagement from '../components/HotDestinationsManagement';
import BlogManagement from '../components/BlogManagement';
import ItineraryManagement from '../components/ItineraryManagement';
import BannerManagement from '../components/BannerManagement';
import HeroManagement from '../components/HeroManagement';
import CounterManagement from '../components/CounterManagement';
import VisaManagement from '../components/VisaManagement';
import VisaFreeDestinationsManagement from '../components/VisaFreeDestinationsManagement';
import BudgetFriendlyDestinationsManagement from '../components/BudgetFriendlyDestinationsManagement';
import ImageLayout1Management from '../components/ImageLayout1Management';
import ImageLayout2Management from '../components/ImageLayout2Management';
import ImageLayout3Management from '../components/ImageLayout3Management';
import ImageLayout4Management from '../components/ImageLayout4Management';
import PartnersManagement from '../components/PartnersManagement';
import LoginPopupManagement from '../components/LoginPopupManagement';
import OffersManagement from '../components/OffersManagement';
import HomepageManagement from '../components/HomepageManagement';
import CartReviewManagement from '../components/CartReviewManagement';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [activeTab, setActiveTab] = useState('homepage');

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-travel-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const tabs = [
    { id: 'homepage', label: 'Homepage' },
    { id: 'hero', label: 'Hero Section' },
    { id: 'explore', label: 'Explore' },
    { id: 'unique', label: 'Unique Experiences' },
    { id: 'middle-east', label: 'Middle East' },
    { id: 'oceania', label: 'Oceania' },
    { id: 'dubs', label: 'DUBS' },
    { id: 'dub', label: 'DUB' },
    { id: 'dubsss', label: 'DUBSSS' },
    { id: 'dubs2', label: 'DUBS (2nd)' },
    { id: 'united-states', label: 'United States' },
    { id: 'south-east-asian', label: 'South East Asian' },
    { id: 'scandinavia', label: 'Scandinavia' },
    { id: 'visa-free', label: 'Visa Free Destinations' },
    { id: 'budget-friendly', label: 'Budget Friendly' },
    { id: 'image-layout1', label: 'Image Layout1' },
    { id: 'image-layout2', label: 'Image Layout2' },
    { id: 'image-layout3', label: 'Image Layout3' },
    { id: 'image-layout4', label: 'Image Layout4' },
    { id: 'trending', label: 'Trending Destinations' },
    { id: 'popular', label: 'Popular Destinations' },
    { id: 'hot', label: 'Hot Happening Destinations' },
    { id: 'packages', label: 'Packages' },
    { id: 'banner', label: 'Banner' },
    { id: 'counter', label: 'Counter' },
    { id: 'blog', label: 'Blog' },
    { id: 'itinerary', label: 'Itinerary' },
    { id: 'visa', label: 'Visa Management' },
    { id: 'partners', label: 'Partners' },
    { id: 'offers', label: 'Wheel Offers' },
    { id: 'login-popup', label: 'Login Popup' },
    { id: 'cart-review', label: 'Booking Review' }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
          
          {/* Navigation Tabs */}
          <div className="flex space-x-4 mb-8 border-b overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 px-4 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-2 border-travel-primary text-travel-primary font-semibold'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {activeTab === 'homepage' && <HomepageManagement />}
            {activeTab === 'hero' && <HeroManagement />}
            {activeTab === 'explore' && <ExploreManagement />}
            {activeTab === 'unique' && <UniqueExperiencesManagement />}
            {activeTab === 'middle-east' && <MiddleEastManagement />}
            {activeTab === 'oceania' && <OceaniaManagement />}
            {activeTab === 'dubs' && <DubsManagement />}
            {activeTab === 'dub' && <DubManagement />}
            {activeTab === 'dubsss' && <DubsssManagement />}
            {activeTab === 'dubs2' && <Dubs2Management />}
            {activeTab === 'united-states' && <UnitedStatesManagement />}
            {activeTab === 'south-east-asian' && <SouthEastAsianManagement />}
            {activeTab === 'scandinavia' && <ScandinaviaManagement />}
            {activeTab === 'visa-free' && <VisaFreeDestinationsManagement />}
            {activeTab === 'budget-friendly' && <BudgetFriendlyDestinationsManagement />}
            {activeTab === 'image-layout1' && <ImageLayout1Management />}
            {activeTab === 'image-layout2' && <ImageLayout2Management />}
            {activeTab === 'image-layout3' && <ImageLayout3Management />}
            {activeTab === 'image-layout4' && <ImageLayout4Management />}
            {activeTab === 'trending' && <TrendingDestinationsManagement />}
            {activeTab === 'popular' && <PopularDestinationsManagement />}
            {activeTab === 'hot' && <HotDestinationsManagement />}
            {activeTab === 'packages' && <PackageManagement />}
            {activeTab === 'banner' && <BannerManagement />}
            {activeTab === 'counter' && <CounterManagement />}
            {activeTab === 'blog' && <BlogManagement />}
            {activeTab === 'itinerary' && <ItineraryManagement />}
            {activeTab === 'visa' && <VisaManagement />}
            {activeTab === 'partners' && <PartnersManagement />}
            {activeTab === 'offers' && <OffersManagement />}
            {activeTab === 'login-popup' && <LoginPopupManagement />}
            {activeTab === 'cart-review' && <CartReviewManagement />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
