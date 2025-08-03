import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SpreadsheetUpload from './SpreadsheetUpload';

interface Dubs2Destination {
  id: string;
  title_line: string | null;
  name: string;
  emoji: string;
  image: string | null;
  position: number;
  status: string;
  discount?: string;
}

const Dubs2Management = () => {
  const [destinations, setDestinations] = useState<Dubs2Destination[]>([]);
  const [editingItem, setEditingItem] = useState<Dubs2Destination | null>(null);
  const [newItem, setNewItem] = useState({ title_line: '', name: '', emoji: '', image: '', discount: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const csvColumns = ['title_line', 'name', 'emoji', 'image', 'discount'];

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    const { data, error } = await supabase
      .from('dubs2_destinations')
      .select('*')
      .order('position', { ascending: true });
    if (data && !error) setDestinations(data);
  };

  const handleUpdatePage = async (item: any) => {
    if (item.id) {
      await supabase
        .from('dubs2_destinations')
        .update({ ...item, status: 'published' })
        .eq('id', item.id);
    } else {
      await supabase
        .from('dubs2_destinations')
        .insert({ ...item, status: 'published', position: destinations.length + 1 });
    }
    loadDestinations();
    setEditingItem(null);
    setShowAddForm(false);
    setNewItem({ title_line: '', name: '', emoji: '', image: '', discount: '' });
  };

  const deleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this DUBS destination?')) {
      await supabase.from('dubs2_destinations').delete().eq('id', id);
      loadDestinations();
    }
  };

  const handleSpreadsheetData = async (data: any[]) => {
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
        .from('dubs2_destinations')
        .insert(destinationsData);

      if (error) throw error;

      alert(`${destinationsData.length} destinations imported successfully`);
      loadDestinations();
    } catch (error) {
      console.error('Error importing destinations:', error);
      alert('Failed to import destinations');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">DUBS (2nd) Destinations Management</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-travel-primary text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={16} />
          Add Destination
        </button>
      </div>

      <SpreadsheetUpload
        onDataParsed={handleSpreadsheetData}
        expectedColumns={csvColumns}
        title="Upload DUBS (2nd) Destinations CSV"
        templateData={destinations}
      />

      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-4">Add New DUBS Destination</h4>
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
              placeholder="Discount"
              value={newItem.discount}
              onChange={(e) => setNewItem({ ...newItem, discount: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdatePage(newItem)}
              className="bg-travel-primary text-white px-4 py-2 rounded-lg"
            >
              Add Destination
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dubs2Management;
