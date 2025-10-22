import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PackageBanner from '../components/PackageBanner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

// Custom Loader Component with fixed image and animation
const PackageLoader = () => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <div className="relative mb-6">
        <div className="w-80 h-60 md:w-96 md:h-72 rounded-xl overflow-hidden border-4 border-travel-primary/20 shadow-lg">
          <img 
            src="https://iili.io/Kf4Cepe.md.jpg"
            alt="Loading..."
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-travel-primary mb-2">Travellata</h2>
        <p className="text-gray-600">Discovering amazing destinations for you...</p>
      </div>
      
      <div className="w-64 md:w-80 h-2 bg-gray-200 rounded-full mt-8 overflow-hidden">
        <div 
          className="h-full bg-travel-primary rounded-full transition-all duration-300 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="mt-2 text-sm text-gray-500">
        {progress}% Complete
      </div>
    </div>
  );
};

const formatPrice = (price: string | undefined) => {
  if (!price) return '0';
  const numericValue = parseInt(price.replace(/[^0-9]/g, '')) || 0;
  return numericValue.toLocaleString('en-IN');
};

// Helper function to get price based on flight selection and duration
const getPackagePrice = (pkg: any, packageDetails: any, withFlights: boolean, withoutFlights: boolean) => {
  // If neither flight option is selected, use the default price from packages table
  if (!withFlights && !withoutFlights) {
    return {
      price: pkg.price,
      originalPrice: pkg.original_price
    };
  }
  
  const details = packageDetails[pkg.id];
  if (!details?.pricing) {
    return {
      price: pkg.price,
      originalPrice: pkg.original_price
    }; // Fallback to default price
  }
  
  const pricing = details.pricing;
  const duration = parseInt(pkg.duration?.replace(/[^0-9]/g, '') || '0');
  
  // Find the closest available duration that has non-zero pricing
  const getAvailableDuration = (pricingObj: any) => {
    const availableDurations = Object.keys(pricingObj || {})
      .map(Number)
      .sort((a, b) => a - b)
      .filter(dur => pricingObj[dur] > 0); // Only consider durations with non-zero prices
    
    if (availableDurations.length === 0) return null;
    
    // Find the closest duration that has pricing
    return availableDurations.reduce((closest, curr) => {
      return Math.abs(curr - duration) < Math.abs(closest - duration) ? curr : closest;
    });
  };
  
  let selectedDuration: number | null = null;
  let priceValue: number | null = null;
  
  if (withFlights && pricing.with_flights) {
    selectedDuration = getAvailableDuration(pricing.with_flights);
    if (selectedDuration !== null) {
      priceValue = pricing.with_flights[selectedDuration];
    }
  } else if (withoutFlights && pricing.without_flights) {
    selectedDuration = getAvailableDuration(pricing.without_flights);
    if (selectedDuration !== null) {
      priceValue = pricing.without_flights[selectedDuration];
    }
  }
  
  // If we found a valid price, calculate the discounted original price
  if (priceValue !== null && priceValue > 0) {
    const currentPrice = parseInt(pkg.price?.replace(/[^0-9]/g, '') || '0');
    const currentOriginalPrice = parseInt(pkg.original_price?.replace(/[^0-9]/g, '') || '0');
    
    // Calculate the discount percentage if both prices are available
    let originalPriceValue = priceValue;
    if (currentPrice > 0 && currentOriginalPrice > currentPrice) {
      const discountPercentage = (currentOriginalPrice - currentPrice) / currentOriginalPrice;
      originalPriceValue = Math.round(priceValue / (1 - discountPercentage));
    }
    
    return {
      price: `₹${priceValue}`,
      originalPrice: originalPriceValue > priceValue ? `₹${originalPriceValue}` : null
    };
  }
  
  // Fallback to default price
  return {
    price: pkg.price,
    originalPrice: pkg.original_price
  };
};

