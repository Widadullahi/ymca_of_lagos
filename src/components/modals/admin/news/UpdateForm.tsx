import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/NewAuthContext';

interface Update {
  id: string;
  title: string;
  content: string;
  type: 'latest-news' | 'upcoming-event';
  actionButtonLabel?: string;
  actionButtonUrl?: string;
  imageUrl?: string;
  images?: string[];
  postedAt: Date;
}

interface UpdateFormProps {
  isOpen: boolean;
  isEditing: boolean;
  update: Update | null;
  onSave: (update: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const UpdateForm: React.FC<UpdateFormProps> = ({
  isOpen,
  isEditing,
  update,
  onSave,
  onCancel,
  isSubmitting = false
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'latest-news' | 'upcoming-event'>('latest-news');
  const [actionButtonLabel, setActionButtonLabel] = useState('');
  const [actionButtonUrl, setActionButtonUrl] = useState('');
  const [primaryImageFile, setPrimaryImageFile] = useState<File | null>(null);
  const [primaryImagePreview, setPrimaryImagePreview] = useState('');
  const [primaryImageBase64, setPrimaryImageBase64] = useState('');
  const [otherImageFiles, setOtherImageFiles] = useState<File[]>([]);
  const [otherImagePreviews, setOtherImagePreviews] = useState<string[]>([]);
  const [otherImageBase64s, setOtherImageBase64s] = useState<string[]>([]);
  const [selectedVideoFiles, setSelectedVideoFiles] = useState<File[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [videoBase64s, setVideoBase64s] = useState<string[]>([]);

  const { displayNotification } = useAuth();

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  useEffect(() => {
    if (isEditing && update) {
      setTitle(update.title);
      setContent(update.content);
      setType(update.type || 'latest-news');
      setActionButtonLabel(update.actionButtonLabel || '');
      setActionButtonUrl(update.actionButtonUrl || '');
      setPrimaryImageFile(null);
      setPrimaryImageBase64('');
      setPrimaryImagePreview(update.imageUrl || '');

      const galleryImages = (update.images || []).filter(Boolean).filter(img => img !== update.imageUrl);
      setOtherImageFiles([]);
      setOtherImageBase64s([]);
      setOtherImagePreviews(galleryImages);
    } else {
      setTitle('');
      setContent('');
      setType('latest-news');
      setActionButtonLabel('');
      setActionButtonUrl('');
      setPrimaryImageFile(null);
      setPrimaryImagePreview('');
      setPrimaryImageBase64('');
      setOtherImageFiles([]);
      setOtherImagePreviews([]);
      setOtherImageBase64s([]);
    }
  }, [isEditing, update]);

  if (!isOpen) return null;

  const handlePrimaryImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setPrimaryImageFile(file);
      setPrimaryImagePreview(URL.createObjectURL(file));
      setPrimaryImageBase64(await convertToBase64(file));
      const input = document.getElementById('primary-image-file') as HTMLInputElement | null;
      if (input) input.value = '';
    } catch (error) {
      console.error('Error processing primary image:', error);
      displayNotification('error', 'Error processing primary image');
    }
  };

  const handleOtherImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      const nextFiles = [...otherImageFiles];
      const nextPreviews = [...otherImagePreviews];
      const nextBase64s = [...otherImageBase64s];

      for (const file of files) {
        nextFiles.push(file);
        nextPreviews.push(URL.createObjectURL(file));
        nextBase64s.push(await convertToBase64(file));
      }

      setOtherImageFiles(nextFiles);
      setOtherImagePreviews(nextPreviews);
      setOtherImageBase64s(nextBase64s);
      const input = document.getElementById('other-image-files') as HTMLInputElement | null;
      if (input) input.value = '';
    } catch (error) {
      console.error('Error processing other images:', error);
      displayNotification('error', 'Error processing other images');
    }
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      // Validate video files
      const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB limit per video
      const validFiles = files.filter(file => {
        if (file.size > MAX_VIDEO_SIZE) {
          displayNotification('error', `Video "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max 500MB per video.`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      const nextFiles = [...selectedVideoFiles];
      const nextPreviews = [...videoPreviews];
      const nextBase64s = [...videoBase64s];

      for (const file of validFiles) {
        console.log(`Processing video: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        nextFiles.push(file);
        nextPreviews.push(URL.createObjectURL(file));
        const base64 = await convertToBase64(file);
        nextBase64s.push(base64);
        console.log(`Video converted to base64: ${file.name}`);
      }

      setSelectedVideoFiles(nextFiles);
      setVideoPreviews(nextPreviews);
      setVideoBase64s(nextBase64s);
      const input = document.getElementById('video-files') as HTMLInputElement | null;
      if (input) input.value = '';
    } catch (error) {
      console.error('Error processing video files:', error);
      displayNotification('error', 'Error processing video files. Please check the console for details.');
    }
  };

  const handleRemovePrimaryImage = () => {
    setPrimaryImageFile(null);
    setPrimaryImagePreview('');
    setPrimaryImageBase64('');
  };

  const handleRemoveOtherImage = (index: number) => {
    setOtherImageFiles(prev => prev.filter((_, i) => i !== index));
    setOtherImagePreviews(prev => prev.filter((_, i) => i !== index));
    setOtherImageBase64s(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveVideo = (index: number) => {
    setSelectedVideoFiles(prev => prev.filter((_, i) => i !== index));
    setVideoPreviews(prev => prev.filter((_, i) => i !== index));
    setVideoBase64s(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      id: isEditing && update ? update.id : '',
      title,
      content,
      type,
      actionButtonLabel: actionButtonLabel.trim(),
      actionButtonUrl: actionButtonUrl.trim(),
      postedAt: isEditing && update ? update.postedAt : new Date(),
      primaryImageBase64: primaryImageBase64 || undefined,
      primaryImageFile: primaryImageFile || undefined,
      primaryImageUrl: primaryImagePreview || '',
      otherImageBase64s: otherImageBase64s.length > 0 ? otherImageBase64s : undefined,
      otherImageFiles: otherImageFiles.length > 0 ? otherImageFiles : undefined,
      otherImageUrls: otherImagePreviews,
      videoBase64s: videoBase64s.length > 0 ? videoBase64s : undefined,
      videoFiles: selectedVideoFiles.length > 0 ? selectedVideoFiles : undefined,
      videoUrls: videoPreviews
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
      <div className="my-8 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? '✏️ Edit Update' : '➕ Create New Update'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Content Type *</label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`cursor-pointer rounded-lg border-2 p-5 text-center transition-all font-medium ${
                type === 'latest-news' ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-gray-300 bg-white hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="latest-news"
                  checked={type === 'latest-news'}
                  onChange={(e) => setType(e.target.value as 'latest-news')}
                  className="sr-only"
                />
                <div className="text-lg">📰</div>
                <div>Latest News</div>
              </label>

              <label className={`cursor-pointer rounded-lg border-2 p-5 text-center transition-all font-medium ${
                type === 'upcoming-event' ? 'border-green-500 bg-green-50 text-green-900' : 'border-gray-300 bg-white hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="upcoming-event"
                  checked={type === 'upcoming-event'}
                  onChange={(e) => setType(e.target.value as 'upcoming-event')}
                  className="sr-only"
                />
                <div className="text-lg">🎯</div>
                <div>Upcoming Event</div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Title *</label>
            <input
              type="text"
              placeholder="Enter a compelling title"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Content *</label>
            <textarea
              placeholder="Describe the news or event in detail"
              className="min-h-[150px] w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Call-to-Action Text</label>
              <input
                type="text"
                placeholder="e.g., Register Now, Learn More"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={actionButtonLabel}
                onChange={(e) => setActionButtonLabel(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Call-to-Action Link</label>
              <input
                type="url"
                placeholder="https://example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={actionButtonUrl}
                onChange={(e) => setActionButtonUrl(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Featured Image</label>
            <div className="space-y-4">
              <input
                id="primary-image-file"
                type="file"
                accept="image/*"
                onChange={handlePrimaryImageChange}
                className="block w-full text-sm border border-gray-300 rounded-lg p-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {primaryImagePreview && (
                <div className="group relative max-w-sm">
                  <img
                    src={primaryImagePreview}
                    alt="Primary preview"
                    className="w-full h-40 rounded-lg border border-gray-300 object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePrimaryImage}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                  >
                    ✕
                  </button>
                  <p className="text-xs text-gray-500 mt-2">Main image displayed on cards</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Gallery Images</label>
            <div className="space-y-4">
              <input
                id="other-image-files"
                type="file"
                accept="image/*"
                multiple
                onChange={handleOtherImagesChange}
                className="block w-full text-sm border border-gray-300 rounded-lg p-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <p className="text-xs text-gray-500">
                Additional images shown in the full story view
              </p>

              {otherImagePreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {otherImagePreviews.map((preview, index) => (
                    <div key={index} className="group relative">
                      <img
                        src={preview}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-32 rounded-lg border border-gray-300 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveOtherImage(index)}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Videos</label>
            <div className="space-y-4">
              <input
                id="video-files"
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideoChange}
                className="block w-full text-sm border border-gray-300 rounded-lg p-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <p className="text-xs text-gray-500">
                MP4, WebM, or MOV files (max 500MB per video)
              </p>

              {videoPreviews.length > 0 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {videoPreviews.map((preview, index) => (
                    <div key={index} className="group relative rounded-lg border border-gray-300 bg-gray-900 p-2 overflow-hidden">
                      <video
                        src={preview}
                        controls
                        className="w-full h-40 rounded object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveVideo(index)}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600 text-sm"
                      >
                        ✕
                      </button>
                      <p className="text-xs text-gray-400 mt-2">Video {index + 1}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg font-medium text-white transition-colors ${
                type === 'upcoming-event' 
                  ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400' 
                  : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
              } disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  {isEditing ? 'Updating' : 'Creating'}...
                </>
              ) : (
                <>
                  {isEditing ? '✏️ Update' : '➕ Create'} {type === 'upcoming-event' ? 'Event' : 'News'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateForm;
