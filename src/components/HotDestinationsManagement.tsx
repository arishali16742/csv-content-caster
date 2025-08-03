import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SpreadsheetUpload from './SpreadsheetUpload';

interface HotDestination {
  id: string;
  name: string;
  country: string;
  description: string;
  price: number;
  old_price: number;
  rating: number;
  image: string;
  discount: string;
  position: number;
  status: string;
  duration: string | null;
}

interface Draft {
  id: string;
  content_data: any;
  created_at: string;
  original_id: string | null;
}

const HotDestinationsManagement = () => {
  const [destinations, setDestinations] = useState<HotDestination[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [editingItem, setEditingItem] = useState<HotDestination | null>(null);
  const [newItem, setNewItem] = useState({
    name: '', country: '', description: '', price: 0, old_price: 0,
    rating: 0, image: '', discount: '', duration: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);

  const csvColumns = ['name', 'country', 'description', 'price', 'old_price', 'rating', 'image', 'discount', 'duration'];

  useEffect(() => {
    loadDestinations();
    loadDrafts();
  }, []);

  const loadDestinations = async () => {
    const { data } = await supabase
      .from('hot_destinations')
      .select('*')
      .order('position', { ascending: true });
    if (data) setDestinations(data);
  };

  const loadDrafts = async () => {
    const { data } = await supabase
      .from('drafts')
      .select('*')
      .eq('content_type', 'hot_destinations')
      .order('created_at', { ascending: false });
    if (data) setDrafts(data);
  };

  const handleCheckboxChange = (destinationId: string) => {
    setSelectedDestinations(prev => 
      prev.includes(destinationId) 
        ? prev.filter(id => id !== destinationId) 
        : [...prev, destinationId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedDestinations.length === 0) {
      alert('No destinations selected');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedDestinations.length} destination(s)?`)) return;
    
    try {
      const { error } = await supabase
        .from('hot_destinations')
        .delete()
        .in('id', selectedDestinations);
      
      if (error) throw error;
      
      //alert(`${selectedDestinations.length} destination(s) deleted successfully`);
      setSelectedDestinations([]);
      loadDestinations();
    } catch (error) {
      console.error('Error deleting destinations:', error);
      alert('Failed to delete destinations');
    }
  };

  const handleSaveDraft = async (item: any) => {
    const { error } = await supabase.from('drafts').insert({
      content_type: 'hot_destinations',
      content_data: item,
      original_id: item.id || null
    });
    
    if (!error) {
      alert('Saved as draft successfully!');
      loadDrafts();
      setShowAddForm(false);
      setEditingItem(null);
      setNewItem({
        name: '', country: '', description: '', price: 0, old_price: 0,
        rating: 0, image: '', discount: '', duration: ''
      });
    } else {
      alert('Error saving draft');
    }
  };

  const handleUpdatePage = async (item: any) => {
    if (item.id) {
      await supabase
        .from('hot_destinations')
        .update({ ...item, status: 'published' })
        .eq('id', item.id);
    } else {
      await supabase
        .from('hot_destinations')
        .insert({ ...item, status: 'published', position: destinations.length + 1 });
    }
    
    loadDestinations();
    setEditingItem(null);
    setShowAddForm(false);
    setNewItem({
      name: '', country: '', description: '', price: 0, old_price: 0,
      rating: 0, image: '', discount: '', duration: ''
    });
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'hold' : 'published';
    await supabase
      .from('hot_destinations')
      .update({ status: newStatus })
      .eq('id', id);
    loadDestinations();
  };

  const moveItem = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = destinations.findIndex(d => d.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === destinations.length - 1)
    ) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const updatedDestinations = [...destinations];
    [updatedDestinations[currentIndex], updatedDestinations[newIndex]] = 
    [updatedDestinations[newIndex], updatedDestinations[currentIndex]];

    for (let i = 0; i < updatedDestinations.length; i++) {
      await supabase
        .from('hot_destinations')
        .update({ position: i + 1 })
        .eq('id', updatedDestinations[i].id);
    }
    
    loadDestinations();
  };

  const updatePosition = async (id: string, newPosition: number) => {
    const items = [...destinations];
    const currentIndex = items.findIndex(item => item.id === id);
    const item = items[currentIndex];
    
    items.splice(currentIndex, 1);
    items.splice(newPosition - 1, 0, item);
    
    for (let i = 0; i < items.length; i++) {
      await supabase
        .from('hot_destinations')
        .update({ position: i + 1 })
        .eq('id', items[i].id);
    }
    
    loadDestinations();
  };

  const deleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this destination?')) {
      await supabase.from('hot_destinations').delete().eq('id', id);
      loadDestinations();
    }
  };

  const publishFromDraft = async (draft: Draft) => {
    if (draft.original_id) {
      await supabase
        .from('hot_destinations')
        .update({ ...draft.content_data, status: 'published' })
        .eq('id', draft.original_id);
    } else {
      await supabase
        .from('hot_destinations')
        .insert({ ...draft.content_data, status: 'published', position: destinations.length + 1 });
    }
    
    await supabase.from('drafts').delete().eq('id', draft.id);
    loadDestinations();
    loadDrafts();
  };

  const deleteDraft = async (id: string) => {
    if (confirm('Are you sure you want to delete this draft?')) {
      await supabase.from('drafts').delete().eq('id', id);
      loadDrafts();
    }
  };

  const handleSpreadsheetData = async (data: any[]) => {
    setLoading(true);
    try {
      const destinationsData = data.map(row => ({
        name: row.name || '',
        country: row.country || '',
        description: row.description || '',
        price: parseFloat(row.price) || 0,
        old_price: parseFloat(row.old_price) || 0,
        rating: parseFloat(row.rating) || 5,
        image: row.image || '',
        discount: row.discount || '',
        duration: row.duration || null,
        status: 'published',
        position: destinations.length + 1
      }));

      const { error } = await supabase
        .from('hot_destinations')
        .insert(destinationsData);

      if (error) throw error;

      //alert(`${destinationsData.length} destinations imported successfully`);
      loadDestinations();
    } catch (error) {
      console.error('Error importing destinations:', error);
      alert('Failed to import destinations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Hot Destinations Management</h3>
        <div className="flex gap-2">
          {selectedDestinations.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Delete Selected ({selectedDestinations.length})
            </button>
          )}
          <button
            onClick={() => setShowDrafts(!showDrafts)}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg"
          >
            {showDrafts ? 'Hide Drafts' : `View Drafts (${drafts.length})`}
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-travel-primary text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={16} />
            Add Destination
          </button>
        </div>
      </div>

      <SpreadsheetUpload
        onDataParsed={handleSpreadsheetData}
        expectedColumns={csvColumns}
        title="Upload Hot Destinations CSV"
        templateData={destinations}
      />

      {showDrafts && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium mb-4">Drafts ({drafts.length})</h4>
          <div className="space-y-3">
            {drafts.map((draft) => (
              <div key={draft.id} className="bg-white border rounded-lg p-3 flex items-center justify-between">
                <div>
                  <span className="font-medium">{draft.content_data.name}</span>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(draft.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => publishFromDraft(draft)}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Publish
                  </button>
                  <button
                    onClick={() => deleteDraft(draft.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {drafts.length === 0 && (
              <p className="text-gray-500 text-center py-4">No drafts found</p>
            )}
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-4">Add New Destination</h4>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="Country"
              value={newItem.country}
              onChange={(e) => setNewItem({ ...newItem, country: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="Description"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Price"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                className="border rounded-lg px-3 py-2"
              />
              <input
                type="number"
                placeholder="Old Price"
                value={newItem.old_price}
                onChange={(e) => setNewItem({ ...newItem, old_price: parseFloat(e.target.value) })}
                className="border rounded-lg px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Rating"
                value={newItem.rating}
                onChange={(e) => setNewItem({ ...newItem, rating: parseFloat(e.target.value) })}
                className="border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="Discount"
                value={newItem.discount}
                onChange={(e) => setNewItem({ ...newItem, discount: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
            </div>
            <input
              type="url"
              placeholder="Image URL"
              value={newItem.image}
              onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="Duration (e.g. 4 Days / 5 Nights)"
              value={newItem.duration}
              onChange={(e) => setNewItem({ ...newItem, duration: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => handleSaveDraft(newItem)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg"
            >
              Save as Draft
            </button>
            <button
              onClick={() => handleUpdatePage(newItem)}
              className="bg-travel-primary text-white px-4 py-2 rounded-lg"
            >
              Update Page
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {destinations.map((destination) => (
          <div key={destination.id} className="bg-white border rounded-lg p-4">
            {editingItem?.id === destination.id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Name"
                />
                <input
                  type="text"
                  value={editingItem.country}
                  onChange={(e) => setEditingItem({ ...editingItem, country: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Country"
                />
                <input
                  type="text"
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Description"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                    className="border rounded-lg px-3 py-2"
                    placeholder="Price"
                  />
                  <input
                    type="number"
                    value={editingItem.old_price}
                    onChange={(e) => setEditingItem({ ...editingItem, old_price: parseFloat(e.target.value) })}
                    className="border rounded-lg px-3 py-2"
                    placeholder="Old Price"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    value={editingItem.rating}
                    onChange={(e) => setEditingItem({ ...editingItem, rating: parseFloat(e.target.value) })}
                    className="border rounded-lg px-3 py-2"
                    placeholder="Rating"
                  />
                  <input
                    type="text"
                    value={editingItem.discount}
                    onChange={(e) => setEditingItem({ ...editingItem, discount: e.target.value })}
                    className="border rounded-lg px-3 py-2"
                    placeholder="Discount"
                  />
                </div>
                <input
                  type="url"
                  value={editingItem.image}
                  onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Image URL"
                />
                <input
                  type="text"
                  placeholder="Duration (e.g. 4 Days / 5 Nights)"
                  value={editingItem.duration || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, duration: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveDraft(editingItem)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                  >
                    Save as Draft
                  </button>
                  <button
                    onClick={() => handleUpdatePage(editingItem)}
                    className="bg-travel-primary text-white px-4 py-2 rounded-lg"
                  >
                    Update Page
                  </button>
                  <button
                    onClick={() => setEditingItem(null)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedDestinations.includes(destination.id)}
                    onChange={() => handleCheckboxChange(destination.id)}
                    className="h-4 w-4"
                  />
                  <img src={destination.image} alt={destination.name} className="w-16 h-16 rounded object-cover" />
                  <div>
                    <span className="font-medium">{destination.name}, {destination.country}</span>
                    <p className="text-sm text-gray-500">{destination.description}</p>
                    <p className="text-sm text-gray-500">Duration: {destination.duration || 'N/A'}</p>
                    <p className="text-sm text-gray-500">Position: {destination.position} | Status: {destination.status || 'published'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={destinations.findIndex(d => d.id === destination.id) + 1}
                    onChange={(e) => updatePosition(destination.id, parseInt(e.target.value))}
                    className="border rounded px-2 py-1 text-sm"
                    title="Position"
                  >
                    {destinations.map((_, index) => (
                      <option key={index + 1} value={index + 1}>
                        {index + 1}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => toggleStatus(destination.id, destination.status || 'published')}
                    className={`p-1 ${(destination.status || 'published') === 'published' ? 'text-green-500' : 'text-red-500'} hover:opacity-70`}
                    title={(destination.status || 'published') === 'published' ? 'Hold (Hide from website)' : 'Publish (Show on website)'}
                  >
                    {(destination.status || 'published') === 'published' ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => moveItem(destination.id, 'up')}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => moveItem(destination.id, 'down')}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    onClick={() => setEditingItem(destination)}
                    className="p-1 text-blue-500 hover:text-blue-700"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => deleteItem(destination.id)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotDestinationsManagement;