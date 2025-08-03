import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, X } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

const MobileDetector = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 768;
      
      setIsMobile(isMobileDevice || isSmallScreen);
      
      // Show popup only once per session for mobile users
      if ((isMobileDevice || isSmallScreen) && !hasShownPopup) {
        const hasSeenPopup = sessionStorage.getItem('mobile-popup-shown');
        if (!hasSeenPopup) {
          setShowPopup(true);
          setHasShownPopup(true);
          sessionStorage.setItem('mobile-popup-shown', 'true');
        }
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [hasShownPopup]);

  const handleContinueOnMobile = () => {
    setShowPopup(false);
  };

  const handleOpenOnDesktop = () => {
    // Copy current URL to clipboard for easy access on desktop
    navigator.clipboard.writeText(window.location.href).catch(() => {
      // Fallback if clipboard API is not available
      console.log('Could not copy URL to clipboard');
    });
    setShowPopup(false);
  };

  return (
    <Dialog open={showPopup} onOpenChange={setShowPopup}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <Smartphone className="h-6 w-6 text-travel-primary" />
            Better Experience on Desktop
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <div className="bg-gradient-to-r from-travel-primary/10 to-travel-secondary/10 rounded-lg p-4">
            <Monitor className="h-12 w-12 mx-auto mb-2 text-travel-primary" />
            <p className="text-sm text-gray-600">
              For the best experience with all features, we recommend viewing TravelGenZ on a desktop or tablet.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleOpenOnDesktop}
              className="w-full bg-travel-primary hover:bg-travel-primary/90"
            >
              <Monitor className="h-4 w-4 mr-2" />
              Copy Link for Desktop
            </Button>
            
            <Button 
              onClick={handleContinueOnMobile}
              variant="outline"
              className="w-full"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Continue on Mobile
            </Button>
          </div>
          
          <p className="text-xs text-gray-500">
            You can always switch to desktop for the full experience
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MobileDetector;