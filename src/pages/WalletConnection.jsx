import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

const WalletConnection = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Wallet connection state
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  
  // Chain details for Open Campus
  const chainDetails = {
    chainId: '0xA045C', // 655854 in hex (corrected from '0xA01EC')
    chainName: 'EDU Chain Testnet',
    rpcUrls: ['https://open-campus-codex-sepolia.drpc.org'],
    blockExplorerUrls: ['https://opencampus-codex.blockscout.com'],
    nativeCurrency: {
      name: 'EDU',
      symbol: 'EDU',
      decimals: 18
    }
  };
  
  // Contract ABI - placeholder
  const contractABI = [
    [
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
    ]  ];
  
  // Contract address - update with the actual contract address
  const contractAddress = '0x90A526394880FbA461D607a4f606A4B10A246F2A'; // Example contract address for EDU chain

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined';
  };

  // Add the Open Campus network to MetaMask
  const addNetwork = async () => {
    if (!isMetaMaskInstalled()) return false;
    
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: chainDetails.chainId,
          chainName: chainDetails.chainName,
          rpcUrls: chainDetails.rpcUrls,
          blockExplorerUrls: chainDetails.blockExplorerUrls,
          nativeCurrency: chainDetails.nativeCurrency
        }]
      });
      return true;
    } catch (error) {
      console.error('Error adding network:', error);
      setConnectionError(`Failed to add network: ${error.message}`);
      return false;
    }
  };

  // Connect to MetaMask wallet
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      setConnectionError('MetaMask is not installed. Please install MetaMask to connect.');
      return;
    }

    setIsConnecting(true);
    setConnectionError('');

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Add the Open Campus network if needed
      const networkAdded = await addNetwork();
      if (!networkAdded) {
        throw new Error('Failed to add Open Campus network to MetaMask. Please try again or add it manually.');
      }
      
      // Switch to the Open Campus network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainDetails.chainId }]
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          const networkAdded = await addNetwork();
          if (!networkAdded) {
            throw new Error('Failed to add Open Campus network. Please check your MetaMask settings and try again.');
          }
          
          // Try switching again after adding
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: chainDetails.chainId }]
          });
        } else {
          console.error('Chain switch error:', switchError);
          throw new Error(`Failed to switch to Open Campus network: ${switchError.message}`);
        }
      }
      
      // Set up ethers provider and signer
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
      
      // Setup event listeners for account and chain changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setConnectionError(`Failed to connect wallet: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle account changes
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnectWallet();
    } else {
      // User switched accounts
      setWalletAddress(accounts[0]);
    }
  };

  // Handle chain changes
  const handleChainChanged = () => {
    // Reload the page when the chain changes
    window.location.reload();
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletAddress('');
    setProvider(null);
    setSigner(null);
    setContract(null);
    
    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  };

  // Format address for display (0x1234...5678)
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Check for existing MetaMask connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (isMetaMaskInstalled()) {
        try {
          // Check if user is already connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            // User is already connected
            setWalletAddress(accounts[0]);
            
            // Setup provider and signer
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
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
          }
        } catch (error) {
          console.error('Error checking for existing connection:', error);
          // Don't set error state here to avoid showing error on initial load
        }
      }
    };
    
    checkConnection();
    
    // Cleanup event listeners when component unmounts
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // Example function that shows how to interact with the contract
  const testContractInteraction = async () => {
    try {
      if (!contract) {
        throw new Error('Contract is not initialized');
      }
      
      // Get the staking amount from the smart contract
      const stakingAmount = await contract.stakingAmount();
      
      // Format the value for display
      const formattedAmount = ethers.formatEther(stakingAmount);
      
      // Show information about the contract and EDU tokens
      alert(`Contract interaction successful!\n\nCurrent staking amount: ${formattedAmount} EDU\n\nYou can now submit papers, verify research, and participate in the platform's governance.`);
      
      // Example of how you might call a contract method to submit a paper:
      // const tx = await contract.submitPaper(
      //   "My Research Paper", 
      //   "QmHash123456789", 
      //   ethers.parseEther("0.5"), // price in EDU
      //   "John Doe, Jane Smith", 
      //   "Computer Science",
      //   { value: stakingAmount } // Send the required staking amount in EDU
      // );
      // await tx.wait();
      // console.log("Paper submitted successfully!");
    } catch (error) {
      console.error('Contract interaction error:', error);
      setConnectionError(`Failed to interact with contract: ${error.message}`);
    }
  };

  // Return to dashboard
  const handleBackToDashboard = () => {
    navigate('/user-dashboard');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-orion-darkGray">Wallet Connection</h1>
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
            <h2 className="text-2xl font-bold mb-2">Connect Your Crypto Wallet</h2>
            <p className="opacity-90">
              Connecting your wallet allows you to interact with the Orion platform's blockchain features, 
              including submitting papers, verifying research, and earning rewards.
            </p>
          </div>

          {/* Wallet Connection UI */}
          <div className="p-8">
            {/* Connection Status */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-orion-darkGray mb-4">Connection Status</h3>
              <div className="p-4 bg-orion-lightBg rounded-lg">
                {walletAddress ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="mb-4 sm:mb-0">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="font-medium text-orion-darkGray">Connected</span>
                      </div>
                      <p className="text-orion-gray text-sm">
                        Wallet Address: <span className="font-mono">{formatAddress(walletAddress)}</span>
                      </p>
                    </div>
                    <button
                      onClick={disconnectWallet}
                      className="px-4 py-2 border border-orion-darkGray text-orion-darkGray rounded-md text-sm font-medium hover:bg-orion-lightGray/50 transition-colors"
                      tabIndex="0"
                      aria-label="Disconnect wallet"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="mb-4 sm:mb-0">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
                        <span className="font-medium text-orion-darkGray">Not Connected</span>
                      </div>
                      <p className="text-orion-gray text-sm">
                        Connect your wallet to access Orion's blockchain features
                      </p>
                    </div>
                    <button
                      onClick={connectWallet}
                      disabled={isConnecting}
                      className="px-4 py-2 bg-gradient-to-r from-orion-darkGray to-orion-mediumGray text-white rounded-md shadow-sm text-sm font-medium hover:from-orion-darkGray hover:to-orion-darkGray transition-all"
                      tabIndex="0"
                      aria-label="Connect wallet with MetaMask"
                    >
                      {isConnecting ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Connecting...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <svg className="mr-2 h-4 w-4" width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21.875 10.9375H3.125C1.39911 10.9375 0 12.3366 0 14.0625V20.3125C0 22.0384 1.39911 23.4375 3.125 23.4375H21.875C23.6009 23.4375 25 22.0384 25 20.3125V14.0625C25 12.3366 23.6009 10.9375 21.875 10.9375Z" fill="white"/>
                            <path d="M21.875 1.5625H3.125C1.39911 1.5625 0 2.96161 0 4.6875V6.25C0 7.97589 1.39911 9.375 3.125 9.375H21.875C23.6009 9.375 25 7.97589 25 6.25V4.6875C25 2.96161 23.6009 1.5625 21.875 1.5625Z" fill="white"/>
                          </svg>
                          Connect Wallet
                        </div>
                      )}
                    </button>
                  </div>
                )}
              </div>
              
              {/* Display connection error if any */}
              {connectionError && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                  <p className="text-sm">{connectionError}</p>
                  <p className="text-xs mt-2">
                    <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="underline">
                      Install MetaMask
                    </a>
                  </p>
                </div>
              )}
            </div>

            {/* Network Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-orion-darkGray mb-4">Network Details</h3>
              <div className="p-4 bg-orion-lightBg rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-orion-darkGray mb-2">Open Campus Network</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-orion-gray">Network Name:</span>
                        <span className="font-medium text-orion-darkGray">{chainDetails.chainName}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-orion-gray">Chain ID:</span>
                        <span className="font-medium text-orion-darkGray">{parseInt(chainDetails.chainId, 16)}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-orion-gray">Native Token:</span>
                        <span className="font-medium text-orion-darkGray">EDU</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-orion-gray">RPC URL:</span>
                        <span className="font-medium text-orion-darkGray truncate max-w-[200px]">{chainDetails.rpcUrls[0]}</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-orion-darkGray mb-2">Connection Details</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-orion-gray">Status:</span>
                        <span className="font-medium text-orion-darkGray">{walletAddress ? 'Connected' : 'Not Connected'}</span>
                      </li>
                      {walletAddress && (
                        <>
                          <li className="flex justify-between">
                            <span className="text-orion-gray">Address:</span>
                            <span className="font-medium text-orion-darkGray">{formatAddress(walletAddress)}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-orion-gray">Contract:</span>
                            <span className="font-medium text-orion-darkGray">{formatAddress(contractAddress)}</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Interaction (only shown when connected) */}
            {walletAddress && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-orion-darkGray mb-4">Contract Interaction</h3>
                <div className="p-4 bg-orion-lightBg rounded-lg">
                  <p className="text-orion-gray mb-4">
                    Now that your wallet is connected, you can interact with the Orion smart contracts to 
                    submit papers, verify research, and participate in the platform's governance.
                  </p>
                  <button
                    onClick={testContractInteraction}
                    className="px-4 py-2 bg-orion-darkGray text-white rounded-md shadow-sm text-sm font-medium hover:bg-orion-mediumGray transition-colors"
                    tabIndex="0"
                    aria-label="Test contract interaction"
                    disabled={!contract}
                  >
                    Test Contract Interaction
                  </button>
                </div>
              </div>
            )}

            {/* Help & Information */}
            <div>
              <h3 className="text-lg font-semibold text-orion-darkGray mb-4">Need Help?</h3>
              <div className="p-4 bg-orion-lightBg rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-orion-darkGray/10 flex items-center justify-center mr-3">
                      <svg className="h-6 w-6 text-orion-darkGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-orion-darkGray mb-1">What is MetaMask?</h4>
                      <p className="text-sm text-orion-gray">
                        MetaMask is a cryptocurrency wallet that allows you to interact with the Ethereum blockchain and compatible networks.
                      </p>
                      <a 
                        href="https://metamask.io/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-orion-darkGray hover:underline mt-1 inline-block"
                      >
                        Learn More
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-orion-darkGray/10 flex items-center justify-center mr-3">
                      <svg className="h-6 w-6 text-orion-darkGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-orion-darkGray mb-1">Why connect a wallet?</h4>
                      <p className="text-sm text-orion-gray">
                        Connecting your wallet allows you to access blockchain-enabled features on Orion, including token rewards for verified papers.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-orion-darkGray/10 flex items-center justify-center mr-3">
                      <svg className="h-6 w-6 text-orion-darkGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-orion-darkGray mb-1">What are EDU tokens?</h4>
                      <p className="text-sm text-orion-gray">
                        EDU is the native token of the Open Campus network (educhain). It's used for submitting papers, purchasing access to research, and rewarding verified contributions to the platform.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-orion-darkGray/10 flex items-center justify-center mr-3">
                      <svg className="h-6 w-6 text-orion-darkGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-orion-darkGray mb-1">Troubleshooting Connection Issues</h4>
                      <p className="text-sm text-orion-gray">
                        If you encounter connection errors:
                        <ul className="list-disc ml-4 mt-1">
                          <li>Check if MetaMask is installed and unlocked</li>
                          <li>Ensure you're using the correct network settings</li>
                          <li>Chain ID: {parseInt(chainDetails.chainId, 16)} (0x{chainDetails.chainId.substring(2)})</li>
                          <li>Try refreshing the page and attempting again</li>
                        </ul>
                      </p>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-orion-darkGray/10 flex items-center justify-center mr-3">
                      <svg className="h-6 w-6 text-orion-darkGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-orion-darkGray mb-1">How to Get EDU Tokens</h4>
                      <p className="text-sm text-orion-gray">
                        EDU tokens are used for all transactions on the Open Campus network. To obtain EDU tokens:
                        <ul className="list-disc ml-4 mt-1">
                          <li>Request test EDU tokens from the Open Campus faucet for testing</li>
                          <li>Earn tokens by contributing to research and reviews on the platform</li>
                          <li>Purchase EDU tokens from supported exchanges</li>
                        </ul>
                        For this demo, test EDU tokens will be automatically provided to your wallet upon connection.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WalletConnection; 