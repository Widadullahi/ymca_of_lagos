
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../context/NewAuthContext.js';
import SocialMediaBar from '../components/navigation/SocialMediaBar.js';
import MainNavigation from '../components/navigation/MainNavigation.js';

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

const collectPostAttachments = (item: any) => item.attachments || item.attachments_data || [];

export default function NewsDetailPage() {
  // Dummy handler for donation modal (replace with actual if needed)
  const openDonationModal = () => {};
  const { id } = useParams();
  const { fetchWithAuth, displayNotification, BACKEND_URL } = useAuth();
  const [update, setUpdate] = useState<Update | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mediaBaseUrl = BACKEND_URL.replace(/\/api\/v1\/?$/, '');
  const getImageValue = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      return value.url || value.file || value.path || value.image || value.image_url || value.imageUrl || '';
    }
    return '';
  };
  const isImageFile = (url?: string | null): boolean => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'].some(ext => lower.includes(ext));
  };
  const toAbsoluteUrl = (value?: any): string => {
    const url = getImageValue(value);
    if (!url) return '';
    // If already an absolute URL, return as is
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('//')) return `${window.location.protocol}${url}`;
    if (url.startsWith('/')) return `${mediaBaseUrl}${url}`;
    return `${mediaBaseUrl}/${url.replace(/^\/+/, '')}`;
  };

  useEffect(() => {
    const fetchUpdate = async () => {
      try {
        const response = await fetchWithAuth({ method: 'GET', path: `/posts/${id}` });
        const item = response?.data;
        if (item) {
          const postAttachments = collectPostAttachments(item);
          const attachmentImages = postAttachments
            .map((att: any) => toAbsoluteUrl(att?.file || att?.url))
            .filter(isImageFile);
          const allImages = [
            toAbsoluteUrl(item.image || item.image_url || item.imageUrl || item?.image_base64),
            ...(item.images || item.image_list || item.imageUrls || []).map((img: any) => toAbsoluteUrl(img)),
            ...attachmentImages
          ].filter(Boolean);

          setUpdate({
            id: item.id,
            title: item.title,
            content: item.content,
            category: item.category,
            actionButtonLabel: item.action_button_label || item.actionButtonLabel || '',
            actionButtonUrl: item.action_button_url || item.actionButtonUrl || '',
            imageUrl: allImages[0] || '',
            images: allImages,
            postedAt: new Date(item.created_at),
            postedBy: item.user?.first_name || item.user?.email || 'Anonymous',
            attachments: postAttachments.map((att: any) => {
              const attachmentUrl = toAbsoluteUrl(att?.file || att?.url);
              const fileName = (att?.file || att?.url || '').split('/').pop() || 'attachment';
              return {
                name: fileName,
                url: attachmentUrl,
                type: fileName.split('.').pop()?.toLowerCase() || 'file',
              };
            }),
          });
        }
      } catch (error) {
        displayNotification('error', 'Failed to load news detail');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUpdate();
  }, [id]);

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
            <div className="w-full h-80 md:h-[28rem] bg-gray-200 rounded-b-lg overflow-hidden flex items-center justify-center mb-8">
              <img
                src={update.imageUrl}
                alt={update.title}
                className="object-cover w-full h-full"
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
