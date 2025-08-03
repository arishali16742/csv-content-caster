import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SpreadsheetUploadUnique from './SpreadsheetUploadUnique';

interface ExploreDestination {
  id: string;
  name: string;
  emoji: string;
  image: string | null;
  position: number;
  status: string;
}

interface Draft {
  id: string;
  content_data: any;
  created_at: string;
  original_id: string | null;
}

const ExploreManagement = () => {
  const [destinations, setDestinations] = useState<ExploreDestination[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [editingItem, setEditingItem] = useState<ExploreDestination | null>(null);
  const [newItem, setNewItem] = useState({ name: '', emoji: '', image: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);

  const csvColumns = ['name', 'emoji', 'image'];

  useEffect(() => {
    loadDestinations();
    loadDrafts();
  }, []);

  const loadDestinations = async () => {
    const { data } = await supabase
      .from('explore_destinations')
      .select('*')
      .order('position', { ascending: true });
    if (data) setDestinations(data);
  };

  const loadDrafts = async () => {
    const { data } = await supabase
      .from('drafts')
      .select('*')
      .eq('content_type', 'explore_destinations')
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
        .from('explore_destinations')
        .delete()
        .in('id', selectedDestinations);
      
      if (error) throw error;
      
      alert(`${selectedDestinations.length} destination(s) deleted successfully`);
      setSelectedDestinations([]);
      loadDestinations();
    } catch (error) {
      console.error('Error deleting destinations:', error);
      alert('Failed to delete destinations');
    }
  };

  const handleSaveDraft = async (item: any) => {
    const { error } = await supabase.from('drafts').insert({
      content_type: 'explore_destinations',
      content_data: item,
      original_id: item.id || null
    });
    
    if (error) {
      console.error('Error saving draft:', error);
      alert('Error saving draft!');
    } else {
      alert('Saved as draft!');
      loadDrafts();
    }
  };

  const handleUpdatePage = async (item: any) => {
    if (item.id) {
      await supabase
        .from('explore_destinations')
        .update({ ...item, status: 'published' })
        .eq('id', item.id);
    } else {
      await supabase
        .from('explore_destinations')
        .insert({ ...item, status: 'published', position: destinations.length + 1 });
    }
    loadDestinations();
    setEditingItem(null);
    setShowAddForm(false);
    setNewItem({ name: '', emoji: '', image: '' });
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'hold' : 'published';
    await supabase
      .from('explore_destinations')
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
        .from('explore_destinations')
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
        .from('explore_destinations')
        .update({ position: i + 1 })
        .eq('id', items[i].id);
    }
    
    loadDestinations();
  };

  const deleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this destination?')) {
      await supabase.from('explore_destinations').delete().eq('id', id);
      loadDestinations();
    }
  };

  const publishFromDraft = async (draft: Draft) => {
    if (draft.original_id) {
      await supabase
        .from('explore_destinations')
        .update({ ...draft.content_data, status: 'published' })
        .eq('id', draft.original_id);
    } else {
      await supabase
        .from('explore_destinations')
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
      const destinationsData = data.map((row, index) => ({
        name: row.name || '',
        emoji: row.emoji || '',
        image: row.image || '',
        status: 'published',
        position: destinations.length + index + 1
      }));

      const { error } = await supabase
        .from('explore_destinations')
        .insert(destinationsData);

      if (error) throw error;

      alert(`${destinationsData.length} destinations imported successfully`);
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
        <h3 className="text-xl font-semibold">Explore Destinations Management</h3>
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

      <SpreadsheetUploadUnique
        onDataParsed={handleSpreadsheetData}
        expectedColumns={csvColumns}
        title="Upload Explore Destinations CSV"
        templateData={destinations}
      />

      {showDrafts && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-4">Saved Drafts</h4>
          {drafts.length === 0 ? (
            <p className="text-gray-500">No drafts available</p>
          ) : (
            <div className="space-y-2">
              {drafts.map((draft) => (
                <div key={draft.id} className="bg-white p-3 rounded border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {draft.content_data.image && (
                      <img 
                        src={draft.content_data.image} 
                        alt={draft.content_data.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <span className="font-medium">{draft.content_data.name}</span>
                      <span className="ml-2">{draft.content_data.emoji}</span>
                      <p className="text-sm text-gray-500">
                        Saved on {new Date(draft.created_at).toLocaleDateString()}
                      </p>
                    </div>
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
            </div>
          )}
        </div>
      )}

      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-4">Add New Explore Destination</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Destination Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="Emoji"
              value={newItem.emoji}
              onChange={(e) => setNewItem({ ...newItem, emoji: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="url"
              placeholder="Image URL"
              value={newItem.image}
              onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
          </div>
          {newItem.image && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
              <img 
                src={newItem.image} 
                alt="Preview" 
                className="w-32 h-32 rounded-lg object-cover border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="flex gap-2">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="border rounded-lg px-3 py-2"
                    placeholder="Destination Name"
                  />
                  <input
                    type="text"
                    value={editingItem.emoji}
                    onChange={(e) => setEditingItem({ ...editingItem, emoji: e.target.value })}
                    className="border rounded-lg px-3 py-2"
                    placeholder="Emoji"
                  />
                  <input
                    type="url"
                    value={editingItem.image || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                    className="border rounded-lg px-3 py-2"
                    placeholder="Image URL"
                  />
                </div>
                {editingItem.image && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                    <img 
                      src={editingItem.image} 
                      alt="Preview" 
                      className="w-32 h-32 rounded-lg object-cover border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
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
                  {destination.image ? (
                    <img 
                      src={destination.image} 
                      alt={destination.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-2xl">
                      {destination.emoji}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">{destination.name}</span>
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

export default ExploreManagement;