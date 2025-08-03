import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Home, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SpreadsheetUploadBlog from './SpreadsheetUploadBlog';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  author: string;
  author_image?: string;
  published: boolean;
  position: number;
  category?: string;
  editor_name?: string;
  categories?: string[];
  date_written?: string;
  show_on_homepage?: boolean;
  additional_images?: string[];
  price?: string;
  itinerary?: string;
}

interface Draft {
  id: string;
  content_data: any;
  created_at: string;
  original_id: string | null;
}

const BlogManagement = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [editingItem, setEditingItem] = useState<BlogPost | null>(null);
  const [newItem, setNewItem] = useState({
    title: '', 
    content: '', 
    excerpt: '', 
    image: '', 
    author: '', 
    author_image: '',
    category: 'Destination Guides',
    editor_name: '', 
    categories: ['Destination Guides'], 
    date_written: new Date().toISOString().split('T')[0],
    show_on_homepage: false,
    additional_images: [''],
    price: '',
    itinerary: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);

  const categories = [
    'Destination Guides',
    'Food Trails', 
    'Budget Hacks',
    'Hidden Gems',
    'Travel Tips'
  ];

  const csvColumns = [
    'title',
    'content', 
    'excerpt',
    'image',
    'author',
    'author_image',
    'category',
    'editor_name',
    'date_written',
    'show_on_homepage',
    'additional_images',
    'price',
    'itinerary'
  ];

  useEffect(() => {
    loadPosts();
    loadDrafts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data } = await supabase
        .from('blog')
        .select('*')
        .order('position', { ascending: true });
      if (data) setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const loadDrafts = async () => {
    try {
      const { data } = await supabase
        .from('drafts')
        .select('*')
        .eq('content_type', 'blog')
        .order('created_at', { ascending: false });
      if (data) setDrafts(data);
    } catch (error) {
      console.error('Error loading drafts:', error);
    }
  };

  const handleCSVData = async (csvData: any[]) => {
    try {
      const processedData = csvData.map((row, index) => ({
        ...row,
        published: true,
        position: posts.length + index + 1,
        categories: row.category ? [row.category] : ['Destination Guides'],
        show_on_homepage: row.show_on_homepage === 'true' || row.show_on_homepage === true,
        //additional_images: row.additional_images ? row.additional_images.split(';').filter(img => img.trim()) : []
      }));

      const { error } = await supabase
        .from('blog')
        .insert(processedData);

      if (error) {
        console.error('Error uploading CSV data:', error);
        alert('Error uploading data: ' + error.message);
      } else {
        alert(`Successfully uploaded ${csvData.length} blog posts!`);
        loadPosts();
        setShowCSVUpload(false);
      }
    } catch (error) {
      console.error('Error processing CSV data:', error);
      alert('Error processing CSV data');
    }
  };

  const handleSaveDraft = async (item: any) => {
    try {
      const { error } = await supabase.from('drafts').insert({
        content_type: 'blog',
        content_data: item,
        original_id: item.id || null
      });
      
      if (!error) {
        alert('Saved as draft successfully!');
        loadDrafts();
        setShowAddForm(false);
        setEditingItem(null);
        resetNewItem();
      } else {
        alert('Error saving draft');
        console.error('Draft save error:', error);
      }
    } catch (error) {
      console.error('Error in handleSaveDraft:', error);
      alert('Error saving draft');
    }
  };

  const resetNewItem = () => {
    setNewItem({
      title: '', 
      content: '', 
      excerpt: '', 
      image: '', 
      author: '', 
      author_image: '',
      category: 'Destination Guides',
      editor_name: '', 
      categories: ['Destination Guides'], 
      date_written: new Date().toISOString().split('T')[0],
      show_on_homepage: false,
      additional_images: [''],
      price: '',
      itinerary: ''
    });
  };

  const handleUpdatePage = async (item: any) => {
    try {
      if (item.id) {
        const { error } = await supabase
          .from('blog')
          .update({ ...item, published: true })
          .eq('id', item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog')
          .insert({ ...item, published: true, position: posts.length + 1 });
        if (error) throw error;
      }
      loadPosts();
      setEditingItem(null);
      setShowAddForm(false);
      resetNewItem();
    } catch (error) {
      console.error('Error updating page:', error);
      alert('Error saving post');
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const { error } = await supabase
        .from('blog')
        .update({ published: newStatus })
        .eq('id', id);
      if (error) throw error;
      loadPosts();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const toggleHomepage = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const { error } = await supabase
        .from('blog')
        .update({ show_on_homepage: newStatus })
        .eq('id', id);
      if (error) throw error;
      loadPosts();
    } catch (error) {
      console.error('Error toggling homepage:', error);
    }
  };

  const publishFromDraft = async (draft: Draft) => {
    try {
      const item = draft.content_data;
      if (draft.original_id) {
        const { error } = await supabase
          .from('blog')
          .update({ ...item, published: true })
          .eq('id', draft.original_id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog')
          .insert({ ...item, published: true, position: posts.length + 1 });
        if (error) throw error;
      }
      
      const { error: deleteError } = await supabase.from('drafts').delete().eq('id', draft.id);
      if (deleteError) throw deleteError;
      
      loadPosts();
      loadDrafts();
    } catch (error) {
      console.error('Error publishing draft:', error);
      alert('Error publishing draft');
    }
  };

  const deleteDraft = async (draftId: string) => {
    if (confirm('Are you sure you want to delete this draft?')) {
      try {
        const { error } = await supabase.from('drafts').delete().eq('id', draftId);
        if (error) throw error;
        loadDrafts();
      } catch (error) {
        console.error('Error deleting draft:', error);
      }
    }
  };

  const moveItem = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = posts.findIndex(p => p.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === posts.length - 1)
    ) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const updatedPosts = [...posts];
    [updatedPosts[currentIndex], updatedPosts[newIndex]] = 
    [updatedPosts[newIndex], updatedPosts[currentIndex]];

    try {
      for (let i = 0; i < updatedPosts.length; i++) {
        const { error } = await supabase
          .from('blog')
          .update({ position: i + 1 })
          .eq('id', updatedPosts[i].id);
        if (error) throw error;
      }
      loadPosts();
    } catch (error) {
      console.error('Error moving item:', error);
    }
  };

  const moveToPosition = async (id: string, newPosition: number) => {
    const currentIndex = posts.findIndex(p => p.id === id);
    const targetIndex = newPosition - 1;
    
    if (currentIndex === targetIndex || targetIndex < 0 || targetIndex >= posts.length) return;

    const updatedPosts = [...posts];
    const [movedItem] = updatedPosts.splice(currentIndex, 1);
    updatedPosts.splice(targetIndex, 0, movedItem);

    try {
      for (let i = 0; i < updatedPosts.length; i++) {
        const { error } = await supabase
          .from('blog')
          .update({ position: i + 1 })
          .eq('id', updatedPosts[i].id);
        if (error) throw error;
      }
      loadPosts();
    } catch (error) {
      console.error('Error moving to position:', error);
    }
  };

  const deleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        const { error } = await supabase.from('blog').delete().eq('id', id);
        if (error) throw error;
        loadPosts();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleCategoryChange = (category: string, isChecked: boolean, isEditing: boolean) => {
    if (isEditing && editingItem) {
      const currentCategories = editingItem.categories || [];
      if (isChecked) {
        setEditingItem({ ...editingItem, categories: [...currentCategories, category] });
      } else {
        setEditingItem({ ...editingItem, categories: currentCategories.filter(c => c !== category) });
      }
    } else {
      const currentCategories = newItem.categories || [];
      if (isChecked) {
        setNewItem({ ...newItem, categories: [...currentCategories, category] });
      } else {
        setNewItem({ ...newItem, categories: currentCategories.filter(c => c !== category) });
      }
    }
  };

  const addImageField = (isEditing: boolean) => {
    if (isEditing && editingItem) {
      const currentImages = editingItem.additional_images || [];
      setEditingItem({ ...editingItem, additional_images: [...currentImages, ''] });
    } else {
      setNewItem({ ...newItem, additional_images: [...newItem.additional_images, ''] });
    }
  };

  const removeImageField = (index: number, isEditing: boolean) => {
    if (isEditing && editingItem) {
      const currentImages = editingItem.additional_images || [];
      setEditingItem({ 
        ...editingItem, 
        additional_images: currentImages.filter((_, i) => i !== index) 
      });
    } else {
      setNewItem({ 
        ...newItem, 
        additional_images: newItem.additional_images.filter((_, i) => i !== index) 
      });
    }
  };

  const updateImageField = (index: number, value: string, isEditing: boolean) => {
    if (isEditing && editingItem) {
      const currentImages = [...(editingItem.additional_images || [])];
      currentImages[index] = value;
      setEditingItem({ ...editingItem, additional_images: currentImages });
    } else {
      const currentImages = [...newItem.additional_images];
      currentImages[index] = value;
      setNewItem({ ...newItem, additional_images: currentImages });
    }
  };

  const renderImageLayout = (images: string[]) => {
    const validImages = images.filter(img => img.trim() !== '');
    if (validImages.length === 0) return null;

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
        <h4 className="text-sm font-medium mb-3">Image Layout Preview:</h4>
        <div className="grid grid-cols-12 gap-2 h-32 w-full">
          {validImages.map((img, index) => {
            let className = "";
            if (validImages.length === 1) {
              className = "col-span-12 h-full";
            } else if (validImages.length === 2) {
              className = "col-span-6 h-full";
            } else if (validImages.length === 3) {
              className = index === 0 ? "col-span-8 h-full" : "col-span-4 h-full";
            } else if (validImages.length === 4) {
              className = index === 0 ? "col-span-8 h-full" : "col-span-4 h-16";
            } else {
              className = index === 0 ? "col-span-8 h-full" : "col-span-2 h-16";
            }

            return (
              <div key={index} className={`${className} overflow-hidden rounded bg-gray-200`}>
                <img 
                  src={img} 
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Blog Management</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCSVUpload(!showCSVUpload)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg"
          >
            {showCSVUpload ? 'Hide CSV Upload' : 'Upload CSV'}
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
            Add Blog Post
          </button>
        </div>
      </div>

      {showCSVUpload && (
        <div className="bg-green-50 p-4 rounded-lg">
          <SpreadsheetUploadBlog
            onDataParsed={handleCSVData}
            
            title="Blog Posts CSV Upload"
            templateData={posts.slice(0, 2)} // Use first 2 posts as template examples
          />
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>CSV Upload Instructions:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>additional_images:</strong> Separate multiple URLs with semicolons (;)</li>
              <li><strong>author_image:</strong> URL of the author's profile image</li>
              <li><strong>show_on_homepage:</strong> Use 'true' or 'false'</li>
              <li><strong>date_written:</strong> Use YYYY-MM-DD format</li>
              <li><strong>category:</strong> Choose from: Destination Guides, Food Trails, Budget Hacks, Hidden Gems, Travel Tips</li>
              <li>All uploaded posts will be automatically published</li>
            </ul>
          </div>
        </div>
      )}

      {showDrafts && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium mb-4">Drafts ({drafts.length})</h4>
          <div className="space-y-3">
            {drafts.map((draft) => (
              <div key={draft.id} className="bg-white border rounded-lg p-3 flex items-center justify-between">
                <div>
                  <span className="font-medium">{draft.content_data.title}</span>
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
          <h4 className="font-medium mb-4">Add New Blog Post</h4>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
            <textarea
              placeholder="Excerpt (brief summary for preview)"
              value={newItem.excerpt}
              onChange={(e) => setNewItem({ ...newItem, excerpt: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
            />
            <textarea
              placeholder="Content (full article content)"
              value={newItem.content}
              onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              rows={8}
            />
            <input
              type="url"
              placeholder="Featured Image URL"
              value={newItem.image}
              onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
            
            <div>
              <label className="block text-sm font-medium mb-2">Additional Images</label>
              {newItem.additional_images.map((img, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="url"
                    placeholder={`Additional Image ${index + 1} URL`}
                    value={img}
                    onChange={(e) => updateImageField(index, e.target.value, false)}
                    className="flex-1 border rounded-lg px-3 py-2"
                  />
                  {newItem.additional_images.length > 1 && (
                    <button
                      onClick={() => removeImageField(index, false)}
                      className="bg-red-500 text-white px-3 py-2 rounded-lg"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addImageField(false)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
              >
                Add Image
              </button>
              {renderImageLayout(newItem.additional_images)}
            </div>

            <input
              type="text"
              placeholder="Price (e.g., Starting from $1299)"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
            
            <div>
              <label className="block text-sm font-medium mb-1">Itinerary</label>
              <textarea
                placeholder="Day-wise itinerary details"
                value={newItem.itinerary}
                onChange={(e) => setNewItem({ ...newItem, itinerary: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                rows={6}
              />
            </div>

            <input
              type="text"
              placeholder="Author Name"
              value={newItem.author}
              onChange={(e) => setNewItem({ ...newItem, author: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />

            <input
              type="url"
              placeholder="Author Image URL"
              value={newItem.author_image}
              onChange={(e) => setNewItem({ ...newItem, author_image: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />

            <input
              type="text"
              placeholder="Editor Name"
              value={newItem.editor_name}
              onChange={(e) => setNewItem({ ...newItem, editor_name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
            <div>
              <label className="block text-sm font-medium mb-1">Date Written</label>
              <input
                type="date"
                value={newItem.date_written}
                onChange={(e) => setNewItem({ ...newItem, date_written: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Categories (Multi-select)</label>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <label key={cat} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newItem.categories?.includes(cat) || false}
                      onChange={(e) => handleCategoryChange(cat, e.target.checked, false)}
                      className="mr-2"
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newItem.show_on_homepage}
                  onChange={(e) => setNewItem({ ...newItem, show_on_homepage: e.target.checked })}
                  className="mr-2"
                />
                Show on Homepage
              </label>
            </div>
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
              Publish Post
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
        {posts.map((post) => (
          <div key={post.id} className="bg-white border rounded-lg p-4">
            {editingItem?.id === post.id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Title"
                />
                <textarea
                  value={editingItem.excerpt}
                  onChange={(e) => setEditingItem({ ...editingItem, excerpt: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Excerpt"
                />
                <textarea
                  value={editingItem.content}
                  onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={8}
                  placeholder="Content"
                />
                <input
                  type="url"
                  value={editingItem.image}
                  onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Image URL"
                />
                
                <div>
                  <label className="block text-sm font-medium mb-2">Additional Images</label>
                  {(editingItem.additional_images || ['']).map((img, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="url"
                        placeholder={`Additional Image ${index + 1} URL`}
                        value={img}
                        onChange={(e) => updateImageField(index, e.target.value, true)}
                        className="flex-1 border rounded-lg px-3 py-2"
                      />
                      {(editingItem.additional_images || []).length > 1 && (
                        <button
                          onClick={() => removeImageField(index, true)}
                          className="bg-red-500 text-white px-3 py-2 rounded-lg"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addImageField(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Add Image
                  </button>
                  {renderImageLayout(editingItem.additional_images || [])}
                </div>

                <input
                  type="text"
                  value={editingItem.price || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Price"
                />
                
                <div>
                  <label className="block text-sm font-medium mb-1">Itinerary</label>
                  <textarea
                    value={editingItem.itinerary || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, itinerary: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    rows={6}
                    placeholder="Day-wise itinerary details"
                  />
                </div>

                <input
                  type="text"
                  value={editingItem.author}
                  onChange={(e) => setEditingItem({ ...editingItem, author: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Author"
                />

                <input
                  type="url"
                  value={editingItem.author_image || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, author_image: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Author Image URL"
                />

                <input
                  type="text"
                  value={editingItem.editor_name || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, editor_name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Editor Name"
                />
                <div>
                  <label className="block text-sm font-medium mb-1">Date Written</label>
                  <input
                    type="date"
                    value={editingItem.date_written || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, date_written: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Categories (Multi-select)</label>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <label key={cat} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingItem.categories?.includes(cat) || false}
                          onChange={(e) => handleCategoryChange(cat, e.target.checked, true)}
                          className="mr-2"
                        />
                        {cat}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingItem.show_on_homepage || false}
                      onChange={(e) => setEditingItem({ ...editingItem, show_on_homepage: e.target.checked })}
                      className="mr-2"
                    />
                    Show on Homepage
                  </label>
                </div>
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
                    Update Post
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
                  {post.image && (
                    <img src={post.image} alt={post.title} className="w-16 h-16 rounded object-cover" />
                  )}
                  <div className="flex items-center gap-3">
                    {post.author_image && (
                      <img 
                        src={post.author_image} 
                        alt={post.author} 
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-200" 
                      />
                    )}
                    <div>
                      <span className="font-medium">{post.title}</span>
                      <p className="text-sm text-gray-500">
                        By {post.author} {post.editor_name && `| Editor: ${post.editor_name}`} | {post.categories?.join(', ') || post.category}
                      </p>
                      <p className="text-sm text-gray-500">
                        Position: {post.position} | Status: {post.published ? 'Published' : 'Draft'} | Homepage: {post.show_on_homepage ? 'Yes' : 'No'}
                      </p>
                      {post.date_written && (
                        <p className="text-sm text-gray-500">Written: {new Date(post.date_written).toLocaleDateString()}</p>
                      )}
                      {post.price && (
                        <p className="text-sm text-gray-500">Price: {post.price}</p>
                      )}
                      {post.excerpt && (
                        <p className="text-sm text-gray-600 mt-1 max-w-md truncate">{post.excerpt}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={post.position}
                    onChange={(e) => moveToPosition(post.id, parseInt(e.target.value))}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {posts.map((_, index) => (
                      <option key={index + 1} value={index + 1}>
                        Position {index + 1}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => toggleHomepage(post.id, post.show_on_homepage || false)}
                    className={`p-1 ${post.show_on_homepage ? 'text-blue-500' : 'text-gray-400'} hover:opacity-70`}
                    title={post.show_on_homepage ? 'Remove from homepage' : 'Show on homepage'}
                  >
                    <Home size={16} />
                  </button>
                  <button
                    onClick={() => toggleStatus(post.id, post.published)}
                    className={`p-1 ${post.published ? 'text-green-500' : 'text-red-500'} hover:opacity-70`}
                    title={post.published ? 'Hide from website' : 'Publish to website'}
                  >
                    {post.published ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => moveItem(post.id, 'up')}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => moveItem(post.id, 'down')}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    onClick={() => setEditingItem(post)}
                    className="p-1 text-blue-500 hover:text-blue-700"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => deleteItem(post.id)}
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

export default BlogManagement;
