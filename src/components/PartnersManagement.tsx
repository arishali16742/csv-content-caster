
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ChevronUp, ChevronDown, Edit, Save, X, Plus, Trash2 } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  logo: string;
  position: number;
  status: string;
  created_at: string;
  updated_at: string;
}

const PartnersManagement = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const [newPartner, setNewPartner] = useState({
    name: '',
    logo: ''
  });

  const [editingPartner, setEditingPartner] = useState({
    name: '',
    logo: ''
  });

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('partners')
        .select('*')
        .order('position', { ascending: true });
      
      if (error) throw error;
      setPartners(data as Partner[] || []);
    } catch (error) {
      console.error('Error loading partners:', error);
      toast({
        title: "Error",
        description: "Failed to load partners",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newPartner.name.trim() || !newPartner.logo.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const maxPosition = Math.max(...partners.map(p => p.position), 0);
      
      const { error } = await (supabase as any)
        .from('partners')
        .insert([{
          ...newPartner,
          position: maxPosition + 1,
          status: 'published'
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Partner added successfully",
      });

      setNewPartner({ name: '', logo: '' });
      setShowAddForm(false);
      loadPartners();
    } catch (error) {
      console.error('Error adding partner:', error);
      toast({
        title: "Error",
        description: "Failed to add partner",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (partner: Partner) => {
    setEditingId(partner.id);
    setEditingPartner({
      name: partner.name,
      logo: partner.logo
    });
  };

  const handleSave = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('partners')
        .update({
          ...editingPartner,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Partner updated successfully",
      });

      setEditingId(null);
      loadPartners();
    } catch (error) {
      console.error('Error updating partner:', error);
      toast({
        title: "Error",
        description: "Failed to update partner",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this partner?')) {
      try {
        const { error } = await (supabase as any)
          .from('partners')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Partner deleted successfully",
        });

        loadPartners();
      } catch (error) {
        console.error('Error deleting partner:', error);
        toast({
          title: "Error",
          description: "Failed to delete partner",
          variant: "destructive",
        });
      }
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = partners.findIndex(p => p.id === id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= partners.length) return;

    try {
      const updates = [
        { id: partners[currentIndex].id, position: partners[newIndex].position },
        { id: partners[newIndex].id, position: partners[currentIndex].position }
      ];

      for (const update of updates) {
        const { error } = await (supabase as any)
          .from('partners')
          .update({ position: update.position })
          .eq('id', update.id);
        
        if (error) throw error;
      }

      loadPartners();
    } catch (error) {
      console.error('Error reordering partners:', error);
      toast({
        title: "Error",
        description: "Failed to reorder partners",
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    
    try {
      const { error } = await (supabase as any)
        .from('partners')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Partner ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`,
      });

      loadPartners();
    } catch (error) {
      console.error('Error updating partner status:', error);
      toast({
        title: "Error",
        description: "Failed to update partner status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading partners...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Partners Management</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Partner
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Partner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="new-name">Partner Name</Label>
              <Input
                id="new-name"
                value={newPartner.name}
                onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                placeholder="Enter partner name"
              />
            </div>
            <div>
              <Label htmlFor="new-logo">Logo URL</Label>
              <Input
                id="new-logo"
                value={newPartner.logo}
                onChange={(e) => setNewPartner({ ...newPartner, logo: e.target.value })}
                placeholder="Enter logo URL"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd}>Add Partner</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {partners.map((partner, index) => (
          <Card key={partner.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <img 
                    src={partner.logo} 
                    alt={partner.name}
                    className="h-12 w-20 object-contain"
                  />
                  
                  {editingId === partner.id ? (
                    <div className="flex-1 space-y-2">
                      <Input
                        value={editingPartner.name}
                        onChange={(e) => setEditingPartner({ ...editingPartner, name: e.target.value })}
                        placeholder="Partner name"
                      />
                      <Input
                        value={editingPartner.logo}
                        onChange={(e) => setEditingPartner({ ...editingPartner, logo: e.target.value })}
                        placeholder="Logo URL"
                      />
                    </div>
                  ) : (
                    <div className="flex-1">
                      <h3 className="font-semibold">{partner.name}</h3>
                      <p className="text-sm text-gray-500">Position: {partner.position}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant={partner.status === 'published' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleStatus(partner.id, partner.status)}
                  >
                    {partner.status === 'published' ? 'Published' : 'Draft'}
                  </Button>

                  <div className="flex flex-col">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReorder(partner.id, 'up')}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReorder(partner.id, 'down')}
                      disabled={index === partners.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>

                  {editingId === partner.id ? (
                    <>
                      <Button size="sm" onClick={() => handleSave(partner.id)}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleEdit(partner)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}

                  <Button size="sm" variant="destructive" onClick={() => handleDelete(partner.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {partners.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No partners found. Add your first partner above.
        </div>
      )}
    </div>
  );
};

export default PartnersManagement;
