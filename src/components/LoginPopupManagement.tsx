import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import BookingPopupManagement from './BookingPopupManagement';

interface LoginPopupSettings {
  id: string;
  image_url: string;
  title: string;
  subtitle: string;
  discount_text: string;
  terms_text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const LoginPopupManagement = () => {
  const [settings, setSettings] = useState<LoginPopupSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    image_url: '',
    title: '',
    subtitle: '',
    discount_text: '',
    terms_text: '*T&C Apply'
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('login_popup_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch login popup settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from('login_popup_settings')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Login popup settings updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('login_popup_settings')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Login popup settings created successfully",
        });
      }

      setFormData({
        image_url: '',
        title: '',
        subtitle: '',
        discount_text: '',
        terms_text: '*T&C Apply'
      });
      setIsEditing(false);
      setEditingId(null);
      fetchSettings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (setting: LoginPopupSettings) => {
    setFormData({
      image_url: setting.image_url,
      title: setting.title || '',
      subtitle: setting.subtitle || '',
      discount_text: setting.discount_text || '',
      terms_text: setting.terms_text || '*T&C Apply'
    });
    setEditingId(setting.id);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this login popup setting?')) return;

    try {
      const { error } = await supabase
        .from('login_popup_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Login popup setting deleted successfully",
      });
      fetchSettings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      // First, set all others to inactive if we're activating this one
      if (!currentStatus) {
        await supabase
          .from('login_popup_settings')
          .update({ is_active: false });
      }

      const { error } = await supabase
        .from('login_popup_settings')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Login popup setting ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
      fetchSettings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      image_url: '',
      title: '',
      subtitle: '',
      discount_text: '',
      terms_text: '*T&C Apply'
    });
    setIsEditing(false);
    setEditingId(null);
  };

  if (loading && settings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-travel-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Login Popup Management</h2>
        <Button
          onClick={() => setIsEditing(true)}
          className="bg-travel-primary hover:bg-travel-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Setting
        </Button>
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Login Popup Setting' : 'Add New Login Popup Setting'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-primary"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-primary"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtitle
              </label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-primary"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Text
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-primary"
                value={formData.discount_text}
                onChange={(e) => setFormData({ ...formData, discount_text: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Terms Text
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-primary"
                value={formData.terms_text}
                onChange={(e) => setFormData({ ...formData, terms_text: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (editingId ? 'Update' : 'Create')}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Discount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {settings.map((setting) => (
              <tr key={setting.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={setting.image_url}
                    alt="Login popup"
                    className="h-16 w-24 object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{setting.title}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">{setting.subtitle}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {setting.discount_text}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    setting.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {setting.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => toggleActive(setting.id, setting.is_active)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {setting.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(setting)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(setting.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BookingPopupManagement />
    </div>
  );
};

export default LoginPopupManagement;
