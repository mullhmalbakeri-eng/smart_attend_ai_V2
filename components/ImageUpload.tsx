"use client";

import { useState } from "react";

export default function ImageUpload({ userId }: { userId: number }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const file = fileInput.files?.[0];
    
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId.toString());

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('Image uploaded successfully!');
        setPreview(null);
        fileInput.value = '';
      } else {
        alert(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      alert('Upload failed: Network error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      
      {preview && (
        <div className="space-y-2">
          <img 
            src={preview} 
            alt="Preview" 
            className="h-32 w-32 object-cover rounded-lg"
          />
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>
      )}
    </div>
  );
}
