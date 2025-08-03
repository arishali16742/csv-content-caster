import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Eye, EyeOff, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LoginPopupSettings {
  id: string;
  image_url: string;
  title: string;
  subtitle: string;
  discount_text: string;
  terms_text: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popupSettings, setPopupSettings] = useState<LoginPopupSettings | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  
  const { toast } = useToast();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchPopupSettings();
    }
  }, [isOpen]);

  const fetchPopupSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('login_popup_settings')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setPopupSettings(data);
    } catch (error) {
      console.error('Error fetching popup settings:', error);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        
        onClose();
        window.location.reload();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
            }
          }
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
        
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl max-w-4xl w-full ${isMobile ? 'h-auto max-h-[90vh] overflow-y-auto' : 'h-[600px]'} relative shadow-2xl flex ${isMobile ? 'flex-col' : 'flex-row'} overflow-hidden`}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 bg-white rounded-full p-1"
        >
          <X className="h-6 w-6" />
        </button>
        
        {/* Left side - Image and promotional content */}
        {!isMobile && (
          <div className="w-1/2 relative bg-gradient-to-br from-travel-primary to-purple-600 flex flex-col justify-center items-center text-white p-8">
            {popupSettings?.image_url && (
              <div className="absolute inset-0">
                <img 
                  src={popupSettings.image_url} 
                  alt="Travel promotion" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black opacity-30"></div>
              </div>
            )}
            
            <div className="relative z-10 text-center">
              {popupSettings?.title && (
                <h2 className="text-3xl font-bold mb-4">{popupSettings.title}</h2>
              )}
              {popupSettings?.discount_text && (
                <div className="text-5xl font-bold mb-4">{popupSettings.discount_text}</div>
              )}
              {popupSettings?.subtitle && (
                <p className="text-lg mb-4 opacity-90">{popupSettings.subtitle}</p>
              )}
              {popupSettings?.terms_text && (
                <p className="text-sm opacity-75">{popupSettings.terms_text}</p>
              )}
            </div>
          </div>
        )}

        {/* Right side - Login/Signup form */}
        <div className={`${isMobile ? 'w-full p-6' : 'w-1/2 p-8'} flex flex-col justify-center`}>
          <div className={`${isMobile ? 'w-full' : 'max-w-sm mx-auto w-full'}`}>
            <div className="text-center mb-6">
              <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-2 text-gray-900`}>
                {isLogin ? 'Welcome Back!' : 'Create Account'}
              </h2>
              <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>
                {isLogin ? 'Sign in to continue your journey' : 'Join our travel community'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'}`}>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="First Name"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-travel-primary focus:border-transparent transition-all"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Last Name"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-travel-primary focus:border-transparent transition-all"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-travel-primary focus:border-transparent transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-travel-primary focus:border-transparent transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-travel-primary to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-[1.02] duration-200"
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div className={`mt-4 ${isMobile ? 'text-sm' : 'text-base'} text-center`}>
              <p className="text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-travel-primary font-semibold hover:underline"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Mobile-only promotional content (shown at bottom) */}
        {isMobile && popupSettings && (
          <div className="w-full bg-gradient-to-br from-travel-primary to-purple-600 text-white p-6 text-center">
            {popupSettings.title && (
              <h3 className="text-xl font-bold mb-2">{popupSettings.title}</h3>
            )}
            {popupSettings.discount_text && (
              <div className="text-3xl font-bold mb-2">{popupSettings.discount_text}</div>
            )}
            {popupSettings.subtitle && (
              <p className="text-sm opacity-90 mb-2">{popupSettings.subtitle}</p>
            )}
            {popupSettings.terms_text && (
              <p className="text-xs opacity-75">{popupSettings.terms_text}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;