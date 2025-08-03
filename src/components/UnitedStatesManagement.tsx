import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SpreadsheetUploadUnique from './SpreadsheetUploadUnique';

interface UnitedStatesDestination {
  id: string;
  title_line: string | null;
  name: string;
  emoji: string;
  image: string | null;
  position: number;
  status: string;
  discount?: string;
}

interface Draft {
  id: string;
  content_data: any;
  created_at: string;
  original_id: string | null;
}

const UnitedStatesManagement = () => {
  const [destinations, setDestinations] = useState<UnitedStatesDestination[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [editingItem, setEditingItem] = useState<UnitedStatesDestination | null>(null);
  const [newItem, setNewItem] = useState({ title_line: '', name: '', emoji: '', image: '', discount: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const csvColumns = ['title_line', 'name', 'emoji', 'image', 'discount'];

  useEffect(() => {
    loadDestinations();
    loadDrafts();
  }, []);

  const loadDestinations = async () => {
    const { data, error } = await supabase
      .from('united_states_destinations')
      .select('*')
      .order('position', { ascending: true });
    if (data && !error) setDestinations(data);
  };

  const loadDrafts = async () => {
    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('content_type', 'united_states_destinations')
      .order('created_at', { ascending: false });
    if (data && !error) setDrafts(data);
  };

  const handleSaveDraft = async (item: any) => {
    const { error } = await supabase.from('drafts').insert({
      content_type: 'united_states_destinations',
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
        .from('united_states_destinations')
        .update({ ...item, status: 'published' })
        .eq('id', item.id);
    } else {
      await supabase
        .from('united_states_destinations')
        .insert({ ...item, status: 'published', position: destinations.length + 1 });
    }
    loadDestinations();
    setEditingItem(null);
    setShowAddForm(false);
    setNewItem({ title_line: '', name: '', emoji: '', image: '', discount: '' });
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'hold' : 'published';
    await supabase
      .from('united_states_destinations')
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
        .from('united_states_destinations')
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
        .from('united_states_destinations')
        .update({ position: i + 1 })
        .eq('id', items[i].id);
    }
    
    loadDestinations();
  };

  const deleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this United States destination?')) {
      await supabase.from('united_states_destinations').delete().eq('id', id);
      loadDestinations();
    }
  };

  const deleteSelectedItems = async () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item to delete');
      return;
    }

    if (confirm(`Are you sure you want to delete ${selectedItems.length} selected destination(s)?`)) {
      await supabase
        .from('united_states_destinations')
        .delete()
        .in('id', selectedItems);
      loadDestinations();
      setSelectedItems([]);
    }
  };

  const publishFromDraft = async (draft: Draft) => {
    if (draft.original_id) {
      await supabase
        .from('united_states_destinations')
        .update({ ...draft.content_data, status: 'published' })
        .eq('id', draft.original_id);
    } else {
      await supabase
        .from('united_states_destinations')
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
        title_line: row.title_line || '',
        name: row.name || '',
        emoji: row.emoji || '',
        image: row.image || '',
        discount: row.discount || '',
        status: 'published',
        position: destinations.length + index + 1
      }));

      const { error } = await supabase
        .from('united_states_destinations')
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

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === destinations.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(destinations.map(item => item.id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">United States Destinations Management</h3>
        <div className="flex gap-2">
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

      {selectedItems.length > 0 && (
        <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
          <span>{selectedItems.length} item(s) selected</span>
          <button
            onClick={deleteSelectedItems}
            className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete Selected
          </button>
        </div>
      )}

      <SpreadsheetUploadUnique
        onDataParsed={handleSpreadsheetData}
        expectedColumns={csvColumns}
        title="Upload United States Destinations CSV"
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
                        className="w-12 h-12 rounded-full object-cover"
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
          <h4 className="font-medium mb-4">Add New United States Destination</h4>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <input
              type="text"
              placeholder="Title Line"
              value={newItem.title_line}
              onChange={(e) => setNewItem({ ...newItem, title_line: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
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
            <input
              type="text"
              placeholder="Discount (e.g., 20% off)"
              value={newItem.discount}
              onChange={(e) => setNewItem({ ...newItem, discount: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
          </div>
          {newItem.image && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
              <img 
                src={newItem.image} 
                alt="Preview" 
                className="w-32 h-32 rounded-full object-cover border"
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
        {destinations.length > 0 && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedItems.length === destinations.length && destinations.length > 0}
              onChange={toggleSelectAll}
              className="h-4 w-4"
            />
            <span className="text-sm">Select All</span>
          </div>
        )}
        
        {destinations.map((destination) => (
          <div key={destination.id} className="bg-white border rounded-lg p-4">
            {editingItem?.id === destination.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <input
                    type="text"
                    value={editingItem.title_line || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, title_line: e.target.value })}
                    className="border rounded-lg px-3 py-2"
                    placeholder="Title Line"
                  />
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
                  <input
                    type="text"
                    value={editingItem.discount || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, discount: e.target.value })}
                    className="border rounded-lg px-3 py-2"
                    placeholder="Discount (e.g., 20% off)"
                  />
                </div>
                {editingItem.image && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                    <img 
                      src={editingItem.image} 
                      alt="Preview" 
                      className="w-32 h-32 rounded-full object-cover border"
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
                    checked={selectedItems.includes(destination.id)}
                    onChange={() => toggleSelectItem(destination.id)}
                    className="h-4 w-4"
                  />
                  {destination.image ? (
                    <img 
                      src={destination.image} 
                      alt={destination.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                      {destination.emoji}
                    </div>
                  )}
                  <div>
                    {destination.title_line && <p className="text-sm text-gray-600">{destination.title_line}</p>}
                    <span className="font-medium">{destination.name}</span>
                    {destination.discount && <span className="ml-2 text-sm text-orange-600 font-medium">{destination.discount}</span>}
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

export default UnitedStatesManagement;