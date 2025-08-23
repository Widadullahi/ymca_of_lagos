// import React, { useState, useEffect } from 'react';
// import { Update } from '../../../../pages/admin/AdminUpdatesPage';

// interface UpdateFormProps {
//   isOpen: boolean;
//   isEditing: boolean;
//   update: Update | null;
//   categories: string[];
//   onSave: (update: any) => void;
//   onCancel: () => void;
// }

// interface Attachment {
//   name: string;
//   url: string;
//   type: string;
// }

// const UpdateForm: React.FC<UpdateFormProps> = ({ 
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
//           {/* <input type="text" placeholder="Posted By" className="w-full p-2 border rounded" value={postedBy} onChange={(e) => setPostedBy(e.target.value)} required /> */}
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

// export default UpdateForm;


import React, { useState, useEffect } from 'react';
import { Update } from '../../../../pages/admin/AdminUpdatesPage';

interface UpdateFormProps {
  isOpen: boolean;
  isEditing: boolean;
  update: Update | null;
  categories: string[];
  onSave: (update: any) => void;
  onCancel: () => void;
}

interface Attachment {
  name: string;
  url: string;
  type: string;
  file?: File; // Add file object for new uploads
  base64?: string; // Add base64 string for new uploads
}

const UpdateForm: React.FC<UpdateFormProps> = ({ 
  isOpen, 
  isEditing, 
  update, 
  categories, 
  onSave, 
  onCancel 
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(categories[0] || '');
  const [postedBy, setPostedBy] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

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
      setCategory(update.category);
      setPostedBy(update.postedBy);
      setImagePreview(update.imageUrl || '');
      setAttachments(update.attachments || []);
    } else {
      setTitle('');
      setContent('');
      setCategory(categories[0] || '');
      setPostedBy('');
      setImageFile(null);
      setImagePreview('');
      setImageBase64('');
      setAttachments([]);
    }
  }, [isEditing, update, categories]);

  if (!isOpen) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setImageFile(file);
        
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        
        // Convert to base64
        const base64 = await convertToBase64(file);
        setImageBase64(base64);
      } catch (error) {
        console.error('Error converting image to base64:', error);
        alert('Error processing image file');
      }
    }
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentFile(file);
    }
  };

  const handleAddAttachment = async () => {
    if (attachmentFile) {
      try {
        const fileType = attachmentFile.type.startsWith('image/') ? 'image' : 
                        attachmentFile.type === 'application/pdf' ? 'pdf' : 
                        attachmentFile.type.startsWith('video/') ? 'video' : 'document';
        
        // Convert file to base64
        const base64 = await convertToBase64(attachmentFile);
        
        setAttachments([...attachments, { 
          name: attachmentFile.name, 
          url: '', // Will be set after upload or can be removed if using base64 only
          type: fileType,
          base64: base64,
          file: attachmentFile // Keep for reference if needed
        }]);
        setAttachmentFile(null);
        
        // Reset the file input
        const fileInput = document.getElementById('attachment-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } catch (error) {
        console.error('Error converting attachment to base64:', error);
        alert('Error processing attachment file');
      }
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageBase64('');
    
    // Reset the file input
    const imageInput = document.getElementById('image-file') as HTMLInputElement;
    if (imageInput) imageInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Pass the base64 data to the parent component
    const updateData = {
      id: isEditing && update ? update.id : '',
      title,
      content,
      category,
      postedBy,
      postedAt: isEditing && update ? update.postedAt : new Date(),
      imageBase64: imageBase64 || undefined,
      imageUrl: !imageBase64 && isEditing ? update?.imageUrl : imageBase64,
      attachments: attachments.length > 0 ? attachments : undefined
    };

    onSave(updateData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-xl font-bold">{isEditing ? 'Edit Update' : 'Add New Update'}</h3>
          <button 
            onClick={onCancel} 
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <input 
            type="text" 
            placeholder="Title" 
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
          />
          
          <select 
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
            required
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          
          <textarea 
            placeholder="Content" 
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
            rows={5} 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            required
          />
          
          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium mb-2">Featured Image</label>
            <input
              id="image-file"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {imagePreview && (
              <div className="mt-2 relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-w-full h-32 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          
          {/* Attachments Section */}
          <div>
            <h4 className="text-sm font-medium mb-2">Attachments</h4>
            {attachments.map((attachment, index) => (
              <div key={index} className="flex justify-between items-center border p-2 rounded mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded">{attachment.type}</span>
                  <span>{attachment.name}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => handleRemoveAttachment(index)} 
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
            
            <div className="space-y-2">
              <input
                id="attachment-file"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,image/*,video/*"
                onChange={handleAttachmentChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {attachmentFile && (
                <div className="text-sm text-gray-600">
                  Selected: {attachmentFile.name} ({(attachmentFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
              <button 
                type="button" 
                onClick={handleAddAttachment} 
                disabled={!attachmentFile}
                className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {attachmentFile ? 'Add Attachment' : 'Select File First'}
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button 
              type="button" 
              onClick={onCancel} 
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 font-medium"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateForm;