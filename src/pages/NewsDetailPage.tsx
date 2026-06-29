
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
  category: string;
  actionButtonLabel?: string;
  actionButtonUrl?: string;
  imageUrl?: string;
  images?: string[];
  postedBy: string;
  postedAt: Date;
  attachments?: Attachment[];
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

  return (
    <>
      {/* Social Media Bar */}
      <SocialMediaBar />
      {/* Main Navigation */}
      <MainNavigation openDonationModal={openDonationModal} />
      <article className="min-h-screen bg-[#faf9f6] pb-20">
        <div className="max-w-3xl mx-auto">
          {update.imageUrl && (
            <div className="w-full bg-gray-100 rounded-b-lg overflow-hidden flex items-center justify-center mb-8 p-3">
              <img
                src={update.imageUrl}
                alt={update.title}
                className="w-full h-auto max-h-[75vh] object-contain rounded-lg"
                style={{ objectPosition: 'center' }}
              />
            </div>
          )}
          <div className="px-4 md:px-0">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 text-gray-900">
              {update.title}
            </h1>
            <div className="flex items-center gap-3 mb-8">
              {/* <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-white">
                {update.postedBy[0]}
              </div> */}
              <div className="text-gray-700 text-base">
                {/* <span className="font-semibold">{update.postedBy}</span> */}
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
            {update.attachments && update.attachments.length > 0 && (
              <div className="border-t pt-6 mt-10">
                <h4 className="font-semibold mb-3 text-lg">Attachments</h4>
                <div className="space-y-2">
                  {update.attachments.map((attachment, idx) => (
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
