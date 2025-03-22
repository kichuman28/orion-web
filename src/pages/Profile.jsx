import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';

const Profile = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({
    papersSubmitted: 0,
    papersVerified: 0,
    successRate: 0,
    tokensEarned: 0
  });
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [certificates, setCertificates] = useState([]);
  const [tokenTransactions, setTokenTransactions] = useState([]);
  const [error, setError] = useState('');

  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // In a real app, we would fetch this data from Firestore
        // For now, we'll use mock data
        const mockProfile = {
          uid: currentUser?.uid || 'user123',
          email: currentUser?.email || 'user@example.com',
          fullName: 'John Doe',
          institution: 'Stanford University',
          role: 'Researcher',
          department: 'Computer Science',
          joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(), // 90 days ago
          profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
          bio: 'Researcher focusing on blockchain applications in academic publishing and verification systems.',
          orcid: '0000-0002-1234-5678',
          walletAddress: '0x1234...5678'
        };
        
        const mockStats = {
          papersSubmitted: 8,
          papersVerified: 5,
          successRate: 62.5, // (5/8) * 100
          tokensEarned: 250
        };
        
        const mockPapers = [
          {
            id: 1,
            title: 'Blockchain in Education',
            abstract: 'This paper explores the potential applications of blockchain technology in educational systems, focusing on credential verification and academic record security.',
            status: 'approved',
            submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
            authors: ['John Doe', 'Jane Smith'],
            category: 'Blockchain',
            blockchain: true,
            ipfsCid: 'QmYourIPFSCidForPaper1',
            publisher: 'Orion Academy',
            publicationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
            doi: '10.1234/orion.2023.0001',
            citations: 3,
            downloads: 45
          },
          {
            id: 2,
            title: 'Machine Learning Applications',
            abstract: 'An exploration of modern machine learning applications in various fields and industries, with case studies and practical implementations.',
            status: 'verified',
            submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
            authors: ['John Doe'],
            category: 'Machine Learning',
            blockchain: true,
            ipfsCid: 'QmYourIPFSCidForPaper2',
            publisher: 'Orion Academy',
            publicationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
            doi: '10.1234/orion.2023.0002',
            citations: 1,
            downloads: 27
          },
          {
            id: 3,
            title: 'Smart Contracts',
            abstract: 'A comprehensive look at smart contracts, their implementation, use cases, and potential for disrupting traditional contractual relationships.',
            status: 'rejected',
            submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(), // 20 days ago
            authors: ['John Doe', 'Robert Johnson', 'Sarah Williams'],
            category: 'Blockchain',
            blockchain: false,
            ipfsCid: '',
            publisher: '',
            publicationDate: null,
            doi: '',
            citations: 0,
            downloads: 0
          },
          {
            id: 4,
            title: 'Decentralized Identity Systems',
            abstract: 'Examining the role of decentralized identity systems in privacy and security, with focus on academic implementations.',
            status: 'pending',
            submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
            authors: ['John Doe', 'Emily Chen'],
            category: 'Security',
            blockchain: false,
            ipfsCid: '',
            publisher: '',
            publicationDate: null,
            doi: '',
            citations: 0,
            downloads: 0
          },
          {
            id: 5,
            title: 'Zero-Knowledge Proofs',
            abstract: 'A technical exploration of zero-knowledge proof systems and their applications in privacy-preserving verification.',
            status: 'verified',
            submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
            authors: ['John Doe'],
            category: 'Cryptography',
            blockchain: true,
            ipfsCid: 'QmYourIPFSCidForPaper3',
            publisher: 'Orion Academy',
            publicationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(), // 25 days ago
            doi: '10.1234/orion.2023.0003',
            citations: 7,
            downloads: 62
          }
        ];
        
        // Mock certificate data
        const mockCertificates = [
          {
            id: 1,
            title: 'Blockchain Verification Expert',
            issuedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(), // 60 days ago
            issuedBy: 'Orion Academy',
            tokenId: '0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
            image: 'https://images.unsplash.com/photo-1569779213435-ba3167ecfcbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
            description: 'Awarded for completing the Blockchain Verification training and contributing to the platform\'s verification process.',
            txHash: '0xabcdef123456789abcdef123456789abcdef123456789abcdef123456789abcd'
          },
          {
            id: 2,
            title: 'Distinguished Researcher',
            issuedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
            issuedBy: 'Orion Academy',
            tokenId: '0x234567890abcdef234567890abcdef234567890abcdef234567890abcdef2345',
            image: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
            description: 'Awarded for publishing 5 verified papers in the Orion platform with high engagement metrics.',
            txHash: '0xbcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890a'
          },
          {
            id: 3,
            title: 'Zero-Knowledge Proof Pioneer',
            issuedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
            issuedBy: 'Orion Academy',
            tokenId: '0x345678901abcdef345678901abcdef345678901abcdef345678901abcdef3456',
            image: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
            description: 'Awarded for groundbreaking research in zero-knowledge proof systems and their academic applications.',
            txHash: '0xcdef12345678901abcdef12345678901abcdef12345678901abcdef12345678901'
          }
        ];
        
        // Mock token transaction data
        const mockTokenTransactions = [
          {
            id: 1,
            type: 'reward',
            amount: 50,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(), // 60 days ago
            txHash: '0xdef123456789abcdef123456789abcdef123456789abcdef123456789abcdef12',
            description: 'Verification reward for paper submission',
            paperTitle: 'Blockchain in Education'
          },
          {
            id: 2,
            type: 'reward',
            amount: 75,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(), // 45 days ago
            txHash: '0xef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd',
            description: 'Citation reward bonus',
            paperTitle: 'Blockchain in Education'
          },
          {
            id: 3,
            type: 'reward',
            amount: 100,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
            txHash: '0xf12345678901abcdef12345678901abcdef12345678901abcdef12345678901ab',
            description: 'Verification reward for paper submission',
            paperTitle: 'Zero-Knowledge Proofs'
          },
          {
            id: 4,
            type: 'purchase',
            amount: -5,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
            txHash: '0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef12345',
            description: 'Paper access purchase',
            paperTitle: 'Advanced Cryptographic Techniques'
          },
          {
            id: 5,
            type: 'reward',
            amount: 30,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
            txHash: '0x23456789abcdef123456789abcdef123456789abcdef123456789abcdef123456',
            description: 'Download reward bonus',
            paperTitle: 'Zero-Knowledge Proofs'
          }
        ];
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setProfileData(mockProfile);
        setStats(mockStats);
        setPapers(mockPapers);
        setFilteredPapers(mockPapers);
        setCertificates(mockCertificates);
        setTokenTransactions(mockTokenTransactions);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [currentUser]);
  
  // Handle filter changes
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredPapers(papers);
    } else {
      setFilteredPapers(papers.filter(paper => paper.status === statusFilter));
    }
  }, [statusFilter, papers]);
  
  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-orion-darkGray mb-2">
            Profile
          </h1>
          <p className="text-gray-600">
            Manage your profile, view your submission history, certificates, and rewards.
          </p>
        </div>
        
        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orion-darkGray"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {/* User Information Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:shrink-0 flex justify-center md:justify-start p-6 md:pl-8 md:pt-8">
                  <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-orion-lightBg">
                    <img
                      src={profileData?.profilePicture}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div className="p-6 md:p-8 md:pl-6 md:flex-1">
                  <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-orion-darkGray">{profileData?.fullName}</h2>
                      <p className="text-gray-600 mt-1">{profileData?.role} at {profileData?.institution}</p>
                    </div>
                    <button
                      className="mt-4 md:mt-0 px-4 py-2 border border-orion-darkGray rounded-md shadow-sm text-sm font-medium text-orion-darkGray bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orion-darkGray"
                      tabIndex="0"
                      aria-label="Edit profile"
                    >
                      Edit Profile
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                      <p className="text-orion-darkGray">{profileData?.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Department</h3>
                      <p className="text-orion-darkGray">{profileData?.department}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">ORCID</h3>
                      <a 
                        href={`https://orcid.org/${profileData?.orcid}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {profileData?.orcid}
                      </a>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Wallet Address</h3>
                      <div className="flex items-center">
                        <span className="text-orion-darkGray font-mono text-sm truncate">
                          {profileData?.walletAddress}
                        </span>
                        <button
                          className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                          aria-label="Copy wallet address"
                        >
                          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Bio</h3>
                      <p className="text-orion-darkGray">{profileData?.bio}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Member since {new Date(profileData?.joinedAt).toLocaleDateString()} ({Math.floor((Date.now() - new Date(profileData?.joinedAt).getTime()) / (1000 * 60 * 60 * 24))} days)
                </div>
              </div>
            </div>
            
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Papers Submitted"
                value={stats.papersSubmitted}
                icon={
                  <svg className="w-6 h-6 text-orion-darkGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              />
              
              <StatCard
                title="Papers Verified"
                value={stats.papersVerified}
                icon={
                  <svg className="w-6 h-6 text-orion-darkGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
                bgColor="bg-green-50"
              />
              
              <StatCard
                title="Success Rate"
                value={`${stats.successRate}%`}
                icon={
                  <svg className="w-6 h-6 text-orion-darkGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                }
                bgColor="bg-blue-50"
              />
              
              <StatCard
                title="Tokens Earned"
                value={stats.tokensEarned}
                icon={
                  <svg className="w-6 h-6 text-orion-darkGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                trend="up"
                trendValue="15%"
                bgColor="bg-yellow-50"
              />
            </div>
            
            {/* Submission History */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <h2 className="text-xl font-bold text-orion-darkGray mb-4 sm:mb-0">Submission History</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Filter by Status:</span>
                    <select 
                      value={statusFilter}
                      onChange={handleFilterChange}
                      className="p-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orion-darkGray focus:border-transparent"
                      tabIndex="0"
                      aria-label="Filter papers by status"
                    >
                      <option value="all">All Papers</option>
                      <option value="verified">Verified</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {filteredPapers.length === 0 ? (
                <div className="p-8 text-center">
                  <svg 
                    className="mx-auto h-12 w-12 text-gray-400" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No papers found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No papers match your current filter criteria.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Metrics
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Blockchain
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPapers.map((paper) => (
                        <tr key={paper.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-orion-darkGray">{paper.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-[250px]">
                              {paper.abstract}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {paper.status === 'verified' && (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                Verified
                              </span>
                            )}
                            {paper.status === 'approved' && (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Approved
                              </span>
                            )}
                            {paper.status === 'pending' && (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            )}
                            {paper.status === 'rejected' && (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                Rejected
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{paper.category}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{new Date(paper.submittedAt).toLocaleDateString()}</div>
                            <div className="text-sm text-gray-500">
                              {Math.floor((Date.now() - new Date(paper.submittedAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {paper.citations > 0 || paper.downloads > 0 ? (
                              <div className="text-sm text-gray-500">
                                {paper.citations > 0 && (
                                  <span className="mr-3">
                                    <span className="font-medium text-orion-darkGray">{paper.citations}</span> citations
                                  </span>
                                )}
                                {paper.downloads > 0 && (
                                  <span>
                                    <span className="font-medium text-orion-darkGray">{paper.downloads}</span> downloads
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">—</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {paper.blockchain ? (
                              <div className="flex items-center text-sm text-gray-900">
                                <svg 
                                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-500" 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  viewBox="0 0 20 20" 
                                  fill="currentColor"
                                >
                                  <path 
                                    fillRule="evenodd" 
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="truncate">
                                  {paper.ipfsCid ? paper.ipfsCid.substring(0, 8) + '...' : 'Verified'}
                                </span>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">—</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* Digital Certificates & Rewards Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Digital Certificates */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-orion-darkGray">Digital Certificates (NFTs)</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Blockchain-verified certificates and achievements
                  </p>
                </div>
                
                {certificates.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg 
                      className="mx-auto h-12 w-12 text-gray-400" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No certificates yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Complete platform milestones to earn digital certificates.
                    </p>
                  </div>
                ) : (
                  <div className="p-6 grid gap-6">
                    {certificates.map((certificate) => (
                      <div key={certificate.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/3 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center p-6">
                            <img 
                              src={certificate.image} 
                              alt={certificate.title} 
                              className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-md"
                            />
                          </div>
                          <div className="md:w-2/3 p-6">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-bold text-orion-darkGray">{certificate.title}</h3>
                                <p className="text-sm text-gray-500">Issued by {certificate.issuedBy} on {new Date(certificate.issuedAt).toLocaleDateString()}</p>
                              </div>
                              <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                Verified
                              </div>
                            </div>
                            <p className="mt-3 text-gray-600 text-sm">{certificate.description}</p>
                            <div className="mt-4 flex flex-wrap justify-between items-center">
                              <div className="text-xs text-gray-500 font-mono truncate max-w-[150px] sm:max-w-[250px]">
                                Token ID: {certificate.tokenId.substring(0, 10)}...
                              </div>
                              <a 
                                href={`https://etherscan.io/tx/${certificate.txHash}`} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center"
                              >
                                <span>View on Blockchain</span>
                                <svg className="ml-1 w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Token Transactions */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-orion-darkGray">Token Transactions</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Your ORION token rewards and transactions
                  </p>
                </div>
                
                {tokenTransactions.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg 
                      className="mx-auto h-12 w-12 text-gray-400" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Earn tokens by contributing to the platform.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Transaction
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Verify
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tokenTransactions.map((transaction) => (
                          <tr key={transaction.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-orion-darkGray">{transaction.description}</div>
                              <div className="text-sm text-gray-500">
                                {transaction.paperTitle && `Paper: ${transaction.paperTitle}`}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{new Date(transaction.timestamp).toLocaleDateString()}</div>
                              <div className="text-sm text-gray-500">
                                {Math.floor((Date.now() - new Date(transaction.timestamp).getTime()) / (1000 * 60 * 60 * 24))} days ago
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                transaction.amount > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {transaction.amount > 0 ? '+' : ''}{transaction.amount} ORION
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <a 
                                href={`https://etherscan.io/tx/${transaction.txHash}`} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center"
                              >
                                <span className="truncate max-w-[80px] sm:max-w-[100px] font-mono">
                                  {transaction.txHash.substring(0, 10)}...
                                </span>
                                <svg className="ml-1 w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Current Balance: <span className="font-semibold text-orion-darkGray">{stats.tokensEarned} ORION</span>
                  </span>
                  <button
                    className="px-4 py-2 border border-orion-darkGray rounded-md shadow-sm text-sm font-medium text-orion-darkGray bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orion-darkGray"
                    tabIndex="0"
                    aria-label="View all transactions"
                  >
                    View All Transactions
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Profile; 