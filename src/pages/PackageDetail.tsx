import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Calendar, 
  Users, 
  Star, 
  MapPin, 
  Plane, 
  Hotel, 
  Camera, 
  ArrowLeft, 
  Share2, 
  Heart,
  Clock,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  ShoppingCart,
  Download,
  ClipboardCheck,
  Train,
  Bus,
  Ship,
  Coffee,
  Utensils,
  Mountain,
  Trophy
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import BookingPopup from '../components/BookingPopup';
import VideoSection from '../components/VideoSection';
import FlightDetails from '../components/FlightDetails';
import jsPDF from 'jspdf';

interface Package {
  id: string;
  title: string;
  country: string;
  destinations: string[];
  duration: string;
  price: string;
  original_price: string;
  rating: number;
  image: string;
  includes: string[];
  mood: string;
  trip_type: string;
  gallery_images?: string[];
  nights?: number;
  activities_count?: number;
  hotel_category?: string;
  meals_included?: string;
  transfer_included?: boolean;
  deal_type?: string;
  special_features?: string[];
  featured_locations?: string[];
  advance_booking_discount?: number;
  price_increase_warning?: string;
  per_person_price?: number;
  total_original_price?: number;
  activity_details?: {
    count: number;
    list: string[];
  };
}

interface PackageDetails {
  package_id: string;
  hero_image: string;
  pricing: {
    with_flights: { [key: string]: number };
    without_flights: { [key: string]: number };
  };
  attractions: string[];
  hotels: string[];
  itinerary: {
    [key: string]: Array<{
      day: number;
      title: string;
      activities: string[];
      accommodation: string;
      breakfast: string;
      lunch: string;
      dinner: string;
    }>;
  };
  flight_details: {
    roundTrip: boolean;
    airportTransfers: boolean;
  };
  hotel_details: {
    category: string;
    pickupDrop: boolean;
  };
  meal_details: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  activity_details: {
    list: string[];
    count: number;
  };
  combo_details: {
    isCombo: boolean;
    features: string[];
  };
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  author_image?: string;
  created_at: string;
  date_written?: string;
  categories?: string[];
  category?: string;
}

const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
  "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon",
  "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guyana", "Haiti",
  "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan",
  "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
  "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
  "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
  "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea",
  "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
  "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Saudi Arabia", "Senegal", "Serbia", "Seychelles",
  "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea",
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan",
  "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
  "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const visaDurations = ["15 Days", "30 Days"];

const PackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState('3');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [members, setMembers] = useState(1);
  const [withFlights, setWithFlights] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [isBookingPopupOpen, setIsBookingPopupOpen] = useState(false);
  const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [visaRates, setVisaRates] = useState<Record<string, Record<string, number>>>({});
  const [visaOrigin, setVisaOrigin] = useState('');
  const [visaDestination, setVisaDestination] = useState('');
  const [visaDuration, setVisaDuration] = useState('15 Days');
  const [visaMembers, setVisaMembers] = useState(1);
  const [addedVisaCost, setAddedVisaCost] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [flightSource, setFlightSource] = useState('');
  const [flightData, setFlightData] = useState<any>(null);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [destinationCountry, setDestinationCountry] = useState('');
  const [flightApiUrl, setFlightApiUrl] = useState('https://tour-travel-292283352371.asia-south1.run.app');

  const images = packageData?.gallery_images && packageData.gallery_images.length > 0 
    ? packageData.gallery_images 
    : [packageData?.image].filter(Boolean);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    if (packageData?.duration) {
      const daysMatch = packageData.duration.match(/^(\d+)\s*Days/i);
      if (daysMatch && daysMatch[1]) {
        setSelectedDuration(daysMatch[1]);
      }
    }
  }, [packageData]);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (id) {
      fetchPackageData();
      loadVisaRates();
    }
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const cartItemId = urlParams.get('cart_item_id');
    
    if (cartItemId && packageData) {
      loadCartItemDetails(cartItemId);
    }
  }, [location.search, packageData]);

  const loadVisaRates = async () => {
    const { data, error } = await supabase
      .from('visa_rates')
      .select('*');
    
    if (data && !error) {
      const ratesMap: Record<string, Record<string, number>> = {};
      data.forEach((rate) => {
        if (!ratesMap[rate.destination_country]) {
          ratesMap[rate.destination_country] = {};
        }
        ratesMap[rate.destination_country]["15 Days"] = rate.price_15_days;
        ratesMap[rate.destination_country]["30 Days"] = rate.price_30_days;
      });
      setVisaRates(ratesMap);
    }
  };

  const loadCartItemDetails = async (cartItemId: string) => {
    try {
      const { data, error } = await supabase
        .from('cart')
        .select('*')
        .eq('id', cartItemId)
        .single();

      if (error) throw error;

      if (data) {
        setSelectedDuration(data.days.toString());
        setMembers(data.members || 1);
        setWithFlights(data.with_flights || false);
        if (data.selected_date) {
          setSelectedDate(new Date(data.selected_date));
        }
      }
    } catch (error) {
      console.error('Error loading cart item details:', error);
    }
  };

  const fetchPackageData = async () => {
    try {
      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .select('*')
        .eq('id', id)
        .single();

      if (packageError) throw packageError;

      const { data: detailsData, error: detailsError } = await supabase
        .from('package_details')
        .select('*')
        .eq('package_id', id)
        .maybeSingle();

      if (detailsError && detailsError.code !== 'PGRST116') {
        console.error('Error fetching package details:', detailsError);
      }

      setPackageData(packageData);
      setVisaDestination(packageData.country);

      if (detailsData) {
        let parsedDetails = { ...detailsData } as any;
        if (typeof parsedDetails.pricing === 'string') {
          try {
            parsedDetails.pricing = JSON.parse(parsedDetails.pricing);
          } catch (e) {
            parsedDetails.pricing = { with_flights: {}, without_flights: {} };
          }
        }
        if (parsedDetails.activity_details) {
          (packageData as Package).activity_details = parsedDetails.activity_details;
        }
        setPackageDetails(parsedDetails as PackageDetails);
      } else {
        setPackageDetails(null);
      }

      if (user) {
        await supabase.from('user_activities').insert({
          user_id: user.id,
          action_type: 'view',
          item_type: 'package',
          item_id: id!,
          item_name: packageData.title,
          user_email: user.email
        });
      }
    } catch (error) {
      console.error('Error fetching package:', error);
      toast({
        title: "Error",
        description: "Failed to load package details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedBlogs = async () => {
    if (!packageData) return;
    
    setBlogsLoading(true);
    try {
      const searchQueries = packageData.destinations.map(dest => 
        `title.ilike.%${dest}%,content.ilike.%${dest}%`
      );
      
      const { data: blogData, error } = await supabase
        .from('blog')
        .select('id, title, excerpt, image, author, author_image, created_at, date_written, categories, category')
        .eq('published', true)
        .or(searchQueries.join(','))
        .order('created_at', { ascending: false })
        .limit(6);

      if (!error && blogData) {
        setRelatedBlogs(blogData);
      }
    } catch (error) {
      console.error('Error loading related blogs:', error);
    } finally {
      setBlogsLoading(false);
    }
  };

  const getCurrentPrice = () => {
    if (!packageDetails?.pricing) {
      const basePrice = parseInt(packageData?.price?.replace(/[^0-9]/g, '') || '0');
      return basePrice;
    }

    const withoutFlightsPrice = packageDetails.pricing.without_flights?.[selectedDuration] || 0;
    
    if (!withFlights) {
      return withoutFlightsPrice;
    }
    
    if (flightData && flightData.total_price_in_inr) {
      return withoutFlightsPrice + flightData.total_price_in_inr;
    }
    
    return packageDetails.pricing.with_flights?.[selectedDuration] || withoutFlightsPrice;
  };

  // NEW: Calculate the adjusted original price based on flight selection
  const getAdjustedOriginalPrice = () => {
    if (!packageData?.original_price) return 0;

    const originalBasePrice = parseInt(packageData.original_price.replace(/[^0-9]/g, '')) || 0;
    
    if (!packageDetails?.pricing) {
      return originalBasePrice;
    }

    const withFlightsPrice = packageDetails.pricing.with_flights?.[selectedDuration] || 0;
    const withoutFlightsPrice = packageDetails.pricing.without_flights?.[selectedDuration] || 0;

    if (withFlightsPrice === 0 || withoutFlightsPrice === 0) {
      return originalBasePrice;
    }

    // Calculate the percentage difference between with_flights and without_flights
    const priceDifference = withFlightsPrice - withoutFlightsPrice;
    const percentageOfOriginal = priceDifference / withFlightsPrice;

    if (withFlights) {
      // When flights are selected, use full original price
      return originalBasePrice;
    } else {
      // When flights are not selected, subtract the same percentage from original price
      const adjustedPrice = originalBasePrice * (1 - percentageOfOriginal);
      return Math.round(adjustedPrice);
    }
  };

  const getTotalPrice = () => {
    return (getCurrentPrice() * members) + addedVisaCost;
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to your cart",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (!packageData) return;

    try {
      const { error } = await supabase.from('cart').insert({
        package_id: packageData.id,
        user_id: user.id,
        days: parseInt(selectedDuration),
        total_price: getCurrentPrice() * members,
        members: members,
        with_flights: withFlights,
        selected_date: selectedDate ? selectedDate.toISOString() : null,
        with_visa: addedVisaCost > 0,
        visa_cost: addedVisaCost,
        booking_type: 'cart'
      });

      if (error) throw error;

      toast({
        title: "Added to Cart!",
        description: "Package has been added to your cart",
      });

      await supabase.from('user_activities').insert({
        user_id: user.id,
        action_type: 'add_to_cart',
        item_type: 'package',
        item_id: packageData.id,
        item_name: packageData.title,
        user_email: user.email
      });

      navigate('/cart');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBookNow = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to book this package",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    setIsBookingPopupOpen(true);
  };

  const nextImage = () => {
    const images = packageData?.gallery_images || [packageData?.image].filter(Boolean);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = packageData?.gallery_images || [packageData?.image].filter(Boolean);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getActivityIcon = (activity: string) => {
    const activityLower = activity.toLowerCase();
    
    if (activityLower.includes('train to')) {
      return <Train className="h-5 w-5 text-blue-600" />;
    }
    if (activityLower.includes('flight to') || activityLower.includes('fly to')) {
      return <Plane className="h-5 w-5 text-indigo-600" />;
    }
    if (activityLower.includes('bus to')) {
      return <Bus className="h-5 w-5 text-green-600" />;
    }
    if (activityLower.includes('food') || activityLower.includes('meal') || activityLower.includes('lunch') || activityLower.includes('dinner')) {
      return <Utensils className="h-5 w-5 text-orange-500" />;
    }
    if (activityLower.includes('photo') || activityLower.includes('view') || activityLower.includes('sight')) {
      return <Camera className="h-5 w-5 text-blue-500" />;
    }
    if (activityLower.includes('coffee') || activityLower.includes('tea') || activityLower.includes('break')) {
      return <Coffee className="h-5 w-5 text-amber-600" />;
    }
    if (activityLower.includes('mountain') || activityLower.includes('trek') || activityLower.includes('hike')) {
      return <Mountain className="h-5 w-5 text-green-600" />;
    }
    return <Clock className="h-5 w-5 text-gray-500" />;
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let yPosition = margin;

    doc.setFillColor(23, 37, 84);
    doc.rect(0, 0, pageWidth, 60, 'F');
    
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('TravelGenz', margin, 40);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Crafting Unforgettable Journeys', margin, 47);
    
    if (images && images.length > 0) {
      try {
        const imgData = await getImageData(images[0]);
        const imgWidth = pageWidth - 2 * margin;
        const imgHeight = imgWidth * 0.6;
        
        doc.addImage(imgData, 'JPEG', margin, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 15;
      } catch (error) {
        console.error('Error adding main image to PDF:', error);
        yPosition += 15;
      }
    } else {
      yPosition += 15;
    }
    
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(23, 37, 84);
    doc.text(packageData?.title || 'Trip Itinerary', margin, yPosition);
    
    yPosition += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`${selectedDuration} Days • ${packageData?.trip_type || 'Package'} • ${packageData?.destinations.join(' → ')}`, margin, yPosition);
    
    yPosition += 8;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Created on ${format(new Date(), 'MMMM dd, yyyy')}`, margin, yPosition);
    
    yPosition += 20;
    
    doc.setFillColor(240, 249, 255);
    doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 25, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 25, 'D');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(50, 50, 50);
    const quote = `"${packageData?.destinations[0]} awaits with unforgettable experiences. This itinerary has been carefully crafted to ensure you make the most of every moment."`;
    const splitQuote = doc.splitTextToSize(quote, pageWidth - 2 * margin - 10);
    doc.text(splitQuote, margin, yPosition + 8);
    
    yPosition += 35;
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(23, 37, 84);
    doc.text('Trip At A Glance', margin, yPosition);
    yPosition += 10;
    
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;
    
    const quickFacts = [
      { icon: '🗓️', title: 'Duration', value: `${selectedDuration} Days ${parseInt(selectedDuration) > 1 ? parseInt(selectedDuration)-1 + ' Nights' : ''}` },
      { icon: '📍', title: 'Destinations', value: packageData?.destinations.join(', ') },
      { icon: '✈️', title: 'Flight Option', value: withFlights ? 'Included' : 'Not Included' },
      { icon: '👥', title: 'Travelers', value: `${members} ${members > 1 ? 'Persons' : 'Person'}` },
      { icon: '🏨', title: 'Accommodation', value: `${packageDetails?.hotels?.length || 'Premium'} Hotels` },
      { icon: '📅', title: 'Travel Date', value: selectedDate ? format(selectedDate, 'MMMM dd, yyyy') : 'Flexible' }
    ];
    
    let factX = margin;
    let factY = yPosition;
    quickFacts.forEach((fact, index) => {
      if (index % 3 === 0 && index !== 0) {
        factX = margin;
        factY += 30;
      }
      
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(factX, factY, 55, 25, 3, 3, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.roundedRect(factX, factY, 55, 25, 3, 3, 'D');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50, 50, 50);
      doc.text(`${fact.icon} ${fact.title}`, factX + 5, factY + 8);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      const splitValue = doc.splitTextToSize(fact.value, 45);
      doc.text(splitValue, factX + 5, factY + 16);
      
      factX += 60;
    });
    
    yPosition = factY + 35;
    
    if (images && images.length > 1) {
      try {
        doc.addPage();
        yPosition = margin;
        
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(23, 37, 84);
        doc.text('Destination Gallery', margin, yPosition);
        yPosition += 10;
        
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 15;
        
        for (let i = 1; i < Math.min(images.length, 4); i++) {
          if (yPosition > pageHeight - 150) {
            doc.addPage();
            yPosition = margin;
          }
          
          try {
            const imgData = await getImageData(images[i]);
            const imgWidth = pageWidth - 2 * margin;
            const imgHeight = imgWidth * 0.5;
            
            doc.addImage(imgData, 'JPEG', margin, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 10;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100, 100, 100);
            doc.text(`Image ${i + 1} of ${images.length}`, margin, yPosition);
            yPosition += 15;
          } catch (error) {
            console.error(`Error adding image ${i} to PDF:`, error);
          }
        }
      } catch (error) {
        console.error('Error adding gallery to PDF:', error);
      }
    }
    
    doc.addPage();
    yPosition = margin;
    
    doc.setFillColor(23, 37, 84);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 30, 'F');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Pricing Summary', margin + 10, yPosition + 20);
    
    yPosition += 40;
    
    const currentPrice = getCurrentPrice();
    const totalPrice = currentPrice * members;
    const originalPrice = getAdjustedOriginalPrice();
    const totalOriginalPrice = originalPrice * members;
    const grandTotalPrice = totalPrice + addedVisaCost;
    
    const priceDetails = [
      { item: 'Base Price', value: `₹${currentPrice.toLocaleString()} x ${members}` },
      { item: 'Subtotal', value: `₹${totalPrice.toLocaleString()}` },
    ];
    
    if (addedVisaCost > 0) {
      priceDetails.push({ item: 'Visa Fees', value: `₹${addedVisaCost.toLocaleString()}` });
    }
    
    priceDetails.push({ item: 'Grand Total', value: `₹${grandTotalPrice.toLocaleString()}` });
    
    priceDetails.forEach((detail, index) => {
      doc.setFontSize(index === priceDetails.length - 1 ? 12 : 10);
      doc.setFont('helvetica', index === priceDetails.length - 1 ? 'bold' : 'normal');
      doc.setTextColor(0, 0, 0);
      
      doc.text(detail.item, margin + 5, yPosition + 8);
      
      const textWidth = doc.getStringUnitWidth(detail.value) * doc.getFontSize() / doc.internal.scaleFactor;
      doc.text(detail.value, pageWidth - margin - 5 - textWidth, yPosition + 8);
      
      if (index === priceDetails.length - 2) {
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition + 12, pageWidth - margin, yPosition + 12);
        yPosition += 5;
      }
      
      yPosition += 10;
    });
    
    if (originalPrice > 0 && totalOriginalPrice > totalPrice) {
      yPosition += 5;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      doc.text(`You save ₹${(totalOriginalPrice - totalPrice).toLocaleString()} (${Math.round(((totalOriginalPrice - totalPrice)/totalOriginalPrice)*100)}% off)`, margin + 5, yPosition);
      yPosition += 10;
    }
    
    yPosition += 15;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(120, 120, 120);
    const disclaimer = '* Prices are subject to availability and may change. Final pricing will be confirmed at the time of booking. Taxes and fees included.';
    const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 2 * margin);
    doc.text(splitDisclaimer, margin, yPosition);
    
    yPosition += 20;
    
    doc.addPage();
    yPosition = margin;
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(23, 37, 84);
    doc.text('Detailed Itinerary', margin, yPosition);
    yPosition += 10;
    
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;
    
    const itinerary = packageDetails?.itinerary?.[selectedDuration] || [];
    itinerary.forEach((day: any, index: number) => {
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = margin;
      }
      
      const dayDate = selectedDate ? 
        new Date(selectedDate.getTime() + ((day.day - 1) * 24 * 60 * 60 * 1000)) : 
        null;
      
      doc.setFillColor(23, 37, 84);
      doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 15, 'F');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(`Day ${day.day}: ${day.title || `Exploring ${packageData?.destinations[0]}`}${dayDate ? ` • ${format(dayDate, 'EEE, MMM dd')}` : ''}`, margin, yPosition + 5);
      yPosition += 20;
      
      if (day.activities && day.activities.length > 0) {
        day.activities.forEach((activity: string, i: number) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = margin;
          }
          
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, yPosition, pageWidth - 2 * margin, 20, 'F');
          doc.setDrawColor(220, 220, 220);
          doc.rect(margin, yPosition, pageWidth - 2 * margin, 20, 'D');
          
          doc.setFillColor(23, 37, 84);
          doc.rect(margin, yPosition, 25, 20, 'F');
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(255, 255, 255);
          doc.text(getTimeSlot(i), margin + 5, yPosition + 12);
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(50, 50, 50);
          doc.text(activity, margin + 30, yPosition + 12);
          
          yPosition += 25;
        });
      } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150, 150, 150);
        doc.text('Activities to be customized based on your preferences', margin, yPosition + 5);
        yPosition += 15;
      }
      
      yPosition += 10;
    });
    
    if (packageDetails?.attractions && packageDetails.attractions.length > 0) {
      doc.addPage();
      yPosition = margin;
      
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(23, 37, 84);
      doc.text('Top Attractions', margin, yPosition);
      yPosition += 10;
      
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      
      packageDetails.attractions.forEach((attraction, index) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = margin;
        }
        
        const fillColor = index % 2 === 0 ? [248, 250, 252] : [255, 255, 255];
        doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
        
        doc.text(`✓ ${attraction}`, margin + 5, yPosition + 7);
        yPosition += 10;
      });
      
      yPosition += 15;
    }
    
    if (packageDetails?.hotels && packageDetails.hotels.length > 0) {
      doc.addPage();
      yPosition = margin;
      
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(23, 37, 84);
      doc.text('Accommodations', margin, yPosition);
      yPosition += 10;
      
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;
      
      doc.setFontSize(10);
      packageDetails.hotels.forEach((hotel, index) => {
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(23, 37, 84);
        doc.text(`🏨 ${hotel}`, margin, yPosition);
        yPosition += 7;
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('4-star property with premium amenities and excellent location', margin + 10, yPosition);
        yPosition += 15;
      });
      
      yPosition += 10;
    }
    
    doc.addPage();
    yPosition = margin;
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(23, 37, 84);
    doc.text('Package Inclusions', margin, yPosition);
    yPosition += 10;
    
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    packageData?.includes.forEach((inclusion, index) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = margin;
      }
      
      const fillColor = index % 2 === 0 ? [248, 250, 252] : [255, 255, 255];
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
      
      doc.text(`✓ ${inclusion}`, margin + 5, yPosition + 7);
      yPosition += 10;
    });

    if (packageDetails?.activity_details?.list) {
      packageDetails.activity_details.list.forEach((activity, index) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
        doc.text(`✓ ${activity}`, margin + 5, yPosition + 7);
        yPosition += 10;
      });
    }
    
    yPosition += 20;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(23, 37, 84);
    doc.text('How To Book', margin, yPosition);
    yPosition += 10;
    
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;
    
    const bookingSteps = [
      "1. Review this itinerary and make any desired changes",
      "2. Contact our travel experts to confirm availability",
      "3. Make a 20% deposit to secure your booking",
      "4. Receive your booking confirmation and travel documents",
      "5. Pay the remaining balance 30 days before departure"
    ];
    
    doc.setFontSize(10);
    bookingSteps.forEach((step, index) => {
      doc.text(step, margin + 5, yPosition + 5);
      yPosition += 10;
    });
    
    yPosition += 20;
    
    doc.setFillColor(240, 249, 255);
    doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 40, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 40, 'D');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(23, 37, 84);
    doc.text('Need Assistance?', margin, yPosition + 10);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Email: info@travelgenz.com', margin, yPosition + 20);
    doc.text('Phone: +1 (555) 123-4567', margin, yPosition + 30);
    
    doc.save(`${packageData?.title.replace(/\s+/g, '_') || 'TravelGenz_Itinerary'}.pdf`);
    
    toast({
      title: "PDF Downloaded",
      description: "Your complete itinerary has been downloaded",
    });

    if (user && packageData) {
      await supabase.from('user_activities').insert({
        user_id: user.id,
        action_type: 'download_itinerary',
        item_type: 'package',
        item_id: packageData.id,
        item_name: packageData.title,
        user_email: user.email
      });
    }
  };

  const getImageData = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/jpeg', 0.8);
            resolve(dataURL);
          } else {
            reject(new Error('Could not get canvas context'));
          }
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      img.src = url;
    });
  };

  const getTimeSlot = (index: number) => {
    const timeSlots = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'];
    return timeSlots[index] || 'ACTIVITY';
  };

  const calculateVisaCost = () => {
    if (!visaDestination || !visaRates[visaDestination]) return 0;
    return visaRates[visaDestination][visaDuration] || 0;
  };

  const fetchFlightData = async () => {
    if (!flightSource || !selectedDate || !packageData) {
      return;
    }

    setLoadingFlights(true);
    setFlightData(null);

    try {
      let destinationIATA = "BOM";
      let sourceIATA = flightSource.trim().toUpperCase();

      try {
        const destinationQueries = packageData.destinations.map(dest => 
          `destinations.ilike.%${dest}%`
        );
        
        const { data: destinationIataData, error: destinationError } = await supabase
          .from('iata' as any)
          .select('iata, destinations, country')
          .or(destinationQueries.join(','))
          .limit(1);

        if (!destinationError && destinationIataData && destinationIataData.length > 0) {
          destinationIATA = (destinationIataData as any)[0].iata;
          setDestinationCountry((destinationIataData as any)[0].country || packageData.destinations.join(', '));
        } else {
          setDestinationCountry(packageData.destinations.join(', '));
        }
      } catch (destinationLookupError) {
        setDestinationCountry(packageData.destinations.join(', '));
      }

      const cityToIATA: Record<string, string> = {
        'delhi': 'DEL',
        'mumbai': 'BOM',
        'chennai': 'MAA',
        'kolkata': 'CCU',
        'bangalore': 'BLR',
        'bengaluru': 'BLR',
        'hyderabad': 'HYD',
        'pune': 'PNQ',
        'ahmedabad': 'AMD',
        'jaipur': 'JAI',
        'kochi': 'COK',
        'goa': 'GOI'
      };

      const lowerSource = flightSource.toLowerCase();
      let foundInFallback = false;
      
      for (const [city, code] of Object.entries(cityToIATA)) {
        if (lowerSource.includes(city)) {
          sourceIATA = code;
          foundInFallback = true;
          break;
        }
      }

      if (!foundInFallback && sourceIATA.length !== 3) {
        try {
          const { data: sourceIataData, error: sourceError } = await supabase
            .from('iata' as any)
            .select('iata, destinations')
            .ilike('destinations', `%${flightSource}%`)
            .limit(1);
          
          if (!sourceError && sourceIataData && sourceIataData.length > 0) {
            sourceIATA = (sourceIataData as any)[0].iata;
          }
        } catch (sourceLookupError) {
          console.warn('Source IATA lookup failed:', sourceLookupError);
        }
      }

      const departureDate = format(selectedDate, 'yyyy-MM-dd');
      const duration = `${selectedDuration} days`;

      const params = new URLSearchParams({
        origin: sourceIATA,
        destination: destinationIATA,
        departure_date: departureDate,
        duration: duration
      });
      
      const response = await fetch(`${flightApiUrl}/flight-price?${params.toString()}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Flight API error:', errorText);
        throw new Error('Failed to fetch flight data');
      }

      const data = await response.json();
      
      if (data.message) {
        toast({
          title: "No Flights Found",
          description: data.message,
          variant: "destructive",
        });
        setFlightData(null);
      } else {
        setFlightData(data);
        toast({
          title: "Flights Found!",
          description: "Flight details loaded successfully",
        });
      }
    } catch (error) {
      console.error('Error fetching flight data:', error);
      toast({
        title: "Flight Search Failed",
        description: "Please check if the API is running and destinations are valid",
        variant: "destructive",
      });
      setFlightData(null);
    } finally {
      setLoadingFlights(false);
    }
  };

  useEffect(() => {
    if (flightSource && selectedDate && packageData) {
      fetchFlightData();
    }
  }, [selectedDate, flightSource]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 md:h-32 md:w-32 border-b-2 border-travel-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Package not found</h1>
            <Button onClick={() => navigate('/packages')}>
              ← Back to Packages
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentItinerary = packageDetails?.itinerary?.[selectedDuration] || [];
  const totalVisaCost = calculateVisaCost() * visaMembers;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-16 md:pt-16">
        <div className="lg:hidden bg-white border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/packages')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative min-h-[400px] overflow-hidden">
          <div
            className="absolute inset-0 bg-center bg-cover scale-110"
            style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
          />
          
          <div
            className="absolute inset-0 bg-center bg-cover scale-110 blur-2xl opacity-70"
            style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
          />
          
          <div
            className="absolute inset-0 bg-center bg-cover scale-105 blur-lg opacity-50"
            style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
          />
          
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-white/20">
              <div className="p-6 md:p-8">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 text-gray-900 line-clamp-2">
                  {packageData.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm md:text-base text-gray-700 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                    <span>{packageData.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                    <span>{packageData.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 md:h-5 md:w-5 text-yellow-500 fill-current" />
                    <span>{packageData.rating}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-2 text-sm md:text-base text-gray-800">Destinations</h3>
                  <div className="flex flex-wrap gap-2">
                    {packageData.destinations.map((destination, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {destination}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4 text-sm md:text-base">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Hotel className="h-5 w-5 text-purple-600" />
                    <span>{packageData.hotel_category || "3-4 Star"}</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Utensils className="h-5 w-5 text-orange-600" />
                    <span>{packageData.meals_included || "Breakfast"}</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Plane className="h-5 w-5 text-indigo-600" />
                    <span>{packageData.transfer_included ? "Transfers" : "No Transfers"}</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    <span>
                      {packageData.activity_details?.count ||
                        packageDetails?.activity_details?.count ||
                        0}{" "}
                      Activities
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative h-[300px] lg:h-[400px]">
                <motion.img
                  key={currentImageIndex}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  src={images[currentImageIndex]}
                  alt={packageData.title}
                  className="w-full h-full object-cover"
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setShowGallery(true)}
                      className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm hover:bg-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg z-10 transition-all duration-200 hover:scale-105"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Gallery ({images.length})</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
                      }}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-3 z-10 transition-all duration-200 hover:scale-110"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) => (prev + 1) % images.length);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-3 z-10 transition-all duration-200 hover:scale-110"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(index);
                          }}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            currentImageIndex === index 
                              ? "bg-white w-6 shadow-lg" 
                              : "bg-white/60 w-2 hover:bg-white/80"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <Card>
                <CardContent className="p-4 md:p-6">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 text-xs md:text-sm">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                      <TabsTrigger value="inclusions">Inclusions</TabsTrigger>
                      <TabsTrigger value="hotels">Hotels</TabsTrigger>
                      <TabsTrigger value="blogs" onClick={loadRelatedBlogs}>Blog</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-[4rem] md:mt-6">
                      <div className="space-y-4 md:space-y-6">
                        <div>
                          <h3 className="font-semibold mb-2 md:mb-3 text-base md:text-lg">About This Trip</h3>
                          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                            Experience the best of {packageData.destinations.join(', ')} with our carefully crafted {packageData.duration} package. 
                            Perfect for {packageData.trip_type.toLowerCase()} travelers seeking {packageData.mood.toLowerCase()} experiences.
                          </p>
                        </div>

                        {packageDetails?.attractions && packageDetails.attractions.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-2 md:mb-3 text-base md:text-lg">Top Attractions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                              {packageDetails.attractions.map((attraction, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm md:text-base">
                                  <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500 flex-shrink-0" />
                                  <span>{attraction}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {packageData.special_features && packageData.special_features.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-2 md:mb-3 text-base md:text-lg">Special Features</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                              {packageData.special_features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm md:text-base">
                                  <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-blue-500 flex-shrink-0" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="itinerary" className="mt-[4rem] md:mt-6">
                      <div className="space-y-4 md:space-y-6">
                        <div className="text-sm font-medium text-gray-700">
                          {selectedDuration} Days Itinerary
                        </div>

                        {currentItinerary.length > 0 ? (
                          <div className="space-y-3 md:space-y-4">
                            {currentItinerary.map((day, index) => (
                              <div key={index} className="border rounded-lg p-3 md:p-4 bg-white">
                                <h4 className="font-semibold mb-2 text-sm md:text-base text-blue-600">
                                  Day {day.day}: {day.title}
                                </h4>
                                
                                {day.activities && day.activities.length > 0 && (
                                  <div className="mb-3">
                                    <h5 className="font-medium mb-1 text-xs md:text-sm">Activities:</h5>
                                    <ul className="space-y-1">
                                      {day.activities.map((activity, actIndex) => (
                                        <li key={actIndex} className="text-xs md:text-sm text-gray-600 flex items-start gap-2">
                                          <span className="text-blue-500 mt-1">•</span>
                                          <span>{activity}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm">
                                  {day.accommodation && (
                                    <div>
                                      <span className="font-medium">🏨 Stay:</span>
                                      <span className="ml-1">{day.accommodation}</span>
                                    </div>
                                  )}
                                  {day.breakfast && (
                                    <div>
                                      <span className="font-medium">🍳 Breakfast:</span>
                                      <span className="ml-1">{day.breakfast}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 md:py-8 text-gray-500">
                            <p className="text-sm md:text-base">Detailed itinerary will be provided upon booking.</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="inclusions" className="mt-[4rem] md:mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        {packageData.includes.map((inclusion, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm md:text-base">
                            <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500 flex-shrink-0" />
                            <span>{inclusion}</span>
                          </div>
                        ))}
                        {packageDetails?.activity_details?.list && packageDetails.activity_details.list.map((activity, index) => (
                          <div key={`activity-${index}`} className="flex items-center gap-2 text-sm md:text-base">
                            <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-blue-500 flex-shrink-0" />
                            <span>{activity}</span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="hotels" className="mt-[4rem] md:mt-6">
                      {packageDetails?.hotels && packageDetails.hotels.length > 0 ? (
                        <div className="space-y-3 md:space-y-4">
                          {packageDetails.hotels.map((hotel, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm md:text-base">
                              <Hotel className="h-3 w-3 md:h-4 md:w-4 text-blue-500 flex-shrink-0" />
                              <span>{hotel}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 md:py-8 text-gray-500">
                          <p className="text-sm md:text-base">Hotel details will be provided upon booking.</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="blogs" className="mt-[4rem] md:mt-6">
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold mb-6">Blog & Useful Tips</h3>
                          
                          {blogsLoading ? (
                            <div className="flex justify-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-travel-primary"></div>
                            </div>
                          ) : relatedBlogs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {relatedBlogs.map((blog) => (
                                <div
                                  key={blog.id}
                                  onClick={() => navigate(`/blog/${blog.id}`)}
                                  className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                                >
                                  {blog.image && (
                                    <img 
                                      src={blog.image}
                                      alt={blog.title}
                                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  )}
                                  <div className="p-4">
                                    <h4 className="font-semibold text-lg mb-2 text-gray-900 line-clamp-2 group-hover:text-travel-primary transition-colors">
                                      {blog.title}
                                    </h4>
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                                      {blog.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                      <span>{blog.author}</span>
                                      <span>{format(new Date(blog.date_written || blog.created_at), 'MMMM dd, yyyy')}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <p>No related articles found for this destination.</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <VideoSection packageId={packageData?.id} />

              <Card>
                <CardContent className="p-6">
                  <Tabs defaultValue="visa">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="visa">
                        <ClipboardCheck className="mr-2 h-4 w-4" /> Visa Assistance
                      </TabsTrigger>
                      <TabsTrigger value="download">
                        <Download className="mr-2 h-4 w-4" /> Download Itinerary
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="visa" className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Departure Country</label>
                            <select
                                value={visaOrigin}
                                onChange={(e) => setVisaOrigin(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">Select Country</option>
                                {countries.map((country) => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                            </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700">Destination Country</label>
                              <select
                                  value={visaDestination}
                                  onChange={(e) => setVisaDestination(e.target.value)}
                                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                              >
                                  <option value="">Select Country</option>
                                  {countries.map((country) => (
                                      <option key={country} value={country}>{country}</option>
                                  ))}
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700">Visa Duration</label>
                              <select
                                  value={visaDuration}
                                  onChange={(e) => setVisaDuration(e.target.value)}
                                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                  disabled={!visaDestination}
                              >
                                  {visaDurations.map((d) => (
                                      <option key={d} value={d}>{d}</option>
                                  ))}
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700">Number of Members</label>
                              <div className="flex items-center gap-4 mt-1">
                                  <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setVisaMembers(Math.max(1, visaMembers - 1))}
                                      disabled={visaMembers <= 1}
                                  >
                                      <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="font-semibold">{visaMembers}</span>
                                  <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setVisaMembers(visaMembers + 1)}
                                  >
                                      <Plus className="h-4 w-4" />
                                  </Button>
                              </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg space-y-4 flex flex-col justify-center">
                          <h4 className="text-lg font-bold">Visa Cost Summary</h4>
                          <div className="flex justify-between">
                              <span>Visa Cost per Member:</span>
                              <span className="font-semibold">₹{calculateVisaCost().toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                              <span>Members:</span>
                              <span className="font-semibold">{visaMembers}</span>
                          </div>
                          <hr />
                          <div className="flex justify-between text-xl font-bold">
                              <span>Total Visa Cost:</span>
                              <span className="text-green-600">₹{totalVisaCost.toLocaleString()}</span>
                          </div>
                          
                          <Button
                              className={`w-full ${addedVisaCost > 0 ? '' : 'bg-green-600 hover:bg-green-700'}`}
                              onClick={() => {
                                  if (addedVisaCost > 0) {
                                      setAddedVisaCost(0);
                                  } else {
                                      setAddedVisaCost(totalVisaCost);
                                  }
                              }}
                              disabled={totalVisaCost === 0 && addedVisaCost === 0}
                              variant={addedVisaCost > 0 ? "destructive" : "default"}
                          >
                              {addedVisaCost > 0 ? `Remove Visa Cost (₹${addedVisaCost.toLocaleString()})` : "Add Visa Cost to Package"}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="download" className="mt-6">
                      <div className="text-center space-y-6">
                        <div className="max-w-md mx-auto">
                          <h3 className="text-2xl font-bold text-gray-900 mb-4">Download Your Itinerary</h3>
                          <p className="text-gray-600 mb-6">
                            Get a comprehensive PDF document with your complete travel itinerary, 
                            including day-by-day activities, pricing details, and package inclusions.
                          </p>
                          
                          <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-gray-900 mb-3">Your PDF will include:</h4>
                            <div className="space-y-2 text-sm text-gray-700">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Complete {selectedDuration}-day itinerary</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Pricing breakdown for {members} member(s)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Package inclusions & attractions</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Day-wise activity schedule</span>
                              </div>
                            </div>
                          </div>

                          <Button 
                            onClick={generatePDF}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg"
                            size="lg"
                          >
                            <Download className="mr-2 h-5 w-5" />
                            Download PDF Itinerary
                          </Button>
                          
                          <p className="text-xs text-gray-500 mt-3">
                            PDF will be downloaded to your device immediately
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-20 md:top-24">
                <Card className="shadow-lg">
                  <CardHeader className="pb-3 md:pb-4">
                    <CardTitle className="text-lg md:text-xl">Book This Package</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 md:space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Duration</label>
                      <div className="border rounded-lg px-3 py-2 bg-gray-50 text-sm">
                        {selectedDuration} Days
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="flights"
                        checked={withFlights}
                        onChange={(e) => setWithFlights(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="flights" className="text-sm md:text-base">Include Flights</label>
                    </div>

                    {withFlights && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2">Source</label>
                          <Input
                            type="text"
                            placeholder="e.g., Delhi, Mumbai, DEL"
                            value={flightSource}
                            onChange={(e) => setFlightSource(e.target.value)}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Enter your departure city or airport code
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Travel Date</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal text-sm md:text-base",
                                  !selectedDate && "text-muted-foreground"
                                )}
                              >
                                <Calendar className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                                {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium mb-2">Number of Travelers</label>
                      <div className="flex items-center justify-between border rounded-lg p-2 md:p-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMembers(Math.max(1, members - 1))}
                          disabled={members <= 1}
                          className="h-6 w-6 md:h-8 md:w-8 p-0"
                        >
                          <Minus className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                        <span className="font-medium text-sm md:text-base">{members} {members === 1 ? 'Person' : 'People'}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMembers(members + 1)}
                          className="h-6 w-6 md:h-8 md:w-8 p-0"
                        >
                          <Plus className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      {/* UPDATED: Use getAdjustedOriginalPrice instead of fixed original price */}
                      {packageData.original_price && (
                        <div className="flex justify-between text-sm md:text-base text-gray-500">
                          <span>Original Price:</span>
                          <span className="line-through">
                            ₹{(getAdjustedOriginalPrice() * members).toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-sm md:text-base">
                        <span>
                          Package ({selectedDuration} days × {members} {members === 1 ? 'person' : 'people'})
                        </span>
                        <span>₹{(getCurrentPrice() * members).toLocaleString()}</span>
                      </div>

                      {addedVisaCost > 0 && (
                        <div className="flex justify-between text-sm md:text-base">
                          <span>Visa Assistance</span>
                          <span>₹{addedVisaCost.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="flex justify-between font-bold text-base md:text-lg border-t pt-2">
                        <span>Total</span>
                        <span className="text-green-600">₹{getTotalPrice().toLocaleString()}</span>
                      </div>

                      {/* UPDATED: Calculate savings based on adjusted original price */}
                      {packageData.original_price && (
                        <motion.div 
                          className="flex justify-between items-center mt-2 p-2 bg-green-50 rounded-lg border border-green-200"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        >
                          <span className="text-green-700 font-semibold text-sm">Saved:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-green-700 font-bold">
                              ₹{((getAdjustedOriginalPrice() * members) - (getCurrentPrice() * members)).toLocaleString()}
                            </span>
                            <motion.span
                              className="text-red-500"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                            >
                              ❤️
                            </motion.span>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="space-y-2 md:space-y-3">
                      <Button 
                        onClick={handleBookNow}
                        className="w-full bg-travel-primary hover:bg-travel-primary/90 text-sm md:text-base py-2 md:py-3"
                      >
                        Book Now
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleAddToCart}
                        className="w-full text-sm md:text-base py-2 md:py-3"
                      >
                        <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>

                    <div className="text-center text-xs md:text-sm text-gray-600 border-t pt-4">
                      <p>Need help? Call us at</p>
                      <p className="font-semibold text-travel-primary">+91 9910565588</p>
                    </div>
                  </CardContent>
                </Card>

                {loadingFlights && (
                  <Card>
                    <CardContent className="p-8">
                      <div className="flex flex-col items-center gap-6 py-6">
                        <div className="relative w-28 h-28">
                          <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                          
                          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
                            <Plane className="h-7 w-7 text-blue-600 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90" />
                          </div>
                          
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-center">
                          <p className="text-gray-900 font-semibold text-xl">Searching for flights...</p>
                          <p className="text-gray-500 text-sm">Finding you the best deals from {flightSource}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {flightData && !loadingFlights && (
                  <FlightDetails
                    journeyType={flightData.journey_type}
                    totalPrice={flightData.total_price_in_inr}
                    outboundJourney={flightData.outbound_journey}
                    returnJourney={flightData.return_journey}
                    returnDate={flightData.return_date}
                    sourceName={flightSource}
                    destinationName={destinationCountry || packageData?.destinations.join(', ')}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {showGallery && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
            <button
              onClick={() => setShowGallery(false)}
              className="fixed top-4 right-4 z-50 text-white hover:text-gray-300 bg-black/50 rounded-full p-2"
            >
              <X className="h-6 w-6 md:h-8 md:w-8" />
            </button>

            <div className="relative max-w-6xl w-full h-full flex flex-col">
              <div className="relative flex-1 flex items-center justify-center">
                <div className="absolute left-0 h-full w-1/4 max-w-[200px] flex items-center justify-center">
                  <div className="relative w-full h-3/4 overflow-hidden rounded-lg opacity-70 blur-sm">
                    <img 
                      src={images[(currentImageIndex - 1 + images.length) % images.length]}
                      alt={`Previous`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10 w-full max-w-3xl h-full max-h-[80vh] flex items-center justify-center"
                >
                  <img 
                    src={images[currentImageIndex]}
                    alt={`Gallery ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                </motion.div>

                <div className="absolute right-0 h-full w-1/4 max-w-[200px] flex items-center justify-center">
                  <div className="relative w-full h-3/4 overflow-hidden rounded-lg opacity-70 blur-sm">
                    <img 
                      src={images[(currentImageIndex + 1) % images.length]}
                      alt={`Next`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
                      }}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 md:p-3 z-20"
                    >
                      <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) => (prev + 1) % images.length);
                      }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 md:p-3 z-20"
                    >
                      <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
                    </button>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="h-24 md:h-32 w-full mt-4 flex items-center justify-center">
                  <div className="relative w-full max-w-3xl h-full">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="thumbnails-container flex space-x-2 md:space-x-4 overflow-x-auto py-2 px-4 scrollbar-hide">
                        {images.map((img, index) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(index);
                            }}
                            className={`thumbnail-${index} flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden transition-all duration-200 ${
                              currentImageIndex === index ? 'ring-2 md:ring-4 ring-travel-primary scale-105 md:scale-110' : 'opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={img}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-sm md:text-base px-3 py-1 rounded-full z-20">
                {currentImageIndex + 1} / {images.length}
              </div>
            </div>
          </div>
        )}

        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-3 md:p-4 z-40">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="text-xs text-gray-600">Total Price</div>
              <div className="text-lg md:text-xl font-bold text-green-600">
                ₹{getTotalPrice().toLocaleString()}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleAddToCart}
                className="flex-1 text-xs md:text-sm py-2 md:py-3"
              >
                <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                Cart
              </Button>
              <Button 
                onClick={handleBookNow}
                className="flex-1 bg-travel-primary hover:bg-travel-primary/90 text-xs md:text-sm py-2 md:py-3"
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:hidden h-20"></div>
      </main>

      <Footer />

      <BookingPopup
        open={isBookingPopupOpen}
        onOpenChange={setIsBookingPopupOpen}
        packageData={{
          id: packageData.id,
          nights: packageData.nights || parseInt(selectedDuration)
        }}
        members={members}
        totalPrice={getCurrentPrice() * members}
        withFlights={withFlights}
        selectedDate={selectedDate}
        visaCost={addedVisaCost}
      />
    </div>
  );
};

export default PackageDetail;