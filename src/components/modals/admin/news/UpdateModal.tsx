import React, { useState, useEffect } from 'react';

interface UpdateFormData {
  title: string;
  content: string;
  type: 'latest-news' | 'upcoming-event';
  eventDate?: string;
  eventTime?: string;
  location?: string;
  address?: string;
  registrationLink?: string;
  maxParticipants?: number | '';
  isFeatured?: boolean;
  images?: File[];
  attachments?: File[];
  removeImages?: boolean;
}

// Define the Update type with all properties
interface Update {
  id?: number;
  title: string;
  content: string;
  type: 'latest-news' | 'upcoming-event';
  postedAt: Date;
  imageUrl?: string;
  images?: string[]; // This was missing
  location?: string;
  address?: string;
  registrationLink?: string;
  maxParticipants?: number | '';
  isFeatured?: boolean;
  attachments?: Array<{
    name: string;
    url: string;
  }>;
}

interface UpdateFormProps {
  isOpen: boolean;
  isEditing: boolean;
  isSubmitting?: boolean;
  update?: Update | null;
  onSave: (formData: UpdateFormData) => Promise<void>;
  onCancel: () => void;
}

const UpdateForm: React.FC<UpdateFormProps> = ({
  isOpen,
  isEditing,
  isSubmitting = false,
  update,
  onSave,
  onCancel
}) => {
  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    type: 'latest-news' | 'upcoming-event';
    eventDate: string;
    eventTime: string;
    location: string;
    address: string;
    registrationLink: string;
    maxParticipants: number | '';
    isFeatured: boolean;
  }>({
    title: '',
    content: '',
    type: 'latest-news',
    eventDate: '',
    eventTime: '09:00',
    location: '',
    address: '',
    registrationLink: '',
    maxParticipants: '',
    isFeatured: false,
  });
  
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedAttachments, setSelectedAttachments] = useState<File[]>([]);
  const [removeImages, setRemoveImages] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Initialize form data when update prop changes
  useEffect(() => {
    if (update) {
      const isEvent = update.type === 'upcoming-event';
      const date = new Date(update.postedAt);
      
      setFormData({
        title: update.title || '',
        content: update.content || '',
        type: isEvent ? 'upcoming-event' : 'latest-news',
        eventDate: isEvent ? date.toISOString().split('T')[0] : '',
        eventTime: isEvent ? date.toTimeString().split(' ')[0].substring(0, 5) : '09:00',
        location: update.location || '',
        address: update.address || '',
        registrationLink: update.registrationLink || '',
        maxParticipants: update.maxParticipants || '',
        isFeatured: update.isFeatured || false,
      });
      
      // Set image previews
      const previews: string[] = [];
      if (update.imageUrl) previews.push(update.imageUrl);
      if (update.images && update.images.length > 0) {
        update.images.forEach((img: string) => {
          if (img && !previews.includes(img)) {
            previews.push(img);
          }
        });
      }
      setImagePreviews(previews);
      
      setRemoveImages(false);
    } else {
      setFormData({
        title: '',
        content: '',
        type: 'latest-news',
        eventDate: '',
        eventTime: '09:00',
        location: '',
        address: '',
        registrationLink: '',
        maxParticipants: '',
        isFeatured: false,
      });
      setImagePreviews([]);
      setRemoveImages(false);
    }
    setSelectedImages([]);
    setSelectedAttachments([]);
  }, [update]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              (name === 'maxParticipants' && value !== '' ? parseInt(value) || '' : value)
    }));
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newImages = [...selectedImages, ...files];
      setSelectedImages(newImages);
      setRemoveImages(false);
      
      // Create previews for new files only
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (result && typeof result === 'string') {
            setImagePreviews(prev => [...prev, result]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Handle attachment selection
  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedAttachments(prev => [...prev, ...files]);
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    // Remove from previews
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
    
    // Remove from selected files if it's a new file
    if (index < selectedImages.length) {
      const newImages = [...selectedImages];
      newImages.splice(index, 1);
      setSelectedImages(newImages);
    } else {
      // If removing an existing image, mark for removal
      setRemoveImages(true);
    }
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setSelectedAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: UpdateFormData = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      type: formData.type,
      
      // Event-specific fields
      ...(formData.type === 'upcoming-event' && {
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        location: formData.location.trim(),
        address: formData.address.trim(),
        registrationLink: formData.registrationLink.trim(),
        maxParticipants: formData.maxParticipants,
        isFeatured: formData.isFeatured,
      }),
      
      // Media
      images: selectedImages.length > 0 ? selectedImages : undefined,
      attachments: selectedAttachments.length > 0 ? selectedAttachments : undefined,
      removeImages: removeImages && selectedImages.length === 0,
    };
    
    await onSave(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-lg rounded-md bg-white mb-10">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Update' : 'Add New Update'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none p-1"
              disabled={isSubmitting}
            >
              &times;
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.type === 'latest-news' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="type"
                    value="latest-news"
                    checked={formData.type === 'latest-news'}
                    onChange={handleInputChange}
                    className="sr-only"
                    disabled={isSubmitting}
                  />
                  <div className="text-center">
                    <div className="text-2xl mb-2">📰</div>
                    <div className="font-medium">Latest News</div>
                  </div>
                </label>
                
                <label className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.type === 'upcoming-event' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="type"
                    value="upcoming-event"
                    checked={formData.type === 'upcoming-event'}
                    onChange={handleInputChange}
                    className="sr-only"
                    disabled={isSubmitting}
                  />
                  <div className="text-center">
                    <div className="text-2xl mb-2">🎯</div>
                    <div className="font-medium">Upcoming Event</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
                placeholder="Enter a descriptive title"
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={6}
                value={formData.content}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
                placeholder="Enter the detailed content"
              />
            </div>

            {/* Event-specific Fields */}
            {formData.type === 'upcoming-event' && (
              <div className="bg-green-50 p-6 rounded-xl space-y-4 border border-green-100">
                <h4 className="font-semibold text-green-800 text-lg">Event Details</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      id="eventDate"
                      name="eventDate"
                      required
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={isSubmitting}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="eventTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Event Time
                    </label>
                    <input
                      type="time"
                      id="eventTime"
                      name="eventTime"
                      value={formData.eventTime}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={isSubmitting}
                    placeholder="e.g., YMCA Main Hall"
                  />
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={isSubmitting}
                    placeholder="Full address of the venue"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="registrationLink" className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Link
                    </label>
                    <input
                      type="url"
                      id="registrationLink"
                      name="registrationLink"
                      value={formData.registrationLink}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={isSubmitting}
                      placeholder="https://example.com/register"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-1">
                      Max Participants
                    </label>
                    <input
                      type="number"
                      id="maxParticipants"
                      name="maxParticipants"
                      value={formData.maxParticipants}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={isSubmitting}
                      placeholder="Leave empty for unlimited"
                      min="1"
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
                    Mark as Featured Event
                  </label>
                </div>
              </div>
            )}

            {/* Images */}
            <div>
              <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                Images (Multiple images can be selected)
              </label>
              
              {imagePreviews.length > 0 && (
                <div className="mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`} 
                          className="h-32 w-full object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={isSubmitting}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <input
                type="file"
                id="images"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isSubmitting}
              />
            </div>

            {/* Attachments */}
            <div>
              <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-2">
                Attachments (PDF, DOC, etc.)
              </label>
              
              {selectedAttachments.length > 0 && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected files:</p>
                  <ul className="space-y-2">
                    {selectedAttachments.map((file, index) => (
                      <li key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                        <div className="flex items-center">
                          <span className="text-gray-500 mr-3">
                            {file.name.endsWith('.pdf') ? '📄' : 
                             file.name.endsWith('.doc') || file.name.endsWith('.docx') ? '📝' : 
                             '📎'}
                          </span>
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                          disabled={isSubmitting}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <input
                type="file"
                id="attachments"
                multiple
                onChange={handleAttachmentChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isSubmitting}
              />
            </div>

            {/* Existing attachments for editing */}
            {isEditing && update?.attachments && update.attachments.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="block text-sm font-medium text-gray-700 mb-2">
                  Existing Attachments
                </p>
                <ul className="space-y-2">
                  {update.attachments.map((attachment: { name: string; url: string }, index: number) => (
                    <li key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                      <a 
                        href={attachment.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      >
                        <span className="mr-2">
                          {attachment.name.endsWith('.pdf') ? '📄' : 
                           attachment.name.endsWith('.doc') || attachment.name.endsWith('.docx') ? '📝' : 
                           '📎'}
                        </span>
                        {attachment.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
                className={`px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  formData.type === 'upcoming-event'
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  isEditing 
                    ? `Update ${formData.type === 'upcoming-event' ? 'Event' : 'News'}`
                    : `Create ${formData.type === 'upcoming-event' ? 'Event' : 'News'}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateForm;