
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Save, X } from 'lucide-react';

interface HomepageSection {
  id: string;
  section_key: string;
  display_name: string;
  subtitle: string | null;
  is_visible: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

const HomepageManagement = () => {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingSubtitle, setEditingSubtitle] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error loading sections:', error);
      toast({
        title: 'Error',
        description: 'Failed to load homepage sections',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSection = async (id: string, updates: Partial<HomepageSection>) => {
    try {
      const { error } = await supabase
        .from('homepage_sections')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      setSections(prev => prev.map(section => 
        section.id === id ? { ...section, ...updates } : section
      ));

      toast({
        title: 'Success',
        description: 'Section updated successfully',
      });
    } catch (error) {
      console.error('Error updating section:', error);
      toast({
        title: 'Error',
        description: 'Failed to update section',
        variant: 'destructive',
      });
    }
  };

  const handleVisibilityToggle = (id: string, isVisible: boolean) => {
    updateSection(id, { is_visible: isVisible });
  };

  const handlePositionChange = (id: string, position: number) => {
    updateSection(id, { position });
  };

  const handleEdit = (section: HomepageSection) => {
    setEditingId(section.id);
    setEditingName(section.display_name);
    setEditingSubtitle(section.subtitle || '');
  };

  const handleSave = (id: string) => {
    updateSection(id, { 
      display_name: editingName,
      subtitle: editingSubtitle || null
    });
    setEditingId(null);
    setEditingName('');
    setEditingSubtitle('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingName('');
    setEditingSubtitle('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-travel-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Homepage Sections Management</CardTitle>
          <p className="text-sm text-gray-600">
            Control which sections appear on your homepage, edit their names and subtitles, and set their positions.
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Section Name & Subtitle</TableHead>
                <TableHead>Visible</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections.map((section) => (
                <TableRow key={section.id}>
                  <TableCell>
                    <Select
                      value={section.position.toString()}
                      onValueChange={(value) => handlePositionChange(section.id, parseInt(value))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: sections.length }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {editingId === section.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          placeholder="Section title"
                          className="font-medium"
                        />
                        <Textarea
                          value={editingSubtitle}
                          onChange={(e) => setEditingSubtitle(e.target.value)}
                          placeholder="Section subtitle (optional)"
                          className="text-sm"
                          rows={2}
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium">{section.display_name}</div>
                        {section.subtitle && (
                          <div className="text-sm text-gray-600 mt-1">{section.subtitle}</div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">{section.section_key}</div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={section.is_visible}
                      onCheckedChange={(checked) => handleVisibilityToggle(section.id, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    {editingId === section.id ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSave(section.id)}
                          className="p-2"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                          className="p-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(section)}
                        className="p-2"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomepageManagement;
