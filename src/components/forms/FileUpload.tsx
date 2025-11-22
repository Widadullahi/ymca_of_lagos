import React, { useRef, useState } from 'react';

interface FileUploadProps {
  label: string;
  name: string;
  onFileChange: (file: File) => void;
  preview: string | null;
  error?: string;
  wrapperClass?: string;
  isRounded?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  name,
  onFileChange,
  preview,
  error,
  wrapperClass = "mb-4",
  isRounded = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onFileChange(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={wrapperClass}>
      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
        {label}
      </label>
      <input
        type="file"
        ref={fileInputRef}
        id={name}
        name={name}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <div
        className={`w-full border-dashed border-2 p-4 text-center cursor-pointer ${error ? 'border-red-500' : 'border-gray-400'}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <img 
            src={preview} 
            alt="Preview" 
            className={`w-32 h-32 object-cover mx-auto ${isRounded ? 'rounded-full' : ''}`} 
          />
        ) : (
          <p className="text-gray-500">
            {dragActive ? 'Release to upload' : 'Drag and drop or click to upload'}
          </p>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-xs italic mt-1">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;