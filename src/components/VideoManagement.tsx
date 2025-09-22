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
import { Trash2, Edit, Plus, Play, Star, ArrowUp, ArrowDown, Upload, FileText, X } from 'lucide-react';
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
  package_id?: string;
}

interface Package {
  id: string;
  title: string;
  country?: string;
}

const VideoManagement = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCSVDialogOpen, setIsCSVDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    duration: '',
    is_featured: false,
    status: 'published' as 'published' | 'draft',
    package_id: '',
  });

  useEffect(() => {
    loadVideos();
    loadPackages();
  }, []);

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;

      setVideos((data || []) as Video[]);
    } catch (error) {
      console.error('Error loading videos:', error);
      toast({
        title: "Error",
        description: "Failed to load videos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('id, title, country');

      if (error) throw error;

      // Cast the data to the Package type
      const packageData: Package[] = data ? data.map(pkg => ({
        id: pkg.id,
        title: pkg.title,
        country: pkg.country
      })) : [];

      setPackages(packageData);
    } catch (error) {
      console.error('Error loading packages:', error);
      toast({
        title: "Error",
        description: "Failed to load packages",
        variant: "destructive",
      });
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
      package_id: '',
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
          .update({
            ...formData,
            package_id: formData.package_id || null
          })
          .eq('id', editingVideo.id);

        if (error) throw error;

        toast({ title: "Success", description: "Video updated successfully" });
      } else {
        const { error } = await supabase
          .from('videos')
          .insert([{ 
            ...formData, 
            position: videos.length,
            package_id: formData.package_id || null
          }]);

        if (error) throw error;

        toast({ title: "Success", description: "Video added successfully" });
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
      package_id: video.package_id || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) throw error;

      toast({ title: "Success", description: "Video deleted successfully" });
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
      const { error } = await supabase.from('videos').update({ position: newPosition }).eq('id', id);
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
    if (video.thumbnail_url) return video.thumbnail_url;
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

  const getPackageTitle = (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    return pkg ? pkg.title : 'No package';
  };

  const getPackageCountry = (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    return pkg ? pkg.country : '';
  };

  const getVideosByPackage = (packageId: string) => {
    return videos.filter(video => video.package_id === packageId);
  };

  const getVideosWithoutPackage = () => {
    return videos.filter(video => !video.package_id);
  };

  const handleCSVUpload = async () => {
    if (!csvFile) {
      toast({
        title: "Error",
        description: "Please select a CSV file first",
        variant: "destructive",
      });
      return;
    }

    setCsvLoading(true);
    
    try {
      const text = await csvFile.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
      
      // Validate required headers
      const requiredHeaders = ['title', 'video_url'];
      const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
      }
      
      const videosToInsert = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(value => value.trim());
        const videoData: any = {};
        
        headers.forEach((header, index) => {
          if (values[index]) {
            // Convert string values to appropriate types
            if (header === 'is_featured') {
              videoData[header] = values[index].toLowerCase() === 'true';
            } else if (header === 'position') {
              videoData[header] = parseInt(values[index]) || videos.length + i - 1;
            } else {
              videoData[header] = values[index];
            }
          }
        });
        
        // Set default values for missing fields
        if (!videoData.position) videoData.position = videos.length + i - 1;
        if (!videoData.status) videoData.status = 'published';
        
        videosToInsert.push(videoData);
      }
      
      const { error } = await supabase
        .from('videos')
        .insert(videosToInsert);
      
      if (error) throw error;
      
      toast({ 
        title: "Success", 
        description: `${videosToInsert.length} videos uploaded successfully` 
      });
      
      setIsCSVDialogOpen(false);
      setCsvFile(null);
      loadVideos();
    } catch (error: any) {
      console.error('Error uploading CSV:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload videos from CSV",
        variant: "destructive",
      });
    } finally {
      setCsvLoading(false);
    }
  };

  const downloadCSVTemplate = () => {
    const headers = ['title', 'description', 'video_url', 'thumbnail_url', 'duration', 'position', 'is_featured', 'status', 'package_id'];
    const csvContent = headers.join(',') + '\nExample Video,This is a description,https://youtube.com/watch?v=abc123,,5:30,0,false,published,';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'video_upload_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getYoutubeEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  if (loading) return (
    <div className="p-6">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-travel-primary mx-auto"></div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Video Management</h1>
        <div className="flex gap-2">
          <Dialog open={isCSVDialogOpen} onOpenChange={setIsCSVDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" /> Upload CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Videos via CSV</DialogTitle>
                <DialogDescription>
                  Upload multiple videos using a CSV file. Required fields: title, video_url
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Input 
                    id="csv-file" 
                    type="file" 
                    accept=".csv" 
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-gray-500">CSV file with video data</p>
                </div>

                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={downloadCSVTemplate}
                    className="self-start"
                  >
                    <FileText className="h-4 w-4 mr-2" /> Download Template
                  </Button>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCSVDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCSVUpload} disabled={!csvFile || csvLoading}>
                    {csvLoading ? "Uploading..." : "Upload Videos"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" /> Add Video
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{editingVideo ? 'Edit Video' : 'Add New Video'}</DialogTitle>
                <DialogDescription>
                  {editingVideo ? 'Update video details' : 'Add a new video to your collection'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <div>
                    <label className="block text-sm font-medium mb-1">Package</label>
                    <Select
                      value={formData.package_id}
                      onValueChange={(value) => setFormData({ ...formData, package_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a package" />
                      </SelectTrigger>
                      <SelectContent>
                        {packages.map(pkg => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.title} {pkg.country && `(${pkg.country})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                </div>

                <div className="flex flex-col">
                  <h3 className="text-lg font-medium mb-4">Video Preview</h3>
                  {formData.video_url ? (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <iframe
                        src={getYoutubeEmbedUrl(formData.video_url)}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Enter a video URL to see preview</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit}>{editingVideo ? 'Update' : 'Add'} Video</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Group videos by package */}
      {packages.map(pkg => {
        const packageVideos = getVideosByPackage(pkg.id);
        if (packageVideos.length === 0) return null;
        
        return (
          <div key={pkg.id} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">{pkg.title}</h2>
                {pkg.country && <p className="text-gray-600">{pkg.country}</p>}
              </div>
              <Badge variant="outline">{packageVideos.length} videos</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {packageVideos.map((video) => (
                <Card key={video.id} className="overflow-hidden cursor-pointer" onClick={() => handleEdit(video)}>
                  <div className="relative aspect-video">
                    <img src={getVideoThumbnail(video)} alt={video.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                    {video.is_featured && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-yellow-500 text-black text-xs p-1">
                          <Star className="h-3 w-3 mr-1" />Featured
                        </Badge>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={video.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                        {video.status}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm line-clamp-2">{video.title}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {/* Videos without a package */}
      {getVideosWithoutPackage().length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Uncategorized Videos</h2>
            <Badge variant="outline">{getVideosWithoutPackage().length} videos</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {getVideosWithoutPackage().map((video) => (
              <Card key={video.id} className="overflow-hidden cursor-pointer" onClick={() => handleEdit(video)}>
                <div className="relative aspect-video">
                  <img src={getVideoThumbnail(video)} alt={video.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                  {video.is_featured && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-yellow-500 text-black text-xs p-1">
                        <Star className="h-3 w-3 mr-1" />Featured
                      </Badge>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant={video.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                      {video.status}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm line-clamp-2">{video.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {videos.length === 0 && (
        <div className="text-center py-12">
          <Play className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
          <p className="text-gray-600 mb-4">Add your first video to get started</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => setIsDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Video</Button>
            <Button variant="outline" onClick={() => setIsCSVDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" /> Upload CSV
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoManagement;