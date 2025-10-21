import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, Clock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FlightSegment {
  airline: string; // Changed from airline_code
  flight_number: string;
  dep_airport: string; // Changed from departure_airport
  dep_time: string; // Changed from departure_time
  arr_airport: string; // Changed from arrival_airport
  arr_time: string; // Changed from arrival_time
  duration: string;
}

interface Journey {
  total_duration: string;
  segments: FlightSegment[];
}

interface FlightDetailsProps {
  journeyType: string;
  totalPrice: number;
  outboundJourney: Journey;
  returnJourney?: Journey;
  returnDate?: string;
  sourceName?: string;
  destinationName?: string;
}

const FlightDetails: React.FC<FlightDetailsProps> = ({
  journeyType,
  totalPrice,
  outboundJourney,
  returnJourney,
  returnDate,
  sourceName,
  destinationName
}) => {
  const formatDuration = (duration: string) => {
    // Duration is in ISO 8601 format like "PT2H30M"
    const hours = duration.match(/(\d+)H/);
    const minutes = duration.match(/(\d+)M/);
    return `${hours ? hours[1] + 'h ' : ''}${minutes ? minutes[1] + 'm' : ''}`;
  };

  const formatDateTime = (dateTime: string) => {
    try {
      const date = new Date(dateTime);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return {
          date: 'Invalid Date',
          time: 'Invalid Date'
        };
      }
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      };
    } catch (error) {
      console.error('Error formatting date:', dateTime, error);
      return {
        date: 'Invalid Date',
        time: 'Invalid Date'
      };
    }
  };

  const renderJourney = (journey: Journey, title: string, showRoute: boolean = false) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-lg">{title}</h4>
          {showRoute && sourceName && destinationName && (
            <p className="text-sm text-gray-600 mt-1">
              {sourceName} → {destinationName}
            </p>
          )}
        </div>
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
          <Clock className="h-3 w-3 mr-1" />
          {formatDuration(journey.total_duration)}
        </Badge>
      </div>

      {journey.segments.map((segment, index) => {
        const departure = formatDateTime(segment.dep_time); // Changed from departure_time
        const arrival = formatDateTime(segment.arr_time); // Changed from arrival_time
        
        return (
          <div key={index} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-900">
                  {segment.airline} {segment.flight_number} {/* Changed from airline_code */}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                {formatDuration(segment.duration)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 items-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{departure.time}</div>
                <div className="text-sm text-gray-600">{departure.date}</div>
                <div className="text-sm font-medium text-gray-900 mt-1">
                  {segment.dep_airport} {/* Changed from departure_airport */}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-full h-0.5 bg-gray-300 relative">
                  <Plane className="h-4 w-4 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-50" />
                </div>
                <div className="text-xs text-gray-500 mt-1">Direct</div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{arrival.time}</div>
                <div className="text-sm text-gray-600">{arrival.date}</div>
                <div className="text-sm font-medium text-gray-900 mt-1">
                  {segment.arr_airport} {/* Changed from arrival_airport */}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <Card className="mt-6">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-blue-600" />
            <span>Available Flights</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-normal text-gray-600">Flight Price</div>
            <div className="text-2xl font-bold text-green-600">
              ₹{totalPrice.toLocaleString()}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <Badge className="bg-blue-100 text-blue-800">
          {journeyType === 'one-way' ? 'One-Way Journey' : 'Round Trip'}
        </Badge>

        {renderJourney(outboundJourney, 'Outbound Flight', true)}

        {returnJourney && (
          <>
            <div className="border-t pt-4" />
            {renderJourney(returnJourney, 'Return Flight', true)}
          </>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
          <p className="text-yellow-800">
            <strong>Note:</strong> Flight prices are subject to availability and may change. 
            This is an estimated price based on current availability.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlightDetails;