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

const formatPrice = (price: string | undefined) => {
  if (!price) return '0';
  const numericValue = parseInt(price.replace(/[^0-9]/g, '')) || 0;
  return numericValue.toLocaleString('en-IN');
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const packagesPerPage = 6;
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const lastFocusedInput = useRef<'desktop' | 'mobile' | null>(null);

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
        .select('package_id, activity_details, attractions');
      
      if (detailsError) throw detailsError;

      const detailsMap = detailsData.reduce((acc, detail) => {
        acc[detail.package_id] = detail;
        return acc;
      }, {});

      setPackages(packagesData || []);
      setPackageDetails(detailsMap || {});
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
  
  const urlParams = new URLSearchParams(location.search);
  const searchQuery = urlParams.get('search') || urlParams.get('destination') || '';
  const pageParam = urlParams.get('page');
  
  setSearchInput(searchQuery);
  setSearchDestination(searchQuery);
  
  // Set current page from URL if available
  if (pageParam) {
    const page = parseInt(pageParam);
    if (!isNaN(page) && page > 0) {
      setCurrentPage(page);
    }
  }
}, [location]);

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
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">Filters</h3>
      <Button 
        variant="ghost" 
        onClick={clearAllFilters} // This calls the outer function
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
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="All Countries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {[...new Set(packages.map(pkg => pkg.country))].filter(Boolean).map(country => (
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
            <SelectItem value="0-10000">₹0–₹10,000</SelectItem>
            <SelectItem value="10000-25000">₹10,000–₹25,000</SelectItem>
            <SelectItem value="25000-50000">₹25,000–₹50,000</SelectItem>
            <SelectItem value="50000-100000">₹50,000–₹100,000</SelectItem>
            <SelectItem value="0-10000000">All Prices</SelectItem>
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
            {[...new Set(packages.map(pkg => pkg.mood))].filter(Boolean).map(mood => (
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
            {[...new Set(packages.map(pkg => pkg.trip_type))].filter(Boolean).map(type => (
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
            {[...new Set(packages.map(pkg => pkg.deal_type))].filter(Boolean).map(deal => (
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
            {[...new Set(packages.map(pkg => pkg.hotel_category))].filter(Boolean).map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <Checkbox
          id="with-flights-sidebar"
          checked={withFlights}
          onCheckedChange={(checked) => {
            setWithFlights(checked === true);
            setCurrentPage(1);
          }}
          className="h-3 w-3 scale-75" // Add scale-75 to shrink it further
        />
        <label htmlFor="with-flights-sidebar" className="text-sm">
          With Flights
        </label>
      </div>
    </div>
  ), [searchInput, selectedCountry, selectedMood, selectedTripType, selectedDealType, selectedHotelCategory, priceRange, withFlights, packages, showMobileFilters]);

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
  setCurrentPage(1);
  navigate('/packages', { replace: true }); // This will clear all URL params including page
};

  const handlePackageClick = (packageId: string) => {
  const urlParams = new URLSearchParams(location.search);
  urlParams.set('page', currentPage.toString());
  
  navigate(`/package/${packageId}?${urlParams.toString()}`);
};

  const handleInputFocus = (type: 'desktop' | 'mobile') => {
    lastFocusedInput.current = type;
  };

  const filteredPackages = packages.filter(pkg => {
    if (searchDestination) {
      const searchTerm = searchDestination.toLowerCase();
      const hasMatch = [pkg.title, pkg.country, ...(pkg.destinations || [])]
        .some(val => val && typeof val === 'string' && (
          val.toLowerCase().includes(searchTerm) ||
          searchTerm.split(/,\s*/).some(part => val.toLowerCase().includes(part))
        ));
      if (!hasMatch) return false;
    }

    const packagePrice = parseInt(pkg.price?.replace(/[^0-9]/g, '') || '0');
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
    const aPrice = parseInt(a.price?.replace(/[^0-9]/g, '') || '0');
    const bPrice = parseInt(b.price?.replace(/[^0-9]/g, '') || '0');
    
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
  
  // Update URL with page parameter
  const urlParams = new URLSearchParams(location.search);
  urlParams.set('page', pageNumber.toString());
  
  navigate(`/packages?${urlParams.toString()}`, { replace: true });
  setCurrentPage(pageNumber);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
                <h1 className="text-lg font-bold">
                  {searchInput ? `Packages for "${searchInput}"` : 'All Packages'} 
                  <span className="text-sm font-normal text-gray-600 ml-2">({sortedPackages.length} found)</span>
                </h1>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Select value={sortBy} onValueChange={(value) => {
                    setSortBy(value);
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="w-full sm:w-36 text-sm h-9">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="position">Default</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="with-flights-top"
                      checked={withFlights}
                      onCheckedChange={(checked) => {
                        setWithFlights(checked === true);
                        setCurrentPage(1);
                      }}
                      className="h-3 w-3 scale-75" // Add scale-75 to shrink it further
                    />
                    <label htmlFor="with-flights-top" className="text-xs">
                      With Flights
                    </label>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-3 bg-white rounded-lg shadow-sm border animate-pulse p-3">
                      <div className="w-full sm:w-1/3 h-40 bg-gray-200 rounded-lg"></div>
                      <div className="w-full sm:w-2/3 space-y-2">
                        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {currentPackages.map((pkg) => {
                      const activitiesCount = packageDetails[pkg.id]?.activity_details?.count || 0;
                      const attractionsCount = packageDetails[pkg.id]?.attractions?.length || 0;
                      
                      return (
                        <div 
                          key={pkg.id} 
                          className="flex flex-col sm:flex-row gap-3 bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handlePackageClick(pkg.id)}
                        >
                          <div className="w-full sm:w-1/3 relative">
                            <img 
                              src={pkg.image} 
                              alt={pkg.title}
                              className="w-full h-[12rem] object-cover"
                            />
                            <div className="absolute top-2 left-2 bg-blue-600 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                              {pkg.duration}
                            </div>
                            {pkg.deal_type !== 'Regular' && (
                              <div className="absolute top-2 right-2 bg-green-600 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                                {pkg.deal_type}
                              </div>
                            )}
                          </div>
                          
                          <div className="w-full sm:w-2/3 p-3 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="font-semibold text-base pr-2 line-clamp-2">{pkg.title}</h3>
                                <div className="flex items-center text-yellow-500 flex-shrink-0">
                                  <span className="text-xs">★</span>
                                  <span className="text-xs ml-0.5">{pkg.rating}</span>
                                </div>
                              </div>
                              
                              <p className="text-gray-600 mb-2 text-sm">{pkg.country}</p>
                              
                              <div className="grid grid-cols-2 gap-1 mb-2">
                                <div className="flex items-center text-xs text-gray-600">
                                  <span className="mr-1">✈️</span>
                                  <span className="truncate">{pkg.destinations?.join(', ') || 'Multiple'}</span>
                                </div>
                                <div className="flex items-center text-xs text-gray-600">
                                  <span className="mr-1">🏨</span>
                                  <span className="truncate">{pkg.hotel_category}</span>
                                </div>
                                <div className="flex items-center text-xs text-gray-600">
                                  <span className="mr-1">🎭</span>
                                  <span>Activities: {activitiesCount}</span>
                                </div>
                                <div className="flex items-center text-xs text-gray-600">
                                  <span className="mr-1">🏛️</span>
                                  <span>Attractions: {attractionsCount}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-1">
                              <div className="text-xs text-gray-500">
                                <span>{pkg.trip_type}</span>
                              </div>
                              <div className="text-right">
                                {pkg.original_price && (
                                  <span className="text-xs text-red-500 line-through block">
                                    ₹{formatPrice(pkg.original_price)}
                                  </span>
                                )}
                                <div className="text-base font-bold text-green-600">
                                  ₹{formatPrice(pkg.price)}
                                  <span className="text-xs font-normal text-gray-500 block">per person</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-6">
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
                <div className="text-center py-8">
                  <h3 className="text-base font-medium text-gray-900 mb-1">No packages found</h3>
                  <p className="text-sm text-gray-600">Try adjusting your filters to see more results.</p>
                  <Button 
                    variant="outline" 
                    onClick={clearAllFilters} 
                    className="mt-3 text-sm"
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