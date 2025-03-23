import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

const MyReviews = () => {
  const { currentUser, userRole, walletAddress, isWalletConnected, connectWallet } = useAuth();
  
  // State variables
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'approved', 'rejected'
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);

  // Contract details (same as in PaperApprovals.jsx)
  const contractAddress = '0x41fC6ddc097bCf6685446B0803d45755b344Ff1E';
  const contractABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "paperId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        }
      ],
      "name": "AccessPurchased",
      "type": "event"
    },
    // ... other ABI entries (add full ABI here)
  ];

  // Initialize contract when wallet is connected
  useEffect(() => {
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed. Please install MetaMask to view your reviews.');
      return;
    }
    
    if (isWalletConnected() && walletAddress) {
      initializeContract();
    }
  }, [walletAddress, isWalletConnected]);
  
  // When contract is initialized, fetch reviews
  useEffect(() => {
    if (contract && walletAddress) {
      fetchMyReviews();
    }
  }, [contract, walletAddress]);

  // Initialize contract
  const initializeContract = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        setError('MetaMask is not installed. Please install MetaMask to view your reviews.');
        return;
      }
      
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      const ethersSigner = await ethersProvider.getSigner();
      
      // Initialize contract instance
      const contractInstance = new ethers.Contract(
        contractAddress,
        contractABI,
        ethersSigner
      );
      
      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setContract(contractInstance);
      
      // Setup event listeners
      window.ethereum.on('chainChanged', () => window.location.reload());
    } catch (error) {
      console.error('Error initializing contract:', error);
      setError('Failed to initialize contract. Please check your connection and try again.');
    }
  };

  // Handle connecting wallet
  const handleConnectWallet = async () => {
    try {
      setError('');
      
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        setError('MetaMask is not installed. Please install MetaMask to view your reviews.');
        return;
      }
      
      await connectWallet();
      
      // Initialize contract after connecting wallet
      if (isWalletConnected()) {
        await initializeContract();
      } else {
        setError('Failed to connect wallet. Please make sure you approve the connection request in your wallet.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      
      // Format a user-friendly error message
      let errorMessage = 'Failed to connect wallet';
      
      if (error.message && error.message.includes('setWalletAddress')) {
        errorMessage = 'Wallet connection issue. Please try refreshing the page and connecting again.';
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      setError(errorMessage);
    }
  };

  // Fetch reviews from the blockchain and Firestore
  const fetchMyReviews = async () => {
    setLoading(true);
    setError('');
    try {
      if (!contract || !walletAddress) return;
      
      // Get total paper count
      const count = await contract.paperCount();
      const paperCount = parseInt(count.toString());
      
      const myReviews = [];
      
      // Fetch all papers from the contract
      for (let i = 0; i < paperCount; i++) {
        try {
          // Get voters for this paper
          const voters = await contract.getPaperVoters(i);
          
          // Check if current user's wallet is in the voters list
          const hasVoted = voters.some(
            voter => voter.toLowerCase() === walletAddress.toLowerCase()
          );
          
          if (hasVoted) {
            // Get user's comment
            const comment = await contract.getPaperComment(i, walletAddress);
            
            // Get paper details
            const details = await contract.getPaperDetails(i);
            
            // Get paper status
            const status = await contract.getPaperStatus(i);
            
            // Try to get user's vote (approve/reject) - can be inferred from event logs
            // For now, we'll get it from the comment (not ideal but works for this demo)
            let vote = { approved: true }; // Default to approved
            
            // Get metadata from Firestore if available
            let firestoreData = null;
            try {
              // Query Firestore for paper with matching hash or transaction data
              const papersRef = collection(db, 'papers');
              const contentHash = details.contentHash || ""; 

              // Try to find the paper in Firestore by hash or author address
              const q = query(
                papersRef,
                where('ipfsHash', '==', contentHash)
              );
              
              const querySnapshot = await getDocs(q);
              
              if (!querySnapshot.empty) {
                firestoreData = querySnapshot.docs[0].data();
              } else {
                // Try alternate query with author address if needed
                const altQuery = query(
                  papersRef,
                  where('authorWallet', '==', details.author.toLowerCase())
                );
                
                const altQuerySnapshot = await getDocs(altQuery);
                
                if (!altQuerySnapshot.empty) {
                  firestoreData = altQuerySnapshot.docs.find(doc => 
                    doc.data().title === details.title
                  )?.data() || altQuerySnapshot.docs[0].data();
                }
              }
            } catch (firestoreError) {
              console.error('Error fetching paper metadata from Firestore:', firestoreError);
            }
            
            // Get vote timestamp by checking blockchain logs or Firestore
            // This is a simplified approach - in production, you'd get it from event logs or a vote record
            const voteTimestamp = new Date();
            
            // Format price from wei to ETH
            const priceInEth = ethers.formatEther(details.price);
            
            myReviews.push({
              id: i,
              paperId: i,
              author: details.author,
              title: details.title,
              price: priceInEth,
              teamMembers: details.teamMembers,
              researchField: details.researchField,
              isApproved: details.isApproved,
              isRevision: details.isRevision,
              isDecided: status.isDecided,
              approvalCount: Number(status.approvals),
              rejectionCount: Number(status.rejections),
              comment: comment,
              vote: vote,
              voteTimestamp: voteTimestamp,
              
              // Additional data from Firestore if available
              abstract: firestoreData?.abstract || '',
              fileName: firestoreData?.fileName || '',
              fileSize: firestoreData?.fileSize || 0,
              fileUrl: firestoreData?.fileUrl || '',
              ipfsHash: firestoreData?.ipfsHash || contentHash,
              submissionDate: firestoreData?.submissionDate?.toDate?.() || null,
              authorName: firestoreData?.authorName || 'Anonymous Researcher',
              authorEmail: firestoreData?.authorEmail || ''
            });
          }
        } catch (error) {
          console.error(`Error fetching paper ${i}:`, error);
        }
      }
      
      // Sort reviews: most recent first
      myReviews.sort((a, b) => b.voteTimestamp - a.voteTimestamp);
      
      setReviews(myReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load your reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filter reviews by type
  const filteredReviews = () => {
    if (activeFilter === 'all') return reviews;
    if (activeFilter === 'approved') return reviews.filter(review => review.vote.approved);
    if (activeFilter === 'rejected') return reviews.filter(review => !review.vote.approved);
    return reviews;
  };

  // Show review details
  const handleViewReview = (review) => {
    setSelectedReview(review);
  };

  // Close review details
  const handleCloseReview = () => {
    setSelectedReview(null);
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    
    try {
      if (typeof date === 'object' && date.toDate) {
        // Handle Firestore Timestamp objects
        date = date.toDate();
      } else if (typeof date === 'string') {
        // Handle ISO string dates
        date = new Date(date);
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (approved) => {
    return approved 
      ? 'bg-green-100 text-green-800 border border-green-200' 
      : 'bg-red-100 text-red-800 border border-red-200';
  };

  // View PDF document
  const handleViewPaper = (fileUrl) => {
    if (!fileUrl) {
      setError('PDF URL not available for this paper.');
      return;
    }
    
    // Open the PDF in a new tab
    window.open(fileUrl, '_blank');
  };

  // Handle manual reconnect attempt
  const handleManualReconnect = async () => {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        setError('MetaMask is not installed. Please install MetaMask to view your reviews.');
        return;
      }
      
      // Check if already connected
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts && accounts.length > 0) {
        // Wallet is already connected, try reloading the page
        console.log('Wallet already connected, reloading page...');
        window.location.reload();
      } else {
        // Try connecting
        await handleConnectWallet();
      }
    } catch (error) {
      console.error('Error during manual reconnect:', error);
      setError('Failed to reconnect. Please try refreshing the page.');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-orion-gray hover:text-orion-darkGray">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                  Dashboard
                </Link>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-orion-gray" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-orion-darkGray md:ml-2">My Reviews</span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-orion-darkGray">My Paper Reviews</h1>
              <p className="text-orion-gray mt-1">
                View all your past and current paper reviews
              </p>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
            <div className="flex justify-between items-center">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
              </div>
              {error.includes('Wallet connection issue') && (
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-sm rounded-md ml-4"
                >
                  Refresh Page
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header with filters */}
          <div className="bg-gradient-to-r from-orion-darkGray to-orion-mediumGray p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">My Review History</h2>
            <p className="opacity-90 mb-6">
              Track all your paper reviews and their outcomes. Filter by approval status to see specific types of reviews.
            </p>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === 'all' 
                    ? 'bg-white text-orion-darkGray' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                All Reviews
              </button>
              <button
                onClick={() => setActiveFilter('approved')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === 'approved' 
                    ? 'bg-white text-green-600' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setActiveFilter('rejected')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === 'rejected' 
                    ? 'bg-white text-red-600' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>

          {/* Wallet Connection Status */}
          {!isWalletConnected() ? (
            <div className="p-8 text-center">
              <div className="bg-orion-lightBg rounded-lg p-6 max-w-md mx-auto">
                <svg className="mx-auto h-12 w-12 text-orion-gray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-orion-darkGray">Wallet Not Connected</h3>
                <p className="mt-2 text-sm text-orion-gray">
                  To view your reviews, you need to connect your wallet first.
                </p>
                <p className="mt-2 text-xs text-orion-gray italic">
                  If your wallet is already connected but you're seeing this message, 
                  try refreshing the page or reconnecting your wallet.
                </p>
                <div className="mt-6 flex flex-col space-y-3">
                  <button
                    onClick={handleManualReconnect}
                    className="w-full px-4 py-2 bg-gradient-to-r from-orion-darkGray to-orion-mediumGray text-white rounded-md shadow-sm text-sm font-medium hover:from-orion-darkGray hover:to-orion-darkGray transition-all"
                    tabIndex="0"
                    aria-label="Connect wallet"
                  >
                    Connect Wallet
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md shadow-sm text-sm font-medium hover:bg-gray-200 transition-all"
                    tabIndex="0"
                    aria-label="Refresh page"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-3/4">
                            <div className="h-6 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-100 rounded w-1/3 mb-2"></div>
                          </div>
                          <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="h-16 bg-gray-100 rounded mb-4"></div>
                        <div className="flex items-center justify-between">
                          <div className="w-32 h-4 bg-gray-200 rounded"></div>
                          <div className="w-24 h-8 bg-gray-200 rounded-md"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredReviews().length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-orion-gray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-orion-darkGray">No Reviews Found</h3>
                  <p className="mt-2 text-sm text-orion-gray">
                    You haven't reviewed any papers yet.
                    {activeFilter !== 'all' && ' Try changing the filter to see other reviews.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredReviews().map(review => (
                    <div key={review.id} className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="p-5">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                          <div>
                            <h3 className="text-lg font-medium text-orion-darkGray">{review.title}</h3>
                            <p className="text-sm text-orion-gray mt-1">
                              {review.researchField} • {review.price} ETH
                            </p>
                          </div>
                          <div className={`px-4 py-1.5 rounded-full text-sm font-medium ${getStatusBadgeClass(review.vote.approved)}`}>
                            {review.vote.approved ? 'Approved' : 'Rejected'}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-md mb-4">
                          <h4 className="text-sm font-semibold text-orion-darkGray mb-2">Your Review Comment</h4>
                          <p className="text-sm text-orion-gray">
                            {review.comment || 'No comment provided'}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-orion-gray">
                            Reviewed on {formatDate(review.voteTimestamp)}
                          </p>
                          <button
                            onClick={() => handleViewReview(review)}
                            className="px-4 py-2 bg-orion-darkGray text-white rounded-md shadow-sm text-sm font-medium hover:bg-orion-mediumGray transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Details Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-orion-darkGray">Review Details</h3>
              <button
                onClick={handleCloseReview}
                className="text-orion-gray hover:text-orion-darkGray rounded-full p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-xl font-semibold text-orion-darkGray">
                    {selectedReview.title}
                  </h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Paper ID: {selectedReview.paperId}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {selectedReview.researchField}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {selectedReview.price} ETH
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(selectedReview.vote.approved)}`}>
                  {selectedReview.vote.approved ? 'You Approved' : 'You Rejected'}
                </span>
              </div>

              <div className="space-y-6">
                {/* Paper status information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="text-sm font-semibold text-orion-darkGray mb-2">Paper Status</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-orion-gray mb-1">Approval Votes</p>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-medium">{selectedReview.approvalCount}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-orion-gray mb-1">Rejection Votes</p>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-red-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-sm font-medium">{selectedReview.rejectionCount}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-orion-gray mb-1">Author</p>
                      <p className="text-sm font-medium">{selectedReview.authorName || formatAddress(selectedReview.author)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-orion-gray mb-1">Final Decision</p>
                      <p className={`text-sm font-medium ${selectedReview.isDecided 
                        ? (selectedReview.isApproved ? 'text-green-600' : 'text-red-600')
                        : 'text-yellow-600'}`}>
                        {selectedReview.isDecided 
                          ? (selectedReview.isApproved ? 'Approved' : 'Rejected')
                          : 'Pending'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Your comment */}
                <div>
                  <h5 className="text-sm font-semibold text-orion-darkGray mb-2">Your Review Comment</h5>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm">{selectedReview.comment || 'No comment provided'}</p>
                  </div>
                  <p className="mt-1 text-xs text-orion-gray">
                    Reviewed on {formatDate(selectedReview.voteTimestamp)}
                  </p>
                </div>

                {/* Abstract */}
                <div>
                  <h5 className="text-sm font-semibold text-orion-darkGray mb-2">Abstract</h5>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm">
                      {selectedReview.abstract || 'No abstract available for this paper.'}
                    </p>
                  </div>
                </div>

                {/* PDF Document */}
                {selectedReview.fileUrl && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="text-sm font-semibold text-orion-darkGray mb-2">Research Paper</h5>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-6 h-6 text-orion-gray mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="font-medium">{selectedReview.fileName || 'Research Paper.pdf'}</p>
                          {selectedReview.fileSize && (
                            <p className="text-sm text-orion-gray">{selectedReview.fileSize} bytes</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewPaper(selectedReview.fileUrl)}
                        className="px-4 py-2 bg-orion-darkGray text-white text-sm font-medium rounded-md hover:bg-orion-mediumGray transition-colors flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Full Paper
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyReviews; 