import { useState, useRef } from 'react';
import { uploadToIPFS } from '../config/ipfs';

const IPFSFileUploader = ({ 
  onFileUploaded, 
  onProgress, 
  acceptedFileTypes = 'application/pdf', 
  maxSizeMB = 10,
  metadataExtractor = null
}) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Check file type
      if (acceptedFileTypes && !selectedFile.type.match(acceptedFileTypes)) {
        setError(`Invalid file type. Only ${acceptedFileTypes} files are accepted`);
        return;
      }
      
      // Check file size (max size in MB)
      if (selectedFile.size > maxSizeMB * 1024 * 1024) {
        setError(`File size exceeds ${maxSizeMB}MB limit`);
        return;
      }
      
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileSize(selectedFile.size);
      setError('');
    }
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Trigger file selection dialog
  const handleSelectFile = () => {
    fileInputRef.current.click();
  };

  // Upload file to IPFS
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      setIsUploading(true);
      setError('');
      setUploadProgress(0);

      // Extract metadata if provided
      let metadata = {};
      if (typeof metadataExtractor === 'function') {
        metadata = metadataExtractor(file);
      }

      // Upload to IPFS
      const result = await uploadToIPFS(
        file,
        fileName,
        metadata,
        (progress) => {
          setUploadProgress(progress);
          if (onProgress) onProgress(progress);
        }
      );

      // Callback with result
      if (onFileUploaded) {
        onFileUploaded(result, file);
      }

      return result;
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Failed to upload: ${err.message}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={acceptedFileTypes}
      />

      {/* File selection area */}
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                   ${file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-orion-primary hover:bg-gray-50'}`}
        onClick={handleSelectFile}
      >
        {!file && (
          <>
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              Click to select or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {acceptedFileTypes.includes('pdf') ? 'PDF' : acceptedFileTypes} up to {maxSizeMB}MB
            </p>
          </>
        )}

        {file && (
          <div className="flex flex-col items-center">
            <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-2 text-sm font-medium text-gray-900 truncate max-w-xs">
              {fileName}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(fileSize)}
            </p>
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setFileName('');
                setFileSize(0);
              }}
              className="mt-2 text-xs text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Upload button */}
      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || isUploading}
        className={`mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                  ${!file || isUploading 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
        aria-label="Upload file to IPFS"
      >
        {isUploading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading ({uploadProgress}%)
          </span>
        ) : 'Upload to IPFS'}
      </button>

      {/* Progress bar */}
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
          <div 
            className="bg-orion-primary h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default IPFSFileUploader; 