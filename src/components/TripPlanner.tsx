
import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, DollarSign, Sparkles, Loader2, Download } from 'lucide-react';

interface TripPlannerProps {
  onClose?: () => void;
}

interface ItineraryDay {
  day: number;
  activities: {
    time: string;
    activity: string;
    description: string;
    cost: string;
  }[];
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  transport: string;
  accommodation: string;
  dailyCost: number;
}

const TripPlanner: React.FC<TripPlannerProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    destination: '',
    duration: '',
    budget: '',
    travelerType: 'solo',
    interests: [] as string[]
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    console.log('Checking saved API key:', savedApiKey ? 'Found' : 'Not found');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setShowApiKeyInput(false);
    } else {
      setShowApiKeyInput(true);
    }
  }, []);

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      console.log('API key saved to localStorage');
      setShowApiKeyInput(false);
    }
  };

  const travelerTypes = [
    { id: 'solo', label: 'Solo Traveler', emoji: '🎒' },
    { id: 'couple', label: 'Couple', emoji: '💑' },
    { id: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
    { id: 'friends', label: 'Friends Group', emoji: '👥' },
    { id: 'business', label: 'Business', emoji: '💼' }
  ];

  const interests = [
    'Adventure', 'Culture', 'Food', 'Photography', 'Nature', 'Shopping', 
    'Nightlife', 'Museums', 'Beaches', 'Mountains', 'History', 'Art'
  ];

  const generateItinerary = async () => {
    if (!formData.destination || !formData.duration || !formData.budget) {
      alert('Please fill in all required fields');
      return;
    }

    if (!apiKey.trim()) {
      setShowApiKeyInput(true);
      alert('Please enter your Gemini API key first');
      return;
    }

    setIsGenerating(true);

    try {
      const budgetInINR = parseInt(formData.budget) * 83; // Convert USD to INR approximately
      
      const prompt = `Create a detailed ${formData.duration}-day travel itinerary for ${formData.destination} for a ${formData.travelerType} with a budget of ₹${budgetInINR} (${formData.budget} USD). 
      
      Interests: ${formData.interests.join(', ')}
      
      Please provide a JSON response with the following structure:
      {
        "days": [
          {
            "day": 1,
            "activities": [
              {
                "time": "9:00 AM",
                "activity": "Activity name",
                "description": "Brief description",
                "cost": "₹XX"
              }
            ],
            "meals": {
              "breakfast": "Restaurant/dish suggestion",
              "lunch": "Restaurant/dish suggestion", 
              "dinner": "Restaurant/dish suggestion"
            },
            "transport": "Transportation method for the day",
            "accommodation": "Hotel/accommodation suggestion",
            "dailyCost": 5000
          }
        ],
        "totalCost": 50000,
        "tips": ["Useful tip 1", "Useful tip 2"]
      }
      
      Make it fun with emojis and Gen Z friendly language. Include 4-6 activities per day (morning, afternoon, evening). Keep within the budget. All prices should be in Indian Rupees (₹).`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedItinerary = JSON.parse(jsonMatch[0]);
        setItinerary(parsedItinerary.days || []);
        setTotalCost(parsedItinerary.totalCost || 0);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating itinerary:', error);
      alert('Failed to generate itinerary. Please check your API key and try again. Make sure you have a valid Gemini API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadItinerary = () => {
    const content = `
TravelGenZ Itinerary - ${formData.destination}
Duration: ${formData.duration} days
Budget: $${formData.budget}
Traveler Type: ${formData.travelerType}

${itinerary.map(day => `
Day ${day.day}:
${day.activities.map(activity => `${activity.time}: ${activity.activity} - ${activity.description} (${activity.cost})`).join('\n')}

Meals:
- Breakfast: ${day.meals.breakfast}
- Lunch: ${day.meals.lunch}
- Dinner: ${day.meals.dinner}

Transport: ${day.transport}
Accommodation: ${day.accommodation}
Daily Cost: ₹${day.dailyCost}
`).join('\n')}

Total Estimated Cost: ₹${totalCost}
Generated by TravelGenZ AI Trip Planner
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TravelGenZ-${formData.destination}-Itinerary.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-travel-primary" />
          AI Trip Planner ✨
        </h2>
        <p className="text-gray-600">Let our AI create the perfect itinerary for your next adventure!</p>
      </div>

      {/* API Key Input */}
      {showApiKeyInput && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">Gemini API Key Required</h3>
          <p className="text-yellow-700 text-sm mb-3">
            Please enter your Gemini API key to use the AI trip planner. Get your free API key from 
            <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-1">
              Google AI Studio
            </a>
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Enter your Gemini API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-travel-primary focus:border-transparent"
            />
            <button
              onClick={saveApiKey}
              disabled={!apiKey.trim()}
              className="bg-travel-primary text-white px-4 py-2 rounded-lg hover:bg-travel-primary/90 transition-colors disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Trip Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Destination *
            </label>
            <input
              type="text"
              placeholder="e.g., Tokyo, Japan"
              value={formData.destination}
              onChange={(e) => setFormData({...formData, destination: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-travel-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Duration (days) *
            </label>
            <input
              type="number"
              placeholder="7"
              min="1"
              max="30"
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-travel-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Budget (USD) *
            </label>
            <input
              type="number"
              placeholder="2000"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-travel-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">≈ ₹{formData.budget ? (parseInt(formData.budget) * 83).toLocaleString() : '0'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline h-4 w-4 mr-1" />
              Traveler Type
            </label>
            <select
              value={formData.travelerType}
              onChange={(e) => setFormData({...formData, travelerType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-travel-primary focus:border-transparent"
            >
              {travelerTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.emoji} {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interests (select multiple)
          </label>
          <div className="flex flex-wrap gap-2">
            {interests.map(interest => (
              <button
                key={interest}
                type="button"
                onClick={() => {
                  const newInterests = formData.interests.includes(interest)
                    ? formData.interests.filter(i => i !== interest)
                    : [...formData.interests, interest];
                  setFormData({...formData, interests: newInterests});
                }}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  formData.interests.includes(interest)
                    ? 'bg-travel-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={generateItinerary}
          disabled={isGenerating || !apiKey.trim()}
          className="w-full mt-6 bg-gradient-travel text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating your perfect trip...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate AI Itinerary
            </>
          )}
        </button>

        {apiKey && (
          <button
            onClick={() => setShowApiKeyInput(true)}
            className="w-full mt-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Change API Key
          </button>
        )}
      </div>

      {/* Generated Itinerary */}
      {itinerary.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Your Perfect Itinerary 🎯</h3>
            <div className="flex gap-2">
              <button
                onClick={downloadItinerary}
                className="flex items-center gap-2 bg-travel-accent text-white px-4 py-2 rounded-lg hover:bg-travel-accent/90 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold text-travel-primary">₹{totalCost.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {itinerary.map((day, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  📅 Day {day.day}
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    ₹{day.dailyCost}/day
                  </span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2">🎯 Activities</h5>
                    <div className="space-y-2">
                      {day.activities.map((activity, i) => (
                        <div key={i} className="bg-gray-50 p-2 rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{activity.time} - {activity.activity}</p>
                              <p className="text-xs text-gray-600">{activity.description}</p>
                            </div>
                            <span className="text-xs font-medium text-travel-primary">{activity.cost}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium mb-1">🍽️ Meals</h5>
                      <div className="text-sm space-y-1">
                        <p><strong>Breakfast:</strong> {day.meals.breakfast}</p>
                        <p><strong>Lunch:</strong> {day.meals.lunch}</p>
                        <p><strong>Dinner:</strong> {day.meals.dinner}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-1">🚗 Transport</h5>
                      <p className="text-sm">{day.transport}</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-1">🏨 Stay</h5>
                      <p className="text-sm">{day.accommodation}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-travel-primary/10 to-travel-accent/10 rounded-lg">
            <p className="text-center text-lg font-semibold text-travel-dark">
              💝 Book with TravelGenZ and save 10-20% on this trip!
            </p>
            <div className="flex gap-4 justify-center mt-4">
              <button className="bg-travel-primary text-white px-6 py-2 rounded-lg hover:bg-travel-primary/90 transition-colors">
                Request Booking
              </button>
              <button className="border border-travel-primary text-travel-primary px-6 py-2 rounded-lg hover:bg-travel-primary/10 transition-colors">
                Compare Prices
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripPlanner;
