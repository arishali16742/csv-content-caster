import React, { useState, useEffect } from 'react';
import { CheckCircle, Send, Phone, ClipboardCheck, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Country list
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

// Duration options
const durations = ["15 Days", "30 Days", "Yearly"];

const steps = [
  {
    icon: <Phone className="w-10 h-10 text-primary-500" />,
    title: "Contact Us",
    description: "Reach out to our expert team for personalized assistance.",
  },
  {
    icon: <Send className="w-10 h-10 text-primary-500" />,
    title: "Send Your Information",
    description: "Provide us with the necessary documents and details.",
  },
  {
    icon: <ClipboardCheck className="w-10 h-10 text-primary-500" />,
    title: "Visa Processing Guidance",
    description: "We guide you through every step of your visa application.",
  },
  {
    icon: <CheckCircle className="w-10 h-10 text-primary-500" />,
    title: "Done!",
    description: "Whippee! We've got your visa approved hassle-free.",
  },
];

const Visa: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [members, setMembers] = useState(1);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState(durations[0]);
  const [visitType, setVisitType] = useState("Single Visit");
  const [visaRates, setVisaRates] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
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
          ratesMap[rate.destination_country]["Yearly"] = rate.price_yearly;
        });
        setVisaRates(ratesMap);
      }
    };

    loadVisaRates();
  }, []);

  const handleCardClick = () => setShowForm(true);

  const handleClose = () => {
    setShowForm(false);
    setOrigin("");
    setDestination("");
    setDuration(durations[0]);
    setVisitType("Single Visit");
    setMembers(1);
  };

  const increaseMembers = () => setMembers(members + 1);
  const decreaseMembers = () => setMembers((prev) => (prev > 1 ? prev - 1 : 1));

  const visaCost =
    destination && visaRates[destination] && visaRates[destination][duration]
      ? visaRates[destination][duration]
      : 0;

  const totalCost = visaCost * members;

  const isAnyFilterSelected =
    origin !== "" || destination !== "" || visitType !== "";

  return (
    <section className="py-8 md:py-12 bg-white relative">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
          Visa{" "}
          <span className="bg-gradient-to-r from-[#f857a6] to-[#a75fff] bg-clip-text text-transparent">
            Information
          </span>
        </h2>
        <p className="text-sm md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
          Booking a trip is no longer difficult! With TravelGenz, enjoy a
          seamless and hassle-free visa process.
          <br />
          <br />
        </p>

        {/* Mobile View */}
        <div className="lg:hidden overflow-x-auto pb-4">
          <div className="flex space-x-4 w-max mx-auto">
            {steps.map(({ icon, title, description }, idx) => (
              <div
                key={idx}
                className="bg-white p-3 rounded-xl shadow-lg flex flex-col items-center text-center cursor-pointer transition-colors duration-300 hover:bg-pink-50"
                style={{ minWidth: '180px' }}
                onClick={handleCardClick}
              >
                <div className="mb-2">{icon}</div>
                <h3 className="text-sm font-semibold mb-1">{title}</h3>
                <p className="text-gray-600 text-xs">{description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10 max-w-7xl mx-auto">
          {steps.map(({ icon, title, description }, idx) => (
            <div
              key={idx}
              className="bg-white p-4 md:p-6 rounded-xl shadow-lg flex flex-col items-center text-center cursor-pointer transition-colors duration-300 hover:bg-pink-50"
              onClick={handleCardClick}
            >
              <div className="mb-3 md:mb-4">{icon}</div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">{title}</h3>
              <p className="text-gray-600 text-sm md:text-base">{description}</p>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={`bg-white rounded-lg p-4 md:p-6 lg:p-8 shadow-xl flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8 max-w-[95vw] md:max-w-[600px] lg:max-w-[900px] w-full transition-all duration-500 ease-in-out relative max-h-[90vh] overflow-y-auto`}
            style={{
              width: isAnyFilterSelected && window.innerWidth >= 1024 ? "900px" : "auto",
            }}
          >
            <button
              className="absolute top-[1.75rem] right-3 text-gray-500 hover:text-red-500"

              onClick={handleClose}
              aria-label="Close form"
            >
              <X className="w-6 h-6" />
            </button>

            <form className="flex-1 space-y-4 md:space-y-6">
              <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center bg-gradient-to-r from-[#f857a6] to-[#a75fff] bg-clip-text text-transparent">
                Visa Application Form
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="flex flex-col">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Country of Origin
                  </label>
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-2.5 md:px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm md:text-base"
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Destination Country
                  </label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-2.5 md:px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm md:text-base"
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-2.5 md:px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm md:text-base"
                    disabled={!destination}
                  >
                    {durations.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Visit Type
                  </label>
                  <select
                    value={visitType}
                    onChange={(e) => setVisitType(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-2.5 md:px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm md:text-base"
                  >
                    <option>Single Visit</option>
                    <option>Multi Visit</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  Members
                </label>
                <button
                  type="button"
                  onClick={decreaseMembers}
                  className="px-2.5 md:px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-base md:text-lg"
                >
                  −
                </button>
                <span className="w-8 md:w-10 text-center text-sm md:text-base">{members}</span>
                <button
                  type="button"
                  onClick={increaseMembers}
                  className="px-2.5 md:px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-base md:text-lg"
                >
                  ＋
                </button>
              </div>

              <button
                type="submit"
                className="w-full mt-3 md:mt-4 bg-gradient-to-r from-[#f857a6] to-[#a75fff] hover:opacity-90 text-white py-2.5 md:py-3 px-4 rounded-md shadow-md transition-all duration-300 text-sm md:text-base"
              >
                Submit Application
              </button>
            </form>

            {isAnyFilterSelected && (
              <div className="flex-1 lg:border-l border-gray-200 lg:pl-6 xl:pl-8 mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0">
                <h4 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center bg-gradient-to-r from-[#f857a6] to-[#a75fff] bg-clip-text text-transparent">
                  Summary
                </h4>
                <div className="space-y-4 md:space-y-6 lg:space-y-8 text-left text-gray-800">
                  {origin && (
                    <div className="text-sm md:text-base">
                      <span className="font-medium bg-gradient-to-r from-[#f857a6] to-[#a75fff] bg-clip-text text-transparent">
                        Origin:
                      </span>{" "}
                      <span>{origin}</span>
                    </div>
                  )}
                  {destination && (
                    <div className="text-sm md:text-base">
                      <span className="font-medium bg-gradient-to-r from-[#f857a6] to-[#a75fff] bg-clip-text text-transparent">
                        Destination:
                      </span>{" "}
                      <span>{destination}</span>
                    </div>
                  )}

                  {destination && (
                    <>
                      <div className="text-sm md:text-base">
                        <span className="font-medium bg-gradient-to-r from-[#f857a6] to-[#a75fff] bg-clip-text text-transparent">
                          Duration:
                        </span>{" "}
                        <span>{duration}</span>
                      </div>
                      <div className="text-sm md:text-base">
                        <span className="font-medium bg-gradient-to-r from-[#f857a6] to-[#a75fff] bg-clip-text text-transparent">
                          Visa Cost per Member:
                        </span>{" "}
                        <span>₹{visaCost.toLocaleString()}</span>
                      </div>
                      <div className="text-sm md:text-base">
                        <span className="font-medium bg-gradient-to-r from-[#f857a6] to-[#a75fff] bg-clip-text text-transparent">
                          Members:
                        </span>{" "}
                        <span>{members}</span>
                      </div>
                      <div className="text-sm md:text-base">
                        <span className="font-medium bg-gradient-to-r from-[#f857a6] to-[#a75fff] bg-clip-text text-transparent">
                          Total Cost:
                        </span>{" "}
                        <span>₹{totalCost.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                 
                  {destination && visitType &&  (
                    <div className="text-sm md:text-base">
                      <span className="font-medium bg-gradient-to-r from-[#f857a6] to-[#a75fff] bg-clip-text text-transparent">
                        Visit Type:
                      </span>{" "}
                      <span>{visitType}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Visa;