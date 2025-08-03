import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Grid, List, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SpreadsheetUploadVisaPricing from './SpreadsheetUploadVisaPricing';

interface VisaFreeDestination {
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

const VisaFreeDestinationsManagement = () => {
  const [destinations, setDestinations] = useState<VisaFreeDestination[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [editingItem, setEditingItem] = useState<VisaFreeDestination | null>(null);
  const [newItem, setNewItem] = useState({ title_line: '', name: '', image: '', price: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'pattern'>('list');
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    loadDestinations();
    loadDrafts();
  }, []);

  const loadDestinations = async () => {
    const { data } = await supabase
      .from('visa_free_destinations')
      .select('*')
      .order('position', { ascending: true });
    if (data) setDestinations(data);
  };

  const loadDrafts = async () => {
    const { data } = await supabase
      .from('drafts')
      .select('*')
      .eq('content_type', 'visa_free_destinations')
      .order('created_at', { ascending: false });
    if (data) setDrafts(data);
  };

  const handleCSVDataParsed = async (data: any[]) => {
    try {
      console.log('Processing CSV data for visa free destinations:', data);
      
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
          .from('visa_free_destinations')
          .insert(destinationData)
          .select();

        if (error) {
          console.error('Error inserting visa free destination:', error);
          alert(`Error inserting destination ${destinationData.name}: ${error.message}`);
          return;
        }

        console.log('Successfully inserted:', insertedData);
      }

      alert(`Successfully uploaded ${data.length} visa free destinations!`);
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
      title_line: 'Visa Free Travel',
      name: 'Dubai',
      image: 'https://example.com/dubai.jpg',
      price: '25330',
      status: 'published'
    }
  ];

  const handleSaveDraft = async (item: any) => {
    const { error } = await supabase.from('drafts').insert({
      content_type: 'visa_free_destinations',
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
        .from('visa_free_destinations')
        .update({ ...item, status: 'published' })
        .eq('id', item.id);
    } else {
      await supabase
        .from('visa_free_destinations')
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
      .from('visa_free_destinations')
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
        .from('visa_free_destinations')
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
        .from('visa_free_destinations')
        .update({ position: i + 1 })
        .eq('id', items[i].id);
    }
    
    loadDestinations();
  };

  const deleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this visa free destination?')) {
      await supabase.from('visa_free_destinations').delete().eq('id', id);
      loadDestinations();
    }
  };

  const deleteSelectedItems = async () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item to delete');
      return;
    }

    if (confirm(`Are you sure you want to delete ${selectedItems.length} selected items?`)) {
      await supabase.from('visa_free_destinations').delete().in('id', selectedItems);
      setSelectedItems([]);
      loadDestinations();
    }
  };

  const publishFromDraft = async (draft: Draft) => {
    if (draft.original_id) {
      await supabase
        .from('visa_free_destinations')
        .update({ ...draft.content_data, status: 'published' })
        .eq('id', draft.original_id);
    } else {
      await supabase
        .from('visa_free_destinations')
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

  const handleCheckboxChange = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
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

  const renderPatternView = () => {
    const currentDestinations = destinations.slice(0, 5);
    
    return (
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="font-medium mb-4">Pattern Preview (First 5 Items)</h4>
        <div className="grid grid-cols-12 gap-4" style={{ height: '400px' }}>
          {currentDestinations[0] && (
            <div className="col-span-3 group relative rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 h-full">
              <img 
                src={currentDestinations[0].image} 
                alt={currentDestinations[0].name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white/80 text-sm mb-1">
                  {currentDestinations[0].title_line}
                </p>
                <h3 className="text-white text-xl font-bold mb-2">
                  {currentDestinations[0].name}
                </h3>
                <p className="text-white text-lg font-semibold">
                  From ₹{currentDestinations[0].price}
                </p>
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => setEditingItem(currentDestinations[0])}
                  className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <Edit size={12} />
                </button>
                <button
                  onClick={() => deleteItem(currentDestinations[0].id)}
                  className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          )}

          <div className="col-span-3 flex flex-col gap-4 h-full">
            {currentDestinations[1] && (
              <div className="group relative rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 flex-1">
                <img 
                  src={currentDestinations[1].image} 
                  alt={currentDestinations[1].name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white/80 text-xs mb-1">
                    {currentDestinations[1].title_line}
                  </p>
                  <h3 className="text-white text-lg font-bold mb-1">
                    {currentDestinations[1].name}
                  </h3>
                  <p className="text-white text-sm font-semibold">
                    From ₹{currentDestinations[1].price}
                  </p>
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => setEditingItem(currentDestinations[1])}
                    className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    <Edit size={12} />
                  </button>
                  <button
                    onClick={() => deleteItem(currentDestinations[1].id)}
                    className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )}

            {currentDestinations[2] && (
              <div className="group relative rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 flex-1">
                <img 
                  src={currentDestinations[2].image} 
                  alt={currentDestinations[2].name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white/80 text-xs mb-1">
                    {currentDestinations[2].title_line}
                  </p>
                  <h3 className="text-white text-lg font-bold mb-1">
                    {currentDestinations[2].name}
                  </h3>
                  <p className="text-white text-sm font-semibold">
                    From ₹{currentDestinations[2].price}
                  </p>
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => setEditingItem(currentDestinations[2])}
                    className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    <Edit size={12} />
                  </button>
                  <button
                    onClick={() => deleteItem(currentDestinations[2].id)}
                    className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {currentDestinations[3] && (
            <div className="col-span-3 group relative rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 h-full">
              <img 
                src={currentDestinations[3].image} 
                alt={currentDestinations[3].name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white/80 text-sm mb-1">
                  {currentDestinations[3].title_line}
                </p>
                <h3 className="text-white text-xl font-bold mb-2">
                  {currentDestinations[3].name}
                </h3>
                <p className="text-white text-lg font-semibold">
                  From ₹{currentDestinations[3].price}
                </p>
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => setEditingItem(currentDestinations[3])}
                  className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <Edit size={12} />
                </button>
                <button
                  onClick={() => deleteItem(currentDestinations[3].id)}
                  className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          )}

          {currentDestinations[4] && (
            <div className="col-span-3 group relative rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 h-full">
              <img 
                src={currentDestinations[4].image} 
                alt={currentDestinations[4].name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white/80 text-sm mb-1">
                  {currentDestinations[4].title_line}
                </p>
                <h3 className="text-white text-xl font-bold mb-2">
                  {currentDestinations[4].name}
                </h3>
                <p className="text-white text-lg font-semibold">
                  From ₹{currentDestinations[4].price}
                </p>
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => setEditingItem(currentDestinations[4])}
                  className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <Edit size={12} />
                </button>
                <button
                  onClick={() => deleteItem(currentDestinations[4].id)}
                  className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Visa Free Destinations Management</h3>
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

      {selectedItems.length > 0 && (
        <div className="bg-red-100 p-3 rounded-lg flex justify-between items-center">
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

      {showCSVUpload && (
        <SpreadsheetUploadVisaPricing
          onDataParsed={handleCSVDataParsed}
          
          title="Visa Free Destinations CSV Upload"
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
                    <img 
                      src={draft.content_data.image} 
                      alt={draft.content_data.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div>
                      <span className="font-medium">{draft.content_data.name}</span>
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
          <h4 className="font-medium mb-4">Add New Visa Free Destination</h4>
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
              placeholder="Price (e.g., 25330)"
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
          <div className="bg-white border rounded-lg p-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedItems.length === destinations.length && destinations.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Select All</span>
            </label>
          </div>

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
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(destination.id)}
                      onChange={() => handleCheckboxChange(destination.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
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

export default VisaFreeDestinationsManagement;