import axios from 'axios';
import FormData from 'form-data';

// Pinata API configuration
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || '6ad69da6572d489a729e';
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY || '52d4f44ac69de30806a540ba9157c0ec7164d688399a2b9f19cb6079a20cb5c5';
const PINATA_API_URL = 'https://api.pinata.cloud';

// Configure axios instance for Pinata
const pinataAxios = axios.create({
  baseURL: PINATA_API_URL,
  headers: {
    'pinata_api_key': PINATA_API_KEY,
    'pinata_secret_api_key': PINATA_SECRET_KEY
  }
});

/**
 * Upload a file to IPFS via Pinata
 * @param {File} file - The file object to upload
 * @param {string} name - Name for the file (used in metadata)
 * @param {Object} metadata - Additional metadata for the file
 * @param {Function} onProgress - Optional callback for upload progress
 * @returns {Promise<{ipfsHash: string, pinSize: number, timestamp: string}>} - IPFS upload result
 */
export const uploadToIPFS = async (file, name, metadata = {}, onProgress = null) => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Prepare metadata
    const pinataMetadata = {
      name: name || file.name,
      keyvalues: {
        ...metadata,
        uploadedBy: metadata.uploadedBy || 'Orion Platform',
        uploadDate: new Date().toISOString()
      }
    };
    
    formData.append('pinataMetadata', JSON.stringify(pinataMetadata));
    
    // Add options to prevent duplicate files
    const pinataOptions = {
      cidVersion: 1,
      wrapWithDirectory: false
    };
    
    formData.append('pinataOptions', JSON.stringify(pinataOptions));
    
    // Upload file with progress tracking
    const response = await pinataAxios.post('/pinning/pinFileToIPFS', formData, {
      maxBodyLength: 'Infinity', // Allow large file uploads
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
    
    console.log('IPFS upload result:', response.data);
    return response.data;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error(`Failed to upload to IPFS: ${error.message}`);
  }
};

/**
 * Get data about a file pinned to IPFS
 * @param {string} ipfsHash - The IPFS hash (CID) to query
 * @returns {Promise<Object>} - File data from Pinata
 */
export const getIPFSFile = async (ipfsHash) => {
  try {
    const response = await pinataAxios.get(`/pinning/pinList?status=pinned&hashContains=${ipfsHash}`);
    return response.data.rows[0] || null;
  } catch (error) {
    console.error('Error getting IPFS file data:', error);
    throw new Error(`Failed to get IPFS file data: ${error.message}`);
  }
};

/**
 * Unpin a file from IPFS via Pinata
 * @param {string} ipfsHash - The IPFS hash (CID) to unpin
 * @returns {Promise<Object>} - Unpin result
 */
export const unpinIPFSFile = async (ipfsHash) => {
  try {
    const response = await pinataAxios.delete(`/pinning/unpin/${ipfsHash}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error unpinning file from IPFS:', error);
    throw new Error(`Failed to unpin file: ${error.message}`);
  }
};

/**
 * Get the IPFS Gateway URL for a file
 * @param {string} ipfsHash - The IPFS hash (CID)
 * @returns {string} - The gateway URL
 */
export const getIPFSGatewayURL = (ipfsHash) => {
  // Using Pinata's dedicated gateway (if you have one) or public gateway
  return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
};

export default {
  uploadToIPFS,
  getIPFSFile,
  unpinIPFSFile,
  getIPFSGatewayURL
}; 