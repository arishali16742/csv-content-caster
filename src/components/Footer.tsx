
import React from 'react';
import { Plane } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Plane className="h-5 w-5 md:h-6 md:w-6 text-travel-primary" strokeWidth={2} />
              <span className="font-bold text-xl md:text-2xl text-white">TravelGenZ</span>
            </div>
            <p className="text-gray-400 mb-4 text-sm md:text-base">
              Luxury travel experiences at prices that won't break the bank.
              Handcrafted for the Gen Z traveler.
            </p>
            <div className="flex space-x-3 md:space-x-4">
              <SocialIcon>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </SocialIcon>
              <SocialIcon>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </SocialIcon>
              <SocialIcon>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </SocialIcon>
              <SocialIcon>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                </svg>
              </SocialIcon>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-3 md:mb-4 text-base md:text-lg">Quick Links</h3>
            <ul className="space-y-2">
              {/* <FooterLink>Flights</FooterLink>
              <FooterLink>Hotels</FooterLink> */}
              <FooterLink>Packages</FooterLink>
              <FooterLink>Trip Planner</FooterLink>
              <FooterLink>Travel Blog</FooterLink>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-3 md:mb-4 text-base md:text-lg">Popular Destinations</h3>
            <ul className="space-y-2">
              <FooterLink>Bali, Indonesia</FooterLink>
              <FooterLink>Santorini, Greece</FooterLink>
              <FooterLink>Tokyo, Japan</FooterLink>
              <FooterLink>Paris, France</FooterLink>
              <FooterLink>Maldives</FooterLink>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-3 md:mb-4 text-base md:text-lg">Contact Us</h3>
            <address className="not-italic">
              <p className="flex items-start gap-2 mb-2 text-sm md:text-base">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>Chhatarpur, New Delhi, 110071, India</span>
              </p>
              <p className="flex items-center gap-2 mb-2 text-sm md:text-base">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                +91 9910565588
              </p>
              <p className="flex items-center gap-2 text-sm md:text-base">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
                hello@travelgenz.com
              </p>
            </address>
          </div>
        </div>
        
        <hr className="border-gray-800 my-6 md:my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm md:text-base">© 2024 TravelGenZ. All rights reserved.</p>
          <div className="flex gap-4 md:gap-6 mt-3 md:mt-0">
            <FooterLink>Privacy Policy</FooterLink>
            <FooterLink>Terms of Service</FooterLink>
            <FooterLink>Cookie Policy</FooterLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ children }: { children: React.ReactNode }) => {
  return (
    <a href="#" className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-travel-primary hover:text-white transition-colors">
      {children}
    </a>
  );
};

const FooterLink = ({ children }: { children: React.ReactNode }) => {
  return (
    <li>
      <a href="#" className="hover:text-travel-primary transition-colors text-sm md:text-base">
        {children}
      </a>
    </li>
  );
};

export default Footer;
