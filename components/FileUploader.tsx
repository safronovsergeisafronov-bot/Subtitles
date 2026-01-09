
import React, { useRef } from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        onFileSelect(file);
      }
    }
  };

  return (
    <div 
      className={`relative border-2 border-dashed rounded-xl p-12 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer
        ${disabled ? 'border-gray-700 opacity-50' : 'border-indigo-500/50 hover:border-indigo-500 hover:bg-indigo-500/5 bg-slate-800/50'}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        className="hidden" 
        accept="video/mp4,video/quicktime"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold mb-2">Upload Reels Video</h3>
      <p className="text-slate-400 text-center max-w-xs">
        Drag & drop MP4 or MOV files here, or click to browse. (Max 3-5 mins)
      </p>
    </div>
  );
};

export default FileUploader;
