import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';

const CommitteePage = () => {
  const navigate = useNavigate();
  const { currentUser, userRole, walletAddress, isWalletConnected, connectWallet } = useAuth();
  
  // State for wallet connection
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  
  // State for DAO membership
  const [isDAOMember, setIsDAOMember] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [hasRequestedMembership, setHasRequestedMembership] = useState(false);
  const [membershipRequests, setMembershipRequests] = useState([]);
  const [currentDAOMembers, setCurrentDAOMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [requestReason, setRequestReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Contract related state
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  
  // Contract details - Using the same contract address as PaperApprovals.jsx
  const contractAddress = '0x41fC6ddc097bCf6685446B0803d45755b344Ff1E';
  const contractABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_member",
          "type": "address"
        }
      ],
      "name": "addMember",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "members",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "admin",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalMembers",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_index",
          "type": "uint256"
        }
      ],
      "name": "getMemberByIndex",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];
  
  // Debug state
  const [debugData, setDebugData] = useState(null);
  
  // Initialize when component mounts
  useEffect(() => {
    if (isWalletConnected()) {
      initializeContract();
    }
  }, [walletAddress]);
  
  // Check DAO membership and requests
  useEffect(() => {
    if (contract && walletAddress) {
      checkDAOMembership();
      fetchMembershipRequests();
      fetchCurrentDAOMembers();
    }
  }, [contract, walletAddress]);
  
  // Initialize wallet and contract
  const initializeContract = async () => {
    if (!window.ethereum || !walletAddress) return;
    
    try {
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
      
    } catch (error) {
      console.error('Error initializing contract:', error);
      setError('Failed to initialize contract. Please check your connection and try again.');
    }
  };
  
  // Handle wallet connection
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setConnectionError('');
    
    try {
      await connectWallet();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setConnectionError('Failed to connect wallet: ' + error.message);
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Check if the user is a DAO member
  const checkDAOMembership = async () => {
    try {
      setLoading(true);
      
      // Debug admin status from auth context
      console.log("User role from Auth context:", userRole);
      
      // Check if user is a DAO member
      const memberStatus = await contract.members(walletAddress);
      setIsDAOMember(memberStatus);
      
      // Check if user is the owner/admin
      const admin = await contract.admin();
      const isContractOwner = admin.toLowerCase() === walletAddress.toLowerCase();
      
      // Set as owner if either contract owner or has admin role
      const isAdminUser = userRole === 'admin';
      setIsOwner(isContractOwner || isAdminUser);
      
      console.log("Contract admin address:", admin);
      console.log("Current wallet address:", walletAddress);
      console.log("Is contract owner:", isContractOwner);
      console.log("Is admin user:", isAdminUser);
      console.log("Final isOwner status:", isContractOwner || isAdminUser);
      
      // Check if user has a pending membership request
      const requestQuery = query(
        collection(db, 'membershipRequests'),
        where('walletAddress', '==', walletAddress),
        where('status', '==', 'pending')
      );
      
      const requestSnapshot = await getDocs(requestQuery);
      setHasRequestedMembership(!requestSnapshot.empty);
      
    } catch (error) {
      console.error('Error checking DAO membership:', error);
      setError('Failed to check DAO membership status.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch all pending membership requests (for owner)
  const fetchMembershipRequests = async () => {
    // Debug logs
    console.log("fetchMembershipRequests called");
    console.log("isOwner status:", isOwner);
    console.log("Connected wallet:", walletAddress);
    
    try {
      // We'll fetch requests regardless of owner status for debugging
      console.log("Querying 'membershipRequests' collection");
      const requestsQuery = query(
        collection(db, 'membershipRequests'),
        where('status', '==', 'pending')
      );
      
      console.log("Executing query...");
      const requestsSnapshot = await getDocs(requestsQuery);
      console.log("Query results:", requestsSnapshot.size, "documents found");
      
      const requestsList = [];
      
      requestsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Document data:", data);
        requestsList.push({
          id: doc.id,
          ...data
        });
      });
      
      console.log("Parsed requests:", requestsList);
      setMembershipRequests(requestsList);
      
    } catch (error) {
      console.error('Error fetching membership requests:', error);
      setError(`Failed to fetch membership requests: ${error.message}`);
    }
  };
  
  // Fetch current DAO members
  const fetchCurrentDAOMembers = async () => {
    if (!contract) return;
    
    try {
      const totalMembersCount = await contract.totalMembers();
      const membersList = [];
      
      for (let i = 0; i < totalMembersCount; i++) {
        try {
          const memberAddress = await contract.getMemberByIndex(i);
          membersList.push({
            address: memberAddress,
            index: i
          });
        } catch (error) {
          console.error(`Error fetching member at index ${i}:`, error);
        }
      }
      
      setCurrentDAOMembers(membersList);
      
    } catch (error) {
      console.error('Error fetching DAO members:', error);
    }
  };
  
  // Submit a membership request
  const submitMembershipRequest = async () => {
    if (!walletAddress || !requestReason.trim()) return;
    
    setSubmitting(true);
    setError('');
    setSuccessMessage('');
    
    try {
      await addDoc(collection(db, 'membershipRequests'), {
        walletAddress: walletAddress,
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.email.split('@')[0],
        reason: requestReason,
        status: 'pending',
        createdAt: serverTimestamp(),
        userId: currentUser.uid
      });
      
      setSuccessMessage('Membership request submitted successfully!');
      setRequestReason('');
      setHasRequestedMembership(true);
      
    } catch (error) {
      console.error('Error submitting membership request:', error);
      setError('Failed to submit membership request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Approve a membership request
  const approveMembershipRequest = async (requestId, memberAddress) => {
    if (!isOwner || !contract) return;
    
    try {
      setSubmitting(true);
      
      // Call smart contract to add member
      const tx = await contract.addMember(memberAddress);
      await tx.wait();
      
      // Update request status in Firestore
      const requestRef = doc(db, 'membershipRequests', requestId);
      await updateDoc(requestRef, {
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: currentUser.uid
      });
      
      // Refresh data
      await fetchMembershipRequests();
      await fetchCurrentDAOMembers();
      
      setSuccessMessage(`Successfully added ${formatAddress(memberAddress)} to the DAO!`);
      
    } catch (error) {
      console.error('Error approving membership:', error);
      setError(`Failed to approve membership: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Reject a membership request
  const rejectMembershipRequest = async (requestId) => {
    if (!isOwner) return;
    
    try {
      setSubmitting(true);
      
      // Update request status in Firestore
      const requestRef = doc(db, 'membershipRequests', requestId);
      await updateDoc(requestRef, {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectedBy: currentUser.uid
      });
      
      // Refresh data
      await fetchMembershipRequests();
      
      setSuccessMessage('Membership request rejected.');
      
    } catch (error) {
      console.error('Error rejecting membership:', error);
      setError('Failed to reject membership request.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Debug function to fetch all membership requests
  const debugFetchAllRequests = async () => {
    try {
      console.log("DEBUG: Fetching all membership requests...");
      const requestsSnapshot = await getDocs(collection(db, 'membershipRequests'));
      
      const allRequests = [];
      requestsSnapshot.forEach((doc) => {
        allRequests.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log("DEBUG: All membership requests:", allRequests);
      setDebugData(allRequests);
      
      // If we found data but regular fetch shows none, update the requests list
      if (allRequests.length > 0 && membershipRequests.length === 0) {
        // Filter just the pending ones to display
        const pendingRequests = allRequests.filter(req => req.status === 'pending');
        if (pendingRequests.length > 0) {
          console.log("DEBUG: Found pending requests that weren't showing up:", pendingRequests);
          setMembershipRequests(pendingRequests);
        }
      }
      
      return allRequests.length > 0;
    } catch (error) {
      console.error("DEBUG: Error fetching all requests:", error);
      return false;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-orion-darkGray">ScholarDAO Committee</h1>
          <p className="text-gray-600 mt-2">
            {isOwner 
              ? 'Manage DAO membership and approve membership requests.'
              : isDAOMember 
                ? 'You are a member of the ScholarDAO. View other members and committee information.' 
                : 'Request to join the ScholarDAO and participate in paper verification.'}
          </p>
        </div>
        
        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
            <p className="text-sm">{successMessage}</p>
          </div>
        )}
        
        {/* Wallet Connection Prompt */}
        {!isWalletConnected() && (
          <div className="bg-white shadow-md rounded-lg p-6 mb-8 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-orion-mediumGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              <h2 className="mt-2 text-lg font-medium text-orion-darkGray">Connect Your Wallet</h2>
              <p className="mt-1 text-sm text-orion-gray">
                You need to connect your wallet to interact with the DAO.
              </p>
            </div>
            
            {connectionError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {connectionError}
              </div>
            )}
            
            <button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="w-full px-4 py-2 bg-orion-darkGray text-white rounded-md shadow-sm font-medium hover:bg-orion-mediumGray transition-colors"
              tabIndex="0"
              aria-label="Connect wallet"
            >
              {isConnecting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </span>
              ) : (
                'Connect Wallet'
              )}
            </button>
          </div>
        )}
        
        {/* Debug section - only visible for admins */}
        {userRole === 'admin' && (
          <div className="mb-6 p-4 bg-gray-100 border border-gray-300 rounded-md">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Admin Debug Tools</h3>
            <div className="flex space-x-4">
              <button
                onClick={debugFetchAllRequests}
                className="px-4 py-2 bg-gray-800 text-white rounded-md shadow-sm text-sm font-medium hover:bg-gray-700"
              >
                Debug: Fetch All Requests
              </button>
            </div>
            
            {debugData && debugData.length > 0 ? (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Found {debugData.length} total requests:</h4>
                <div className="bg-white p-3 rounded border border-gray-200 max-h-60 overflow-auto">
                  <pre className="text-xs">{JSON.stringify(debugData, null, 2)}</pre>
                </div>
              </div>
            ) : debugData && debugData.length === 0 ? (
              <div className="mt-4 text-orange-600">No request documents found in 'membershipRequests' collection</div>
            ) : null}
          </div>
        )}
        
        {/* Main Content - Based on User Role */}
        {isWalletConnected() && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - DAO Member Status / Request Form */}
            <div className="lg:col-span-1 space-y-6">
              {/* User Status Card */}
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-orion-darkGray to-orion-mediumGray p-6 text-white">
                  <h2 className="text-xl font-semibold">Your Status</h2>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 rounded-full bg-orion-lightBg flex items-center justify-center text-orion-darkGray">
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-orion-darkGray">{currentUser?.displayName || currentUser?.email}</p>
                        <p className="text-xs text-orion-gray">{formatAddress(walletAddress)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm font-medium text-orion-darkGray">DAO Membership:</p>
                      {loading ? (
                        <p className="text-sm text-orion-gray">Checking status...</p>
                      ) : isDAOMember ? (
                        <div className="mt-1 flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                              <circle cx="4" cy="4" r="3" />
                            </svg>
                            Active Member
                          </span>
                        </div>
                      ) : hasRequestedMembership ? (
                        <div className="mt-1 flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-yellow-400" fill="currentColor" viewBox="0 0 8 8">
                              <circle cx="4" cy="4" r="3" />
                            </svg>
                            Request Pending
                          </span>
                        </div>
                      ) : (
                        <div className="mt-1 flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-gray-400" fill="currentColor" viewBox="0 0 8 8">
                              <circle cx="4" cy="4" r="3" />
                            </svg>
                            Not a Member
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Membership Request Form */}
              {isWalletConnected() && !isDAOMember && !hasRequestedMembership && (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-orion-darkGray mb-4">Request DAO Membership</h3>
                    <p className="text-sm text-orion-gray mb-4">
                      As a DAO member, you can participate in paper verification and earn rewards for your contributions.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="requestReason" className="block text-sm font-medium text-orion-darkGray mb-1">
                          Why do you want to join the ScholarDAO?
                        </label>
                        <textarea
                          id="requestReason"
                          value={requestReason}
                          onChange={(e) => setRequestReason(e.target.value)}
                          placeholder="Explain your qualifications and interest in joining the DAO..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orion-darkGray focus:border-orion-darkGray"
                          rows="4"
                          tabIndex="0"
                          aria-label="Reason for joining the DAO"
                          required
                        />
                      </div>
                      
                      <button
                        onClick={submitMembershipRequest}
                        disabled={submitting || !requestReason.trim()}
                        className={`w-full px-4 py-2 rounded-md shadow-sm text-sm font-medium 
                          ${requestReason.trim() && !submitting
                            ? "bg-orion-darkGray text-white hover:bg-orion-mediumGray" 
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        tabIndex="0"
                        aria-label="Submit membership request"
                      >
                        {submitting ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                          </span>
                        ) : (
                          "Submit Request"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Pending Request Status */}
              {isWalletConnected() && hasRequestedMembership && (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <div className="p-6">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="mt-2 text-lg font-medium text-orion-darkGray">Membership Request Pending</h3>
                      <p className="mt-1 text-sm text-orion-gray">
                        Your request to join the ScholarDAO is currently under review. You'll be notified once it's approved.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right Column - Admin/Owner Functionality OR Member List */}
            <div className="lg:col-span-2 space-y-6">
              {/* If Owner - Show Membership Requests */}
              {isOwner && (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <div className="bg-orion-lightBg p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-orion-darkGray">Membership Requests</h2>
                    <p className="text-sm text-orion-gray mt-1">
                      You are viewing this section as {isOwner ? 'an admin or contract owner' : 'a regular user'}.
                    </p>
                  </div>
                  
                  {membershipRequests.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {membershipRequests.map((request) => (
                        <div key={request.id} className="p-6">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <div className="mb-4 sm:mb-0">
                              <p className="text-lg font-medium text-orion-darkGray">{request.userName || 'Unknown User'}</p>
                              <p className="text-sm text-orion-gray">{request.userEmail || 'No email'}</p>
                              <p className="text-sm text-orion-gray">{formatAddress(request.walletAddress)}</p>
                              <p className="mt-2 text-sm text-orion-gray">{request.reason || 'No reason provided'}</p>
                              <p className="mt-1 text-xs text-orion-gray">
                                Requested: {request.createdAt ? (request.createdAt.toDate ? request.createdAt.toDate().toLocaleDateString() : 'Date format error') : 'No date'}
                              </p>
                            </div>
                            
                            <div className="flex space-x-3">
                              <button
                                onClick={() => rejectMembershipRequest(request.id)}
                                disabled={submitting}
                                className="px-4 py-2 border border-red-300 text-red-700 rounded-md shadow-sm text-sm font-medium hover:bg-red-50"
                                tabIndex="0"
                                aria-label="Reject membership request"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => approveMembershipRequest(request.id, request.walletAddress)}
                                disabled={submitting}
                                className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-green-700"
                                tabIndex="0"
                                aria-label="Approve membership request"
                              >
                                {submitting ? 'Processing...' : 'Approve'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6">
                      <div className="text-center">
                        <p className="text-orion-gray mb-4">No pending membership requests found.</p>
                        
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 inline-block text-left">
                          <h4 className="font-medium text-orion-darkGray mb-2">Troubleshooting Information:</h4>
                          <ul className="text-sm space-y-1 text-orion-gray">
                            <li>• Contract Address: <span className="font-mono text-xs">{contractAddress}</span></li>
                            <li>• User Role: {userRole || 'Not set'}</li>
                            <li>• Wallet Connected: {walletAddress ? 'Yes' : 'No'}</li>
                            <li>• Wallet Address: {formatAddress(walletAddress) || 'None'}</li>
                            <li>• Contract Initialized: {contract ? 'Yes' : 'No'}</li>
                            <li>• Owner Status: {isOwner ? 'Yes' : 'No'}</li>
                          </ul>
                          <p className="mt-3 text-xs text-orion-gray">
                            Try using the debug button above to check if there are any requests in the database. 
                            If requests exist in Firestore but are not displayed here, there might be an issue with query permissions or data format.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* DAO Members List */}
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="bg-orion-lightBg p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-orion-darkGray">Current DAO Members</h2>
                </div>
                
                {loading ? (
                  <div className="p-6 text-center">
                    <svg className="animate-spin mx-auto h-8 w-8 text-orion-mediumGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-2 text-orion-gray">Loading members...</p>
                  </div>
                ) : currentDAOMembers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-6">
                    {currentDAOMembers.map((member, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-full bg-orion-lightBg flex items-center justify-center text-orion-darkGray">
                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="ml-3 flex-1 truncate">
                            <p className="text-sm font-medium text-orion-darkGray">
                              {formatAddress(member.address)}
                            </p>
                            {member.address.toLowerCase() === walletAddress.toLowerCase() && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-orion-gray">No DAO members found.</p>
                  </div>
                )}
              </div>
              
              {/* DAO Information */}
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="bg-orion-lightBg p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-orion-darkGray">About ScholarDAO</h2>
                </div>
                <div className="p-6">
                  <p className="text-orion-gray mb-4">
                    ScholarDAO is a decentralized autonomous organization responsible for reviewing and verifying research papers on the Orion platform.
                  </p>
                  <p className="text-orion-gray mb-4">
                    Members can vote on paper submissions and earn rewards for their contributions to the academic community.
                  </p>
                  <p className="text-orion-gray">
                    The DAO contract is deployed at: <span className="font-mono text-sm">{contractAddress}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CommitteePage; 