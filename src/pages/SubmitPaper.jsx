import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

const SubmitPaper = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [researchField, setResearchField] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [stakeAmount] = useState(0.05); // Fixed stake amount in ETH
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Form, 2: Review & Stake
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Research fields options (for dropdown)
  const researchFields = [
    'Computer Science', 
    'Mathematics', 
    'Physics', 
    'Chemistry', 
    'Biology', 
    'Medicine', 
    'Economics', 
    'Psychology', 
    'Sociology',
    'Philosophy',
    'Linguistics',
    'Arts & Humanities',
    'Engineering',
    'Environmental Science',
    'Blockchain & Cryptography',
    'Artificial Intelligence',
    'Other'
  ];
  
  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Check file type (only PDF allowed)
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are accepted');
        return;
      }
      
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit');
        return;
      }
      
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileSize(selectedFile.size);
      setError('');
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!abstract.trim()) {
      setError('Abstract is required');
      return;
    }
    
    if (!researchField) {
      setError('Research field is required');
      return;
    }
    
    if (!file) {
      setError('Please upload your paper (PDF format)');
      return;
    }
    
    // Move to step 2 (review & stake)
    setStep(2);
  };
  
  // Handle final submission with stake
  const handleStakeAndSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      
      // 1. Upload file to IPFS (mock implementation)
      await uploadToIPFS();
      
      // 2. Process payment/stake on blockchain (mock implementation)
      await processStake();
      
      // 3. Store metadata in Firestore (mock implementation)
      await storeMetadata();
      
      // Success! Navigate to confirmation or dashboard
      navigate('/dashboard', { 
        state: { notification: 'Paper submitted successfully!' } 
      });
      
    } catch (err) {
      console.error('Submission error:', err);
      setError(`Failed to submit paper: ${err.message}`);
      setIsSubmitting(false);
    }
  };
  
  // Mock IPFS upload with progress
  const uploadToIPFS = () => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          resolve('QmYourIPFSHashHere'); // Mock IPFS CID
        }
      }, 300);
    });
  };
  
  // Mock blockchain stake transaction
  const processStake = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('0xYourTransactionHashHere');
      }, 2000);
    });
  };
  
  // Mock Firestore storage
  const storeMetadata = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  };
  
  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-orion-darkGray mb-2">
            Submit Academic Paper
          </h1>
          <p className="text-gray-600">
            Submit your research for review, verification, and blockchain certification.
          </p>
        </div>
        
        {/* Progress steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
                step >= 1 ? 'bg-orion-darkGray text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <div className="ml-2">
                <div className="text-sm font-medium text-orion-darkGray">Paper Details</div>
              </div>
            </div>
            
            <div className="flex-1 mx-4">
              <div className={`h-1 ${step >= 2 ? 'bg-orion-darkGray' : 'bg-gray-200'}`}></div>
            </div>
            
            <div className="flex items-center">
              <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
                step >= 2 ? 'bg-orion-darkGray text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <div className="ml-2">
                <div className="text-sm font-medium text-orion-darkGray">Stake & Submit</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p className="font-medium">Submission Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {/* Step 1: Paper details form */}
        {step === 1 && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-orion-darkGray mb-1">
                  Paper Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orion-darkGray focus:border-transparent"
                  placeholder="Enter the title of your paper"
                  tabIndex="0"
                />
              </div>
              
              {/* Abstract */}
              <div>
                <label htmlFor="abstract" className="block text-sm font-medium text-orion-darkGray mb-1">
                  Abstract <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="abstract"
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  rows="5"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orion-darkGray focus:border-transparent"
                  placeholder="Provide a brief summary of your research paper"
                  tabIndex="0"
                ></textarea>
                <p className="mt-1 text-sm text-gray-500">
                  {abstract.length}/500 characters (max)
                </p>
              </div>
              
              {/* Team Members */}
              <div>
                <label htmlFor="teamMembers" className="block text-sm font-medium text-orion-darkGray mb-1">
                  Co-Authors / Team Members
                </label>
                <input
                  id="teamMembers"
                  type="text"
                  value={teamMembers}
                  onChange={(e) => setTeamMembers(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orion-darkGray focus:border-transparent"
                  placeholder="Enter names of co-authors separated by commas"
                  tabIndex="0"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter names of all contributors, separated by commas
                </p>
              </div>
              
              {/* Research Field */}
              <div>
                <label htmlFor="researchField" className="block text-sm font-medium text-orion-darkGray mb-1">
                  Research Field <span className="text-red-500">*</span>
                </label>
                <select
                  id="researchField"
                  value={researchField}
                  onChange={(e) => setResearchField(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orion-darkGray focus:border-transparent"
                  tabIndex="0"
                >
                  <option value="">Select a research field</option>
                  {researchFields.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-orion-darkGray mb-1">
                  Upload Paper (PDF only) <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-orion-darkGray hover:text-orion-mediumGray focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept=".pdf"
                          className="sr-only"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                          tabIndex="0"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF up to 10MB</p>
                    
                    {file && (
                      <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center">
                          <svg className="w-6 h-6 text-orion-darkGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <div className="ml-2">
                            <p className="text-sm font-medium text-orion-darkGray">{fileName}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(fileSize)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFile(null);
                            setFileName('');
                            setFileSize(0);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="text-gray-400 hover:text-gray-500"
                          tabIndex="0"
                          aria-label="Remove file"
                        >
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-orion-darkGray hover:bg-orion-mediumGray focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orion-darkGray"
                tabIndex="0"
                aria-label="Continue to stake and submit"
              >
                Continue to Stake & Submit
                <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </form>
        )}
        
        {/* Step 2: Review & Stake */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-orion-darkGray mb-4">
              Review and Submit
            </h2>
            
            <div className="grid grid-cols-1 gap-6 mb-8">
              {/* Paper summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-orion-darkGray mb-2">Paper Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Title</p>
                    <p className="font-medium text-orion-darkGray">{title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Research Field</p>
                    <p className="font-medium text-orion-darkGray">{researchField}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Authors</p>
                    <p className="font-medium text-orion-darkGray">
                      {currentUser?.email}
                      {teamMembers && `, ${teamMembers}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">File</p>
                    <p className="font-medium text-orion-darkGray">{fileName} ({formatFileSize(fileSize)})</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Abstract</p>
                  <p className="text-orion-darkGray">{abstract}</p>
                </div>
              </div>
              
              {/* Stake information */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-orion-darkGray mb-4">Staking Information</h3>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="ml-2 text-sm text-blue-800">
                      By staking, you're confirming that this is your original work. Stake will be returned after successful verification.
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="font-medium text-orion-darkGray">Required Stake Amount:</span>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-600 mr-1" viewBox="0 0 33 53" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.3576 0L16 1.11273V36.3028L16.3576 36.6611L32.2976 27.5559L16.3576 0Z" fill="#343434"/>
                      <path d="M16.3578 0L0.417847 27.5559L16.3578 36.6611V19.6374V0Z" fill="#8C8C8C"/>
                      <path d="M16.3575 39.7374L16.1567 39.9827V52.4515L16.3575 53L32.3066 30.6377L16.3575 39.7374Z" fill="#3C3C3B"/>
                      <path d="M16.3578 53.0001V39.7375L0.417847 30.6378L16.3578 53.0001Z" fill="#8C8C8C"/>
                      <path d="M16.3575 36.6611L32.2973 27.556L16.3575 19.6375V36.6611Z" fill="#141414"/>
                      <path d="M0.417847 27.556L16.3576 36.6611V19.6375L0.417847 27.556Z" fill="#393939"/>
                    </svg>
                    <span className="text-xl font-bold text-orion-darkGray">{stakeAmount} ETH</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="font-medium text-orion-darkGray">Gas Fee (estimated):</span>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-600 mr-1" viewBox="0 0 33 53" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.3576 0L16 1.11273V36.3028L16.3576 36.6611L32.2976 27.5559L16.3576 0Z" fill="#343434"/>
                      <path d="M16.3578 0L0.417847 27.5559L16.3578 36.6611V19.6374V0Z" fill="#8C8C8C"/>
                      <path d="M16.3575 39.7374L16.1567 39.9827V52.4515L16.3575 53L32.3066 30.6377L16.3575 39.7374Z" fill="#3C3C3B"/>
                      <path d="M16.3578 53.0001V39.7375L0.417847 30.6378L16.3578 53.0001Z" fill="#8C8C8C"/>
                      <path d="M16.3575 36.6611L32.2973 27.556L16.3575 19.6375V36.6611Z" fill="#141414"/>
                      <path d="M0.417847 27.556L16.3576 36.6611V19.6375L0.417847 27.556Z" fill="#393939"/>
                    </svg>
                    <span className="text-orion-darkGray">~0.002 ETH</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-3">
                  <span className="font-medium text-orion-darkGray">Total:</span>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-600 mr-1" viewBox="0 0 33 53" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.3576 0L16 1.11273V36.3028L16.3576 36.6611L32.2976 27.5559L16.3576 0Z" fill="#343434"/>
                      <path d="M16.3578 0L0.417847 27.5559L16.3578 36.6611V19.6374V0Z" fill="#8C8C8C"/>
                      <path d="M16.3575 39.7374L16.1567 39.9827V52.4515L16.3575 53L32.3066 30.6377L16.3575 39.7374Z" fill="#3C3C3B"/>
                      <path d="M16.3578 53.0001V39.7375L0.417847 30.6378L16.3578 53.0001Z" fill="#8C8C8C"/>
                      <path d="M16.3575 36.6611L32.2973 27.556L16.3575 19.6375V36.6611Z" fill="#141414"/>
                      <path d="M0.417847 27.556L16.3576 36.6611V19.6375L0.417847 27.556Z" fill="#393939"/>
                    </svg>
                    <span className="text-xl font-bold text-orion-darkGray">~0.052 ETH</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Submission UI */}
            {isSubmitting ? (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-medium text-orion-darkGray text-center mb-4">
                  Submitting your paper...
                </h3>
                <div className="mb-4">
                  <div className="mb-2 flex justify-between">
                    <span className="text-sm font-medium text-orion-darkGray">
                      Uploading to IPFS
                    </span>
                    <span className="text-sm font-medium text-orion-darkGray">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-orion-darkGray to-orion-mediumGray h-2.5 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-center text-gray-500">
                  Please don't close this page. This process may take a few minutes.
                </p>
              </div>
            ) : (
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-orion-darkGray bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orion-darkGray"
                  tabIndex="0"
                  aria-label="Back to edit paper details"
                >
                  <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleStakeAndSubmit}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-orion-darkGray hover:bg-orion-mediumGray focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orion-darkGray"
                  tabIndex="0"
                  aria-label="Confirm submission and stake funds"
                >
                  Submit & Stake Funds
                  <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SubmitPaper; 