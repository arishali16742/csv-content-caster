import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Grid, List, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SpreadsheetUpload from './SpreadsheetUpload';

interface ImageLayout4Destination {
  id: string;
  title_line: string;
  name: string;
  image: string;
  price: string;
  position: number;
  status: string;
}

interface Draft {
  id: string;
  content_data: any;
  created_at: string;
  original_id: string | null;
}

const ImageLayout4Management = () => {
  const [destinations, setDestinations] = useState<ImageLayout4Destination[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [editingItem, setEditingItem] = useState<ImageLayout4Destination | null>(null);
  const [newItem, setNewItem] = useState({ title_line: '', name: '', image: '', price: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'pattern'>('list');
  const [showCSVUpload, setShowCSVUpload] = useState(false);

  useEffect(() => {
    loadDestinations();
    loadDrafts();
  }, []);

  const loadDestinations = async () => {
    const { data, error } = await supabase
      .from('image_layout4_destinations')
      .select('*')
      .order('position', { ascending: true });
    if (data && !error) setDestinations(data);
  };

  const loadDrafts = async () => {
    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('content_type', 'image_layout4_destinations')
      .order('created_at', { ascending: false });
    if (data && !error) setDrafts(data);
  };

  const handleCSVDataParsed = async (data: any[]) => {
    try {
      console.log('Processing CSV data for image layout4 destinations:', data);
      
      const maxPosition = destinations.length > 0 ? Math.max(...destinations.map(d => d.position)) : 0;
      
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        console.log('Processing row:', row);
        
        const destinationData = {
          title_line: row.title_line || '',
          name: row.name || '',
          image: row.image || '',
          price: row.price || '',
          status: row.status || 'published',
          position: maxPosition + i + 1
        };

        console.log('Inserting destination data:', destinationData);

        const { data: insertedData, error } = await supabase
          .from('image_layout4_destinations')
          .insert(destinationData)
          .select();

        if (error) {
          console.error('Error inserting image layout4 destination:', error);
          alert(`Error inserting destination ${destinationData.name}: ${error.message}`);
          return;
        }

        console.log('Successfully inserted:', insertedData);
      }

      alert(`Successfully uploaded ${data.length} image layout4 destinations!`);
      await loadDestinations();
      setShowCSVUpload(false);
    } catch (error) {
      console.error('Error processing CSV data:', error);
      alert('Error processing CSV data. Please check the format and try again.');
    }
  };

  const csvColumns = ['title_line', 'name', 'image', 'price', 'status'];

  const templateData = [
    {
      title_line: 'Amazing Destination',
      name: 'Paris',
      image: 'https://example.com/paris.jpg',
      price: '₹45000',
      status: 'published'
    }
  ];

  const handleSaveDraft = async (item: any) => {
    const { error } = await supabase.from('drafts').insert({
      content_type: 'image_layout4_destinations',
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
        .from('image_layout4_destinations')
        .update({ ...item, status: 'published' })
        .eq('id', item.id);
    } else {
      await supabase
        .from('image_layout4_destinations')
        .insert({ ...item, status: 'published', position: destinations.length + 1 });
    }
    loadDestinations();
    setEditingItem(null);
    setShowAddForm(false);
    setNewItem({ title_line: '', name: '', image: '', price: '' });
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'hold' : 'published';
    await supabase
      .from('image_layout4_destinations')
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
        .from('image_layout4_destinations')
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
        .from('image_layout4_destinations')
        .update({ position: i + 1 })
        .eq('id', items[i].id);
    }
    
    loadDestinations();
  };

  const deleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this image layout4 destination?')) {
      await supabase.from('image_layout4_destinations').delete().eq('id', id);
      loadDestinations();
    }
  };

  const publishFromDraft = async (draft: Draft) => {
    if (draft.original_id) {
      await supabase
        .from('image_layout4_destinations')
        .update({ ...draft.content_data, status: 'published' })
        .eq('id', draft.original_id);
    } else {
      await supabase
        .from('image_layout4_destinations')
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

  const renderPatternView = () => {
    const currentDestinations = destinations.slice(0, 6);
    
    return (
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="font-medium mb-4">Pattern Preview (First 6 Items)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {currentDestinations.map((destination) => (
            <div key={destination.id} className="group cursor-pointer relative">
              <div className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
                  <p className="text-sm md:text-base font-medium mb-1 opacity-90">
                    {destination.title_line}
                  </p>
                  <h3 className="text-lg md:text-xl font-bold mb-2">
                    {destination.name}
                  </h3>
                  <p className="text-xl md:text-2xl font-bold text-yellow-400">
                    {destination.price}
                  </p>
                </div>
              </div>
              
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => setEditingItem(destination)}
                  className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <Edit size={12} />
                </button>
                <button
                  onClick={() => deleteItem(destination.id)}
                  className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Image Layout4 Management</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'pattern' : 'list')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            {viewMode === 'list' ? <Grid size={16} /> : <List size={16} />}
            {viewMode === 'list' ? 'Pattern View' : 'List View'}
          </button>
          <button
            onClick={() => setShowCSVUpload(!showCSVUpload)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Upload size={16} />
            CSV Upload
          </button>
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

      {showCSVUpload && (
        <SpreadsheetUpload
          onDataParsed={handleCSVDataParsed}
          expectedColumns={csvColumns}
          title="Image Layout4 Destinations CSV Upload"
          templateData={templateData}
        />
      )}

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
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div>
                      <span className="font-medium">{draft.content_data.name}</span>
                      <p className="text-sm text-gray-500">
                        {draft.content_data.price} - Saved on {new Date(draft.created_at).toLocaleDateString()}
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
          <h4 className="font-medium mb-4">Add New Image Layout4 Destination</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
              type="url"
              placeholder="Image URL"
              value={newItem.image}
              onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="Price (e.g., ₹45000)"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
          </div>
          {newItem.image && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
              <img 
                src={newItem.image} 
                alt="Preview" 
                className="w-32 h-32 rounded object-cover border"
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

      {viewMode === 'pattern' ? renderPatternView() : (
        <div className="space-y-4">
          {destinations.map((destination) => (
            <div key={destination.id} className="bg-white border rounded-lg p-4">
              {editingItem?.id === destination.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                      type="text"
                      value={editingItem.title_line}
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
                      type="url"
                      value={editingItem.image}
                      onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                      className="border rounded-lg px-3 py-2"
                      placeholder="Image URL"
                    />
                    <input
                      type="text"
                      value={editingItem.price}
                      onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                      className="border rounded-lg px-3 py-2"
                      placeholder="Price"
                    />
                  </div>
                  {editingItem.image && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                      <img 
                        src={editingItem.image} 
                        alt="Preview" 
                        className="w-32 h-32 rounded object-cover border"
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
                    <img 
                      src={destination.image} 
                      alt={destination.name}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div>
                      <p className="text-sm text-gray-600">{destination.title_line}</p>
                      <span className="font-medium">{destination.name}</span>
                      <p className="text-sm text-gray-500">Price: {destination.price} | Position: {destination.position} | Status: {destination.status}</p>
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
                      onClick={() => toggleStatus(destination.id, destination.status)}
                      className={`p-1 ${destination.status === 'published' ? 'text-green-500' : 'text-red-500'} hover:opacity-70`}
                      title={destination.status === 'published' ? 'Hold (Hide from website)' : 'Publish (Show on website)'}
                    >
                      {destination.status === 'published' ? <Eye size={16} /> : <EyeOff size={16} />}
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
      )}
    </div>
  );
};

export default ImageLayout4Management;
