import React, { useState, useEffect } from 'react';
import { Update } from '../../../../pages/admin/AdminUpdatesPage';

interface UpdateFormProps {
  isOpen: boolean;
  isEditing: boolean;
  update: Update | null;
  categories: string[];
  onSave: (update: Update) => void;
  onCancel: () => void;
}

interface Attachment {
  name: string;
  url: string;
  type: string;
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
  const [imageUrl, setImageUrl] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentType, setAttachmentType] = useState('pdf');

  useEffect(() => {
    if (isEditing && update) {
      setTitle(update.title);
      setContent(update.content);
      setCategory(update.category);
      setPostedBy(update.postedBy);
      setImageUrl(update.imageUrl || '');
      setAttachments(update.attachments || []);
    } else {
      setTitle('');
      setContent('');
      setCategory(categories[0] || '');
      setPostedBy('');
      setImageUrl('');
      setAttachments([]);
    }
  }, [isEditing, update, categories]);

  if (!isOpen) return null;

  const handleAddAttachment = () => {
    if (attachmentName && attachmentUrl) {
      setAttachments([...attachments, { name: attachmentName, url: attachmentUrl, type: attachmentType }]);
      setAttachmentName('');
      setAttachmentUrl('');
      setAttachmentType('pdf');
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: isEditing && update ? update.id : '',
      title,
      content,
      category,
      postedBy,
      postedAt: isEditing && update ? update.postedAt : new Date(),
      imageUrl: imageUrl || undefined,
      attachments: attachments.length > 0 ? attachments : undefined
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-xl font-bold">{isEditing ? 'Edit Update' : 'Add New Update'}</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <input type="text" placeholder="Title" className="w-full p-2 border rounded" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <select className="w-full p-2 border rounded" value={category} onChange={(e) => setCategory(e.target.value)} required>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <input type="text" placeholder="Posted By" className="w-full p-2 border rounded" value={postedBy} onChange={(e) => setPostedBy(e.target.value)} required />
          <textarea placeholder="Content" className="w-full p-2 border rounded" rows={5} value={content} onChange={(e) => setContent(e.target.value)} required></textarea>
          <input type="text" placeholder="Image URL (optional)" className="w-full p-2 border rounded" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          
          <div>
            <h4 className="text-sm font-medium mb-2">Attachments</h4>
            {attachments.map((attachment, index) => (
              <div key={index} className="flex justify-between items-center border p-2 rounded mb-2">
                <span>{attachment.name} ({attachment.type})</span>
                <button type="button" onClick={() => handleRemoveAttachment(index)} className="text-red-500 hover:text-red-700">Remove</button>
              </div>
            ))}
            
            <div className="grid grid-cols-3 gap-2">
              <input type="text" placeholder="Attachment Name" className="p-2 border rounded" value={attachmentName} onChange={(e) => setAttachmentName(e.target.value)} />
              <input type="text" placeholder="Attachment URL" className="p-2 border rounded" value={attachmentUrl} onChange={(e) => setAttachmentUrl(e.target.value)} />
              <select className="p-2 border rounded" value={attachmentType} onChange={(e) => setAttachmentType(e.target.value)}>
                <option value="pdf">PDF</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
              <button type="button" onClick={handleAddAttachment} className="col-span-3 p-2 bg-blue-500 text-white rounded hover:bg-blue-700">Add Attachment</button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateForm;
