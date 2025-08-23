// import React, { useState, useEffect } from 'react';
// import { Update } from '../../../../pages/admin/AdminUpdatesPage';

// interface UpdateFormProps {
//   isOpen: boolean;
//   isEditing: boolean;
//   update: Update | null;
//   categories: string[];
//   onSave: (update: Update) => void;
//   onCancel: () => void;
// }

// interface Attachment {
//   name: string;
//   url: string;
//   type: string;
// }

// const UpdateModal: React.FC<UpdateFormProps> = ({ 
//   isOpen, 
//   isEditing, 
//   update, 
//   categories, 
//   onSave, 
//   onCancel 
// }) => {
//   const [title, setTitle] = useState('');
//   const [content, setContent] = useState('');
//   const [category, setCategory] = useState(categories[0] || '');
//   const [postedBy, setPostedBy] = useState('');
//   const [imageUrl, setImageUrl] = useState('');
//   const [attachments, setAttachments] = useState<Attachment[]>([]);
  
//   const [attachmentName, setAttachmentName] = useState('');
//   const [attachmentUrl, setAttachmentUrl] = useState('');
//   const [attachmentType, setAttachmentType] = useState('pdf');

//   useEffect(() => {
//     if (isEditing && update) {
//       setTitle(update.title);
//       setContent(update.content);
//       setCategory(update.category);
//       setPostedBy(update.postedBy);
//       setImageUrl(update.imageUrl || '');
//       setAttachments(update.attachments || []);
//     } else {
//       setTitle('');
//       setContent('');
//       setCategory(categories[0] || '');
//       setPostedBy('');
//       setImageUrl('');
//       setAttachments([]);
//     }
//   }, [isEditing, update, categories]);

//   if (!isOpen) return null;

//   const handleAddAttachment = () => {
//     if (attachmentName && attachmentUrl) {
//       setAttachments([...attachments, { name: attachmentName, url: attachmentUrl, type: attachmentType }]);
//       setAttachmentName('');
//       setAttachmentUrl('');
//       setAttachmentType('pdf');
//     }
//   };

//   const handleRemoveAttachment = (index: number) => {
//     setAttachments(attachments.filter((_, i) => i !== index));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSave({
//       id: isEditing && update ? update.id : '',
//       title,
//       content,
//       category,
//       postedBy,
//       postedAt: isEditing && update ? update.postedAt : new Date(),
//       imageUrl: imageUrl || undefined,
//       attachments: attachments.length > 0 ? attachments : undefined
//     });
//   };

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6">
//         <div className="flex justify-between items-center border-b pb-3">
//           <h3 className="text-xl font-bold">{isEditing ? 'Edit Update' : 'Add New Update'}</h3>
//           <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">&times;</button>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4 mt-4">
//           <input type="text" placeholder="Title" className="w-full p-2 border rounded" value={title} onChange={(e) => setTitle(e.target.value)} required />
//           <select className="w-full p-2 border rounded" value={category} onChange={(e) => setCategory(e.target.value)} required>
//             {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
//           </select>
//           <input type="text" placeholder="Posted By" className="w-full p-2 border rounded" value={postedBy} onChange={(e) => setPostedBy(e.target.value)} required />
//           <textarea placeholder="Content" className="w-full p-2 border rounded" rows={5} value={content} onChange={(e) => setContent(e.target.value)} required></textarea>
//           <input type="text" placeholder="Image URL (optional)" className="w-full p-2 border rounded" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          
//           <div>
//             <h4 className="text-sm font-medium mb-2">Attachments</h4>
//             {attachments.map((attachment, index) => (
//               <div key={index} className="flex justify-between items-center border p-2 rounded mb-2">
//                 <span>{attachment.name} ({attachment.type})</span>
//                 <button type="button" onClick={() => handleRemoveAttachment(index)} className="text-red-500 hover:text-red-700">Remove</button>
//               </div>
//             ))}
            
//             <div className="grid grid-cols-3 gap-2">
//               <input type="text" placeholder="Attachment Name" className="p-2 border rounded" value={attachmentName} onChange={(e) => setAttachmentName(e.target.value)} />
//               <input type="text" placeholder="Attachment URL" className="p-2 border rounded" value={attachmentUrl} onChange={(e) => setAttachmentUrl(e.target.value)} />
//               <select className="p-2 border rounded" value={attachmentType} onChange={(e) => setAttachmentType(e.target.value)}>
//                 <option value="pdf">PDF</option>
//                 <option value="image">Image</option>
//                 <option value="video">Video</option>
//               </select>
//               <button type="button" onClick={handleAddAttachment} className="col-span-3 p-2 bg-blue-500 text-white rounded hover:bg-blue-700">Add Attachment</button>
//             </div>
//           </div>

//           <div className="flex justify-end space-x-3 mt-4">
//             <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
//             <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Save</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default UpdateModal;


// components/modals/admin/news/UpdateForm.tsx


// components/modals/admin/news/UpdateForm.tsx
import React, { useState, useEffect } from 'react';


interface UpdateFormData {
  title: string;
  content: string;
  category: string;
  image?: File;
  attachments?: File[];
  removeImage?: boolean;
}

interface UpdateFormProps {
  isOpen: boolean;
  isEditing: boolean;
  isSubmitting?: boolean;
  update?: any | null;          // For populating form when editing
  categories: string[];
  onSave: (formData: UpdateFormData) => Promise<void>;  // Form data with Files
  onCancel: () => void;
}

const UpdateForm: React.FC<UpdateFormProps> = ({
  isOpen,
  isEditing,
  isSubmitting = false,
  update,
  categories,
  onSave,
  onCancel
}) => {
  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    category: string;
  }>({
    title: '',
    content: '',
    category: categories[0] || '',
  });
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedAttachments, setSelectedAttachments] = useState<File[]>([]);
  const [removeImage, setRemoveImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Initialize form data when update prop changes
  useEffect(() => {
    if (update) {
      setFormData({
        title: update.title,
        content: update.content,
        category: update.category,
      });
      setImagePreview(update.imageUrl || '');
      setRemoveImage(false);
    } else {
      setFormData({
        title: '',
        content: '',
        category: categories[0] || '',
      });
      setImagePreview('');
      setRemoveImage(false);
    }
    setSelectedImage(null);
    setSelectedAttachments([]);
  }, [update, categories]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setRemoveImage(false);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle attachment selection
  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedAttachments(prev => [...prev, ...files]);
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setSelectedAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Remove image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    setRemoveImage(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: UpdateFormData = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      category: formData.category,
      image: selectedImage || undefined,
      attachments: selectedAttachments.length > 0 ? selectedAttachments : undefined,
      removeImage: removeImage && !selectedImage
    };
    
    await onSave(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {isEditing ? 'Edit Update' : 'Add New Update'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={4}
                value={formData.content}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Image */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                Image
              </label>
              
              {imagePreview && !removeImage && (
                <div className="mt-2 mb-2">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="h-32 w-32 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="ml-2 text-red-600 hover:text-red-800 text-sm"
                    disabled={isSubmitting}
                  >
                    Remove Image
                  </button>
                </div>
              )}
              
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isSubmitting}
              />
            </div>

            {/* Attachments */}
            <div>
              <label htmlFor="attachments" className="block text-sm font-medium text-gray-700">
                Attachments
              </label>
              
              {selectedAttachments.length > 0 && (
                <div className="mt-2 mb-2">
                  <p className="text-sm text-gray-600">Selected files:</p>
                  <ul className="text-sm text-gray-700">
                    {selectedAttachments.map((file, index) => (
                      <li key={index} className="flex justify-between items-center">
                        <span>{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-600 hover:text-red-800 ml-2"
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
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isSubmitting}
              />
            </div>

            {/* Existing attachments for editing */}
            {isEditing && update?.attachments && update.attachments.length > 0 && (
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">
                  Existing Attachments
                </p>
                <ul className="text-sm text-gray-700">
                  {update.attachments.map((attachment:any, index:any) => (
                    <li key={index} className="flex justify-between items-center">
                      <a 
                        href={attachment.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {attachment.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  isEditing ? 'Update' : 'Create'
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