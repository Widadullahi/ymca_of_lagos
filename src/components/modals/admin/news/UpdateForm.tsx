import React, { useState, useEffect } from 'react';
import { Update, Attachment } from '../../../../pages/admin/AdminUpdatesPage';

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
  const [type, setType] = useState<'latest-news' | 'upcoming-event'>('latest-news');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageBase64s, setImageBase64s] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

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
      setType(update.type || 'latest-news');
      
      // Set image previews - check for both imageUrl and images
      const imageUrls: string[] = [];
      
      if (update.imageUrl) {
        imageUrls.push(update.imageUrl);
      }
      
      if (update.images && update.images.length > 0) {
        // Add images that aren't already in the array
        update.images.forEach(img => {
          if (img && !imageUrls.includes(img)) {
            imageUrls.push(img);
          }
        });
      }
      
      setImagePreviews(imageUrls);
      
      // Set attachments
      if (update.attachments && update.attachments.length > 0) {
        setAttachments(update.attachments);
      } else {
        setAttachments([]);
      }
    } else {
      // Reset all fields
      setTitle('');
      setContent('');
      setType('latest-news');
      setImageFiles([]);
      setImagePreviews([]);
      setImageBase64s([]);
      setAttachments([]);
    }
  }, [isEditing, update]);

  if (!isOpen) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      try {
        const newFiles = [...imageFiles];
        const newPreviews = [...imagePreviews];
        const newBase64s = [...imageBase64s];
        
        for (const file of files) {
          newFiles.push(file);
          
          // Create preview URL
          const previewUrl = URL.createObjectURL(file);
          newPreviews.push(previewUrl);
          
          // Convert to base64
          const base64 = await convertToBase64(file);
          newBase64s.push(base64);
        }
        
        setImageFiles(newFiles);
        setImagePreviews(newPreviews);
        setImageBase64s(newBase64s);
        
        // Reset the file input
        const imageInput = document.getElementById('image-files') as HTMLInputElement;
        if (imageInput) imageInput.value = '';
      } catch (error) {
        console.error('Error processing images:', error);
        alert('Error processing image files');
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageBase64s(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments: Attachment[] = [];
    
    for (const file of files) {
      const base64 = await convertToBase64(file);
      newAttachments.push({
        name: file.name,
        url: '',
        type: file.type.split('/')[1] || file.name.split('.').pop() || 'file',
        file: file,
        base64: base64
      });
    }
    
    setAttachments(prev => [...prev, ...newAttachments]);
    
    // Reset the file input
    const fileInput = document.getElementById('attachment-files') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare update data
    const updateData = {
      id: isEditing && update ? update.id : '',
      title,
      content,
      type,
      postedAt: isEditing && update ? update.postedAt : new Date(),
      imageBase64s: imageBase64s.length > 0 ? imageBase64s : undefined,
      imageUrl: imagePreviews.length > 0 ? imagePreviews[0] : '',
      images: imagePreviews,
      attachments: attachments.length > 0 ? attachments : []
    };

    console.log('Update Data:', updateData);
    onSave(updateData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3 sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold">
            {isEditing ? 'Edit Update' : 'Add New Update'}
          </h3>
          <button 
            onClick={onCancel} 
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none p-1"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${
                type === 'latest-news' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="latest-news"
                  checked={type === 'latest-news'}
                  onChange={(e) => setType(e.target.value as 'latest-news')}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-2xl mb-2">📰</div>
                  <div className="font-medium">Latest News</div>
                </div>
              </label>
              
              <label className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${
                type === 'upcoming-event' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="upcoming-event"
                  checked={type === 'upcoming-event'}
                  onChange={(e) => setType(e.target.value as 'upcoming-event')}
                  className="sr-only"
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
            <label className="block text-sm font-medium mb-2">Title</label>
            <input 
              type="text" 
              placeholder="Enter title" 
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea 
              placeholder="Enter content" 
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]" 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              required
            />
          </div>

          {/* Images Upload Section */}
          <div>
            <label className="block text-sm font-medium mb-2">Images</label>
            <div className="space-y-4">
              <input
                id="image-files"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={preview} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-32 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                      <div className="text-xs text-gray-500 mt-1">
                        Image {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Attachments Section */}
          <div>
            <label className="block text-sm font-medium mb-2">Attachments</label>
            <div className="space-y-4">
              <input
                id="attachment-files"
                type="file"
                multiple
                onChange={handleFileUpload}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-3 text-xl">
                          {attachment.type === 'pdf' ? '📄' : 
                           attachment.type === 'doc' || attachment.type === 'docx' ? '📝' : 
                           '📎'}
                        </span>
                        <div>
                          <div className="font-medium">{attachment.name}</div>
                          <div className="text-sm text-gray-500">{attachment.type.toUpperCase()}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button 
              type="button" 
              onClick={onCancel} 
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`px-6 py-2 text-white rounded font-medium transition-colors ${
                type === 'upcoming-event' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isEditing ? 'Update' : 'Create'} {type === 'upcoming-event' ? 'Event' : 'News'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateForm;