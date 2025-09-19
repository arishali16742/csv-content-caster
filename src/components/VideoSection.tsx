import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Play, Clock, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface Video {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: string;
  is_featured: boolean;
}

const VideoSection = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('status', 'published')
        .order('position', { ascending: true });

      if (error) {
        console.error('Error loading videos:', error);
        return;
      }

      setVideos(data || []);
    } catch (error) {
      console.error('Error in loadVideos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setIsPlaying(true);
  };

  const closeModal = () => {
    setSelectedVideo(null);
    setIsPlaying(false);
  };

  const getVideoEmbedUrl = (url: string) => {
    // Convert YouTube watch URL to embed URL
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    // Convert YouTube short URL to embed URL
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    // For direct video files or other platforms
    return url;
  };

  const getVideoThumbnail = (video: Video) => {
    if (video.thumbnail_url) {
      return video.thumbnail_url;
    }
    // Generate YouTube thumbnail if no custom thumbnail
    if (video.video_url.includes('youtube.com/watch?v=')) {
      const videoId = video.video_url.split('v=')[1]?.split('&')[0];
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    if (video.video_url.includes('youtu.be/')) {
      const videoId = video.video_url.split('youtu.be/')[1]?.split('?')[0];
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return '/placeholder.svg';
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Travel Videos</h2>
            <div className="animate-pulse bg-gray-200 h-4 w-64 mx-auto rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-video rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-4 w-3/4 mb-2 rounded"></div>
                <div className="bg-gray-200 h-3 w-1/2 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!videos.length) {
    return null;
  }

  const featuredVideo = videos.find(v => v.is_featured) || videos[0];
  const galleryVideos = videos.filter(v => v.id !== featuredVideo?.id);

  return (
    <>
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              Travel Videos
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience destinations through our curated travel videos and get inspired for your next adventure
            </p>
          </div>

          {/* Featured Video */}
          {featuredVideo && (
            <div className="mb-12">
              <div 
                className="relative aspect-video max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl cursor-pointer group"
                onClick={() => handleVideoClick(featuredVideo)}
              >
                <img
                  src={getVideoThumbnail(featuredVideo)}
                  alt={featuredVideo.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-30 transition-all duration-300">
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-6 group-hover:scale-110 transition-transform duration-300">
                    <Play className="h-12 w-12 text-white ml-1" fill="currentColor" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                  <h3 className="text-white text-xl md:text-2xl font-bold mb-2">
                    {featuredVideo.title}
                  </h3>
                  {featuredVideo.description && (
                    <p className="text-white text-sm md:text-base opacity-90">
                      {featuredVideo.description}
                    </p>
                  )}
                  {featuredVideo.duration && (
                    <div className="flex items-center mt-2 text-white text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      {featuredVideo.duration}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Video Gallery */}
          {galleryVideos.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-center mb-8 text-gray-800">
                More Travel Videos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleryVideos.map((video) => (
                  <div
                    key={video.id}
                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                    onClick={() => handleVideoClick(video)}
                  >
                    <div className="relative aspect-video">
                      <img
                        src={getVideoThumbnail(video)}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3">
                          <Play className="h-6 w-6 text-white ml-0.5" fill="currentColor" />
                        </div>
                      </div>
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {video.duration}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                        {video.title}
                      </h4>
                      {video.description && (
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {video.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Video Modal */}
      <Dialog open={isPlaying} onOpenChange={closeModal}>
        <DialogContent className="max-w-6xl w-full p-0 bg-black">
          <div className="relative aspect-video">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            {selectedVideo && (
              <iframe
                src={getVideoEmbedUrl(selectedVideo.video_url)}
                title={selectedVideo.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VideoSection;