
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Partner {
  id: string;
  name: string;
  logo: string;
  position: number;
  status: string;
}

const Partners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    const loadPartners = async () => {
      const { data, error } = await (supabase as any)
        .from('partners')
        .select('*')
        .eq('status', 'published')
        .order('position', { ascending: true });
      
      if (data && !error) {
        setPartners(data as Partner[]);
      } else if (error) {
        console.error('Error loading partners:', error);
      }
    };

    loadPartners();
  }, []);

  if (partners.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Partnered with the best in the industry
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
          {partners.map((partner) => (
            <div key={partner.id} className="flex items-center justify-center">
              <img 
                src={partner.logo} 
                alt={partner.name}
                className="h-12 md:h-16 object-contain filter brightness-75 hover:brightness-100 transition-all duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
