import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import SpreadsheetUploadIt from './SpreadsheetUploadPackageItinerary';

const ItineraryManagement = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [packageDetails, setPackageDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedDuration, setSelectedDuration] = useState('3');
  const [isNewItinerary, setIsNewItinerary] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch packages",
        variant: "destructive",
      });
    }
  };

  const fetchPackageDetails = async (packageId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('package_details')
        .select('*')
        .eq('package_id', packageId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      const defaultItinerary = {
        '3': [
          { day: 1, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' },
          { day: 2, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' },
          { day: 3, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' }
        ],
        '5': [
          { day: 1, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' },
          { day: 2, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' },
          { day: 3, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' },
          { day: 4, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' },
          { day: 5, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' }
        ],
        '7': [
          { day: 1, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' },
          { day: 2, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' },
          { day: 3, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' },
          { day: 4, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' },
          { day: 5, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' },
          { day: 6, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' },
          { day: 7, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' }
        ]
      };

      console.log('Package details fetched:', data);

      setPackageDetails(data || {
        package_id: packageId,
        pricing: { with_flights: { 3: 0, 5: 0, 7: 0 }, without_flights: { 3: 0, 5: 0, 7: 0 } },
        attractions: [],
        hotels: [],
        itinerary: defaultItinerary,
        hero_image: '',
        flight_details: { roundTrip: true, airportTransfers: true },
        hotel_details: { category: "3 Star", pickupDrop: true },
        activity_details: { list: [], count: 0 },
        meal_details: { lunch: false, dinner: false, breakfast: true },
        combo_details: { isCombo: false, features: [] }
      });
    } catch (error) {
      console.error('Error fetching package details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch package details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = (pkg: any) => {
    console.log('Selected package:', pkg);
    setSelectedPackage(pkg);
    setIsNewItinerary(false);
    fetchPackageDetails(pkg.id);
    setActiveTab('basic');
  };

  const handleAddNewItinerary = () => {
    const defaultItinerary = {
      '3': [
        { day: 1, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' },
        { day: 2, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' },
        { day: 3, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' }
      ],
      '5': [
        { day: 1, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' },
        { day: 2, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' },
        { day: 3, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' },
        { day: 4, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' },
        { day: 5, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' }
      ],
      '7': [
        { day: 1, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' },
        { day: 2, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' },
        { day: 3, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' },
        { day: 4, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' },
        { day: 5, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' },
        { day: 6, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' },
        { day: 7, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' }
      ]
    };

    const newPkg = { id: 'new', title: 'New Itinerary' };
    setSelectedPackage(newPkg);
    setIsNewItinerary(true);
    setPackageDetails({
      package_id: 'new',
      pricing: { with_flights: { 3: 0, 5: 0, 7: 0 }, without_flights: { 3: 0, 5: 0, 7: 0 } },
      attractions: [],
      hotels: [],
      itinerary: defaultItinerary,
      hero_image: '',
      flight_details: { roundTrip: true, airportTransfers: true },
      hotel_details: { category: "3 Star", pickupDrop: true },
      activity_details: { list: [], count: 0 },
      meal_details: { lunch: false, dinner: false, breakfast: true },
      combo_details: { isCombo: false, features: [] }
    });
    setActiveTab('itinerary');
  };

  const updateField = useCallback((field: string, value: any) => {
    setPackageDetails((prev: any) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  }, []);

  const updateNestedField = useCallback((section: string, field: string, value: any) => {
    setPackageDetails((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };
    });
  }, []);

  const updateArrayField = useCallback((field: string, index: number, value: string) => {
    setPackageDetails((prev: any) => {
      if (!prev) return prev;
      const newArray = [...(prev[field] || [])];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  }, []);

  const addArrayItem = useCallback((field: string) => {
    setPackageDetails((prev: any) => {
      if (!prev) return prev;
      return { ...prev, [field]: [...(prev[field] || []), ''] };
    });
  }, []);

  const removeArrayItem = useCallback((field: string, index: number) => {
    setPackageDetails((prev: any) => {
      if (!prev) return prev;
      const newArray = (prev[field] || []).filter((_: any, i: number) => i !== index);
      return { ...prev, [field]: newArray };
    });
  }, []);

  const updateItineraryDay = useCallback((duration: string, dayIndex: number, field: string, value: any) => {
    setPackageDetails((prev: any) => {
      if (!prev || !prev.itinerary) return prev;
      const newItinerary = { ...prev.itinerary };
      if (!newItinerary[duration]) {
        newItinerary[duration] = [];
      }
      const newDayArray = [...newItinerary[duration]];
      if (!newDayArray[dayIndex]) {
        newDayArray[dayIndex] = { day: dayIndex + 1, title: '', activities: [''], accommodation: '', breakfast: '', lunch: '', dinner: '' };
      }
      newDayArray[dayIndex] = {
        ...newDayArray[dayIndex],
        [field]: value
      };
      newItinerary[duration] = newDayArray;
      return { ...prev, itinerary: newItinerary };
    });
  }, []);

  const addActivity = useCallback((duration: string, dayIndex: number) => {
    setPackageDetails((prev: any) => {
      if (!prev || !prev.itinerary) return prev;
      const newItinerary = { ...prev.itinerary };
      if (!newItinerary[duration]) {
        newItinerary[duration] = [];
      }
      const newDayArray = [...newItinerary[duration]];
      if (!newDayArray[dayIndex]) {
        newDayArray[dayIndex] = { day: dayIndex + 1, title: '', activities: [], accommodation: '', breakfast: '', lunch: '', dinner: '' };
      }
      newDayArray[dayIndex] = {
        ...newDayArray[dayIndex],
        activities: [...(newDayArray[dayIndex].activities || []), '']
      };
      newItinerary[duration] = newDayArray;
      return { ...prev, itinerary: newItinerary };
    });
  }, []);

  const removeActivity = useCallback((duration: string, dayIndex: number, activityIndex: number) => {
    setPackageDetails((prev: any) => {
      if (!prev || !prev.itinerary) return prev;
      const newItinerary = { ...prev.itinerary };
      const newDayArray = [...newItinerary[duration]];
      newDayArray[dayIndex] = {
        ...newDayArray[dayIndex],
        activities: newDayArray[dayIndex].activities.filter((_: any, i: number) => i !== activityIndex)
      };
      newItinerary[duration] = newDayArray;
      return { ...prev, itinerary: newItinerary };
    });
  }, []);

  const updateActivity = useCallback((duration: string, dayIndex: number, activityIndex: number, value: string) => {
    setPackageDetails((prev: any) => {
      if (!prev || !prev.itinerary) return prev;
      const newItinerary = { ...prev.itinerary };
      const newDayArray = [...newItinerary[duration]];
      const newActivities = [...newDayArray[dayIndex].activities];
      newActivities[activityIndex] = value;
      newDayArray[dayIndex] = {
        ...newDayArray[dayIndex],
        activities: newActivities
      };
      newItinerary[duration] = newDayArray;
      return { ...prev, itinerary: newItinerary };
    });
  }, []);

  const updatePricing = useCallback((category: string, duration: string, value: string) => {
    setPackageDetails((prev: any) => {
      if (!prev?.pricing) return prev;
      return {
        ...prev,
        pricing: {
          ...prev.pricing,
          [category]: {
            ...prev.pricing[category],
            [duration]: parseFloat(value) || 0
          }
        }
      };
    });
  }, []);

  const handleSaveDetails = async () => {
    if (!packageDetails || !selectedPackage) return;
    
    setLoading(true);
    try {
      console.log('Saving package details:', packageDetails);
      
      const { error } = await supabase
        .from('package_details')
        .upsert(packageDetails);
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Package details saved successfully",
      });
    } catch (error) {
      console.error('Error saving package details:', error);
      toast({
        title: "Error",
        description: "Failed to save package details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCSVData = async (data: any[]) => {
    try {
      const processedResults = [];
      
      for (const row of data) {
        let targetPackageId = selectedPackage?.id;
        
        // Determine which package to update
        if (row.package_id) {
          targetPackageId = row.package_id;
        } else if (row.package_title && !selectedPackage) {
          // Find package by title
          const foundPackage = packages.find(pkg => pkg.title === row.package_title);
          if (foundPackage) {
            targetPackageId = foundPackage.id;
          } else {
            toast({
              title: "Error",
              description: `Package with title "${row.package_title}" not found`,
              variant: "destructive"
            });
            continue;
          }
        } else if (!selectedPackage) {
          toast({
            title: "Error",
            description: "Please select a package first or include package_id/package_title in CSV",
            variant: "destructive"
          });
          continue;
        }

        // Check if package details already exist
        const { data: existingData, error: checkError } = await supabase
          .from('package_details')
          .select('id')
          .eq('package_id', targetPackageId)
          .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking existing record:', checkError);
          continue;
        }

        // Process CSV data for complete package details including itinerary
        const itinerary = {
          '3': [],
          '5': [],
          '7': []
        };

        // Process 3-day itinerary
        for (let day = 1; day <= 3; day++) {
          const dayData = {
            day: day,
            title: row[`day_${day}_title_3days`] || '',
            activities: row[`day_${day}_activities_3days`] ? row[`day_${day}_activities_3days`].split(';').filter(a => a.trim()) : [''],
            accommodation: row[`day_${day}_accommodation_3days`] || '',
            breakfast: row[`day_${day}_breakfast_3days`] || '',
            lunch: row[`day_${day}_lunch_3days`] || '',
            dinner: row[`day_${day}_dinner_3days`] || ''
          };
          itinerary['3'].push(dayData);
        }

        // Process 5-day itinerary
        for (let day = 1; day <= 5; day++) {
          const dayData = {
            day: day,
            title: row[`day_${day}_title_5days`] || '',
            activities: row[`day_${day}_activities_5days`] ? row[`day_${day}_activities_5days`].split(';').filter(a => a.trim()) : [''],
            accommodation: row[`day_${day}_accommodation_5days`] || '',
            breakfast: row[`day_${day}_breakfast_5days`] || '',
            lunch: row[`day_${day}_lunch_5days`] || '',
            dinner: row[`day_${day}_dinner_5days`] || ''
          };
          itinerary['5'].push(dayData);
        }

        // Process 7-day itinerary
        for (let day = 1; day <= 7; day++) {
          const dayData = {
            day: day,
            title: row[`day_${day}_title_7days`] || '',
            activities: row[`day_${day}_activities_7days`] ? row[`day_${day}_activities_7days`].split(';').filter(a => a.trim()) : [''],
            accommodation: row[`day_${day}_accommodation_7days`] || '',
            breakfast: row[`day_${day}_breakfast_7days`] || '',
            lunch: row[`day_${day}_lunch_7days`] || '',
            dinner: row[`day_${day}_dinner_7days`] || ''
          };
          itinerary['7'].push(dayData);
        }

        const packageData = {
          package_id: targetPackageId,
          hero_image: row.hero_image || '',
          pricing: {
            with_flights: {
              3: parseInt(row.price_3_days_with_flights) || 0,
              5: parseInt(row.price_5_days_with_flights) || 0,
              7: parseInt(row.price_7_days_with_flights) || 0
            },
            without_flights: {
              3: parseInt(row.price_3_days_without_flights) || 0,
              5: parseInt(row.price_5_days_without_flights) || 0,
              7: parseInt(row.price_7_days_without_flights) || 0
            }
          },
          attractions: row.attractions ? row.attractions.split(';').filter(a => a.trim()) : [],
          hotels: row.hotels ? row.hotels.split(';').filter(h => h.trim()) : [],
          itinerary: itinerary,
          flight_details: {
            roundTrip: row.round_trip === 'true' || row.round_trip === '1',
            airportTransfers: row.airport_transfers === 'true' || row.airport_transfers === '1'
          },
          hotel_details: {
            category: row.hotel_category || '3 Star',
            pickupDrop: row.pickup_drop === 'true' || row.pickup_drop === '1'
          },
          meal_details: {
            breakfast: row.breakfast === 'true' || row.breakfast === '1',
            lunch: row.lunch === 'true' || row.lunch === '1',
            dinner: row.dinner === 'true' || row.dinner === '1'
          },
          activity_details: {
            list: row.activities ? row.activities.split(';').filter(a => a.trim()) : [],
            count: row.activity_count ? parseInt(row.activity_count) : 0
          },
          combo_details: {
            isCombo: row.is_combo === 'true' || row.is_combo === '1',
            features: row.combo_features ? row.combo_features.split(';').filter(f => f.trim()) : []
          }
        };

        let error;
        if (existingData) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('package_details')
            .update(packageData)
            .eq('package_id', targetPackageId);
          error = updateError;
        } else {
          // Insert new record
          const { error: insertError } = await supabase
            .from('package_details')
            .insert(packageData);
          error = insertError;
        }

        if (error) {
          console.error('Database error for package:', targetPackageId, error);
          toast({
            title: "Error",
            description: `Failed to upload details for package ID: ${targetPackageId}`,
            variant: "destructive"
          });
        } else {
          processedResults.push(targetPackageId);
        }
      }

      if (processedResults.length > 0) {
        toast({
          title: "Success",
          description: `Successfully uploaded details for ${processedResults.length} package(s)`,
        });
        
        // Refresh current package details if it was updated
        if (selectedPackage && processedResults.includes(selectedPackage.id)) {
          fetchPackageDetails(selectedPackage.id);
        }
      }
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Error",
        description: "Failed to process CSV data",
        variant: "destructive"
      });
    }
  };

  const expectedColumns = [
    // Package Identification
    'package_id',
    'package_title',
    
    // Basic Details
    'hero_image',
    
    // Pricing
    'price_3_days_with_flights',
    'price_5_days_with_flights', 
    'price_7_days_with_flights',
    'price_3_days_without_flights',
    'price_5_days_without_flights',
    'price_7_days_without_flights',
    
    // General Package Info
    'attractions',
    'hotels',
    'round_trip',
    'airport_transfers',
    'hotel_category',
    'pickup_drop',
    'breakfast',
    'lunch',
    'dinner',
    'activities',
    'activity_count',
    'is_combo',
    'combo_features',

    // 3 Days Itinerary
    'day_1_title_3days', 'day_1_activities_3days', 'day_1_accommodation_3days', 'day_1_breakfast_3days', 'day_1_lunch_3days', 'day_1_dinner_3days',
    'day_2_title_3days', 'day_2_activities_3days', 'day_2_accommodation_3days', 'day_2_breakfast_3days', 'day_2_lunch_3days', 'day_2_dinner_3days',
    'day_3_title_3days', 'day_3_activities_3days', 'day_3_accommodation_3days', 'day_3_breakfast_3days', 'day_3_lunch_3days', 'day_3_dinner_3days',

    // 5 Days Itinerary
    'day_1_title_5days', 'day_1_activities_5days', 'day_1_accommodation_5days', 'day_1_breakfast_5days', 'day_1_lunch_5days', 'day_1_dinner_5days',
    'day_2_title_5days', 'day_2_activities_5days', 'day_2_accommodation_5days', 'day_2_breakfast_5days', 'day_2_lunch_5days', 'day_2_dinner_5days',
    'day_3_title_5days', 'day_3_activities_5days', 'day_3_accommodation_5days', 'day_3_breakfast_5days', 'day_3_lunch_5days', 'day_3_dinner_5days',
    'day_4_title_5days', 'day_4_activities_5days', 'day_4_accommodation_5days', 'day_4_breakfast_5days', 'day_4_lunch_5days', 'day_4_dinner_5days',
    'day_5_title_5days', 'day_5_activities_5days', 'day_5_accommodation_5days', 'day_5_breakfast_5days', 'day_5_lunch_5days', 'day_5_dinner_5days',

    // 7 Days Itinerary
    'day_1_title_7days', 'day_1_activities_7days', 'day_1_accommodation_7days', 'day_1_breakfast_7days', 'day_1_lunch_7days', 'day_1_dinner_7days',
    'day_2_title_7days', 'day_2_activities_7days', 'day_2_accommodation_7days', 'day_2_breakfast_7days', 'day_2_lunch_7days', 'day_2_dinner_7days',
    'day_3_title_7days', 'day_3_activities_7days', 'day_3_accommodation_7days', 'day_3_breakfast_7days', 'day_3_lunch_7days', 'day_3_dinner_7days',
    'day_4_title_7days', 'day_4_activities_7days', 'day_4_accommodation_7days', 'day_4_breakfast_7days', 'day_4_lunch_7days', 'day_4_dinner_7days',
    'day_5_title_7days', 'day_5_activities_7days', 'day_5_accommodation_7days', 'day_5_breakfast_7days', 'day_5_lunch_7days', 'day_5_dinner_7days',
    'day_6_title_7days', 'day_6_activities_7days', 'day_6_accommodation_7days', 'day_6_breakfast_7days', 'day_6_lunch_7days', 'day_6_dinner_7days',
    'day_7_title_7days', 'day_7_activities_7days', 'day_7_accommodation_7days', 'day_7_breakfast_7days', 'day_7_lunch_7days', 'day_7_dinner_7days'
  ];

  const templateData = [
    {
      // Package Identification
      package_id: packages.length > 0 ? packages[0].id : 'pkg_001',
      package_title: packages.length > 0 ? packages[0].title : 'Golden Triangle Tour',
      
      // Basic Details
      hero_image: 'https://example.com/hero.jpg',
      
      // Pricing
      price_3_days_with_flights: 25000,
      price_5_days_with_flights: 40000,
      price_7_days_with_flights: 55000,
      price_3_days_without_flights: 18000,
      price_5_days_without_flights: 30000,
      price_7_days_without_flights: 42000,
      
      // General Package Info
      attractions: 'Red Fort;India Gate;Taj Mahal',
      hotels: 'Hotel Deluxe;Resort Paradise',
      round_trip: 'true',
      airport_transfers: 'true',
      hotel_category: '4 Star',
      pickup_drop: 'true',
      breakfast: 'true',
      lunch: 'false',
      dinner: 'true',
      activities: 'City Tour;Museum Visit;Local Market',
      activity_count: 5,
      is_combo: 'false',
      combo_features: 'Flight;Hotel;Sightseeing',

      // 3 Days Itinerary
      day_1_title_3days: 'Arrival in Delhi',
      day_1_activities_3days: 'Airport pickup;Hotel check-in;Welcome dinner',
      day_1_accommodation_3days: 'Hotel Deluxe Delhi',
      day_1_breakfast_3days: 'Continental breakfast',
      day_1_lunch_3days: 'Local restaurant',
      day_1_dinner_3days: 'Hotel buffet',

      day_2_title_3days: 'Delhi Sightseeing',
      day_2_activities_3days: 'Red Fort visit;India Gate;Qutub Minar',
      day_2_accommodation_3days: 'Hotel Deluxe Delhi',
      day_2_breakfast_3days: 'Hotel breakfast',
      day_2_lunch_3days: 'Traditional cuisine',
      day_2_dinner_3days: 'Local restaurant',

      day_3_title_3days: 'Departure',
      day_3_activities_3days: 'Shopping;Airport transfer',
      day_3_accommodation_3days: 'Hotel Deluxe Delhi',
      day_3_breakfast_3days: 'Hotel breakfast',
      day_3_lunch_3days: 'Quick meal',
      day_3_dinner_3days: 'Airport lounge',

      // 5 Days Itinerary (extending 3-day)
      day_1_title_5days: 'Arrival in Delhi',
      day_1_activities_5days: 'Airport pickup;Hotel check-in;Welcome dinner',
      day_1_accommodation_5days: 'Hotel Deluxe Delhi',
      day_1_breakfast_5days: 'Continental breakfast',
      day_1_lunch_5days: 'Local restaurant',
      day_1_dinner_5days: 'Hotel buffet',

      day_2_title_5days: 'Delhi Sightseeing',
      day_2_activities_5days: 'Red Fort visit;India Gate;Qutub Minar',
      day_2_accommodation_5days: 'Hotel Deluxe Delhi',
      day_2_breakfast_5days: 'Hotel breakfast',
      day_2_lunch_5days: 'Traditional cuisine',
      day_2_dinner_5days: 'Local restaurant',

      day_3_title_5days: 'Delhi to Agra',
      day_3_activities_5days: 'Travel to Agra;Taj Mahal visit',
      day_3_accommodation_5days: 'Hotel Paradise Agra',
      day_3_breakfast_5days: 'Hotel breakfast',
      day_3_lunch_5days: 'Agra restaurant',
      day_3_dinner_5days: 'Hotel dinner',

      day_4_title_5days: 'Agra Exploration',
      day_4_activities_5days: 'Agra Fort;Mehtab Bagh;Local markets',
      day_4_accommodation_5days: 'Hotel Paradise Agra',
      day_4_breakfast_5days: 'Hotel breakfast',
      day_4_lunch_5days: 'Local cuisine',
      day_4_dinner_5days: 'Hotel buffet',

      day_5_title_5days: 'Return to Delhi',
      day_5_activities_5days: 'Return journey;Shopping;Departure',
      day_5_accommodation_5days: 'Hotel Deluxe Delhi',
      day_5_breakfast_5days: 'Hotel breakfast',
      day_5_lunch_5days: 'Travel meal',
      day_5_dinner_5days: 'Airport lounge',

      // 7 Days Itinerary (extending 5-day)
      day_1_title_7days: 'Arrival in Delhi',
      day_1_activities_7days: 'Airport pickup;Hotel check-in;Welcome dinner',
      day_1_accommodation_7days: 'Hotel Deluxe Delhi',
      day_1_breakfast_7days: 'Continental breakfast',
      day_1_lunch_7days: 'Local restaurant',
      day_1_dinner_7days: 'Hotel buffet',

      day_2_title_7days: 'Delhi Sightseeing',
      day_2_activities_7days: 'Red Fort visit;India Gate;Qutub Minar',
      day_2_accommodation_7days: 'Hotel Deluxe Delhi',
      day_2_breakfast_7days: 'Hotel breakfast',
      day_2_lunch_7days: 'Traditional cuisine',
      day_2_dinner_7days: 'Local restaurant',

      day_3_title_7days: 'Delhi to Agra',
      day_3_activities_7days: 'Travel to Agra;Taj Mahal visit',
      day_3_accommodation_7days: 'Hotel Paradise Agra',
      day_3_breakfast_7days: 'Hotel breakfast',
      day_3_lunch_7days: 'Agra restaurant',
      day_3_dinner_7days: 'Hotel dinner',

      day_4_title_7days: 'Agra Exploration',
      day_4_activities_7days: 'Agra Fort;Mehtab Bagh;Local markets',
      day_4_accommodation_7days: 'Hotel Paradise Agra',
      day_4_breakfast_7days: 'Hotel breakfast',
      day_4_lunch_7days: 'Local cuisine',
      day_4_dinner_7days: 'Hotel buffet',

      day_5_title_7days: 'Agra to Jaipur',
      day_5_activities_7days: 'Travel to Jaipur;City Palace visit',
      day_5_accommodation_7days: 'Hotel Royal Jaipur',
      day_5_breakfast_7days: 'Hotel breakfast',
      day_5_lunch_7days: 'Travel meal',
      day_5_dinner_7days: 'Rajasthani dinner',

      day_6_title_7days: 'Jaipur Sightseeing',
      day_6_activities_7days: 'Amber Fort;Hawa Mahal;Local bazaars',
      day_6_accommodation_7days: 'Hotel Royal Jaipur',
      day_6_breakfast_7days: 'Hotel breakfast',
      day_6_lunch_7days: 'Traditional thali',
      day_6_dinner_7days: 'Cultural dinner show',

      day_7_title_7days: 'Return to Delhi',
      day_7_activities_7days: 'Return journey;Shopping;Departure',
      day_7_accommodation_7days: 'Hotel Deluxe Delhi',
      day_7_breakfast_7days: 'Hotel breakfast',
      day_7_lunch_7days: 'Travel meal',
      day_7_dinner_7days: 'Airport lounge'
    }
  ];

  if (selectedPackage && packageDetails) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {isNewItinerary ? 'Add New Itinerary' : `Itinerary Management - ${selectedPackage.title}`}
          </h3>
          <div className="flex gap-2">
            <Button
              onClick={handleSaveDetails}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedPackage(null);
                setPackageDetails(null);
                setActiveTab('basic');
                setIsNewItinerary(false);
              }}
            >
              Back to Packages
            </Button>
          </div>
        </div>

        {/* CSV Upload Section */}
        <SpreadsheetUploadIt
          onDataParsed={handleCSVData}
          expectedColumns={expectedColumns}
          title="Upload Complete Package Details & Itinerary CSV"
          templateData={templateData}
          selectedPackageId={selectedPackage?.id}
          packages={packages}
        />

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6 border-b">
          {['basic', 'pricing', 'attractions', 'hotels', 'itinerary'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-4 capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-pink-500 text-pink-500 font-semibold'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
          {/* Basic Tab */}
          {activeTab === 'basic' && (
            <div>
              <h4 className="font-medium text-gray-800 mb-4">Basic Package Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Hero Image URL</label>
                  <Input
                    value={packageDetails.hero_image || ''}
                    onChange={(e) => updateField('hero_image', e.target.value)}
                    placeholder="Main package detail page image"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Package Status</label>
                  <p className="text-sm text-gray-600">Currently editing: {selectedPackage.title}</p>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div>
              <h4 className="font-medium text-gray-800 mb-4">Pricing Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2">With Flights</h5>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm">3 Days:</label>
                      <Input
                        type="number"
                        value={packageDetails.pricing?.with_flights?.[3] || 0}
                        onChange={(e) => updatePricing('with_flights', '3', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm">5 Days:</label>
                      <Input
                        type="number"
                        value={packageDetails.pricing?.with_flights?.[5] || 0}
                        onChange={(e) => updatePricing('with_flights', '5', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm">7 Days:</label>
                      <Input
                        type="number"
                        value={packageDetails.pricing?.with_flights?.[7] || 0}
                        onChange={(e) => updatePricing('with_flights', '7', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Without Flights</h5>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm">3 Days:</label>
                      <Input
                        type="number"
                        value={packageDetails.pricing?.without_flights?.[3] || 0}
                        onChange={(e) => updatePricing('without_flights', '3', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm">5 Days:</label>
                      <Input
                        type="number"
                        value={packageDetails.pricing?.without_flights?.[5] || 0}
                        onChange={(e) => updatePricing('without_flights', '5', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm">7 Days:</label>
                      <Input
                        type="number"
                        value={packageDetails.pricing?.without_flights?.[7] || 0}
                        onChange={(e) => updatePricing('without_flights', '7', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Flight Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="roundTrip"
                        checked={packageDetails.flight_details?.roundTrip || false}
                        onChange={(e) => updateNestedField('flight_details', 'roundTrip', e.target.checked)}
                      />
                      <label htmlFor="roundTrip" className="text-sm">Round Trip</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="airportTransfers"
                        checked={packageDetails.flight_details?.airportTransfers || false}
                        onChange={(e) => updateNestedField('flight_details', 'airportTransfers', e.target.checked)}
                      />
                      <label htmlFor="airportTransfers" className="text-sm">Airport Transfers</label>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Hotel Details</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <Select 
                        value={packageDetails.hotel_details?.category || '3 Star'} 
                        onValueChange={(value) => updateNestedField('hotel_details', 'category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3 Star">3 Star</SelectItem>
                          <SelectItem value="4 Star">4 Star</SelectItem>
                          <SelectItem value="5 Star">5 Star</SelectItem>
                          <SelectItem value="Resort">Resort</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="pickupDrop"
                        checked={packageDetails.hotel_details?.pickupDrop || false}
                        onChange={(e) => updateNestedField('hotel_details', 'pickupDrop', e.target.checked)}
                      />
                      <label htmlFor="pickupDrop" className="text-sm">Pickup & Drop</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-800 mb-2">Meal Details</h4>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="breakfast"
                      checked={packageDetails.meal_details?.breakfast || false}
                      onChange={(e) => updateNestedField('meal_details', 'breakfast', e.target.checked)}
                    />
                    <label htmlFor="breakfast" className="text-sm">Breakfast</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="lunch"
                      checked={packageDetails.meal_details?.lunch || false}
                      onChange={(e) => updateNestedField('meal_details', 'lunch', e.target.checked)}
                    />
                    <label htmlFor="lunch" className="text-sm">Lunch</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="dinner"
                      checked={packageDetails.meal_details?.dinner || false}
                      onChange={(e) => updateNestedField('meal_details', 'dinner', e.target.checked)}
                    />
                    <label htmlFor="dinner" className="text-sm">Dinner</label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Attractions Tab */}
          {activeTab === 'attractions' && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Attractions</h4>
              {(packageDetails.attractions || []).map((attraction: string, index: number) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={attraction}
                    onChange={(e) => updateArrayField('attractions', index, e.target.value)}
                    className="flex-1"
                    placeholder="Attraction name"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeArrayItem('attractions', index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem('attractions')}
              >
                Add Attraction
              </Button>
            </div>
          )}

          {/* Hotels Tab */}
          {activeTab === 'hotels' && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Hotels</h4>
              {(packageDetails.hotels || []).map((hotel: string, index: number) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={hotel}
                    onChange={(e) => updateArrayField('hotels', index, e.target.value)}
                    className="flex-1"
                    placeholder="Hotel name"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeArrayItem('hotels', index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem('hotels')}
              >
                Add Hotel
              </Button>
            </div>
          )}

          {/* Itinerary Tab */}
          {activeTab === 'itinerary' && (
            <div>
              <h4 className="font-medium text-gray-800 mb-4">Day-by-Day Itinerary</h4>
              <p className="text-sm text-gray-600 mb-4">Create detailed itineraries for 3, 5, and 7-day packages</p>
              
              {/* Duration Selection */}
              <div className="flex space-x-4 mb-6">
                {['3', '5', '7'].map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration)}
                    className={`px-4 py-2 rounded ${
                      selectedDuration === duration
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {duration} Days
                  </button>
                ))}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium mb-4 text-purple-600">{selectedDuration} Day Package</h5>
                
                {packageDetails.itinerary?.[selectedDuration]?.map((day: any, dayIndex: number) => (
                  <div key={dayIndex} className="bg-white p-4 rounded mb-4 border">
                    <h6 className="font-medium text-pink-600 mb-3">Day {day.day || dayIndex + 1}</h6>
                    
                    {/* Day Title and Accommodation */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Day Title</label>
                        <Input
                          value={day.title || ''}
                          onChange={(e) => updateItineraryDay(selectedDuration, dayIndex, 'title', e.target.value)}
                          placeholder="e.g., Arrival & City Exploration"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Accommodation</label>
                        <Input
                          value={day.accommodation || ''}
                          onChange={(e) => updateItineraryDay(selectedDuration, dayIndex, 'accommodation', e.target.value)}
                          placeholder="Hotel name or type"
                        />
                      </div>
                    </div>

                    {/* Activities */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Activities</label>
                      {(day.activities || []).map((activity: string, activityIndex: number) => (
                        <div key={activityIndex} className="flex gap-2 mb-2">
                          <Textarea
                            value={activity}
                            onChange={(e) => updateActivity(selectedDuration, dayIndex, activityIndex, e.target.value)}
                            placeholder="Describe the activity..."
                            rows={2}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => removeActivity(selectedDuration, dayIndex, activityIndex)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addActivity(selectedDuration, dayIndex)}
                        className="mt-2"
                      >
                        Add Activity
                      </Button>
                    </div>

                    {/* Meals */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Breakfast</label>
                        <Input
                          value={day.breakfast || ''}
                          onChange={(e) => updateItineraryDay(selectedDuration, dayIndex, 'breakfast', e.target.value)}
                          placeholder="Breakfast details"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Lunch</label>
                        <Input
                          value={day.lunch || ''}
                          onChange={(e) => updateItineraryDay(selectedDuration, dayIndex, 'lunch', e.target.value)}
                          placeholder="Lunch details"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Dinner</label>
                        <Input
                          value={day.dinner || ''}
                          onChange={(e) => updateItineraryDay(selectedDuration, dayIndex, 'dinner', e.target.value)}
                          placeholder="Dinner details"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-pink-600">Itinerary Management</h3>
        <Button
          onClick={handleAddNewItinerary}
          className="bg-pink-600 hover:bg-pink-700 text-white"
        >
          + Add Itinerary
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <p className="text-gray-600 mb-4">Select a package to manage its detailed itinerary and pricing:</p>
          <div className="grid gap-4">
            {packages.map((pkg) => (
              <div key={pkg.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {pkg.image && (
                    <img 
                      src={pkg.image} 
                      alt={pkg.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <h4 className="font-medium">{pkg.title}</h4>
                    <p className="text-sm text-gray-600">{pkg.country} • {pkg.duration}</p>
                    <p className="text-sm font-medium text-green-600">{pkg.price}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleSelectPackage(pkg)}
                  >
                    Manage Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryManagement;