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
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import BookingPopup from '../components/BookingPopup';
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
  const [withFlights, setWithFlights] = useState(true);
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

    const priceCategory = withFlights ? 'with_flights' : 'without_flights';
    return packageDetails.pricing[priceCategory]?.[selectedDuration] || 0;
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
    
    yPosition = 70;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`${user?.email?.split('@')[0] || 'Guest'}'s Personalized Itinerary`, margin, yPosition);
    
    yPosition += 15;
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
    
    doc.setFillColor(23, 37, 84);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 30, 'F');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Pricing Summary', margin + 10, yPosition + 20);
    
    yPosition += 40;
    
    const currentPrice = getCurrentPrice();
    const totalPrice = currentPrice * members;
    const originalPrice = parseInt(packageData?.original_price.replace(/[₹,]/g, '') || '0');
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

  const getTimeSlot = (index: number) => {
    const timeSlots = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'];
    return timeSlots[index] || 'ACTIVITY';
  };

  const calculateVisaCost = () => {
    if (!visaDestination || !visaRates[visaDestination]) return 0;
    return visaRates[visaDestination][visaDuration] || 0;
  };

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

  const images = packageData.gallery_images && packageData.gallery_images.length > 0 
    ? packageData.gallery_images 
    : [packageData.image].filter(Boolean);

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

        <div className="relative">
          <div className="h-[16rem] md:!h-[36rem] lg:h-96 relative overflow-hidden">



            <img 
              src={packageDetails?.hero_image || packageData.image}
              alt={packageData.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-10"></div>
            
            <div className="hidden lg:block absolute top-4 left-4">
              <Button
                variant="secondary"
                onClick={() => navigate('/packages')}
                className="bg-white/90 hover:bg-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Packages
              </Button>
            </div>

            <div className="hidden lg:block absolute top-4 right-4">
             
            </div>

            {images.length > 1 && (
              <>
                
                
               
              </>
            )}

            {images.length > 1 && (
              <button
                onClick={() => setShowGallery(true)}
                className="absolute bottom-2 md:bottom-4 left-2 md:left-4 bg-white/90 hover:bg-white px-2 md:px-3 py-1 md:py-2 rounded-lg text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2"
              >
                <Camera className="h-3 w-3 md:h-4 md:w-4" />
                View Gallery ({images.length})
              </button>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4 mb-4">
                    <div className="flex-1">
                      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 md:mb-3">{packageData.title}</h1>
                      <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm md:text-base text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                          <span>{packageData.country}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 md:h-4 md:w-4" />
                          <span>{packageData.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-400 fill-current" />
                          <span>{packageData.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="lg:hidden text-right">
                      {packageData.original_price && (
                        <span className="text-sm md:text-base text-red-500 line-through block">
                          ₹{parseInt(packageData.original_price.replace(/[^0-9]/g, '')).toLocaleString()}
                        </span>
                      )}
                      <div className="text-xl md:text-2xl font-bold text-green-600">
                        ₹{parseInt(packageData.price.replace(/[^0-9]/g, '')).toLocaleString()}
                        <span className="text-xs md:text-sm font-normal text-gray-500 block">per person</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold mb-2 text-sm md:text-base">Destinations</h3>
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      {packageData.destinations.map((destination, index) => (
                        <Badge key={index} variant="secondary" className="text-xs md:text-sm">
                          {destination}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm">
                    <div className="flex items-center gap-1 md:gap-2">
                      <span>🏨</span>
                      <span>{packageData.hotel_category || '3-4 Star'}</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <span>🍽️</span>
                      <span>{packageData.meals_included || 'Breakfast'}</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <span>🚗</span>
                      <span>{packageData.transfer_included ? 'Transfers' : 'No Transfers'}</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <span>🎯</span>
                      <span>{(packageData.activity_details?.count || packageDetails?.activity_details?.count || 0)} Activities</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                        <div className="flex flex-wrap gap-2 md:gap-3">
                          {['3', '5', '7'].map((duration) => (
                            <Button
                              key={duration}
                              variant={selectedDuration === duration ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedDuration(duration)}
                              className="text-xs md:text-sm"
                            >
                              {duration} Days
                            </Button>
                          ))}
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
                                  {day.dinner && (
                                    <div>
                                      <span className="font-medium">🍽️ Dinner:</span>
                                      <span className="ml-1">{day.dinner}</span>
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

              <Card>
                <CardContent className="p-6">
                  <Tabs defaultValue="visa">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="visa">
                        <ClipboardCheck className="mr-2 h-4 w-4" /> Visa Assistance
                      </TabsTrigger>
                      <TabsTrigger value="download" onClick={generatePDF}>
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
                      <div className="grid grid-cols-3 gap-2">
                        {['3', '5', '7'].map((duration) => (
                          <Button
                            key={duration}
                            variant={selectedDuration === duration ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedDuration(duration)}
                            className="text-xs md:text-sm"
                          >
                            {duration} Days
                          </Button>
                        ))}
                      </div>
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

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm md:text-base">
                        <span>Package ({selectedDuration} days × {members} {members === 1 ? 'person' : 'people'})</span>
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
              </div>
            </div>
          </div>
        </div>

        {showGallery && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-4xl w-full">
              <button
                onClick={() => setShowGallery(false)}
                className="absolute top-2 md:top-4 right-2 md:right-4 text-white hover:text-gray-300 z-10"
              >
                <X className="h-6 w-6 md:h-8 md:w-8" />
              </button>
              
              <div className="relative">
                <img 
                  src={images[currentImageIndex]}
                  alt={`Gallery ${currentImageIndex + 1}`}
                  className="w-full h-auto max-h-[70vh] md:max-h-[80vh] object-contain"
                />
                
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 md:p-3"
                    >
                      <ChevronLeft className="h-4 w-4 md:h-6 md:w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 md:p-3"
                    >
                      <ChevronRight className="h-4 w-4 md:h-6 md:w-6" />
                    </button>
                  </>
                )}
                
                <div className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 text-white text-xs md:text-sm">
                  {currentImageIndex + 1} of {images.length}
                </div>
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