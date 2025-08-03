
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface CounterStats {
  id?: string;
  packages_booked: number;
  visa_booked: number;
  happy_customers: number;
}

interface BackgroundImage {
  id?: string;
  image_url: string;
  alt_text: string;
  position: number;
  is_active: boolean;
}

const CounterManagement = () => {
  const [stats, setStats] = useState<CounterStats>({
    packages_booked: 0,
    visa_booked: 0,
    happy_customers: 0
  });
  const [backgrounds, setBackgrounds] = useState<BackgroundImage[]>([]);
  const [newBackground, setNewBackground] = useState<BackgroundImage>({
    image_url: '',
    alt_text: '',
    position: 0,
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
    fetchBackgrounds();
  }, []);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('counter_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (data && data.length > 0) {
        setStats(data[0]);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchBackgrounds = async () => {
    try {
      const { data, error } = await supabase
        .from('counter_backgrounds')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      setBackgrounds(data || []);
    } catch (error) {
      console.error('Error fetching backgrounds:', error);
    }
  };

  const updateStats = async () => {
    setLoading(true);
    try {
      if (stats.id) {
        const { error } = await supabase
          .from('counter_stats')
          .update({
            packages_booked: stats.packages_booked,
            visa_booked: stats.visa_booked,
            happy_customers: stats.happy_customers,
            updated_at: new Date().toISOString()
          })
          .eq('id', stats.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('counter_stats')
          .insert(stats);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Counter statistics updated successfully",
      });
    } catch (error) {
      console.error('Error updating stats:', error);
      toast({
        title: "Error",
        description: "Failed to update statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addBackground = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('counter_backgrounds')
        .insert(newBackground);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Background image added successfully",
      });

      setNewBackground({
        image_url: '',
        alt_text: '',
        position: 0,
        is_active: true
      });
      fetchBackgrounds();
    } catch (error) {
      console.error('Error adding background:', error);
      toast({
        title: "Error",
        description: "Failed to add background image",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteBackground = async (id: string) => {
    if (!confirm('Are you sure you want to delete this background?')) return;

    try {
      const { error } = await supabase
        .from('counter_backgrounds')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Background image deleted successfully",
      });

      fetchBackgrounds();
    } catch (error) {
      console.error('Error deleting background:', error);
      toast({
        title: "Error",
        description: "Failed to delete background image",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Counter Statistics</h3>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Packages Booked</label>
              <Input
                type="number"
                value={stats.packages_booked}
                onChange={(e) => setStats({...stats, packages_booked: parseInt(e.target.value) || 0})}
                placeholder="Enter number of packages booked"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Visa Applications</label>
              <Input
                type="number"
                value={stats.visa_booked}
                onChange={(e) => setStats({...stats, visa_booked: parseInt(e.target.value) || 0})}
                placeholder="Enter number of visa applications"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Happy Customers</label>
              <Input
                type="number"
                value={stats.happy_customers}
                onChange={(e) => setStats({...stats, happy_customers: parseInt(e.target.value) || 0})}
                placeholder="Enter number of happy customers"
              />
            </div>
          </div>
          <Button onClick={updateStats} disabled={loading}>
            {loading ? 'Updating...' : 'Update Statistics'}
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Background Images</h3>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="mb-6">
            <h4 className="font-medium mb-4">Add New Background</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <Input
                  value={newBackground.image_url}
                  onChange={(e) => setNewBackground({...newBackground, image_url: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Position</label>
                <Input
                  type="number"
                  value={newBackground.position}
                  onChange={(e) => setNewBackground({...newBackground, position: parseInt(e.target.value) || 0})}
                  placeholder="Display order"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Alt Text</label>
              <Textarea
                value={newBackground.alt_text}
                onChange={(e) => setNewBackground({...newBackground, alt_text: e.target.value})}
                placeholder="Description of the image"
                rows={2}
              />
            </div>
            <Button onClick={addBackground} disabled={loading}>
              Add Background
            </Button>
          </div>

          <div>
            <h4 className="font-medium mb-4">Current Backgrounds</h4>
            <div className="grid gap-4">
              {backgrounds.map((bg) => (
                <div key={bg.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img 
                      src={bg.image_url} 
                      alt={bg.alt_text || 'Background'} 
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">Position: {bg.position}</p>
                      <p className="text-sm text-gray-600">{bg.alt_text}</p>
                      <p className="text-xs text-gray-500">
                        Status: {bg.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteBackground(bg.id!)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounterManagement;
