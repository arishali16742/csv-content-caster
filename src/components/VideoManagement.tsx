import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Edit, Plus, Play, Star, ArrowUp, ArrowDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Video {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: string;
  position: number;
  is_featured: boolean;
  status: 'published' | 'draft';
  created_at: string;
  updated_at: string;
}

const VideoManagement = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    duration: '',
    is_featured: false,
    status: 'published' as 'published' | 'draft',
  });

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('position', { ascending: true });

      if (error) {
        console.error('Error loading videos:', error);
        toast({
          title: "Error",
          description: "Failed to load videos",
          variant: "destructive",
        });
        return;
      }

      setVideos((data || []) as Video[]);
    } catch (error) {
      console.error('Error in loadVideos:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      video_url: '',
      thumbnail_url: '',
      duration: '',
      is_featured: false,
      status: 'published',
    });
    setEditingVideo(null);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.video_url) {
      toast({
        title: "Error",
        description: "Title and video URL are required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingVideo) {
        const { error } = await supabase
          .from('videos')
          .update(formData)
          .eq('id', editingVideo.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Video updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('videos')
          .insert([{ ...formData, position: videos.length }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Video added successfully",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadVideos();
    } catch (error) {
      console.error('Error saving video:', error);
      toast({
        title: "Error",
        description: "Failed to save video",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || '',
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url || '',
      duration: video.duration || '',
      is_featured: video.is_featured,
      status: video.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Video deleted successfully",
      });
      loadVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    }
  };

  const updatePosition = async (id: string, newPosition: number) => {
    try {
      const { error } = await supabase
        .from('videos')
        .update({ position: newPosition })
        .eq('id', id);

      if (error) throw error;

      loadVideos();
    } catch (error) {
      console.error('Error updating position:', error);
    }
  };

  const moveVideo = (id: string, direction: 'up' | 'down') => {
    const currentIndex = videos.findIndex(v => v.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= videos.length) return;

    const videoToMove = videos[currentIndex];
    const videoToSwap = videos[newIndex];

    updatePosition(videoToMove.id, videoToSwap.position);
    updatePosition(videoToSwap.id, videoToMove.position);
  };

  const getVideoThumbnail = (video: Video) => {
    if (video.thumbnail_url) {
      return video.thumbnail_url;
    }
    // Generate YouTube thumbnail if no custom thumbnail
    if (video.video_url.includes('youtube.com/watch?v=')) {
      const videoId = video.video_url.split('v=')[1]?.split('&')[0];
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    }
    if (video.video_url.includes('youtu.be/')) {
      const videoId = video.video_url.split('youtu.be/')[1]?.split('?')[0];
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    }
    return '/placeholder.svg';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-travel-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Video Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingVideo ? 'Edit Video' : 'Add New Video'}
              </DialogTitle>
              <DialogDescription>
                {editingVideo ? 'Update video details' : 'Add a new video to your collection'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter video title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter video description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Video URL *</label>
                <Input
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="YouTube URL or direct video link"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Custom Thumbnail URL</label>
                <Input
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="Optional custom thumbnail (will auto-generate for YouTube)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration</label>
                <Input
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 2:30, 5 mins"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
                <label className="text-sm font-medium">Featured Video</label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'published' | 'draft') => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingVideo ? 'Update' : 'Add'} Video
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, index) => (
          <Card key={video.id} className="overflow-hidden">
            <div className="relative aspect-video">
              <img
                src={getVideoThumbnail(video)}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Play className="h-12 w-12 text-white" />
              </div>
              {video.is_featured && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-yellow-500 text-black">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge variant={video.status === 'published' ? 'default' : 'secondary'}>
                  {video.status}
                </Badge>
              </div>
              {video.duration && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
              {video.description && (
                <p className="text-sm text-gray-600 line-clamp-3">{video.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => moveVideo(video.id, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => moveVideo(video.id, 'down')}
                    disabled={index === videos.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-500">#{video.position + 1}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(video)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(video.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-12">
          <Play className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
          <p className="text-gray-600 mb-4">Add your first video to get started</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Video
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoManagement;