import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const PaperApprovals = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
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
  
  // Contract details from WalletConnection.jsx
  const contractAddress = '0x56bed8Fb1C2081057cbcF72b3f9828E5799a955C';
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

  // Connect to wallet if not connected
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        // The checkWalletConnection useEffect will handle the rest
      } catch (error) {
        console.error('User rejected wallet connection:', error);
        setError('Failed to connect wallet. Please try again and approve the connection request.');
      }
    } else {
      setError('MetaMask is not installed. Please install MetaMask to use this feature.');
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
      
      // Get voters for the paper
      const voters = await contract.getPaperVoters(paperId);
      
      // Check if current wallet address is in the voters array
      return voters.some(voter => 
        voter.toLowerCase() === walletAddress.toLowerCase()
      );
    } catch (error) {
      console.error(`Error checking if user voted on paper ${paperId}:`, error);
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
            minRequiredVotes: minVotes ? Number(minVotes.toString()) : 3 // Default to 3 if not available
          });
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
      
      // Close modal and refresh papers
      setSuccessMessage(`Vote submitted successfully for paper #${votingPaperId}! Transaction hash: ${receipt.hash.substring(0, 10)}...`);
      setVotingPaperId(null);
      await fetchPapers();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 7000);
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

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-orion-darkGray">Paper Approvals</h1>
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
            <div className="p-8 text-center">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-md mx-auto">
                <svg className="mx-auto h-12 w-12 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-orion-darkGray">Not a DAO Member</h3>
                <p className="mt-2 text-sm text-orion-gray">
                  You are not registered as a member of the ScholarDAO. Only members can vote on paper submissions.
                </p>
                <p className="mt-2 text-xs text-orion-gray">
                  Please contact the DAO administrator to request membership.
                </p>
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
                <div className="flex justify-center items-center py-12">
                  <svg className="animate-spin h-8 w-8 text-orion-mediumGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-3 text-orion-gray">Loading papers...</span>
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
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-orion-darkGray mb-2">Papers for Review</h3>
                    <p className="text-sm text-orion-gray">
                      Below are the submitted research papers that require verification. Papers need {isMember && 'at least'} votes from DAO members before they can be approved or rejected.
                    </p>
                  </div>
                  
                  {/* Paper List */}
                  <div className="space-y-6">
                    {papers.map((paper) => (
                      <div 
                        key={paper.id}
                        className={`border rounded-lg overflow-hidden ${
                          paper.isDecided
                            ? paper.isApproved
                              ? 'border-green-200 bg-green-50'
                              : 'border-red-200 bg-red-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                            <div className="mb-4 sm:mb-0 sm:mr-6">
                              <h4 className="text-xl font-medium text-orion-darkGray">{paper.title}</h4>
                              
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                  ID: {paper.id}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                                  {paper.researchField}
                                </span>
                                {paper.isRevision && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-800">
                                    Revision of #{paper.previousVersion}
                                  </span>
                                )}
                              </div>
                              
                              <div className="mt-3 text-sm text-orion-gray">
                                <p><span className="font-medium">Author:</span> {formatAddress(paper.author)}</p>
                                <p><span className="font-medium">Team:</span> {paper.teamMembers}</p>
                                <p><span className="font-medium">Access Price:</span> {paper.price} EDU</p>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-start sm:items-end space-y-3">
                              {/* Voting Progress */}
                              <div className="w-full max-w-[200px]">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Voting Progress</span>
                                  <span>{paper.approvalCount + paper.rejectionCount} / {paper.minRequiredVotes} votes</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                                  <div 
                                    className="bg-orion-darkGray h-2.5 rounded-full" 
                                    style={{ width: `${Math.min(100, ((Number(paper.approvalCount) + Number(paper.rejectionCount)) / Number(paper.minRequiredVotes)) * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center text-green-600">
                                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                  </svg>
                                  <span className="ml-1">{paper.approvalCount}</span>
                                </div>
                                <div className="flex items-center text-red-600">
                                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                  </svg>
                                  <span className="ml-1">{paper.rejectionCount}</span>
                                </div>
                              </div>
                              
                              {/* Status Badge */}
                              {paper.isDecided ? (
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  paper.isApproved
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {paper.isApproved ? 'Approved' : 'Rejected'}
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                  Pending Verification
                                </span>
                              )}
                              
                              {/* Vote Button */}
                              {!paper.isDecided && !paper.hasVoted && paper.author.toLowerCase() !== walletAddress.toLowerCase() && (
                                <button
                                  onClick={() => handleOpenVoteModal(paper.id)}
                                  className="mt-2 px-4 py-2 bg-orion-darkGray text-white rounded-md shadow-sm text-sm font-medium hover:bg-orion-mediumGray transition-colors"
                                  tabIndex="0"
                                  aria-label={`Vote on paper ${paper.title}`}
                                >
                                  Cast Vote
                                </button>
                              )}
                              
                              {paper.hasVoted && (
                                <span className="text-xs text-orion-gray mt-2 italic">You have already voted on this paper</span>
                              )}
                              
                              {paper.author.toLowerCase() === walletAddress.toLowerCase() && (
                                <span className="text-xs text-orion-gray mt-2 italic">You cannot vote on your own paper</span>
                              )}
                            </div>
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
      {votingPaperId !== null && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-orion-darkGray mb-4">
                Vote on Paper #{votingPaperId}
              </h3>
              
              {papers.find(p => p.id === votingPaperId) && (
                <div className="mb-4 text-sm">
                  <p className="font-medium">{papers.find(p => p.id === votingPaperId).title}</p>
                  <p className="text-orion-gray mt-1">{papers.find(p => p.id === votingPaperId).researchField}</p>
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-orion-darkGray mb-2">
                  Your Decision
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setVoteApproval(true)}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium ${
                      voteApproval 
                        ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                        : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                    }`}
                    tabIndex="0"
                    aria-label="Approve paper"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setVoteApproval(false)}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium ${
                      !voteApproval 
                        ? 'bg-red-100 text-red-800 border-2 border-red-300' 
                        : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                    }`}
                    tabIndex="0"
                    aria-label="Reject paper"
                  >
                    Reject
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orion-darkGray focus:border-orion-darkGray"
                  rows="4"
                  tabIndex="0"
                  aria-label="Enter your comment"
                  required
                />
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
                  className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium 
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
      )}
    </DashboardLayout>
  );
};

export default PaperApprovals; 