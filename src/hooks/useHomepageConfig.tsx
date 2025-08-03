
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HomepageSection {
  id: string;
  section_key: string;
  display_name: string;
  subtitle: string | null;
  is_visible: boolean;
  position: number;
}

export const useHomepageConfig = () => {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSections();
    
    // Subscribe to changes in homepage_sections table
    const channel = supabase
      .channel('homepage-sections-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'homepage_sections'
        },
        () => {
          console.log('Homepage sections changed, reloading...');
          loadSections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSections = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .eq('is_visible', true)
        .order('position', { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error loading sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSectionConfig = (sectionKey: string) => {
    return sections.find(section => section.section_key === sectionKey);
  };

  const isSectionVisible = (sectionKey: string) => {
    const section = getSectionConfig(sectionKey);
    return section ? section.is_visible : true; // Default to visible if not found
  };

  const getSectionTitle = (sectionKey: string, defaultTitle: string) => {
    const section = getSectionConfig(sectionKey);
    return section ? section.display_name : defaultTitle;
  };

  const getSectionSubtitle = (sectionKey: string, defaultSubtitle: string) => {
    const section = getSectionConfig(sectionKey);
    return section && section.subtitle ? section.subtitle : defaultSubtitle;
  };

  return {
    sections,
    loading,
    getSectionConfig,
    isSectionVisible,
    getSectionTitle,
    getSectionSubtitle,
    reload: loadSections,
  };
};
