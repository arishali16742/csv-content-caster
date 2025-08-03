
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, ShoppingCart, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import LoginModal from './LoginModal';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [userInitials, setUserInitials] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isAuthenticated } = useAuth();
  const { isAdmin } = useAdmin();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      const firstName = user.user_metadata?.first_name || '';
      const lastName = user.user_metadata?.last_name || '';
      
      if (firstName && lastName) {
        setUserInitials(`${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase());
      } else if (firstName) {
        setUserInitials(firstName.charAt(0).toUpperCase());
      } else {
        setUserInitials(user.email?.charAt(0).toUpperCase() || 'U');
      }
    }
  }, [user]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigation = (path: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      navigate(path);
      setIsMenuOpen(false);
    }, 100);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const getNavbarClasses = () => {
    if (isHomePage) {
      return `fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md' 
          : 'bg-transparent'
      }`;
    }
    return 'fixed top-0 w-full z-50 bg-white shadow-md transition-all duration-300';
  };

  const getLinkClasses = () => {
    if (isHomePage) {
      return `${
        isScrolled 
          ? 'text-gray-700 hover:text-travel-primary' 
          : 'text-white hover:text-gray-200'
      } font-medium transition-colors flex items-center gap-1 cursor-pointer border-none bg-transparent`;
    }
    return 'text-gray-700 hover:text-travel-primary font-medium transition-colors flex items-center gap-1 cursor-pointer border-none bg-transparent';
  };

  const getLogoClasses = () => {
    if (isHomePage) {
      return `flex-shrink-0 font-bold text-lg md:text-xl ${
        isScrolled ? 'text-travel-primary' : 'text-white'
      }`;
    }
    return 'flex-shrink-0 font-bold text-lg md:text-xl text-travel-primary';
  };

  const getButtonClasses = () => {
    if (isHomePage && !isScrolled) {
      return 'bg-white text-travel-primary hover:bg-gray-100';
    }
    return '';
  };

  const getMenuButtonClasses = () => {
    if (isHomePage) {
      return `inline-flex items-center justify-center p-2 rounded-md ${
        isScrolled 
          ? 'text-gray-400 hover:text-gray-500 hover:bg-gray-100' 
          : 'text-white hover:text-gray-200 hover:bg-white/10'
      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-travel-primary`;
    }
    return 'inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-travel-primary';
  };

  return (
    <>
      <nav className={getNavbarClasses()}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-16">
            <div className="flex items-center">
              <Link to="/" className={getLogoClasses()}>
                TravelGenZ
              </Link>
            </div>
            
            <div className="hidden lg:flex items-center space-x-6 lg:space-x-8">
              <button onClick={() => handleNavigation('/')} className={getLinkClasses()}>
                Home
              </button>
              {/* <button onClick={() => handleNavigation('/flights')} className={getLinkClasses()}>
                Flights
              </button>
              <button onClick={() => handleNavigation('/hotels')} className={getLinkClasses()}>
                Hotels
              </button> */}
              <button onClick={() => handleNavigation('/packages')} className={getLinkClasses()}>
                Packages
              </button>
              <button onClick={() => handleNavigation('/blog')} className={getLinkClasses()}>
                Blog
              </button>
              <button onClick={() => handleNavigation('/price-comparison')} className={getLinkClasses()}>
                Price Comparison
              </button>
              
              {/* Cart for authenticated users */}
              {isAuthenticated && (
                <button onClick={() => handleNavigation('/cart')} className={getLinkClasses()}>
                  <ShoppingCart className="h-5 w-5" />
                </button>
              )}
              
              {/* Admin links */}
              {isAuthenticated && isAdmin && (
                <>
                  <button onClick={() => handleNavigation('/dashboard')} className={getLinkClasses()}>
                    Dashboard
                  </button>
                  <button onClick={() => handleNavigation('/user-activity')} className={getLinkClasses()}>
                    <Activity className="h-5 w-5" />
                  </button>
                </>
              )}
              
              {/* Auth buttons */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-travel-primary text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {userInitials}
                    </div>
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              ) : (
                <Button 
                  onClick={handleLoginClick}
                  className={getButtonClasses()}
                >
                  Login
                </Button>
              )}
            </div>

            <div className="-mr-2 flex lg:hidden">
              <button
                onClick={toggleMenu}
                type="button"
                className={getMenuButtonClasses()}
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className={`lg:hidden ${isMenuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
            <button onClick={() => handleNavigation('/')} className="nav-link block bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md text-base font-medium">
              Home
            </button>
            <button onClick={() => handleNavigation('/packages')} className="nav-link block text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">
              Packages
            </button>
            <button onClick={() => handleNavigation('/blog')} className="nav-link block text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">
              Blog
            </button>
            <button onClick={() => handleNavigation('/price-comparison')} className="nav-link block text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">
              Price Comparison
            </button>
            
            {/* Mobile cart */}
            {isAuthenticated && (
              <button onClick={() => handleNavigation('/cart')} className="nav-link block text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">
                Cart
              </button>
            )}
            
            {/* Mobile admin links */}
            {isAuthenticated && isAdmin && (
              <>
                <button onClick={() => handleNavigation('/dashboard')} className="nav-link block text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">
                  Dashboard
                </button>
                <button onClick={() => handleNavigation('/user-activity')} className="nav-link block text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">
                  User Activity
                </button>
              </>
            )}
            
            {/* Mobile auth buttons */}
            {isAuthenticated ? (
              <div className="px-3 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-travel-primary text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {userInitials}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <button onClick={handleLoginClick} className="nav-link block text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;