const Packages = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [packageDetails, setPackageDetails] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('position');
  const [searchInput, setSearchInput] = useState('');
  const [searchDestination, setSearchDestination] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedMood, setSelectedMood] = useState('all');
  const [selectedTripType, setSelectedTripType] = useState('all');
  const [selectedDealType, setSelectedDealType] = useState('all');
  const [selectedHotelCategory, setSelectedHotelCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [withFlights, setWithFlights] = useState(false);
  const [withoutFlights, setWithoutFlights] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showLoader, setShowLoader] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const packagesPerPage = 9;
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const lastFocusedInput = useRef<'desktop' | 'mobile' | null>(null);
  const hasAppliedFiltersFromURL = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: packagesData, error: packagesError } = await supabase
          .from('packages')
          .select('*')
          .or('status.is.null,status.eq.published')
          .contains('publish_to', ['packages'])
          .order('position', { ascending: true });
        
        if (packagesError) throw packagesError;

        const { data: detailsData, error: detailsError } = await supabase
          .from('package_details')
          .select('package_id, activity_details, attractions, pricing');
        
        if (detailsError) throw detailsError;

        const detailsMap = detailsData.reduce((acc, detail) => {
          acc[detail.package_id] = detail;
          return acc;
        }, {});

        setPackages(packagesData || []);
        setPackageDetails(detailsMap || {});

        // Parse URL parameters AFTER data is loaded
        if (!hasAppliedFiltersFromURL.current) {
          const urlParams = new URLSearchParams(location.search);
          const searchQuery = urlParams.get('search') || urlParams.get('destination') || '';
          const pageParam = urlParams.get('page');
          const countryParam = urlParams.get('country');
          const moodParam = urlParams.get('mood');
          const tripTypeParam = urlParams.get('tripType');
          const dealTypeParam = urlParams.get('dealType');
          const hotelCategoryParam = urlParams.get('hotelCategory');
          const priceMinParam = urlParams.get('priceMin');
          const priceMaxParam = urlParams.get('priceMax');
          const flightsParam = urlParams.get('flights');
          const withoutFlightsParam = urlParams.get('withoutFlights');
          const sortParam = urlParams.get('sort');
          
          // Set values from URL parameters
          setSearchInput(searchQuery);
          setSearchDestination(searchQuery);
          
          if (countryParam) setSelectedCountry(countryParam);
          if (moodParam) setSelectedMood(moodParam);
          if (tripTypeParam) setSelectedTripType(tripTypeParam);
          if (dealTypeParam) setSelectedDealType(dealTypeParam);
          if (hotelCategoryParam) setSelectedHotelCategory(hotelCategoryParam);
          if (priceMinParam && priceMaxParam) setPriceRange([parseInt(priceMinParam), parseInt(priceMaxParam)]);
          if (flightsParam) setWithFlights(flightsParam === 'true');
          if (withoutFlightsParam) setWithoutFlights(withoutFlightsParam === 'true');
          if (sortParam) setSortBy(sortParam);
          
          // Set current page from URL if available
          if (pageParam) {
            const page = parseInt(pageParam);
            if (!isNaN(page) && page > 0) {
              setCurrentPage(page);
            }
          }
          
          hasAppliedFiltersFromURL.current = true;
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
        setTimeout(() => {
          setShowLoader(false);
        }, 3000);
      }
    };

    fetchData();
    
    const savedScrollPosition = sessionStorage.getItem('packagesScrollPosition');
    if (savedScrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition));
        sessionStorage.removeItem('packagesScrollPosition');
      }, 100);
    }
  }, [location]);

  const getFilteredOptions = useCallback(() => {
    let filtered = [...packages];
    
    if (searchDestination) {
      const searchTerm = searchDestination.toLowerCase();
      filtered = filtered.filter(pkg => {
        return [pkg.title, pkg.country, ...(Array.isArray(pkg.destinations) ? pkg.destinations : [])]
          .some(val => val && typeof val === 'string' && (
            val.toLowerCase().includes(searchTerm) ||
            searchTerm.split(/,\s*/).some(part => val.toLowerCase().includes(part))
          ));
      });
    }
    
    filtered = filtered.filter(pkg => {
      const dynamicPrice = getPackagePrice(pkg, packageDetails, withFlights, withoutFlights);
      const packagePrice = parseInt(dynamicPrice.price?.replace(/[^0-9]/g, '') || '0');
      return packagePrice >= priceRange[0] && packagePrice <= priceRange[1];
    });
    
    if (selectedCountry !== 'all') {
      filtered = filtered.filter(pkg => pkg.country === selectedCountry);
    }
    
    if (selectedMood !== 'all') {
      filtered = filtered.filter(pkg => pkg.mood === selectedMood);
    }
    
    if (selectedTripType !== 'all') {
      filtered = filtered.filter(pkg => pkg.trip_type === selectedTripType);
    }
    
    if (selectedDealType !== 'all') {
      filtered = filtered.filter(pkg => pkg.deal_type === selectedDealType);
    }
    
    if (selectedHotelCategory !== 'all') {
      filtered = filtered.filter(pkg => pkg.hotel_category === selectedHotelCategory);
    }
    
    const countries = [...new Set(filtered.map(pkg => pkg.country))].filter(Boolean).sort();
    const moods = [...new Set(filtered.map(pkg => pkg.mood))].filter(Boolean).sort();
    const tripTypes = [...new Set(filtered.map(pkg => pkg.trip_type))].filter(Boolean).sort();
    const dealTypes = [...new Set(filtered.map(pkg => pkg.deal_type))].filter(Boolean);
    const hotelCategories = [...new Set(filtered.map(pkg => pkg.hotel_category))].filter(Boolean);
    
    const packagePrices = filtered
      .map(pkg => {
        const dynamicPrice = getPackagePrice(pkg, packageDetails, withFlights, withoutFlights);
        return parseInt(dynamicPrice.price?.replace(/[^0-9]/g, '') || '0');
      })
      .filter(price => price > 0);
    
    let availablePriceRanges = [];
    
    if (packagePrices.length > 0) {
      const brackets = [
        { min: 0, max: 10000, label: '₹0–₹10,000' },
        { min: 10000, max: 25000, label: '₹10,000–₹25,000' },
        { min: 25000, max: 50000, label: '₹25,000–₹50,000' },
        { min: 50000, max: 75000, label: '₹50,000–₹75,000' },
        { min: 75000, max: 100000, label: '₹75,000–₹100,000' },
        { min: 100000, max: 150000, label: '₹100,000–₹150,000' },
        { min: 150000, max: 200000, label: '₹150,000–₹200,000' },
        { min: 200000, max: 300000, label: '₹200,000–₹300,000' },
        { min: 300000, max: 500000, label: '₹300,000–₹500,000' },
        { min: 500000, max: 10000000, label: '₹500,000+' }
      ];
      
      const availableBrackets = brackets.filter(bracket => {
        return packagePrices.some(price => price >= bracket.min && price <= bracket.max);
      });
      
      availableBrackets.push({ min: 0, max: 10000000, label: 'All Prices' });
      
      availablePriceRanges = availableBrackets.map(bracket => ({
        label: bracket.label,
        value: `${bracket.min}-${bracket.max}`
      }));
    } else {
      availablePriceRanges = [{ label: 'All Prices', value: '0-10000000' }];
    }
    
    const hasPackagesWithFlights = filtered.some(pkg => {
      const details = packageDetails[pkg.id];
      return details?.pricing?.with_flights && Object.values(details.pricing.with_flights).some((price: any) => price > 0);
    });
    
    const hasPackagesWithoutFlights = filtered.some(pkg => {
      const details = packageDetails[pkg.id];
      return details?.pricing?.without_flights && Object.values(details.pricing.without_flights).some((price: any) => price > 0);
    });
    
    return {
      countries,
      moods,
      tripTypes,
      dealTypes,
      hotelCategories,
      priceRanges: availablePriceRanges,
      hasPackagesWithFlights,
      hasPackagesWithoutFlights
    };
  }, [packages, packageDetails, searchDestination, priceRange, withFlights, withoutFlights, selectedCountry, selectedMood, selectedTripType, selectedDealType, selectedHotelCategory]);

  useEffect(() => {
    if (isInitialLoad) return;
    
    const updateURL = () => {
      const urlParams = new URLSearchParams();
      
      if (searchInput) urlParams.set('search', searchInput);
      if (selectedCountry !== 'all') urlParams.set('country', selectedCountry);
      if (selectedMood !== 'all') urlParams.set('mood', selectedMood);
      if (selectedTripType !== 'all') urlParams.set('tripType', selectedTripType);
      if (selectedDealType !== 'all') urlParams.set('dealType', selectedDealType);
      if (selectedHotelCategory !== 'all') urlParams.set('hotelCategory', selectedHotelCategory);
      if (priceRange[0] !== 0 || priceRange[1] !== 10000000) {
        urlParams.set('priceMin', priceRange[0].toString());
        urlParams.set('priceMax', priceRange[1].toString());
      }
      if (withFlights) urlParams.set('flights', 'true');
      if (withoutFlights) urlParams.set('withoutFlights', 'true');
      if (sortBy !== 'position') urlParams.set('sort', sortBy);
      if (currentPage !== 1) urlParams.set('page', currentPage.toString());
      
      navigate(`/packages?${urlParams.toString()}`, { replace: true });
    };

    updateURL();
  }, [searchInput, selectedCountry, selectedMood, selectedTripType, selectedDealType, selectedHotelCategory, priceRange, withFlights, withoutFlights, sortBy, currentPage, navigate, isInitialLoad]);

  useEffect(() => {
    if (inputRef.current && lastFocusedInput.current) {
      inputRef.current.focus();
    }
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    setSearchDestination(value);
    setCurrentPage(1);
  };

  const FilterContent = useCallback(({ inputRef, onFocus }: { 
    inputRef: React.RefObject<HTMLInputElement>,
    onFocus: (type: 'desktop' | 'mobile') => void 
  }) => {
    const { 
      countries, 
      moods, 
      tripTypes, 
      dealTypes, 
      hotelCategories, 
      priceRanges: availablePriceRanges,
      hasPackagesWithFlights,
      hasPackagesWithoutFlights
    } = getFilteredOptions();
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Filters</h3>
          <Button 
            variant="ghost" 
            onClick={clearAllFilters}
            className="text-sm p-0 h-auto"
            size="sm"
          >
            Clear All
          </Button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Destination</label>
          <Input
            ref={inputRef}
            placeholder="Search destination..."
            value={searchInput}
            onChange={handleSearchChange}
            onFocus={() => onFocus(showMobileFilters ? 'mobile' : 'desktop')}
            className="text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Country</label>
          <Select value={selectedCountry} onValueChange={(value) => {
            setSelectedCountry(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map(country => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price Range</label>
          <Select
            value={`${priceRange[0]}-${priceRange[1]}`}
            onValueChange={(value) => {
              const [min, max] = value.split("-").map(Number);
              setPriceRange([min, max]);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select Price Range" />
            </SelectTrigger>
            <SelectContent>
              {availablePriceRanges.map(range => (
                <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mood</label>
          <Select value={selectedMood} onValueChange={(value) => {
            setSelectedMood(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="All Moods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Moods</SelectItem>
              {moods.map(mood => (
                <SelectItem key={mood} value={mood}>{mood}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Trip Type</label>
          <Select value={selectedTripType} onValueChange={(value) => {
            setSelectedTripType(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {tripTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Deal Type</label>
          <Select value={selectedDealType} onValueChange={(value) => {
            setSelectedDealType(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="All Deals" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Deals</SelectItem>
              {dealTypes.map(deal => (
                <SelectItem key={deal} value={deal}>{deal}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Hotel Category</label>
          <Select value={selectedHotelCategory} onValueChange={(value) => {
            setSelectedHotelCategory(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {hotelCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 pt-2">
          {hasPackagesWithFlights && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="with-flights-sidebar"
                checked={withFlights}
                onCheckedChange={(checked) => {
                  setWithFlights(checked === true);
                  if (checked) setWithoutFlights(false);
                  setCurrentPage(1);
                }}
                className="h-3 w-3 scale-75"
              />
              <label htmlFor="with-flights-sidebar" className="text-sm">
                With Flights
              </label>
            </div>
          )}
          
          {hasPackagesWithoutFlights && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="without-flights-sidebar"
                checked={withoutFlights}
                onCheckedChange={(checked) => {
                  setWithoutFlights(checked === true);
                  if (checked) setWithFlights(false);
                  setCurrentPage(1);
                }}
                className="h-3 w-3 scale-75"
              />
              <label htmlFor="without-flights-sidebar" className="text-sm">
                Without Flights
              </label>
            </div>
          )}
        </div>
      </div>
    );
  }, [searchInput, selectedCountry, selectedMood, selectedTripType, selectedDealType, selectedHotelCategory, priceRange, withFlights, withoutFlights, showMobileFilters, getFilteredOptions]);

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchDestination('');
    setSelectedCountry('all');
    setSelectedMood('all');
    setSelectedTripType('all');
    setSelectedDealType('all');
    setSelectedHotelCategory('all');
    setPriceRange([0, 10000000]);
    setWithFlights(false);
    setWithoutFlights(false);
    setSortBy('position');
    setCurrentPage(1);
    navigate('/packages', { replace: true });
  };

  const handlePackageClick = (packageId: string) => {
    sessionStorage.setItem('packagesScrollPosition', window.scrollY.toString());
    navigate(`/package/${packageId}${location.search}`);
  };

  const handleInputFocus = (type: 'desktop' | 'mobile') => {
    lastFocusedInput.current = type;
  };

  const filteredPackages = packages.filter(pkg => {
    if (searchDestination) {
      const searchTerm = searchDestination.toLowerCase();
      const hasMatch = [pkg.title, pkg.country, ...(Array.isArray(pkg.destinations) ? pkg.destinations : [])]
        .some(val => val && typeof val === 'string' && (
          val.toLowerCase().includes(searchTerm) ||
          searchTerm.split(/,\s*/).some(part => val.toLowerCase().includes(part))
        ));
      if (!hasMatch) return false;
    }

    const dynamicPrice = getPackagePrice(pkg, packageDetails, withFlights, withoutFlights);
    const packagePrice = parseInt(dynamicPrice.price?.replace(/[^0-9]/g, '') || '0');
    if (packagePrice < priceRange[0] || packagePrice > priceRange[1]) return false;

    return (
      (selectedCountry === 'all' || pkg.country === selectedCountry) &&
      (selectedMood === 'all' || pkg.mood === selectedMood) &&
      (selectedTripType === 'all' || pkg.trip_type === selectedTripType) &&
      (selectedDealType === 'all' || pkg.deal_type === selectedDealType) &&
      (selectedHotelCategory === 'all' || pkg.hotel_category === selectedHotelCategory)
    );
  });

  const sortedPackages = [...filteredPackages].sort((a, b) => {
    const aPrice = parseInt(getPackagePrice(a, packageDetails, withFlights, withoutFlights).price?.replace(/[^0-9]/g, '') || '0');
    const bPrice = parseInt(getPackagePrice(b, packageDetails, withFlights, withoutFlights).price?.replace(/[^0-9]/g, '') || '0');
    
    switch (sortBy) {
      case 'price-low': return aPrice - bPrice;
      case 'price-high': return bPrice - aPrice;
      case 'rating': return (b.rating || 0) - (a.rating || 0);
      default: return (a.position || 0) - (b.position || 0);
    }
  });

  const indexOfLastPackage = currentPage * packagesPerPage;
  const indexOfFirstPackage = indexOfLastPackage - packagesPerPage;
  const currentPackages = sortedPackages.slice(indexOfFirstPackage, indexOfLastPackage);
  const totalPages = Math.ceil(sortedPackages.length / packagesPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (showLoader) {
    return <PackageLoader />;
  }

  const { hasPackagesWithFlights, hasPackagesWithoutFlights } = getFilteredOptions();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        <div className="mt-16">
          <PackageBanner searchQuery={searchInput} />
        </div>

        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4">
          <div className="lg:hidden mb-4">
            <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters & Search
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] max-w-sm">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Filter packages by your preferences
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4">
                  <FilterContent inputRef={inputRef} onFocus={handleInputFocus} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex gap-4 md:gap-6 lg:gap-8">
            <div className="hidden lg:block w-1/4 max-h-[804px] bg-white rounded-xl shadow-sm p-4 border border-gray-200 overflow-y-auto">
              <FilterContent inputRef={inputRef} onFocus={handleInputFocus} />
            </div>

            <div className="w-full lg:w-3/4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedCountry !== 'all' ? `Packages in ${selectedCountry}` : 
                   searchInput ? `Packages for "${searchInput}"` : 'All Packages'} 
                  <span className="text-sm font-normal text-gray-600 ml-2">({sortedPackages.length} found)</span>
                </h1>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Select value={sortBy} onValueChange={(value) => {
                    setSortBy(value);
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="w-full sm:w-40 text-sm h-9">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="position">Default</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                    </SelectContent>
                  </Select>
                  {hasPackagesWithFlights && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="with-flights-top"
                        checked={withFlights}
                        onCheckedChange={(checked) => {
                          setWithFlights(checked === true);
                          if (checked) setWithoutFlights(false);
                          setCurrentPage(1);
                        }}
                        className="h-3 w-3 scale-75"
                      />
                      <label htmlFor="with-flights-top" className="text-xs">
                        With Flights
                      </label>
                    </div>
                  )}
                  {hasPackagesWithoutFlights && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="without-flights-top"
                        checked={withoutFlights}
                        onCheckedChange={(checked) => {
                          setWithoutFlights(checked === true);
                          if (checked) setWithFlights(false);
                          setCurrentPage(1);
                        }}
                        className="h-3 w-3 scale-75"
                      />
                      <label htmlFor="without-flights-top" className="text-xs">
                        Without Flights
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border animate-pulse p-4">
                      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentPackages.map((pkg) => {
                      const activitiesCount = packageDetails[pkg.id]?.activity_details?.count || 0;
                      const attractionsCount = packageDetails[pkg.id]?.attractions?.length || 0;
                      const dynamicPrice = getPackagePrice(pkg, packageDetails, withFlights, withoutFlights);
                      
                      return (
                        <div 
                          key={pkg.id} 
                          className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                          onClick={() => handlePackageClick(pkg.id)}
                        >
                          <div className="relative">
                            <img 
                              src={pkg.image} 
                              alt={pkg.title}
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                              {pkg.duration}
                            </div>
                            {pkg.deal_type !== 'Regular' && (
                              <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                                {pkg.deal_type}
                              </div>
                            )}
                          </div>
                          
                          <div className="p-4 flex flex-col flex-grow">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-base line-clamp-2 flex-grow pr-2">{pkg.title}</h3>
                              <div className="flex items-center text-yellow-500 flex-shrink-0">
                                <span className="text-xs">★</span>
                                <span className="text-xs ml-0.5">{pkg.rating}</span>
                              </div>
                            </div>
                            
                            <p className="text-gray-600 mb-3 text-sm">{pkg.country}</p>
                            
                            <div className="space-y-2 mb-4 text-xs text-gray-600">
                              <div className="flex items-center">
                                <span className="mr-2">✈️</span>
                                <span className="truncate">{pkg.destinations?.join(', ') || 'Multiple'}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="mr-2">🏨</span>
                                <span className="truncate">{pkg.hotel_category}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="mr-2">🎭</span>
                                <span>Activities: {activitiesCount}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="mr-2">🏛️</span>
                                <span>Attractions: {attractionsCount}</span>
                              </div>
                            </div>
                            
                            <div className="mt-auto pt-4 border-t">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">{pkg.trip_type}</span>
                                <div className="text-right">
                                  {dynamicPrice.originalPrice && (
                                    <span className="text-xs text-red-500 line-through block">
                                      ₹{formatPrice(dynamicPrice.originalPrice)}
                                    </span>
                                  )}
                                  <div className="text-base font-bold text-green-600">
                                    ₹{formatPrice(dynamicPrice.price)}
                                    <span className="text-xs font-normal text-gray-500 block">per person</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-8">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              href="#" 
                              onClick={(e) => {
                                e.preventDefault();
                                paginate(currentPage - 1);
                              }}
                              className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                            />
                          </PaginationItem>
                          
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <PaginationItem key={pageNum}>
                                <PaginationLink
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    paginate(pageNum);
                                  }}
                                  isActive={currentPage === pageNum}
                                  className="text-sm"
                                >
                                  {pageNum}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                          
                          <PaginationItem>
                            <PaginationNext 
                              href="#" 
                              onClick={(e) => {
                                e.preventDefault();
                                paginate(currentPage + 1);
                              }}
                              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}

              {!loading && sortedPackages.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
                  <p className="text-sm text-gray-600 mb-4">Try adjusting your filters to see more results.</p>
                  <Button 
                    variant="outline" 
                    onClick={clearAllFilters} 
                    className="text-sm"
                    size="sm"
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Packages;