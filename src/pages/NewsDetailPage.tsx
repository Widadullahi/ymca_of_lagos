
import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../context/NewAuthContext';
import { createPostsApi } from '../api/postsApi';
import SocialMediaBar from '../components/navigation/SocialMediaBar';
import MainNavigation from '../components/navigation/MainNavigation';

interface Attachment {
  name: string;
  url: string;
  type: string;
}

interface Update {
  id: string;
  title: string;
  content: string;
  type: 'latest-news' | 'upcoming-event';
  actionButtonLabel?: string;
  actionButtonUrl?: string;
  imageUrl?: string;
  images?: string[];
  postedBy: string;
  postedAt: Date;
  attachments?: Attachment[];
  category?: string;
}

export default function NewsDetailPage() {
  // Dummy handler for donation modal (replace with actual if needed)
  const openDonationModal = () => {};
  const { id } = useParams();
  const { fetchWithAuth, displayNotification, BACKEND_URL } = useAuth();
  // Memoize postsApi to prevent re-creating it on every render
  const postsApi = React.useMemo(() => createPostsApi(fetchWithAuth, BACKEND_URL), [fetchWithAuth, BACKEND_URL]);
  const [update, setUpdate] = useState<Update | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUpdate = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const post = await postsApi.getPost(id);
        if (post) {
          setUpdate(post);
        }
      } catch (error) {
        console.error('Error fetching news detail:', error);
        displayNotification('error', 'Failed to load news detail');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUpdate();
  }, [id, postsApi]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }
  if (!update) {
    return <div className="flex justify-center items-center h-64">News not found.</div>;
  }

  const getUpdateImages = (update: Update): string[] => {
    if (update.images?.length) return update.images;
    if (update.imageUrl) return [update.imageUrl];
    return [];
  };
  
  const getUpdateVideos = (update: Update): Attachment[] => {
    if (!update.attachments) return [];
    return update.attachments.filter(att => 
      ['mp4', 'webm', 'mov', 'ogg'].includes(att.type.toLowerCase())
    );
  };
  
  const images = getUpdateImages(update);
  const videos = getUpdateVideos(update);
  const isVideo = (type: string) => ['mp4', 'webm', 'mov', 'ogg'].includes(type.toLowerCase());
  
  return (
    <>
      {/* Social Media Bar */}
      <SocialMediaBar />
      {/* Main Navigation */}
      <MainNavigation openDonationModal={openDonationModal} />
      <article className="min-h-screen bg-[#faf9f6] pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Media Gallery (Images & Videos) */}
          <div className="mb-10">
            {/* Videos */}
            {videos.map((video, idx) => (
              <div key={`video-${idx}`} className="mb-6 w-full">
                <video
                  src={video.url}
                  controls
                  className="w-full max-h-[75vh] rounded-lg object-contain"
                  onError={(e) => {
                    console.warn('Failed to load video:', video.url);
                    e.currentTarget.onerror = null;
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ))}
            
            {/* Images */}
            {images.map((img, idx) => (
              <div key={`img-${idx}`} className="mb-6">
                <img
                  src={img}
                  alt={idx === 0 ? update.title : `${update.title} - Image ${idx + 1}`}
                  className="w-full h-auto max-h-[75vh] object-contain rounded-lg"
                  style={{ objectPosition: 'center' }}
                  onError={(e) => {
                    console.warn('Failed to load image:', img);
                    e.currentTarget.onerror = null;
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
          
          <div className="px-4 md:px-0">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 text-gray-900">
              {update.title}
            </h1>
            <div className="flex items-center gap-3 mb-8">
              <div className="text-gray-700 text-base">
                <span className="mx-2">·</span>
                <span>{format(update.postedAt, 'MMMM do, yyyy')}</span>
                {update.category && (
                  <span className="ml-2 px-2 py-0.5 rounded bg-gray-100 text-xs font-medium text-gray-600 align-middle">
                    {update.category}
                  </span>
                )}
              </div>
            </div>
            <div className="prose prose-lg max-w-none mb-10 text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
              <p className="whitespace-pre-line">{update.content}</p>
            </div>
            {(update.actionButtonLabel || update.actionButtonUrl) && (
              <div className="mb-10">
                <a
                  href={update.actionButtonUrl || '#'}
                  target={update.actionButtonUrl ? "_blank" : "_self"}
                  rel={update.actionButtonUrl ? "noopener noreferrer" : undefined}
                  className={`inline-flex items-center rounded-lg px-5 py-3 font-semibold transition ${
                    update.actionButtonUrl 
                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {update.actionButtonLabel || "Button"}
                </a>
              </div>
            )}
            {update.attachments && update.attachments.filter(a => !isVideo(a.type)).length > 0 && (
              <div className="border-t pt-6 mt-10">
                <h4 className="font-semibold mb-3 text-lg">Attachments</h4>
                <div className="space-y-2">
                  {update.attachments.filter(a => !isVideo(a.type)).map((attachment, idx) => (
                    <a
                      key={idx}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 border rounded hover:bg-gray-50 transition"
                    >
                      <span className="ml-2 text-base text-blue-700 underline">{attachment.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    </>
  );
}
