
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface Offer {
  id?: string;
  title: string;
  discount: string;
  color: string;
  active: boolean;
  position: number;
}

const OffersManagement = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newOffer, setNewOffer] = useState<Offer>({
    title: '',
    discount: '',
    color: '#8B5CF6',
    active: true,
    position: 0
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const colorOptions = [
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#3B82F6', // Blue
    '#F97316', // Orange
    '#6366F1'  // Indigo
  ];

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('wheel_offers')
        .select('*')
        .order('position', { ascending: true });
      
      if (data) {
        setOffers(data);
      } else if (error) {
        console.error('Error loading offers:', error);
        toast({
          title: "Error",
          description: "Failed to load offers",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error in loadOffers:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveOffer = async (offer: Offer) => {
    try {
      if (offer.id) {
        // Update existing offer
        const { error } = await supabase
          .from('wheel_offers')
          .update({
            title: offer.title,
            discount: offer.discount,
            color: offer.color,
            active: offer.active,
            position: offer.position
          })
          .eq('id', offer.id);

        if (error) throw error;
      } else {
        // Create new offer
        const { error } = await supabase
          .from('wheel_offers')
          .insert({
            title: offer.title,
            discount: offer.discount,
            color: offer.color,
            active: offer.active,
            position: offer.position
          });

        if (error) throw error;
      }

      await loadOffers();
      setEditingId(null);
      setShowAddForm(false);
      setNewOffer({
        title: '',
        discount: '',
        color: '#8B5CF6',
        active: true,
        position: 0
      });

      toast({
        title: "Success",
        description: `Offer ${offer.id ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      console.error('Error saving offer:', error);
      toast({
        title: "Error",
        description: "Failed to save offer",
        variant: "destructive"
      });
    }
  };

  const deleteOffer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('wheel_offers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadOffers();
      toast({
        title: "Success",
        description: "Offer deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast({
        title: "Error",
        description: "Failed to delete offer",
        variant: "destructive"
      });
    }
  };

  const updateOfferField = (id: string, field: keyof Offer, value: any) => {
    setOffers(offers.map(offer => 
      offer.id === id ? { ...offer, [field]: value } : offer
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-travel-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Wheel Offers Management</h2>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-travel-primary hover:bg-travel-primary/90"
          disabled={offers.length >= 6}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Offer
        </Button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          <strong>Note:</strong> The wheel supports exactly 6 offers. Active offers will be displayed on the wheel.
        </p>
      </div>

      {/* Add New Offer Form */}
      {showAddForm && (
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Add New Offer</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newOffer.title}
                onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-primary"
                placeholder="e.g., Flight Discount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount
              </label>
              <input
                type="text"
                value={newOffer.discount}
                onChange={(e) => setNewOffer({ ...newOffer, discount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-primary"
                placeholder="e.g., 15% OFF"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewOffer({ ...newOffer, color })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      newOffer.color === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position (0-5)
              </label>
              <input
                type="number"
                min="0"
                max="5"
                value={newOffer.position}
                onChange={(e) => setNewOffer({ ...newOffer, position: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-primary"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => saveOffer(newOffer)} className="bg-travel-primary hover:bg-travel-primary/90">
              <Save className="h-4 w-4 mr-2" />
              Save Offer
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Offers List */}
      <div className="space-y-4">
        {offers.map((offer) => (
          <div key={offer.id} className="bg-white border rounded-lg p-4">
            {editingId === offer.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={offer.title}
                      onChange={(e) => updateOfferField(offer.id!, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount
                    </label>
                    <input
                      type="text"
                      value={offer.discount}
                      onChange={(e) => updateOfferField(offer.id!, 'discount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="flex gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          onClick={() => updateOfferField(offer.id!, 'color', color)}
                          className={`w-8 h-8 rounded-full border-2 ${
                            offer.color === color ? 'border-gray-800' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      value={offer.position}
                      onChange={(e) => updateOfferField(offer.id!, 'position', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-primary"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={offer.active}
                      onChange={(e) => updateOfferField(offer.id!, 'active', e.target.checked)}
                      className="mr-2"
                    />
                    Active
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => saveOffer(offer)} size="sm" className="bg-travel-primary hover:bg-travel-primary/90">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: offer.color }}
                  />
                  <div>
                    <h3 className="font-semibold">{offer.title}</h3>
                    <p className="text-sm text-gray-600">{offer.discount}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    offer.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {offer.active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-sm text-gray-500">Position: {offer.position}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingId(offer.id!)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteOffer(offer.id!)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        {offers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No offers found. Add some offers to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OffersManagement;
