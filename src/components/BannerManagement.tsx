
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface Banner {
  id?: string;
  destination_name: string;
  description: string | null;
  banner_image: string;
  total_packages: number | null;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

const BannerManagement = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('destination_banners')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast({
        title: "Error",
        description: "Failed to fetch banners",
        variant: "destructive",
      });
    }
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner({...banner});
  };

  const handleCreateBanner = () => {
    setEditingBanner({
      destination_name: '',
      description: '',
      banner_image: '',
      total_packages: 0,
      is_default: false
    });
  };

  const updateField = (field: keyof Banner, value: any) => {
    setEditingBanner((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  const handleDefaultChange = (checked: boolean | "indeterminate") => {
    updateField('is_default', checked === true);
  };

  const handleSaveBanner = async () => {
    if (!editingBanner) return;
    
    setLoading(true);
    try {
      // If this banner is being set as default, unset all other default banners first
      if (editingBanner.is_default) {
        await supabase
          .from('destination_banners')
          .update({ is_default: false })
          .neq('id', editingBanner.id || '');
      }

      const bannerData = {
        destination_name: editingBanner.destination_name,
        description: editingBanner.description,
        banner_image: editingBanner.banner_image,
        total_packages: editingBanner.total_packages,
        is_default: editingBanner.is_default
      };

      if (editingBanner.id) {
        // Update existing banner
        const { error } = await supabase
          .from('destination_banners')
          .update(bannerData)
          .eq('id', editingBanner.id);
        
        if (error) throw error;
      } else {
        // Create new banner
        const { error } = await supabase
          .from('destination_banners')
          .insert(bannerData);
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Banner saved successfully",
      });

      setEditingBanner(null);
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      toast({
        title: "Error",
        description: "Failed to save banner",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    
    try {
      const { error } = await supabase
        .from('destination_banners')
        .delete()
        .eq('id', bannerId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Banner deleted successfully",
      });
      
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast({
        title: "Error",
        description: "Failed to delete banner",
        variant: "destructive",
      });
    }
  };

  if (editingBanner) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {editingBanner.id ? 'Edit Banner' : 'Create New Banner'}
          </h3>
          <Button
            variant="outline"
            onClick={() => setEditingBanner(null)}
          >
            Back to List
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Destination Name</label>
              <Input
                value={editingBanner.destination_name || ''}
                onChange={(e) => updateField('destination_name', e.target.value)}
                placeholder="e.g., Bali, Dubai, Thailand"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={editingBanner.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Brief description of the destination"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Banner Image URL</label>
              <Input
                value={editingBanner.banner_image || ''}
                onChange={(e) => updateField('banner_image', e.target.value)}
                placeholder="https://example.com/banner-image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Total Packages</label>
              <Input
                type="number"
                value={editingBanner.total_packages || 0}
                onChange={(e) => updateField('total_packages', parseInt(e.target.value) || 0)}
                placeholder="Number of packages available"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-default"
                checked={editingBanner.is_default || false}
                onCheckedChange={handleDefaultChange}
              />
              <label htmlFor="is-default" className="text-sm font-medium">
                Set as Default Banner (shown when no specific destination is searched)
              </label>
            </div>

            {editingBanner.banner_image && (
              <div>
                <label className="block text-sm font-medium mb-1">Preview</label>
                <img 
                  src={editingBanner.banner_image} 
                  alt="Banner preview" 
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-6">
            <Button
              onClick={handleSaveBanner}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Banner'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setEditingBanner(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Banner Management</h3>
        <Button onClick={handleCreateBanner}>
          Create New Banner
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="grid gap-4">
            {banners.map((banner) => (
              <div key={banner.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {banner.banner_image && (
                    <img 
                      src={banner.banner_image} 
                      alt={banner.destination_name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{banner.destination_name}</h4>
                      {banner.is_default && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{banner.description}</p>
                    <p className="text-sm font-medium text-blue-600">
                      {banner.total_packages} packages
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditBanner(banner)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteBanner(banner.id!)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerManagement;
