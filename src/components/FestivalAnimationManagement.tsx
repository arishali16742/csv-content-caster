import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Pencil, Save, X, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface FestivalAnimation {
  id: string;
  festival_name: string;
  animation_type: string;
  offer_text: string | null;
  start_date: string;
  end_date: string;
  duration_seconds: number;
  is_active: boolean;
}

const FestivalAnimationManagement = () => {
  const [animations, setAnimations] = useState<FestivalAnimation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<FestivalAnimation>>({});
  const [newAnimation, setNewAnimation] = useState<Partial<FestivalAnimation>>({
    festival_name: '',
    animation_type: 'christmas',
    offer_text: '',
    start_date: '',
    end_date: '',
    duration_seconds: 10,
    is_active: false,
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadAnimations();
  }, []);

  const loadAnimations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('festival_animations' as any)
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setAnimations((data || []) as unknown as FestivalAnimation[]);
    } catch (error) {
      console.error('Error loading animations:', error);
      toast.error('Failed to load festival animations');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newAnimation.festival_name || !newAnimation.start_date || !newAnimation.end_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('festival_animations' as any)
        .insert([newAnimation]);

      if (error) throw error;

      toast.success('Festival animation added successfully');
      setShowAddForm(false);
      setNewAnimation({
        festival_name: '',
        animation_type: 'christmas',
        offer_text: '',
        start_date: '',
        end_date: '',
        duration_seconds: 10,
        is_active: false,
      });
      loadAnimations();
    } catch (error) {
      console.error('Error adding animation:', error);
      toast.error('Failed to add festival animation');
    }
  };

  const handleEdit = (animation: FestivalAnimation) => {
    setEditingId(animation.id);
    setEditForm(animation);
  };

  const handleSave = async () => {
    if (!editingId) return;

    try {
      const { error } = await supabase
        .from('festival_animations' as any)
        .update(editForm)
        .eq('id', editingId);

      if (error) throw error;

      toast.success('Festival animation updated successfully');
      setEditingId(null);
      setEditForm({});
      loadAnimations();
    } catch (error) {
      console.error('Error updating animation:', error);
      toast.error('Failed to update festival animation');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this animation?')) return;

    try {
      const { error } = await supabase
        .from('festival_animations' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Festival animation deleted successfully');
      loadAnimations();
    } catch (error) {
      console.error('Error deleting animation:', error);
      toast.error('Failed to delete festival animation');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('festival_animations' as any)
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Animation ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      loadAnimations();
    } catch (error) {
      console.error('Error toggling animation:', error);
      toast.error('Failed to update animation status');
    }
  };

  const animationTypes = [
    { value: 'christmas', label: 'Christmas (Snow & Santa)' },
    { value: 'holi', label: 'Holi (Colors)' },
    { value: 'diwali', label: 'Diwali (Firecrackers)' },
    { value: 'eid', label: 'Eid (Moon & Stars)' },
  ];

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Festival Animations</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Animation
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Add New Festival Animation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Festival Name</label>
              <Input
                value={newAnimation.festival_name}
                onChange={(e) => setNewAnimation({ ...newAnimation, festival_name: e.target.value })}
                placeholder="e.g., Christmas 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Animation Type</label>
              <Select
                value={newAnimation.animation_type}
                onValueChange={(value) => setNewAnimation({ ...newAnimation, animation_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {animationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Offer Text</label>
              <Input
                value={newAnimation.offer_text || ''}
                onChange={(e) => setNewAnimation({ ...newAnimation, offer_text: e.target.value })}
                placeholder="e.g., 20% OFF"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Duration (seconds)</label>
              <Input
                type="number"
                value={newAnimation.duration_seconds}
                onChange={(e) => setNewAnimation({ ...newAnimation, duration_seconds: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <Input
                type="datetime-local"
                value={newAnimation.start_date}
                onChange={(e) => setNewAnimation({ ...newAnimation, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <Input
                type="datetime-local"
                value={newAnimation.end_date}
                onChange={(e) => setNewAnimation({ ...newAnimation, end_date: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={newAnimation.is_active}
                onCheckedChange={(checked) => setNewAnimation({ ...newAnimation, is_active: checked })}
              />
              <label className="text-sm font-medium">Active</label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleAdd}>Add Animation</Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Festival Name</TableHead>
              <TableHead>Animation Type</TableHead>
              <TableHead>Offer Text</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Duration (s)</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {animations.map((animation) => (
              <TableRow key={animation.id}>
                <TableCell>
                  {editingId === animation.id ? (
                    <Input
                      value={editForm.festival_name}
                      onChange={(e) => setEditForm({ ...editForm, festival_name: e.target.value })}
                    />
                  ) : (
                    animation.festival_name
                  )}
                </TableCell>
                <TableCell>
                  {editingId === animation.id ? (
                    <Select
                      value={editForm.animation_type}
                      onValueChange={(value) => setEditForm({ ...editForm, animation_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {animationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    animationTypes.find((t) => t.value === animation.animation_type)?.label
                  )}
                </TableCell>
                <TableCell>
                  {editingId === animation.id ? (
                    <Input
                      value={editForm.offer_text || ''}
                      onChange={(e) => setEditForm({ ...editForm, offer_text: e.target.value })}
                    />
                  ) : (
                    animation.offer_text || '-'
                  )}
                </TableCell>
                <TableCell>
                  {editingId === animation.id ? (
                    <Input
                      type="datetime-local"
                      value={editForm.start_date}
                      onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                    />
                  ) : (
                    new Date(animation.start_date).toLocaleDateString()
                  )}
                </TableCell>
                <TableCell>
                  {editingId === animation.id ? (
                    <Input
                      type="datetime-local"
                      value={editForm.end_date}
                      onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                    />
                  ) : (
                    new Date(animation.end_date).toLocaleDateString()
                  )}
                </TableCell>
                <TableCell>
                  {editingId === animation.id ? (
                    <Input
                      type="number"
                      value={editForm.duration_seconds}
                      onChange={(e) => setEditForm({ ...editForm, duration_seconds: parseInt(e.target.value) })}
                    />
                  ) : (
                    animation.duration_seconds
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={animation.is_active}
                    onCheckedChange={() => handleToggleActive(animation.id, animation.is_active)}
                    disabled={editingId === animation.id}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {editingId === animation.id ? (
                      <>
                        <Button size="sm" onClick={handleSave}>
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel}>
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(animation)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(animation.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default FestivalAnimationManagement;
