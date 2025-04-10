import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import IPFSFileUploader from '../components/IPFSFileUploader';
import { getIPFSGatewayURL } from '../config/ipfs';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ethers } from 'ethers';
import { checkPlagiarism, formatPlagiarismResults } from '../services/plagiarismService';

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
  const [stakeAmount] = useState(0.00006); // Fixed stake amount as required by the contract
  const [ipfsResult, setIpfsResult] = useState(null);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Form, 2: Review & Stake
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Plagiarism check state
  const [plagiarismCheckInProgress, setPlagiarismCheckInProgress] = useState(false);
  const [plagiarismResults, setPlagiarismResults] = useState(null);
  
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
  
  // Handle IPFS upload completion and initiate plagiarism check
  const handleFileUploaded = async (result, file) => {
    console.log('File uploaded to IPFS:', result);
    setIpfsResult(result);
    setFileName(file.name);
    setFileSize(file.size);
    
    // Start plagiarism check if we have a valid IPFS result
    if (result && result.IpfsHash) {
      const fileUrl = getIPFSGatewayURL(result.IpfsHash);
      await performPlagiarismCheck(fileUrl);
    }
  };
  
  // Perform plagiarism check on the uploaded file
  const performPlagiarismCheck = async (fileUrl) => {
    try {
      setPlagiarismCheckInProgress(true);
      setPlagiarismResults({
        status: 'pending',
        overallStatus: 'In Progress',
        isPlagiarized: false,
        matchesFound: 0
      });
      
      console.log('Starting plagiarism check for:', fileUrl);
      
      // Set a timeout for the API call to prevent long waits
      const timeoutDuration = 10000; // 10 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Plagiarism check timed out')), timeoutDuration);
      });
      
      try {
        // Try calling the API with a timeout
        const results = await Promise.race([
          checkPlagiarism(fileUrl),
          timeoutPromise
        ]);
        
        // Format the results for storage
        const formattedResults = formatPlagiarismResults(results);
        setPlagiarismResults(formattedResults);
        
        console.log('Plagiarism check completed:', formattedResults);
        
        return formattedResults;
      } catch (apiError) {
        console.error('Plagiarism API error:', apiError);
        
        // Create a fallback "successful" check result to allow submission to continue
        const fallbackResults = formatPlagiarismResults({
          is_plagiarized: false,
          matches_found: 0,
          overall_status: 'Unavailable - Proceeding without check',
          similarity_scores: []
        });
        
        // Set a warning flag on the results
        fallbackResults.isUnavailable = true;
        fallbackResults.status = 'completed';
        fallbackResults.overallStatus = 'API Unavailable - Proceeding without check';
        
        setPlagiarismResults(fallbackResults);
        console.log('Using fallback plagiarism results:', fallbackResults);
        
        return fallbackResults;
      }
    } catch (error) {
      console.error('Error during plagiarism check process:', error);
      
      // Set an error status but allow the user to continue
      const errorResults = {
        status: 'error',
        errorMessage: error.message,
        overallStatus: 'Error during check',
        isPlagiarized: false,
        matchesFound: 0,
        similarityScores: []
      };
      
      setPlagiarismResults(errorResults);
      return errorResults;
    } finally {
      setPlagiarismCheckInProgress(false);
    }
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
  
  // Store paper metadata in Firestore
  const storeMetadata = async (ipfsResult, txHash) => {
    if (!currentUser) throw new Error('User not authenticated');
    if (!ipfsResult || !ipfsResult.IpfsHash) throw new Error('Invalid IPFS result');
    if (!walletAddress) throw new Error('Wallet not connected');
    
    try {
      console.log('Storing metadata in Firestore with transaction hash:', txHash);
      
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
        comments: [],
        // Add blockchain transaction details
        transactionHash: txHash || null, // Store at top level for easier queries
        blockchain: {
          transactionHash: txHash || null,
          stakingAmount: stakeAmount,
          network: 'EDU Chain',
          status: 'confirmed',
          timestamp: new Date().toISOString()
        },
        blockchainVerified: Boolean(txHash),
        // Add plagiarism check results
        plagiarism: plagiarismResults || {
          status: 'pending',
          overallStatus: 'Pending',
          isPlagiarized: false,
          matchesFound: 0,
          similarityScores: [],
          checkDate: new Date().toISOString()
        }
      };
      
      await setDoc(paperRef, paperData);
      return paperRef.id;
    } catch (error) {
      console.error('Firestore storage error:', error);
      throw new Error(`Failed to store metadata: ${error.message}`);
    }
  };
  
  // Real blockchain transaction implementation
  const processStake = async () => {
    if (!isWalletConnected()) {
      throw new Error('Wallet connection required for staking');
    }
    
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not installed. Please install MetaMask first.');
      }
      
      // Log chain information for debugging
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('Current chain ID:', chainId);
      
      // Get a fresh signer instance directly from ethers/MetaMask
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      const ethSigner = await ethProvider.getSigner();
      
      if (!ethSigner) {
        throw new Error('Wallet is connected but signer is not available');
      }
      
      // Log the signer address for confirmation
      console.log('Signer address:', await ethSigner.getAddress());
      
      // Contract address - must match the deployed contract on EDU Chain
      const contractAddress = '0x41fC6ddc097bCf6685446B0803d45755b344Ff1E'; 
      
      // Contract ABI - only the function we need
      const contractABI = [
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "_title",
              "type": "string"
            },
            {
              "internalType": "string", 
              "name": "_contentHash",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "_price",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "_teamMembers",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "_researchField",
              "type": "string"
            }
          ],
          "name": "submitPaper",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
        }
      ];
      
      // Create contract instance
      const contract = new ethers.Contract(contractAddress, contractABI, ethSigner);
      console.log('Contract instance created. Address:', contractAddress);
      
      // Prepare parameters for submitPaper function
      const paperTitle = title;
      const contentHash = ipfsResult.IpfsHash; // IPFS hash from upload result
      const accessPrice = ethers.parseEther("0"); // Free access by default (0 price)
      const teamMembersList = teamMembers || ''; // Use empty string if no team members
      const researchFieldValue = researchField;
      
      // Amount to stake - must match the required amount in the contract (0.00006 EDU)
      const stakeAmountWei = ethers.parseEther(stakeAmount.toString());
      
      console.log('Submitting paper to blockchain:');
      console.log('Title:', paperTitle);
      console.log('Content Hash (IPFS):', contentHash);
      console.log('Access Price:', ethers.formatEther(accessPrice), 'EDU');
      console.log('Team Members:', teamMembersList);
      console.log('Research Field:', researchFieldValue);
      console.log('Stake Amount:', ethers.formatEther(stakeAmountWei), 'EDU (estimated)');
      
      // Try to estimate gas first to check if the transaction is likely to succeed
      let estimatedGas;
      try {
        console.log('Estimating gas for the transaction...');
        estimatedGas = await contract.submitPaper.estimateGas(
          paperTitle,
          contentHash,
          accessPrice,
          teamMembersList,
          researchFieldValue,
          { value: stakeAmountWei }
        );
        console.log('Gas estimation successful. Estimated gas:', estimatedGas.toString());
      } catch (gasEstimateError) {
        console.error('Gas estimation failed:', gasEstimateError);
        throw new Error(`Transaction is likely to fail: ${gasEstimateError.message}. Check if you have enough EDU and if the contract accepts submissions.`);
      }
      
      // Call the submitPaper function with the staking amount
      console.log('Sending transaction with gas limit:', 3000000);
      const tx = await contract.submitPaper(
        paperTitle,
        contentHash,
        accessPrice, // 0 for free access
        teamMembersList,
        researchFieldValue,
        { 
          value: stakeAmountWei, // Send the required stake amount with the transaction
          // Fixed gas limit calculation to handle BigInt properly
          gasLimit: estimatedGas ? BigInt(Math.floor(Number(estimatedGas) * 1.2)) : BigInt(3000000)
        }
      );
      
      console.log('Transaction sent:', tx.hash);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log('Transaction confirmed in block:', receipt.blockNumber);
      
      return tx.hash; // Return the transaction hash
    } catch (error) {
      console.error('Blockchain transaction error:', error);
      // Provide more detailed error message based on the type of error
      if (error.code === 'ACTION_REJECTED') {
        throw new Error('Transaction was rejected by the user.');
      } else if (error.message.includes('insufficient funds')) {
        throw new Error('Insufficient funds in wallet. Please make sure you have enough EDU for the stake and gas fees.');
      } else {
        throw new Error(`Stake transaction failed: ${error.message}`);
      }
    }
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
        setIsSubmitting(false);
        throw new Error('File not uploaded to IPFS');
      }
      
      console.log('Starting blockchain transaction...');
      
      // Set a timeout to prevent UI from being stuck in loading state
      const transactionTimeout = setTimeout(() => {
        if (isSubmitting) {
          setIsSubmitting(false);
          setError('Transaction is taking too long. It might still be processing in the background. Please check your wallet for status.');
        }
      }, 45000); // 45 seconds timeout
      
      try {
        // Process payment/stake on blockchain
        const txHash = await processStake();
        // Clear the timeout since transaction completed
        clearTimeout(transactionTimeout);
        
        console.log('Transaction successful with hash:', txHash);
        
        // Store metadata in Firestore with transaction hash
        await storeMetadata(ipfsResult, txHash);
        
        // Success! Navigate to confirmation or dashboard
        navigate('/dashboard', { 
          state: { notification: 'Paper submitted successfully! Your transaction has been recorded on the blockchain.' } 
        });
      } catch (blockchainError) {
        // Clear the timeout since transaction errored
        clearTimeout(transactionTimeout);
        
        console.error('Blockchain transaction error:', blockchainError);
        setError(`Blockchain transaction failed: ${blockchainError.message}`);
        setIsSubmitting(false);
      }
      
    } catch (err) {
      console.error('Submission error:', err);
      setError(`Failed to submit paper: ${err.message}`);
      setIsSubmitting(false);
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
  
  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // A function to check if MetaMask is on the correct network
  const checkNetwork = async () => {
    if (!window.ethereum) return;
    
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('Current chain ID:', chainId);
      return chainId;
    } catch (error) {
      console.error('Error checking network:', error);
    }
  };
  
  // Add a debug button to help diagnose issues
  const debugContractInteraction = async () => {
    try {
      setError('');
      
      if (!window.ethereum) {
        setError('MetaMask not detected');
        return;
      }
      
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      const ethSigner = await ethProvider.getSigner();
      const contractAddress = '0x41fC6ddc097bCf6685446B0803d45755b344Ff1E';
      
      // Simple ABI to just check connection
      const minimalABI = [
        {
          "inputs": [],
          "name": "stakingAmount",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        }
      ];
      
      const contract = new ethers.Contract(contractAddress, minimalABI, ethProvider);
      
      let stakingText = "Unknown (using default value of 0.00006 EDU)";
      try {
        const stakingAmount = await contract.stakingAmount();
        stakingText = ethers.formatEther(stakingAmount) + " EDU";
      } catch (contractError) {
        console.error('Error calling contract function:', contractError);
        // Just use the default text instead of throwing
      }
      
      const debugMsg = `
        Debug Info:
        - Chain ID: ${chainId}
        - Connected account: ${await ethSigner.getAddress()}
        - Contract address: ${contractAddress}
        - Required staking amount: ${stakingText}
      `;
      
      console.log(debugMsg);
      alert(debugMsg);
      
    } catch (error) {
      console.error('Debug error:', error);
      setError(`Debug error: ${error.message}`);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-orion-primary text-white">
          <h1 className="text-xl font-bold">Submit Research Paper</h1>
          <p className="mt-1 text-sm">Upload your paper for peer review and blockchain verification</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}
        
        {/* Step 1: Form */}
        {step === 1 && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Paper Information</h2>
              <p className="text-sm text-gray-600 mb-4">
                Complete the form below to submit your paper. All papers require a stake of {stakeAmount} EDU (approximate),
                which will be returned if your paper passes the review process.
              </p>
              
              <form onSubmit={handleSubmit}>
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
                  
                  {/* Plagiarism Check Status */}
                  {ipfsResult && (
                    <div className="mt-4">
                      {plagiarismCheckInProgress ? (
                        <div className="flex items-center space-x-2 text-sm text-blue-700">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Checking document for plagiarism...</span>
                        </div>
                      ) : plagiarismResults ? (
                        <div className={`text-sm rounded-md p-3 ${
                          plagiarismResults.status === 'error' ? 'bg-yellow-50 text-yellow-800' :
                          plagiarismResults.isUnavailable ? 'bg-gray-50 text-gray-700' :
                          plagiarismResults.isPlagiarized ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
                        }`}>
                          <div className="flex">
                            {plagiarismResults.status === 'error' ? (
                              <svg className="h-5 w-5 text-yellow-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            ) : plagiarismResults.isUnavailable ? (
                              <svg className="h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            ) : plagiarismResults.isPlagiarized ? (
                              <svg className="h-5 w-5 text-red-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="h-5 w-5 text-green-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                            
                            <div>
                              <p className="font-medium">
                                {plagiarismResults.status === 'error' ? 'Error checking plagiarism' :
                                 plagiarismResults.isUnavailable ? 'Plagiarism check unavailable' :
                                 plagiarismResults.isPlagiarized ? 'Potential plagiarism detected' : 'Document appears to be original'}
                              </p>
                              <p>
                                {plagiarismResults.status === 'error' ? plagiarismResults.errorMessage :
                                 plagiarismResults.isUnavailable ? 'The plagiarism check service is currently unavailable. You can continue with your submission.' :
                                 `${plagiarismResults.matchesFound} similarity ${plagiarismResults.matchesFound === 1 ? 'match' : 'matches'} found`}
                              </p>
                              {plagiarismResults.isPlagiarized && (
                                <p className="mt-1 font-medium">
                                  You can still submit, but the committee will review the plagiarism report.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
                
                {/* Submit Button */}
                <div className="flex justify-end mt-16">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700"
                  >
                    Continue to Review
                  </button>
                </div>
              </form>
            </div>
            
            <div className="mt-8 bg-gray-50 p-4 rounded-md">
              <h3 className="text-md font-medium text-gray-800 mb-2">Blockchain Requirements</h3>
              <p className="text-sm text-gray-600 mb-2">
                To submit your paper on the blockchain, you will need:
              </p>
              <ul className="list-disc pl-5 text-sm text-gray-600 mb-4 space-y-1">
                <li>A connected wallet with at least {stakeAmount} EDU for staking</li>
                <li>The paper will be permanently stored on IPFS</li>
                <li>Transaction details will be recorded on the EDU Chain blockchain</li>
              </ul>
              
              {!isWalletConnected() && (
                <button
                  type="button"
                  onClick={handleConnectWallet}
                  className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orion-darkGray hover:bg-orion-mediumGray focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orion-darkGray"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Connect Wallet
                </button>
              )}
              
              {/* Debug button */}
              <button
                type="button"
                onClick={debugContractInteraction}
                className="mt-2 ml-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Debug Connection
              </button>
            </div>
          </div>
        )}
        
        {/* Step 2: Review & Stake */}
        {step === 2 && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Review & Submit</h2>
            
            <div className="bg-gray-50 p-5 rounded-lg mb-6">
              <h3 className="text-md font-medium text-gray-800 mb-2">Paper Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Title</p>
                  <p className="text-gray-800">{title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Research Field</p>
                  <p className="text-gray-800">{researchField}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Team Members</p>
                  <p className="text-gray-800">{teamMembers || 'None'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">File</p>
                  <p className="text-gray-800">{fileName} ({formatFileSize(fileSize)})</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-500">Abstract</p>
                <p className="text-gray-800">{abstract}</p>
              </div>
            </div>
            
            {/* Plagiarism Check Results */}
            {plagiarismResults && (
              <div className={`p-5 rounded-lg mb-6 ${
                plagiarismResults.status === 'error' ? 'bg-yellow-50' :
                plagiarismResults.isPlagiarized ? 'bg-red-50' : 'bg-green-50'
              }`}>
                <h3 className="text-md font-medium text-gray-800 mb-2">Plagiarism Check Results</h3>
                <div className={`flex items-start ${
                  plagiarismResults.status === 'error' ? 'text-yellow-800' :
                  plagiarismResults.isPlagiarized ? 'text-red-800' : 'text-green-800'
                }`}>
                  {plagiarismResults.status === 'error' ? (
                    <svg className="h-6 w-6 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : plagiarismResults.isPlagiarized ? (
                    <svg className="h-6 w-6 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  
                  <div>
                    <p className="font-semibold">
                      {plagiarismResults.status === 'error' ? 'Error during plagiarism check' :
                       plagiarismResults.isPlagiarized ? 'Potential plagiarism detected' : 'Document appears to be original'}
                    </p>
                    <p className="mt-1">
                      {plagiarismResults.status === 'error' ? plagiarismResults.errorMessage :
                       `${plagiarismResults.matchesFound} similarity ${plagiarismResults.matchesFound === 1 ? 'match' : 'matches'} found`}
                    </p>
                    
                    {plagiarismResults.status !== 'error' && plagiarismResults.similarityScores?.length > 0 && (
                      <div className="mt-3">
                        <p className="font-medium">Similarity details:</p>
                        <ul className="mt-1 list-disc list-inside text-sm">
                          {plagiarismResults.similarityScores.slice(0, 3).map((score, index) => (
                            <li key={index}>
                              {score.reference_file || `Source ${index + 1}`}: {Math.round(score.similarity * 100)}% similarity
                            </li>
                          ))}
                          {plagiarismResults.similarityScores.length > 3 && (
                            <li>And {plagiarismResults.similarityScores.length - 3} more sources</li>
                          )}
                        </ul>
                      </div>
                    )}
                    
                    {plagiarismResults.isPlagiarized && (
                      <p className="mt-3 font-medium">
                        You can still submit this paper, but please be aware that the committee will review the plagiarism report
                        during the approval process. Consider reviewing your document if significant plagiarism is detected.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Important Information</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Submitting this paper requires a stake of approximately {stakeAmount} EDU. This amount will be returned if your paper passes the review process.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between space-x-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orion-primary"
              >
                Back to Edit
              </button>
              
              <div className="flex space-x-4">
                {/* Debug button on Review page too */}
                <button
                  type="button"
                  onClick={debugContractInteraction}
                  className="inline-flex items-center px-4 py-2 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Debug Connection
                </button>
                
                <button
                  type="button"
                  onClick={handleStakeAndSubmit}
                  disabled={isSubmitting || !isWalletConnected()}
                  className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                    isSubmitting || !isWalletConnected() 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      Stake and Submit
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SubmitPaper; 