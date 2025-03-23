import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, setDoc, Timestamp, addDoc, collection, serverTimestamp, query, where, getDocs, getDoc } from 'firebase/firestore';
import PlagiarismResultsCard from '../components/PlagiarismResultsCard';

const PaperApprovals = () => {
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();
  
  // Wallet connection state
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  
  // Paper data state
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [votingPaperId, setVotingPaperId] = useState(null);
  const [voteApproval, setVoteApproval] = useState(true);
  const [voteComment, setVoteComment] = useState('');
  const [submittingVote, setSubmittingVote] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // DAO membership request state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [hasRequestedMembership, setHasRequestedMembership] = useState(false);

  // Contract details from WalletConnection.jsx
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
				"internalType": "uint256",
				"name": "_paperId",
				"type": "uint256"
			}
		],
		"name": "claimStake",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "member",
				"type": "address"
			}
		],
		"name": "MemberAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "oldMinVotes",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newMinVotes",
				"type": "uint256"
			}
		],
		"name": "MinRequiredVotesChanged",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "oldPaperId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newPaperId",
				"type": "uint256"
			}
		],
		"name": "PaperResubmitted",
		"type": "event"
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
				"name": "author",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "researchField",
				"type": "string"
			}
		],
		"name": "PaperSubmitted",
		"type": "event"
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
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "PaperVerified",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_paperId",
				"type": "uint256"
			}
		],
		"name": "purchaseAccess",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_rejectedPaperId",
				"type": "uint256"
			},
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
		"name": "resubmitPaper",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "newPaperId",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_newMinVotes",
				"type": "uint256"
			}
		],
		"name": "setMinRequiredVotes",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_newAmount",
				"type": "uint256"
			}
		],
		"name": "setStakingAmount",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
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
				"name": "author",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "StakeReturned",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "oldAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newAmount",
				"type": "uint256"
			}
		],
		"name": "StakingAmountChanged",
		"type": "event"
	},
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
				"name": "member",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "VerificationVote",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_paperId",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "_approve",
				"type": "bool"
			},
			{
				"internalType": "string",
				"name": "_comment",
				"type": "string"
			}
		],
		"name": "voteOnPaper",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
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
				"name": "voter",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "comment",
				"type": "string"
			}
		],
		"name": "VoterComment",
		"type": "event"
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_paperId",
				"type": "uint256"
			}
		],
		"name": "getLatestRevision",
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
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_paperId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_voter",
				"type": "address"
			}
		],
		"name": "getPaperComment",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_paperId",
				"type": "uint256"
			}
		],
		"name": "getPaperDetails",
		"outputs": [
			{
				"internalType": "address",
				"name": "author",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "teamMembers",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "researchField",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "isApproved",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "isRevision",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "previousVersion",
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
				"name": "_paperId",
				"type": "uint256"
			}
		],
		"name": "getPaperRevisionHistory",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_paperId",
				"type": "uint256"
			}
		],
		"name": "getPaperStatus",
		"outputs": [
			{
				"internalType": "bool",
				"name": "isDecided",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "isApproved",
				"type": "bool"
			},
			{
				"internalType": "uint8",
				"name": "approvals",
				"type": "uint8"
			},
			{
				"internalType": "uint8",
				"name": "rejections",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_paperId",
				"type": "uint256"
			}
		],
		"name": "getPaperVoters",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
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
		"name": "minRequiredVotes",
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
		"inputs": [],
		"name": "paperCount",
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
				"name": "",
				"type": "uint256"
			}
		],
		"name": "papers",
		"outputs": [
			{
				"internalType": "address",
				"name": "author",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "contentHash",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "accessPrice",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "decided",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			},
			{
				"internalType": "uint8",
				"name": "approvalCount",
				"type": "uint8"
			},
			{
				"internalType": "uint8",
				"name": "rejectionCount",
				"type": "uint8"
			},
			{
				"internalType": "string",
				"name": "teamMembers",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "researchField",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "isRevision",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "previousVersion",
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
				"name": "",
				"type": "uint256"
			}
		],
		"name": "paperStakes",
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
				"name": "",
				"type": "uint256"
			}
		],
		"name": "stakeReturned",
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
		"name": "stakingAmount",
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
	}
  ];

  // Check if user has connected wallet on mount
  useEffect(() => {
    checkWalletConnection();
  }, []);
  
  // When wallet is connected, fetch papers
  useEffect(() => {
    if (isConnected && contract) {
      fetchPapers();
      checkMemberStatus();
    }
  }, [isConnected, contract]);

  // Check if user has already requested membership
  useEffect(() => {
    const checkExistingRequest = async () => {
      if (!currentUser || !walletAddress) return;
      
      try {
        const requestQuery = query(
          collection(db, 'membershipRequests'),
          where('walletAddress', '==', walletAddress),
          where('status', '==', 'pending')
        );
        
        const requestSnapshot = await getDocs(requestQuery);
        setHasRequestedMembership(!requestSnapshot.empty);
      } catch (err) {
        console.error('Error checking membership requests:', err);
      }
    };
    
    if (walletAddress) {
      checkExistingRequest();
    }
  }, [currentUser, walletAddress]);

  // Check if wallet is connected
  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const ethersProvider = new ethers.BrowserProvider(window.ethereum);
          const ethersSigner = await ethersProvider.getSigner();
          
          // Initialize contract instance
          const contractInstance = new ethers.Contract(
            contractAddress,
            contractABI,
            ethersSigner
          );
          
          setWalletAddress(accounts[0]);
          setProvider(ethersProvider);
          setSigner(ethersSigner);
          setContract(contractInstance);
          setIsConnected(true);
          
          // Setup event listeners
          window.ethereum.on('accountsChanged', handleAccountsChanged);
          window.ethereum.on('chainChanged', handleChainChanged);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
        setError('Failed to connect to wallet. Please check your connection and try again.');
      }
    }
  };

  // Handle account changes
  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      // User disconnected wallet
      setIsConnected(false);
      setWalletAddress('');
      setPapers([]);
    } else {
      // User switched accounts
      setWalletAddress(accounts[0]);
      if (contract) {
        await fetchPapers();
        await checkMemberStatus();
      }
    }
  };

  // Handle chain changes
  const handleChainChanged = () => {
    window.location.reload();
  };

  // Initialize wallet and contract
  const initializeContract = async () => {
    if (!window.ethereum) {
      setError("MetaMask not detected. Please install MetaMask to use this feature.");
      return;
    }
    
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const userAddress = accounts[0];
      
      // Create provider and signer
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      const ethersSigner = await ethersProvider.getSigner();
      
      // Initialize contract instance
      const contractInstance = new ethers.Contract(
        contractAddress,
        contractABI,
        ethersSigner
      );
      
      // Update state
      setWalletAddress(userAddress);
      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setContract(contractInstance);
      setIsConnected(true);
      
      // Check if the user is a DAO member
      await checkDAOMembership();
      
      // Fetch papers
      await fetchPapers();
      
    } catch (error) {
      console.error('Error initializing contract:', error);
      setError('Failed to initialize contract. Please check your connection and try again.');
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    setError('');
    try {
      await initializeContract();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(`Failed to connect wallet: ${error.message}`);
    }
  };

  // Check if the current address is a DAO member
  const checkMemberStatus = async () => {
    try {
      if (contract && walletAddress) {
        const memberStatus = await contract.members(walletAddress);
        setIsMember(memberStatus);
      }
    } catch (error) {
      console.error('Error checking member status:', error);
      setError('Failed to check DAO membership status.');
    }
  };

  // Check if user has already voted on a specific paper
  const checkUserVoted = async (paperId) => {
    try {
      if (!contract || !walletAddress) return false;
      
      // Get the voters for the paper
      const voters = await contract.getPaperVoters(paperId);
      
      // Check if the current user's wallet address is in the voters array
      return voters.some(voter => voter.toLowerCase() === walletAddress.toLowerCase());
    } catch (error) {
      console.error('Error checking if user voted:', error);
      return false;
    }
  };

  // Fetch papers from the contract
  const fetchPapers = async () => {
    setLoading(true);
    setError('');
    try {
      if (!contract) return;
      
      // Get total paper count
      const count = await contract.paperCount();
      const paperCount = parseInt(count.toString());
      
      const fetchedPapers = [];
      
      // Fetch details for each paper
      for (let i = 0; i < paperCount; i++) {
        try {
          // Get paper details
          const details = await contract.getPaperDetails(i);
          
          // Get paper status (if decided, approved, etc.)
          const status = await contract.getPaperStatus(i);
          
          // Check if current user has already voted on this paper
          let hasVoted = false;
          
          // If user is a member, check if they've voted on the paper
          if (isMember && walletAddress) {
            hasVoted = await checkUserVoted(i);
          }
          
          // Format price from wei to ETH
          const priceInEth = ethers.formatEther(details.price);
          
          // Get min required votes to display in UI
          const minVotes = await contract.minRequiredVotes();
          
          // Try to get additional metadata from Firestore
          let firestoreData = null;
          try {
            // Query Firestore for paper with matching hash or transaction data
            const papersRef = collection(db, 'papers');
            const contentHash = details.contentHash || ""; // This might be the IPFS hash

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
                // Find the most likely match if multiple papers by same author
                firestoreData = altQuerySnapshot.docs.find(doc => 
                  doc.data().title === details.title || 
                  doc.data().teamMembers.includes(details.teamMembers)
                )?.data() || altQuerySnapshot.docs[0].data();
              }
            }
          } catch (firestoreError) {
            console.error('Error fetching paper metadata from Firestore:', firestoreError);
            // Continue without Firestore data
          }
          
          // Only add papers that the user hasn't voted on yet
          if (!hasVoted) {
            fetchedPapers.push({
              id: i,
              author: details.author,
              title: details.title,
              price: priceInEth,
              teamMembers: details.teamMembers,
              researchField: details.researchField,
              isApproved: details.isApproved,
              isRevision: details.isRevision,
              previousVersion: details.previousVersion.toString(),
              isDecided: status.isDecided,
              approvalCount: Number(status.approvals),
              rejectionCount: Number(status.rejections),
              hasVoted: hasVoted,
              minRequiredVotes: minVotes ? Number(minVotes.toString()) : 3, // Default to 3 if not available
              
              // Additional data from Firestore if available
              abstract: firestoreData?.abstract || '',
              fileName: firestoreData?.fileName || '',
              fileSize: firestoreData?.fileSize || 0,
              fileUrl: firestoreData?.fileUrl || '',
              ipfsHash: firestoreData?.ipfsHash || contentHash,
              submissionDate: firestoreData?.submissionDate?.toDate?.() || null,
              firestoreId: firestoreData?.id || null,
              authorName: firestoreData?.authorName || 'Anonymous Researcher',
              authorEmail: firestoreData?.authorEmail || '',
              // Add plagiarism data
              plagiarism: firestoreData?.plagiarism || null
            });
          }
        } catch (error) {
          console.error(`Error fetching paper ${i}:`, error);
        }
      }
      
      // Sort papers: pending first, then approved, then rejected
      fetchedPapers.sort((a, b) => {
        if (!a.isDecided && b.isDecided) return -1;
        if (a.isDecided && !b.isDecided) return 1;
        if (a.isDecided && b.isDecided) {
          if (a.isApproved && !b.isApproved) return -1;
          if (!a.isApproved && b.isApproved) return 1;
        }
        return b.id - a.id; // Newest papers first within each category
      });
      
      setPapers(fetchedPapers);
    } catch (error) {
      console.error('Error fetching papers:', error);
      setError('Failed to load papers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Open voting modal for a paper
  const handleOpenVoteModal = (paperId) => {
    console.log("Opening vote modal for paper ID:", paperId);
    setVotingPaperId(paperId);
    setVoteComment('');
    setVoteApproval(true);
  };

  // Close voting modal
  const handleCloseVoteModal = () => {
    setVotingPaperId(null);
  };

  // Submit vote
  const handleSubmitVote = async () => {
    if (!contract || votingPaperId === null || !voteComment.trim()) {
      return;
    }
    
    setSubmittingVote(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // First check if the user has already voted
      const hasVoted = await checkUserVoted(votingPaperId);
      
      if (hasVoted) {
        setError("You have already voted on this paper.");
        setSubmittingVote(false);
        return;
      }
      
      // Get paper details to check if it's already decided
      const status = await contract.getPaperStatus(votingPaperId);
      
      if (status.isDecided) {
        setError("This paper has already been decided upon.");
        setSubmittingVote(false);
        return;
      }
      
      // Call the voteOnPaper function
      const tx = await contract.voteOnPaper(
        votingPaperId,
        voteApproval,
        voteComment
      );
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log('Vote transaction receipt:', receipt);
      
      // Close modal
      setVotingPaperId(null);
      
      // Display success message and navigate to My Reviews page
      setSuccessMessage(`Vote submitted successfully for paper #${votingPaperId}! Redirecting you to My Reviews...`);
      
      // Clear success message after 3 seconds and navigate
      setTimeout(() => {
        setSuccessMessage('');
        navigate('/my-reviews');
      }, 3000);
    } catch (error) {
      console.error('Error submitting vote:', error);
      
      // Format user-friendly error message
      let errorMessage = 'Failed to submit vote';
      
      if (error.reason) {
        errorMessage += `: ${error.reason}`;
      } else if (error.message) {
        const matches = error.message.match(/'([^']*)'|"([^"]*)"/);
        if (matches && (matches[1] || matches[2])) {
          errorMessage += `: ${matches[1] || matches[2]}`;
        } else {
          errorMessage += `: ${error.message}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setSubmittingVote(false);
    }
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Navigate to wallet connection page
  const handleGoToWalletConnection = () => {
    navigate('/wallet-connection');
  };

  // Return to dashboard
  const handleBackToDashboard = () => {
    navigate('/user-dashboard');
  };

  // New function to handle membership request
  const handleRequestMembership = async () => {
    if (!currentUser || !walletAddress) {
      setError('You need to connect your wallet first');
      return;
    }

    setRequestLoading(true);
    setError('');
    try {
      // Create a membership request document in Firestore
      await addDoc(collection(db, 'membershipRequests'), {
        walletAddress: walletAddress,
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.email.split('@')[0],
        reason: requestReason,
        status: 'pending',
        createdAt: serverTimestamp(),
        userId: currentUser.uid
      });
      
      setRequestSuccess(true);
      setHasRequestedMembership(true); // Update the request status
      
      setTimeout(() => {
        setShowRequestModal(false);
        setRequestSuccess(false);
      }, 3000);
    } catch (err) {
      setError(`Failed to submit request: ${err.message}`);
    }
    setRequestLoading(false);
  };

  // Modify the "Not a DAO Member" display section to include a button
  const renderNotMemberMessage = () => {
    return (
      <div className="bg-amber-50 border border-amber-100 p-8 rounded-lg text-center max-w-md mx-auto">
        <div className="flex justify-center mb-4">
          <svg className="w-12 h-12 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">Not a DAO Member</h3>
        <p className="text-gray-600 mb-6">
          You are not registered as a member of the ScholarDAO. Only members can vote on paper submissions.
        </p>
        
        {hasRequestedMembership ? (
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <p className="text-blue-700 font-medium">Membership Request Pending</p>
            <p className="text-sm text-blue-600 mt-1">
              Your request to join the ScholarDAO is under review. You'll be notified once it's approved.
            </p>
          </div>
        ) : (
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-4 py-2 bg-orion-darkGray text-white rounded-md hover:bg-orion-mediumGray transition-colors"
          >
            Request Membership
          </button>
        )}
        
        <p className="mt-3 text-sm text-gray-500">
          Need help? Contact the DAO administrator for assistance.
        </p>
      </div>
    );
  };

  // Add the membership request modal
  const renderRequestModal = () => {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${showRequestModal ? 'block' : 'hidden'}`}>
        <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowRequestModal(false)}></div>
        <div className="bg-white rounded-lg p-6 max-w-md w-full relative z-10">
          <h3 className="text-xl font-semibold mb-4">Request DAO Membership</h3>
          
          {requestSuccess ? (
            <div className="p-4 bg-green-100 text-green-700 rounded-md mb-4">
              Your membership request has been submitted successfully! The DAO administrator will review your request.
            </div>
          ) : (
            <>
              <p className="mb-4 text-gray-600">
                Please provide a reason why you would like to become a member of the ScholarDAO. This information will help the administrator review your request.
              </p>
              
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md mb-4 h-32"
                placeholder="Explain why you would like to join the ScholarDAO..."
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                disabled={requestLoading}
              ></textarea>
              
              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md mb-4">
                  {error}
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowRequestModal(false)}
                  disabled={requestLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestMembership}
                  disabled={requestLoading || !requestReason.trim()}
                  className="px-4 py-2 bg-orion-darkGray text-white rounded-md hover:bg-orion-mediumGray disabled:opacity-50"
                  tabIndex="0"
                  aria-label="Submit membership request"
                >
                  {requestLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </div>
                  ) : 'Submit Request'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Function to check if the user is a DAO member
  const checkDAOMembership = async () => {
    try {
      if (!contract || !walletAddress) {
        setIsMember(false);
        return false;
      }
      
      // Call the members mapping in the contract to check membership
      const isMemberResult = await contract.members(walletAddress);
      setIsMember(isMemberResult);
      
      return isMemberResult;
    } catch (error) {
      console.error('Error checking DAO membership:', error);
      setError('Failed to check DAO membership status.');
      setIsMember(false);
      return false;
    }
  };

  // Add function to open the IPFS PDF in a new tab
  const handleViewPaper = (fileUrl) => {
    if (!fileUrl) {
      setError('PDF URL not available for this paper.');
      return;
    }
    
    // Open the PDF in a new tab
    window.open(fileUrl, '_blank');
  };
  
  // Format file size for display
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        day: 'numeric'
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  };

  // Format file name from URL 
  const formatFileName = (url) => {
    if (!url) return 'Research Paper.pdf';
    
    try {
      // Try to extract filename from URL
      const parts = url.split('/');
      let fileName = parts[parts.length - 1];
      
      // Remove any query parameters
      fileName = fileName.split('?')[0];
      
      // If it's an IPFS hash with no extension, add .pdf
      if (fileName.length > 30 && !fileName.includes('.')) {
        return 'Research Paper.pdf';
      }
      
      // If it's still very long (likely a hash), use generic name
      if (fileName.length > 30) {
        return 'Research Paper.pdf';
      }
      
      // If no extension, add .pdf
      if (!fileName.includes('.')) {
        fileName += '.pdf';
      }
      
      return fileName;
    } catch (err) {
      console.error('Error formatting file name:', err);
      return 'Research Paper.pdf';
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
                  <span className="ml-1 text-sm font-medium text-orion-darkGray md:ml-2">Paper Approvals</span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-orion-darkGray">Research Papers for Review</h1>
              <p className="text-orion-gray mt-1">
                Review and vote on research papers as a committee member
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              {userRole === 'admin' && (
                <Link
                  to="/admin/committee"
                  className="text-orion-mediumGray hover:text-orion-darkGray flex items-center"
                  tabIndex="0"
                  aria-label="Manage ScholarDAO Committee"
                >
                  <svg className="w-5 h-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Manage Committee
                </Link>
              )}
              <button
                onClick={handleBackToDashboard}
                className="text-orion-darkGray hover:text-orion-mediumGray flex items-center"
                tabIndex="0"
                aria-label="Return to dashboard"
              >
                <svg className="w-5 h-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
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
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 text-green-700">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-orion-darkGray to-orion-mediumGray p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Research Paper Verification</h2>
            <p className="opacity-90">
              Review and vote on submitted research papers. As a DAO member, you help maintain the quality and
              integrity of research on the Orion platform by verifying submissions.
            </p>
          </div>

          {/* Wallet Connection Status */}
          {!isConnected ? (
            <div className="p-8 text-center">
              <div className="bg-orion-lightBg rounded-lg p-6 max-w-md mx-auto">
                <svg className="mx-auto h-12 w-12 text-orion-gray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-orion-darkGray">Wallet Not Connected</h3>
                <p className="mt-2 text-sm text-orion-gray">
                  To view and vote on papers, you need to connect your wallet first.
                </p>
                <div className="mt-6 flex flex-col space-y-3">
                  <button
                    onClick={connectWallet}
                    className="w-full px-4 py-2 bg-gradient-to-r from-orion-darkGray to-orion-mediumGray text-white rounded-md shadow-sm text-sm font-medium hover:from-orion-darkGray hover:to-orion-darkGray transition-all"
                    tabIndex="0"
                    aria-label="Connect wallet"
                  >
                    Connect Wallet
                  </button>
                  <button
                    onClick={handleGoToWalletConnection}
                    className="w-full px-4 py-2 border border-orion-gray text-orion-gray rounded-md text-sm font-medium hover:bg-orion-lightGray/50 transition-colors"
                    tabIndex="0"
                    aria-label="Go to wallet connection page"
                  >
                    Go to Wallet Connection Page
                  </button>
                </div>
              </div>
            </div>
          ) : !isMember ? (
            renderNotMemberMessage()
          ) : hasRequestedMembership ? (
            <div className="text-center p-8">
              <svg className="mx-auto h-12 w-12 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Membership Request Pending</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your request to join the DAO is currently under review. 
                You will be notified once your request has been approved.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleBackToDashboard}
                  className="px-4 py-2 bg-orion-darkGray text-white rounded-md hover:bg-orion-mediumGray transition-colors"
                  tabIndex="0"
                  aria-label="Return to dashboard"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8">
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
              
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                      <div className="w-full h-2 bg-gray-200"></div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-3/4">
                            <div className="h-6 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-100 rounded w-1/3 mb-2"></div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                            <div className="ml-2">
                              <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                              <div className="h-3 bg-gray-100 rounded w-16"></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1">
                            <div className="w-24 h-4 bg-gray-200 rounded"></div>
                            <div className="w-16 h-3 bg-gray-100 rounded"></div>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gray-300 w-2/5"></div>
                          </div>
                        </div>
                        
                        <div className="h-16 bg-gray-100 rounded mb-4"></div>
                        
                        <div className="flex items-center justify-between">
                          <div className="w-20 h-4 bg-gray-200 rounded"></div>
                          <div className="w-28 h-8 bg-gray-300 rounded-md"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : papers.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-orion-gray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-orion-darkGray">No Papers Found</h3>
                  <p className="mt-2 text-sm text-orion-gray">
                    There are currently no papers available for review.
                  </p>
                </div>
              ) : (
                <div className="mt-6">
                  <div className="space-y-4">
                    {papers.map(paper => (
                      <div key={paper.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-medium text-orion-darkGray">{paper.title}</h3>
                              <p className="text-sm text-orion-gray mt-1">
                                {paper.researchField ? `${paper.researchField}` : 'Research Paper'}
                                {paper.price && ` • ${paper.price} ETH`}
                              </p>
                            </div>
                            {paper.authorDetails && (
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-orion-lightGray flex items-center justify-center text-orion-darkGray font-medium text-sm">
                                  {paper.authorDetails.name ? paper.authorDetails.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="ml-2">
                                  <p className="text-sm font-medium">{paper.authorDetails.name || 'Unknown Author'}</p>
                                  <p className="text-xs text-orion-gray">{formatDate(paper.submissionDate)}</p>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Add plagiarism badge */}
                          {paper.plagiarism && paper.plagiarism.status === 'completed' && (
                            <div className="mb-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                paper.plagiarism.isUnavailable ? 'bg-gray-100 text-gray-800' :
                                paper.plagiarism.isPlagiarized 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {paper.plagiarism.isUnavailable ? (
                                  <>
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    Check unavailable
                                  </>
                                ) : paper.plagiarism.isPlagiarized ? (
                                  <>
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                                    </svg>
                                    Plagiarism detected
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                    </svg>
                                    Original content
                                  </>
                                )}
                              </span>
                            </div>
                          )}
                          
                          {/* Vote Progress Indicator */}
                          {paper.voteCount !== undefined && paper.requiredVotes !== undefined && (
                            <div className="mb-4">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-orion-darkGray">Review Progress</span>
                                <span className="text-xs text-orion-gray">{paper.voteCount} of {paper.requiredVotes} votes</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-orion-darkGray to-orion-mediumGray" 
                                  style={{ width: `${(paper.voteCount / paper.requiredVotes) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                          
                          <p className="text-sm text-orion-gray mb-4 line-clamp-2">
                            {paper.abstract || 'No abstract available for this paper.'}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 text-orion-gray mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs text-orion-gray">{formatDate(paper.submissionDate)}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                console.log("Clicked Review & Vote for paper:", paper.id);
                                console.log("Paper details:", paper);
                                setVotingPaperId(paper.id);
                                setVoteComment('');
                                setVoteApproval(true);
                              }}
                              className="px-4 py-2 bg-orion-darkGray text-white rounded-md shadow-sm text-sm font-medium hover:bg-orion-mediumGray transition-colors"
                              tabIndex="0"
                              aria-label="Review and vote on this paper"
                            >
                              Review & Vote
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Voting Modal */}
      {console.log("Voting modal check - votingPaperId:", votingPaperId)}
      {votingPaperId !== null && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
        {console.log("Rendering modal for paper ID:", votingPaperId)}
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-orion-darkGray">Review & Vote</h3>
              <button
                onClick={handleCloseVoteModal}
                className="text-orion-gray hover:text-orion-darkGray rounded-full p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="p-6">
              {console.log("Papers array:", papers)}
              {console.log("Looking for paper with ID:", votingPaperId)}
              {console.log("Paper found:", papers.find(p => p.id === votingPaperId))}
              {papers.find(p => p.id === votingPaperId) ? (
                <div>
                  <div className="mb-6">
                    <h4 className="text-xl font-semibold text-orion-darkGray mb-2">
                      {papers.find(p => p.id === votingPaperId).title}
                    </h4>
                    
                    <div className="flex flex-wrap gap-3 mb-4">
                      <div className="flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm text-orion-gray">
                        <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {papers.find(p => p.id === votingPaperId).researchField}
                      </div>
                      
                      <div className="flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm text-orion-gray">
                        <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {papers.find(p => p.id === votingPaperId).price} ETH
                      </div>
                    </div>

                    {/* Vote Progress Indicator */}
                    <div className="mb-5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-orion-darkGray">Review Progress</span>
                        <span className="text-sm text-orion-gray">
                          {papers.find(p => p.id === votingPaperId).approvalCount + papers.find(p => p.id === votingPaperId).rejectionCount} of {papers.find(p => p.id === votingPaperId).minRequiredVotes} votes
                        </span>
                      </div>
                      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orion-darkGray to-orion-mediumGray" 
                          style={{ 
                            width: `${Math.min(100, ((papers.find(p => p.id === votingPaperId).approvalCount + 
                            papers.find(p => p.id === votingPaperId).rejectionCount) / 
                            papers.find(p => p.id === votingPaperId).minRequiredVotes) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="mb-5">
                      <h5 className="text-sm font-semibold text-orion-darkGray mb-2">Abstract</h5>
                      <div className="bg-orion-lightBg/30 p-3 rounded-md">
                        <p className="text-sm">
                          {papers.find(p => p.id === votingPaperId).abstract || 'No abstract available for this paper.'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Plagiarism Check Results */}
                    <div className="mb-5">
                      <h5 className="text-sm font-semibold text-orion-darkGray mb-2">Plagiarism Check</h5>
                      <PlagiarismResultsCard 
                        plagiarismData={papers.find(p => p.id === votingPaperId).plagiarism} 
                        showDetails={true}
                      />
                    </div>

                    {papers.find(p => p.id === votingPaperId).fileUrl && (
                      <div className="mb-5 bg-gray-50 p-4 rounded-md">
                        <h5 className="text-sm font-semibold text-orion-darkGray mb-2">Research Paper</h5>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <svg className="w-6 h-6 text-orion-gray mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div>
                              <p className="font-medium">{formatFileName(papers.find(p => p.id === votingPaperId).fileUrl) || 'Research Paper.pdf'}</p>
                              {papers.find(p => p.id === votingPaperId).fileSize && (
                                <p className="text-sm text-orion-gray">{formatFileSize(papers.find(p => p.id === votingPaperId).fileSize)}</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleViewPaper(papers.find(p => p.id === votingPaperId).fileUrl)}
                            className="px-4 py-2 bg-orion-darkGray text-white text-sm font-medium rounded-md hover:bg-orion-mediumGray transition-colors flex items-center"
                            tabIndex="0"
                            aria-label="View full paper in new tab"
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

                      <div className="border-t border-gray-200 pt-6">
                      <h5 className="font-semibold text-orion-darkGray mb-4">Cast Your Vote</h5>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-orion-darkGray mb-2">
                          Your Decision
                        </label>
                        <div className="flex space-x-4">
                          <button
                            onClick={() => setVoteApproval(true)}
                            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium ${
                              voteApproval 
                                ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                                : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                            }`}
                            tabIndex="0"
                            aria-label="Approve paper"
                          >
                            <div className="flex justify-center items-center">
                              <svg className={`w-5 h-5 mr-2 ${voteApproval ? 'text-green-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                              Approve
                            </div>
                          </button>
                          <button
                            onClick={() => setVoteApproval(false)}
                            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium ${
                              !voteApproval 
                                ? 'bg-red-100 text-red-800 border-2 border-red-300' 
                                : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                            }`}
                            tabIndex="0"
                            aria-label="Reject paper"
                          >
                            <div className="flex justify-center items-center">
                              <svg className={`w-5 h-5 mr-2 ${!voteApproval ? 'text-red-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                              </svg>
                              Reject
                            </div>
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="comment" className="block text-sm font-medium text-orion-darkGray mb-2">
                          Comment (required)
                        </label>
                        <textarea
                          id="comment"
                          value={voteComment}
                          onChange={(e) => setVoteComment(e.target.value)}
                          placeholder={voteApproval 
                            ? "Explain why you approve this paper..." 
                            : "Explain why you reject this paper..."}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orion-darkGray focus:border-orion-darkGray"
                          rows="4"
                          tabIndex="0"
                          aria-label="Enter your comment"
                          required
                        />
                        <p className="mt-1 text-xs text-orion-gray">
                          Your comment will be visible to the author and other DAO members.
                        </p>
                      </div>
                      
                      {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                          {error}
                        </div>
                      )}
                      
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={handleCloseVoteModal}
                          className="px-4 py-2 border border-gray-300 text-orion-gray rounded-md shadow-sm text-sm font-medium hover:bg-gray-50"
                          tabIndex="0"
                          aria-label="Cancel voting"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSubmitVote}
                          disabled={submittingVote || !voteComment.trim()}
                          className={`px-6 py-2 rounded-md shadow-sm text-sm font-medium 
                            ${voteComment.trim() && !submittingVote
                              ? "bg-orion-darkGray text-white hover:bg-orion-mediumGray" 
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                          tabIndex="0"
                          aria-label="Submit your vote"
                        >
                          {submittingVote ? (
                            <div className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Submitting...
                            </div>
                          ) : (
                            "Submit Vote"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>No paper found for the given ID.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add the request modal */}
      {renderRequestModal()}
    </DashboardLayout>
  );
};

export default PaperApprovals; 