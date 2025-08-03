import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowUp, ArrowDown, Eye, EyeOff, Edit, Trash2 } from 'lucide-react';
import SpreadsheetUploadPackage from './SpreadsheetUploadPackage';
import ImageUpload from './ImageUpload';

interface Package {
  id?: string;
  title: string;
  country: string;
  destinations: string[];
  duration: string;
  price: string;
  original_price: string;
  rating: number;
  image: string;
  includes: string[];
  mood: string;
  trip_type: string;
  publish_to: string[];
  status?: string;
  position?: number;
  gallery_images?: string[];
}

const PackageManagement = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const { toast } = useToast();

  const publishOptions = [
    { id: 'packages', label: 'Packages Page' },
    { id: 'trending', label: 'Trending Destinations' },
    { id: 'popular', label: 'Popular Destinations' },
    { id: 'hot', label: 'Hot Destinations' }
  ];

  const csvColumns = [
    'title', 'country', 'destinations', 'duration', 'price', 'original_price', 
    'rating', 'image', 'gallery_images', 'includes', 'mood', 'trip_type'
  ];

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    if (selectAll) {
      setSelectedPackages(packages.map(pkg => pkg.id!));
    } else {
      setSelectedPackages([]);
    }
  }, [selectAll, packages]);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('position', { ascending: true });
      
      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch packages",
        variant: "destructive",
      });
    }
  };

  const handleCheckboxChange = (packageId: string) => {
    setSelectedPackages(prev => 
      prev.includes(packageId) 
        ? prev.filter(id => id !== packageId) 
        : [...prev, packageId]
    );
  };

  const handleSelectAllChange = (checked: boolean) => {
    setSelectAll(checked);
  };

  const handleBulkDelete = async () => {
    if (selectedPackages.length === 0) {
      toast({
        title: "No packages selected",
        description: "Please select packages to delete",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedPackages.length} package(s)?`)) return;
    
    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .in('id', selectedPackages);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `${selectedPackages.length} package(s) deleted successfully`,
      });
      
      setSelectedPackages([]);
      setSelectAll(false);
      fetchPackages();
    } catch (error) {
      console.error('Error deleting packages:', error);
      toast({
        title: "Error",
        description: "Failed to delete packages",
        variant: "destructive",
      });
    }
  };

  const handleCreatePackage = () => {
    setEditingPackage({
      title: '',
      country: '',
      destinations: [],
      duration: '',
      price: '',
      original_price: '',
      rating: 5,
      image: '',
      includes: [],
      mood: '',
      trip_type: '',
      publish_to: ['packages'],
      gallery_images: []
    });
  };

  const handleEditPackage = (pkg: Package) => {
    setEditingPackage({...pkg, gallery_images: pkg.gallery_images || []});
  };

  const updateField = (field: keyof Package, value: any) => {
    setEditingPackage((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  const handleImagesUploaded = (imageUrls: string[]) => {
    updateField('gallery_images', imageUrls);
    if (imageUrls.length > 0 && !editingPackage?.image) {
      updateField('image', imageUrls[0]);
    }
  };

  const handlePublishToChange = (optionId: string, checked: boolean) => {
    if (!editingPackage) return;
    
    let newPublishTo = [...(editingPackage.publish_to || [])];
    
    if (checked) {
      if (!newPublishTo.includes(optionId)) {
        newPublishTo.push(optionId);
      }
    } else {
      newPublishTo = newPublishTo.filter(id => id !== optionId);
    }
    
    updateField('publish_to', newPublishTo);
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'hold' : 'published';
    try {
      const { error } = await supabase
        .from('packages')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Package ${newStatus === 'published' ? 'published' : 'put on hold'}`,
      });
      
      fetchPackages();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update package status",
        variant: "destructive",
      });
    }
  };

  const moveItem = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = packages.findIndex(p => p.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === packages.length - 1)
    ) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const updatedPackages = [...packages];
    [updatedPackages[currentIndex], updatedPackages[newIndex]] = 
    [updatedPackages[newIndex], updatedPackages[currentIndex]];

    try {
      for (let i = 0; i < updatedPackages.length; i++) {
        await supabase
          .from('packages')
          .update({ position: i + 1 })
          .eq('id', updatedPackages[i].id);
      }
      
      fetchPackages();
    } catch (error) {
      console.error('Error updating positions:', error);
      toast({
        title: "Error",
        description: "Failed to update package positions",
        variant: "destructive",
      });
    }
  };

  const updatePosition = async (id: string, newPosition: number) => {
    const items = [...packages];
    const currentIndex = items.findIndex(item => item.id === id);
    const item = items[currentIndex];
    
    items.splice(currentIndex, 1);
    items.splice(newPosition - 1, 0, item);
    
    try {
      for (let i = 0; i < items.length; i++) {
        await supabase
          .from('packages')
          .update({ position: i + 1 })
          .eq('id', items[i].id);
      }
      
      fetchPackages();
    } catch (error) {
      console.error('Error updating positions:', error);
      toast({
        title: "Error",
        description: "Failed to update package positions",
        variant: "destructive",
      });
    }
  };

  const handleSavePackage = async () => {
    if (!editingPackage) return;
    
    setLoading(true);
    try {
      const packageData = {
        title: editingPackage.title,
        country: editingPackage.country,
        destinations: editingPackage.destinations,
        duration: editingPackage.duration,
        price: editingPackage.price,
        original_price: editingPackage.original_price,
        rating: editingPackage.rating,
        image: editingPackage.image,
        includes: editingPackage.includes,
        mood: editingPackage.mood,
        trip_type: editingPackage.trip_type,
        publish_to: editingPackage.publish_to || ['packages'],
        status: 'published',
        gallery_images: editingPackage.gallery_images || []
      };

      if (editingPackage.id) {
        const { error } = await supabase
          .from('packages')
          .update(packageData)
          .eq('id', editingPackage.id);
        
        if (error) throw error;

        await updateDestinationSections(editingPackage.id, packageData, editingPackage.publish_to || []);
      } else {
        const { data, error } = await supabase
          .from('packages')
          .insert({
            ...packageData,
            position: packages.length + 1
          })
          .select();
        
        if (error) throw error;
        if (data && data[0]) {
          await updateDestinationSections(data[0].id, packageData, editingPackage.publish_to || []);
        }
      }

      toast({
        title: "Success",
        description: "Package saved successfully",
      });

      setEditingPackage(null);
      fetchPackages();
    } catch (error) {
      console.error('Error saving package:', error);
      toast({
        title: "Error",
        description: "Failed to save package",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateDestinationSections = async (packageId: string, packageData: any, publishTo: string[]) => {
    const priceNum = parseInt((packageData.price || '').replace(/[^\d]/g, '')) || 0;
    const oldPriceNum = parseInt((packageData.original_price || '').replace(/[^\d]/g, '')) || 0;

    const discount = oldPriceNum > 0 && priceNum < oldPriceNum ?
      `${Math.round((1 - (priceNum / oldPriceNum)) * 100)}% OFF` : '';
      
    const destinationData = {
      name: packageData.title,
      country: packageData.country,
      description: `${packageData.duration} package starting from ${packageData.price}`,
      price: priceNum,
      old_price: oldPriceNum,
      rating: packageData.rating,
      image: packageData.image,
      discount: discount,
      status: 'published',
      duration: packageData.duration,
    };

    await Promise.all([
      supabase.from('trending_destinations').delete().eq('name', packageData.title),
      supabase.from('popular_destinations').delete().eq('name', packageData.title),
      supabase.from('hot_destinations').delete().eq('name', packageData.title)
    ]);

    const promises = [];
    if (publishTo.includes('trending')) {
      promises.push(supabase.from('trending_destinations').insert(destinationData));
    }
    if (publishTo.includes('popular')) {
      promises.push(supabase.from('popular_destinations').insert(destinationData));
    }
    if (publishTo.includes('hot')) {
      promises.push(supabase.from('hot_destinations').insert(destinationData));
    }

    if (promises.length > 0) {
      const results = await Promise.allSettled(promises);
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Error inserting into destination table ${index}:`, result.reason);
        }
      });
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    
    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', packageId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Package deleted successfully",
      });
      
      fetchPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({
        title: "Error",
        description: "Failed to delete package",
        variant: "destructive",
      });
    }
  };

  const handleSpreadsheetData = async (data: any[]) => {
    setLoading(true);
    try {
      const packagesData = data.map((row, index) => ({
        title: row.title || '',
        country: row.country || '',
        destinations: row.destinations ? row.destinations.split(';').map((d: string) => d.trim()) : [],
        duration: row.duration || '',
        price: row.price || '',
        original_price: row.original_price || '',
        rating: parseFloat(row.rating) || 5,
        image: row.image || '',
        gallery_images: row.gallery_images ? row.gallery_images.split(';').map((img: string) => img.trim()).filter((img: string) => img) : [],
        includes: row.includes ? row.includes.split(';').map((i: string) => i.trim()) : [],
        mood: row.mood || '',
        trip_type: row.trip_type || '',
        publish_to: ['packages'],
        status: 'published',
        position: packages.length + index + 1
      }));

      const { error } = await supabase
        .from('packages')
        .insert(packagesData);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${packagesData.length} packages imported successfully`,
      });

      fetchPackages();
    } catch (error) {
      console.error('Error importing packages:', error);
      toast({
        title: "Error",
        description: "Failed to import packages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (editingPackage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {editingPackage.id ? 'Edit Package' : 'Create New Package'}
          </h3>
          <Button
            variant="outline"
            onClick={() => setEditingPackage(null)}
          >
            Back to List
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={editingPackage.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Package title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <Input
                  value={editingPackage.country || ''}
                  onChange={(e) => updateField('country', e.target.value)}
                  placeholder="Country"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Package Images</label>
              <ImageUpload
                onImagesUploaded={handleImagesUploaded}
                existingImages={editingPackage.gallery_images || []}
                maxImages={6}
              />
              <p className="text-xs text-gray-500 mt-2">
                The first image will be used as the main package image. Upload up to 6 images for the gallery.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Main Image URL (fallback)</label>
              <Input
                value={editingPackage.image || ''}
                onChange={(e) => updateField('image', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be auto-filled with the first uploaded image, or you can set a custom URL.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Destinations (comma-separated)</label>
              <Input
                value={editingPackage.destinations?.join(', ') || ''}
                onChange={(e) => updateField('destinations', e.target.value.split(',').map(d => d.trim()).filter(d => d))}
                placeholder="Destination 1, Destination 2, ..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Duration</label>
                <Input
                  value={editingPackage.duration || ''}
                  onChange={(e) => updateField('duration', e.target.value)}
                  placeholder="e.g., 7 Days 6 Nights"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={editingPackage.rating || 5}
                  onChange={(e) => updateField('rating', parseFloat(e.target.value) || 5)}
                  placeholder="Rating (1-5)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <Input
                  value={editingPackage.price || ''}
                  onChange={(e) => updateField('price', e.target.value)}
                  placeholder="e.g., ₹45,000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Original Price</label>
                <Input
                  value={editingPackage.original_price || ''}
                  onChange={(e) => updateField('original_price', e.target.value)}
                  placeholder="e.g., ₹55,000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Includes (comma-separated)</label>
              <Textarea
                value={editingPackage.includes?.join(', ') || ''}
                onChange={(e) => updateField('includes', e.target.value.split(',').map(i => i.trim()).filter(i => i))}
                placeholder="Flights, Hotels, Meals, ..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mood</label>
                <Input
                  value={editingPackage.mood || ''}
                  onChange={(e) => updateField('mood', e.target.value)}
                  placeholder="e.g., Adventure, Relaxation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Trip Type</label>
                <Input
                  value={editingPackage.trip_type || ''}
                  onChange={(e) => updateField('trip_type', e.target.value)}
                  placeholder="e.g., Family, Honeymoon"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Publish To</label>
              <div className="grid grid-cols-2 gap-3">
                {publishOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={editingPackage.publish_to?.includes(option.id) || false}
                      onCheckedChange={(checked) => handlePublishToChange(option.id, checked === true)}
                    />
                    <label htmlFor={option.id} className="text-sm font-medium">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {editingPackage.image && (
              <div>
                <label className="block text-sm font-medium mb-1">Preview</label>
                <img 
                  src={editingPackage.image} 
                  alt="Package preview" 
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-6">
            <Button
              onClick={handleSavePackage}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Package'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setEditingPackage(null)}
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
        <h3 className="text-lg font-semibold">Package Management</h3>
        <div className="flex gap-2">
          {selectedPackages.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={handleBulkDelete}
            >
              Delete Selected ({selectedPackages.length})
            </Button>
          )}
          <Button onClick={handleCreatePackage}>
            Create New Package
          </Button>
        </div>
      </div>

      <SpreadsheetUploadPackage
        onDataParsed={handleSpreadsheetData}
        expectedColumns={csvColumns}
        title="Upload Packages CSV"
        templateData={packages}
      />

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="grid gap-4">
            <div className="border rounded-lg p-4 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={selectAll}
                  onCheckedChange={(checked) => handleSelectAllChange(checked === true)}
                  className="mr-2"
                />
                <span className="font-medium">Select All Packages</span>
              </div>
            </div>

            {packages.map((pkg) => (
              <div key={pkg.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedPackages.includes(pkg.id!)}
                    onCheckedChange={() => handleCheckboxChange(pkg.id!)}
                    className="mr-2"
                  />
                  {pkg.image && (
                    <img 
                      src={pkg.image} 
                      alt={pkg.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <h4 className="font-medium">{pkg.title}</h4>
                    <p className="text-sm text-gray-600">{pkg.country} • {pkg.duration}</p>
                    <p className="text-sm font-medium text-blue-600">{pkg.price}</p>
                    <p className="text-sm text-gray-500">Position: {pkg.position} | Status: {pkg.status || 'published'}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pkg.publish_to?.map((section) => (
                        <span key={section} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {publishOptions.find(opt => opt.id === section)?.label || section}
                        </span>
                      ))}
                    </div>
                    {pkg.gallery_images && pkg.gallery_images.length > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        📸 {pkg.gallery_images.length} images uploaded
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={packages.findIndex(p => p.id === pkg.id) + 1}
                    onChange={(e) => updatePosition(pkg.id!, parseInt(e.target.value))}
                    className="border rounded px-2 py-1 text-sm"
                    title="Position"
                  >
                    {packages.map((_, index) => (
                      <option key={index + 1} value={index + 1}>
                        {index + 1}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => toggleStatus(pkg.id!, pkg.status || 'published')}
                    className={`p-1 ${(pkg.status || 'published') === 'published' ? 'text-green-500' : 'text-red-500'} hover:opacity-70`}
                    title={(pkg.status || 'published') === 'published' ? 'Hold (Hide from website)' : 'Publish (Show on website)'}
                  >
                    {(pkg.status || 'published') === 'published' ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => moveItem(pkg.id!, 'up')}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => moveItem(pkg.id!, 'down')}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    onClick={() => handleEditPackage(pkg)}
                    className="p-1 text-blue-500 hover:text-blue-700"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg.id!)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageManagement;