import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import IPFSFileUploader from '../components/IPFSFileUploader';
import { getIPFSGatewayURL } from '../config/ipfs';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const SubmitPaper = () => {
  const { currentUser, walletAddress, isWalletConnected, connectWallet } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [researchField, setResearchField] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [stakeAmount] = useState(0.05); // Fixed stake amount in ETH
  const [ipfsResult, setIpfsResult] = useState(null);
  
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
  
  // Handle IPFS upload completion
  const handleFileUploaded = (result, file) => {
    console.log('File uploaded to IPFS:', result);
    setIpfsResult(result);
    setFileName(file.name);
    setFileSize(file.size);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if wallet is connected
    if (!isWalletConnected()) {
      setError('Please connect your wallet first to submit a paper');
      return;
    }
    
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
    
    // If we already have an IPFS result, we can move to step 2
    // Otherwise, we need to show an error
    if (!ipfsResult) {
      setError('Please upload your paper (PDF format) to IPFS first');
      return;
    }
    
    // Move to step 2 (review & stake)
    setStep(2);
  };
  
  // Handle final submission with stake
  const handleStakeAndSubmit = async () => {
    // Double-check wallet connection
    if (!isWalletConnected()) {
      setError('Please connect your wallet first to submit a paper');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // We already have the IPFS result from the uploader
      if (!ipfsResult) {
        throw new Error('File not uploaded to IPFS');
      }
      
      // Process payment/stake on blockchain (mock implementation)
      await processStake();
      
      // Store metadata in Firestore
      await storeMetadata(ipfsResult);
      
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
  
  // Store paper metadata in Firestore
  const storeMetadata = async (ipfsResult) => {
    if (!currentUser) throw new Error('User not authenticated');
    if (!ipfsResult || !ipfsResult.IpfsHash) throw new Error('Invalid IPFS result');
    if (!walletAddress) throw new Error('Wallet not connected');
    
    try {
      // Create a new paper document in Firestore
      const paperRef = doc(collection(db, 'papers'));
      const paperData = {
        id: paperRef.id,
        title,
        abstract,
        researchField,
        teamMembers: teamMembers || '',
        authorUid: currentUser.uid,
        authorEmail: currentUser.email,
        authorName: currentUser.displayName || 'Anonymous Researcher',
        authorWallet: walletAddress,
        ipfsHash: ipfsResult.IpfsHash,
        fileUrl: getIPFSGatewayURL(ipfsResult.IpfsHash),
        fileName,
        fileSize,
        stakeAmount,
        status: 'pending',
        submissionDate: serverTimestamp(),
        votes: {
          approve: 0,
          reject: 0,
          totalVotes: 0
        },
        comments: []
      };
      
      await setDoc(paperRef, paperData);
      return paperRef.id;
    } catch (error) {
      console.error('Firestore storage error:', error);
      throw new Error(`Failed to store metadata: ${error.message}`);
    }
  };
  
  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError('Failed to connect wallet. Please try again.');
    }
  };
  
  // Mock blockchain stake transaction
  const processStake = async () => {
    if (!isWalletConnected()) {
      throw new Error('Wallet connection required for staking');
    }
    
    // Since we have access to the wallet through AuthContext, we could
    // implement a real blockchain transaction here using ethers.js
    
    try {
      // In a real implementation, this would use the signer from AuthContext
      // to send a transaction to the smart contract
      
      // Mock blockchain transaction with a delay to simulate network time
      return new Promise((resolve) => {
        console.log(`Processing stake of ${stakeAmount} ETH from ${walletAddress}`);
        setTimeout(() => {
          // Mock transaction hash
          resolve('0x' + Math.random().toString(16).substring(2, 42));
        }, 2000);
      });
    } catch (error) {
      console.error('Blockchain transaction error:', error);
      throw new Error(`Stake transaction failed: ${error.message}`);
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
  
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Submit Research Paper</h1>
        
        {/* Wallet connection notice */}
        {!isWalletConnected() && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6" role="alert">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-yellow-600 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Wallet connection required!</span>
            </div>
            <p className="mt-1 ml-7">You need to connect your wallet to submit a paper. Staking requires a connected wallet.</p>
            <div className="mt-3 ml-7">
              <button
                onClick={handleConnectWallet}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        )}
        
        {/* Step indicator */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-orion-primary' : 'bg-gray-300'} text-white`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-orion-primary' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-orion-primary' : 'bg-gray-300'} text-white`}>
              2
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <div className="text-sm text-gray-600">Paper Details</div>
            <div className="text-sm text-gray-600">Review & Stake</div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            {error}
          </div>
        )}
        
        {/* Step 1: Paper Details Form */}
        {step === 1 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Paper Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orion-primary focus:border-orion-primary"
                placeholder="Enter the title of your research paper"
                required
              />
            </div>
            
            {/* Abstract */}
            <div>
              <label htmlFor="abstract" className="block text-sm font-medium text-gray-700">
                Abstract <span className="text-red-500">*</span>
              </label>
              <textarea
                id="abstract"
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                rows={5}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orion-primary focus:border-orion-primary"
                placeholder="Enter a brief summary of your research"
                required
              />
            </div>
            
            {/* Team Members */}
            <div>
              <label htmlFor="teamMembers" className="block text-sm font-medium text-gray-700">
                Team Members (Optional)
              </label>
              <input
                type="text"
                id="teamMembers"
                value={teamMembers}
                onChange={(e) => setTeamMembers(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orion-primary focus:border-orion-primary"
                placeholder="Enter names of co-authors or team members"
              />
              <p className="mt-1 text-xs text-gray-500">
                Separate names with commas
              </p>
            </div>
            
            {/* Research Field */}
            <div>
              <label htmlFor="researchField" className="block text-sm font-medium text-gray-700">
                Research Field <span className="text-red-500">*</span>
              </label>
              <select
                id="researchField"
                value={researchField}
                onChange={(e) => setResearchField(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orion-primary focus:border-orion-primary"
                required
              >
                <option value="">Select Research Field</option>
                {researchFields.map((field) => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>
            
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paper File (PDF) <span className="text-red-500">*</span>
              </label>
              
              <IPFSFileUploader
                onFileUploaded={handleFileUploaded}
                onProgress={setUploadProgress}
                acceptedFileTypes="application/pdf"
                maxSizeMB={10}
                metadataExtractor={(file) => ({
                  title,
                  abstract: abstract.substring(0, 100) + '...',
                  researchField,
                  authorUid: currentUser.uid,
                  authorEmail: currentUser.email,
                  teamMembers: teamMembers || 'Solo author',
                  submissionDate: new Date().toISOString()
                })}
              />
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orion-primary hover:bg-orion-primaryDark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orion-primary"
              >
                Continue to Review
              </button>
            </div>
          </form>
        )}
        
        {/* Step 2: Review and Stake */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Paper Submission Review
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Please review the details before finalizing your submission
                </p>
              </div>
              
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Title</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{title}</dd>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Research Field</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{researchField}</dd>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Abstract</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {abstract}
                    </dd>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Team Members</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {teamMembers || 'Solo Author'}
                    </dd>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">File</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {fileName} ({formatFileSize(fileSize)})
                    </dd>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">IPFS Hash</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {ipfsResult?.IpfsHash}
                    </dd>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Required Stake</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {stakeAmount} ETH
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Submitting this paper requires a stake of {stakeAmount} ETH. This stake will be returned to you if your paper passes the review process.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orion-primary"
              >
                Back to Edit
              </button>
              
              <button
                type="button"
                onClick={handleStakeAndSubmit}
                disabled={isSubmitting || !isWalletConnected()}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  isWalletConnected() 
                    ? 'bg-orion-primary hover:bg-orion-primaryDark' 
                    : 'bg-gray-400 cursor-not-allowed'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orion-primary`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Stake & Submit Paper'}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SubmitPaper; 