import React, { useState, useEffect } from 'react';
import { Update } from '../../../../pages/admin/AdminUpdatesPage';

interface UpdateFormProps {
  isOpen: boolean;
  isEditing: boolean;
  update: Update | null;
  onSave: (update: any) => void;
  onCancel: () => void;
}

const UpdateForm: React.FC<UpdateFormProps> = ({ 
  isOpen, 
  isEditing, 
  update, 
  onSave, 
  onCancel 
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  // Change type state to use display names instead of kebab-case
  const [type, setType] = useState<'Latest News' | 'Upcoming Event'>('Latest News');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageBase64Array, setImageBase64Array] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update types array to use display names
  const types = [
    { 
      value: 'Latest News' as const, 
      label: 'Latest News', 
      icon: '📰', 
      color: 'bg-blue-50', 
      borderColor: 'border-blue-500', 
      textColor: 'text-blue-700' 
    },
    { 
      value: 'Upcoming Event' as const, 
      label: 'Upcoming Event', 
      icon: '📅', 
      color: 'bg-green-50', 
      borderColor: 'border-green-500', 
      textColor: 'text-green-700' 
    }
  ];

  // Helper function to convert file to base64
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
      // Handle both old and new format for backward compatibility
      if (update.type === 'latest-news' || update.type === 'Latest News') {
        setType('Latest News');
      } else if (update.type === 'upcoming-event' || update.type === 'Upcoming Event') {
        setType('Upcoming Event');
      } else {
        setType(update.type as any || 'Latest News');
      }
      setExistingImages(update.images || []);
    } else {
      setTitle('');
      setContent('');
      setType('Latest News');
      setImageFiles([]);
      setImagePreviews([]);
      setImageBase64Array([]);
      setExistingImages([]);
      setRemovedImages([]);
    }
  }, [isEditing, update]);

  if (!isOpen) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      try {
        const newFiles = [...imageFiles, ...files];
        setImageFiles(newFiles);
        
        // Create preview URLs for new files
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
        
        // Convert new files to base64
        const newBase64Promises = files.map(file => convertToBase64(file));
        const newBase64 = await Promise.all(newBase64Promises);
        setImageBase64Array(prev => [...prev, ...newBase64]);
      } catch (error) {
        console.error('Error processing images:', error);
        alert('Error processing image files');
      }
    }
    
    // Reset the file input
    e.target.value = '';
  };

  const handleRemoveNewImage = (index: number) => {
    const newImageFiles = [...imageFiles];
    const newImagePreviews = [...imagePreviews];
    const newImageBase64Array = [...imageBase64Array];
    
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(newImagePreviews[index]);
    
    newImageFiles.splice(index, 1);
    newImagePreviews.splice(index, 1);
    newImageBase64Array.splice(index, 1);
    
    setImageFiles(newImageFiles);
    setImagePreviews(newImagePreviews);
    setImageBase64Array(newImageBase64Array);
  };

  const handleRemoveExistingImage = (index: number) => {
    const imageToRemove = existingImages[index];
    const newExistingImages = [...existingImages];
    newExistingImages.splice(index, 1);
    setExistingImages(newExistingImages);
    setRemovedImages(prev => [...prev, imageToRemove]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Combine existing images (minus removed ones) with new base64 images
      const filteredExistingImages = existingImages.filter(img => !removedImages.includes(img));
      const allImages = [...filteredExistingImages, ...imageBase64Array];
      
      const updateData = {
        id: isEditing && update ? update.id : '',
        title,
        content,
        type,
        postedAt: isEditing && update ? update.postedAt : new Date(),
        images: allImages.length > 0 ? allImages : undefined,
        imageUrl: allImages.length > 0 ? allImages[0] : undefined,
        removedImages: removedImages.length > 0 ? removedImages : undefined
      };

      onSave(updateData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
    }
  };

  const totalImages = existingImages.length + imagePreviews.length;

  // Helper function to get placeholder text based on type
  const getPlaceholderText = () => {
    if (type === 'Latest News') {
      return {
        title: 'Enter news title...',
        content: 'Write your news content here...',
        description: 'Sharing news, announcements, or updates with your community'
      };
    } else {
      return {
        title: 'Enter event title...',
        content: 'Write your event details here...',
        description: 'Creating events, meetings, or gatherings for your community'
      };
    }
  };

  const placeholder = getPlaceholderText();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh]">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 border-b px-6 py-4 bg-white rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Update' : 'Create New Update'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Choose between Latest News or Upcoming Event
              </p>
            </div>
            <button 
              onClick={onCancel} 
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close modal"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Form Content - Scrollable with scrollbar */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 max-h-[calc(85vh-200px)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selection */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Update Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {types.map((typeOption) => (
                    <button
                      key={typeOption.value}
                      type="button"
                      onClick={() => setType(typeOption.value)}
                      className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all duration-200 ${
                        type === typeOption.value
                          ? `${typeOption.color} ${typeOption.borderColor} ${typeOption.textColor} shadow-md scale-[1.02]`
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <span className="text-3xl mb-3">{typeOption.icon}</span>
                      <span className="font-semibold text-lg">{typeOption.label}</span>
                      {type === typeOption.value && (
                        <div className="mt-2 w-6 h-1.5 bg-current rounded-full opacity-50"></div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-3 text-center">
                  {placeholder.description}
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder={placeholder.title} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea 
                  placeholder={placeholder.content} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[180px] resize-y" 
                  rows={6}
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  required
                />
              </div>

              {/* Images Section */}
              <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Images {totalImages > 0 && `(${totalImages} selected)`}
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                      Upload multiple images. First image will be used as featured image.
                    </p>
                  </div>
                </div>

                {/* Image Upload Button */}
                <div className="mb-6">
                  <label className="block cursor-pointer">
                    <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200">
                      <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-1 text-sm text-gray-600">Click to upload images</p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        multiple
                        className="hidden"
                      />
                    </div>
                  </label>
                </div>

                {/* Image Grid with scrollbar */}
                {(existingImages.length > 0 || imagePreviews.length > 0) && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Images</h4>
                    <div className="overflow-y-auto max-h-60 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-2">
                        {/* Existing Images */}
                        {existingImages.map((img, index) => (
                          <div key={`existing-${index}`} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                              <img 
                                src={img} 
                                alt={`Existing ${index + 1}`} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/200x200?text=Image+Error';
                                }}
                              />
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveExistingImage(index)}
                                className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-red-600 transition-all duration-200 transform scale-90 group-hover:scale-100"
                                title="Remove image"
                              >
                                ×
                              </button>
                            </div>
                            <div className="absolute top-1 left-1 bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                              Existing
                            </div>
                          </div>
                        ))}

                        {/* New Images */}
                        {imagePreviews.map((preview, index) => (
                          <div key={`new-${index}`} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                              <img 
                                src={preview} 
                                alt={`New ${index + 1}`} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveNewImage(index)}
                                className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-red-600 transition-all duration-200 transform scale-90 group-hover:scale-100"
                                title="Remove image"
                              >
                                ×
                              </button>
                            </div>
                            <div className="absolute top-1 left-1 bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full">
                              New
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 border-t px-6 py-4 bg-white rounded-b-xl">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {totalImages > 0 && (
                <span className="inline-flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {totalImages} image{totalImages !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex space-x-3">
              <button 
                type="button" 
                onClick={onCancel} 
                disabled={isSubmitting}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button 
                type="button" 
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    {isEditing ? 'Update Post' : 'Create Post'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateForm;