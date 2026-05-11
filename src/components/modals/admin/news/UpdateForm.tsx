import React, { useEffect, useState } from 'react';

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
      alert('Error processing primary image');
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
      alert('Error processing other images');
    }
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      const nextFiles = [...selectedVideoFiles];
      const nextPreviews = [...videoPreviews];
      const nextBase64s = [...videoBase64s];

      for (const file of files) {
        nextFiles.push(file);
        nextPreviews.push(URL.createObjectURL(file));
        nextBase64s.push(await convertToBase64(file));
      }

      setSelectedVideoFiles(nextFiles);
      setVideoPreviews(nextPreviews);
      setVideoBase64s(nextBase64s);
      const input = document.getElementById('video-files') as HTMLInputElement | null;
      if (input) input.value = '';
    } catch (error) {
      console.error('Error processing video files:', error);
      alert('Error processing video files');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-500 bg-opacity-75">
      <div className="my-8 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white pb-3">
          <h3 className="text-xl font-bold">
            {isEditing ? 'Edit Update' : 'Add New Update'}
          </h3>
          <button
            onClick={onCancel}
            className="p-1 text-2xl leading-none text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Type</label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`cursor-pointer rounded-lg border p-4 text-center transition-colors ${
                type === 'latest-news' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="latest-news"
                  checked={type === 'latest-news'}
                  onChange={(e) => setType(e.target.value as 'latest-news')}
                  className="sr-only"
                />
                <div className="mb-2 text-2xl">N</div>
                <div className="font-medium">Latest News</div>
              </label>

              <label className={`cursor-pointer rounded-lg border p-4 text-center transition-colors ${
                type === 'upcoming-event' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="upcoming-event"
                  checked={type === 'upcoming-event'}
                  onChange={(e) => setType(e.target.value as 'upcoming-event')}
                  className="sr-only"
                />
                <div className="mb-2 text-2xl">E</div>
                <div className="font-medium">Upcoming Event</div>
              </label>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Title</label>
            <input
              type="text"
              placeholder="Enter title"
              className="w-full rounded border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Content</label>
            <textarea
              placeholder="Enter content"
              className="min-h-[150px] w-full rounded border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Action Button Text</label>
              <input
                type="text"
                placeholder="e.g. Register Now"
                className="w-full rounded border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={actionButtonLabel}
                onChange={(e) => setActionButtonLabel(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Action Button Link</label>
              <input
                type="url"
                placeholder="https://example.com"
                className="w-full rounded border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={actionButtonUrl}
                onChange={(e) => setActionButtonUrl(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Image</label>
            <div className="space-y-4">
              <input
                id="primary-image-file"
                type="file"
                accept="image/*"
                onChange={handlePrimaryImageChange}
                className="w-full rounded border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {primaryImagePreview && (
                <div className="group relative max-w-xs">
                  <img
                    src={primaryImagePreview}
                    alt="Primary preview"
                    className="h-40 w-full rounded border object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePrimaryImage}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                  >
                    ×
                  </button>
                  <div className="mt-1 text-xs text-gray-500">
                    Main image for the landing page card
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Other Images</label>
            <div className="space-y-4">
              <input
                id="other-image-files"
                type="file"
                accept="image/*"
                multiple
                onChange={handleOtherImagesChange}
                className="w-full rounded border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <p className="text-xs text-gray-500">
                These appear as small previews under the main image when "Read Full Story" is opened.
              </p>

              {otherImagePreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {otherImagePreviews.map((preview, index) => (
                    <div key={index} className="group relative">
                      <img
                        src={preview}
                        alt={`Other preview ${index + 1}`}
                        className="h-32 w-full rounded border object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveOtherImage(index)}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                      >
                        ×
                      </button>
                      <div className="mt-1 text-xs text-gray-500">Preview {index + 1}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Video</label>
            <div className="space-y-4">
              <input
                id="video-files"
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideoChange}
                className="w-full rounded border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <p className="text-xs text-gray-500">
                Upload video files to accompany the news or event. Supported formats include MP4, WebM, and MOV.
              </p>

              {videoPreviews.length > 0 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {videoPreviews.map((preview, index) => (
                    <div key={index} className="group relative rounded border bg-gray-100 p-2">
                      <video
                        src={preview}
                        controls
                        className="h-40 w-full rounded object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveVideo(index)}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                      >
                        ×
                      </button>
                      <div className="mt-1 text-xs text-gray-500">Video {index + 1}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 border-t pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="rounded bg-gray-300 px-4 py-2 font-medium transition-colors hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`rounded px-6 py-2 font-medium text-white transition-colors ${
                type === 'upcoming-event' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent align-[-2px]" />
                  {isEditing ? 'Updating' : 'Creating'} {type === 'upcoming-event' ? 'Event' : 'News'}...
                </>
              ) : (
                <>
                  {isEditing ? 'Update' : 'Create'} {type === 'upcoming-event' ? 'Event' : 'News'}
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
