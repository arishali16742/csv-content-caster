import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface HeroSettings {
  id?: string;
  hero_image: string;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_description: string | null;
  created_at?: string;
  updated_at?: string;
}

const HeroManagement = () => {
  const [heroSettings, setHeroSettings] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchHeroSettings();
  }, []);

  const fetchHeroSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_settings' as any)
        .select('*')
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setHeroSettings(data as unknown as HeroSettings);
      } else {
        // Set default values if no settings exist
        setHeroSettings({
          hero_image: '',
          hero_title: 'Discover Your Dream Destination',
          hero_subtitle: 'Explore the World with TravelGenZ',
          hero_description: 'Find amazing travel packages and create unforgettable memories'
        });
      }
    } catch (error) {
      console.error('Error fetching hero settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch hero settings",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const updateField = (field: keyof HeroSettings, value: string) => {
    setHeroSettings((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  const handleSaveSettings = async () => {
    if (!heroSettings) return;
    
    setLoading(true);
    try {
      const settingsData = {
        hero_image: heroSettings.hero_image,
        hero_title: heroSettings.hero_title,
        hero_subtitle: heroSettings.hero_subtitle,
        hero_description: heroSettings.hero_description
      };

      if (heroSettings.id) {
        // Update existing settings
        const { error } = await supabase
          .from('hero_settings' as any)
          .update(settingsData)
          .eq('id', heroSettings.id);
        
        if (error) throw error;
      } else {
        // Create new settings
        const { data, error } = await supabase
          .from('hero_settings' as any)
          .insert(settingsData)
          .select()
          .single();
        
        if (error) throw error;
        setHeroSettings(data as unknown as HeroSettings);
      }

      toast({
        title: "Success",
        description: "Hero settings saved successfully",
      });

      fetchHeroSettings();
    } catch (error) {
      console.error('Error saving hero settings:', error);
      toast({
        title: "Error",
        description: "Failed to save hero settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-travel-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Hero Section Management</h3>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Hero Background Image URL</label>
            <Input
              value={heroSettings?.hero_image || ''}
              onChange={(e) => updateField('hero_image', e.target.value)}
              placeholder="https://example.com/hero-image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hero Title</label>
            <Input
              value={heroSettings?.hero_title || ''}
              onChange={(e) => updateField('hero_title', e.target.value)}
              placeholder="Main heading for the hero section"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hero Subtitle</label>
            <Input
              value={heroSettings?.hero_subtitle || ''}
              onChange={(e) => updateField('hero_subtitle', e.target.value)}
              placeholder="Subtitle text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hero Description</label>
            <Textarea
              value={heroSettings?.hero_description || ''}
              onChange={(e) => updateField('hero_description', e.target.value)}
              placeholder="Brief description for the hero section"
              rows={3}
            />
          </div>

          {heroSettings?.hero_image && (
            <div>
              <label className="block text-sm font-medium mb-1">Preview</label>
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <img 
                  src={heroSettings.hero_image} 
                  alt="Hero preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-center text-white px-4">
                    <h1 className="text-2xl font-bold mb-2">{heroSettings.hero_title}</h1>
                    <h2 className="text-lg mb-2">{heroSettings.hero_subtitle}</h2>
                    <p className="text-sm">{heroSettings.hero_description}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            onClick={handleSaveSettings}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Hero Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroManagement;
