import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { getIPFSGatewayURL } from '../config/ipfs';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';

const MyPapers = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { paperId } = useParams();
  
  // State for paper list and selected paper
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for paper access and payment
  const [hasAccess, setHasAccess] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  
  // State for AI Q&A
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Add PDF viewer state
  const [pdfScale, setPdfScale] = useState(1);
  const pdfContainerRef = useRef(null);
  
  // Load papers on component mount
  useEffect(() => {
    const fetchPapers = async () => {
      if (!currentUser) {
        setError('You need to be logged in to view your papers');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');
        
        // Create a Firestore query to get papers by the current user
        const papersRef = collection(db, 'papers');
        const q = query(
          papersRef, 
          where('authorUid', '==', currentUser.uid),
          orderBy('submissionDate', 'desc')
        );
        
        // Execute the query
        const querySnapshot = await getDocs(q);
        
        // Process the results
        const fetchedPapers = [];
        querySnapshot.forEach((doc) => {
          const paperData = doc.data();
          fetchedPapers.push({
            id: doc.id,
            title: paperData.title || 'Untitled Paper',
            abstract: paperData.abstract || 'No abstract provided',
            status: paperData.status || 'pending',
            submittedAt: paperData.submissionDate?.toDate().toISOString() || new Date().toISOString(),
            authors: paperData.teamMembers ? [paperData.authorName, ...paperData.teamMembers.split(',').map(author => author.trim())] : [paperData.authorName || 'Anonymous Researcher'],
            category: paperData.researchField || 'Uncategorized',
            blockchain: Boolean(paperData.blockchainVerified),
            ipfsHash: paperData.ipfsHash || '',
            fileUrl: paperData.fileUrl || '',
            accessFee: paperData.accessFee || 0,
            hasAccess: true, // The user submitted this paper, so they have access
            publisher: paperData.publisher || 'Orion Platform',
            publicationDate: paperData.publicationDate?.toDate().toISOString() || null,
            doi: paperData.doi || '',
            keywords: paperData.keywords || [],
            citations: paperData.citations || 0,
            downloads: paperData.downloads || 0,
            fileName: paperData.fileName || '',
            fileSize: paperData.fileSize || 0,
            votes: paperData.votes || { approve: 0, reject: 0, totalVotes: 0 },
            comments: paperData.comments || []
          });
        });
        
        setPapers(fetchedPapers);
        
        // If paperId is provided, fetch the selected paper directly from Firestore
        if (paperId) {
          try {
            const paperRef = doc(db, 'papers', paperId);
            const paperSnap = await getDoc(paperRef);
            
            if (paperSnap.exists()) {
              const paperData = paperSnap.data();
              
              // Only set as selected if it belongs to the current user
              if (paperData.authorUid === currentUser.uid) {
                const selectedPaperData = {
                  id: paperSnap.id,
                  title: paperData.title || 'Untitled Paper',
                  abstract: paperData.abstract || 'No abstract provided',
                  status: paperData.status || 'pending',
                  submittedAt: paperData.submissionDate?.toDate().toISOString() || new Date().toISOString(),
                  authors: paperData.teamMembers ? [paperData.authorName, ...paperData.teamMembers.split(',').map(author => author.trim())] : [paperData.authorName || 'Anonymous Researcher'],
                  category: paperData.researchField || 'Uncategorized',
                  blockchain: Boolean(paperData.blockchainVerified),
                  ipfsHash: paperData.ipfsHash || '',
                  fileUrl: paperData.fileUrl || '',
                  accessFee: paperData.accessFee || 0,
                  hasAccess: true, // The user submitted this paper, so they have access
                  publisher: paperData.publisher || 'Orion Platform',
                  publicationDate: paperData.publicationDate?.toDate().toISOString() || null,
                  doi: paperData.doi || '',
                  keywords: paperData.keywords || [],
                  citations: paperData.citations || 0,
                  downloads: paperData.downloads || 0,
                  fileName: paperData.fileName || '',
                  fileSize: paperData.fileSize || 0,
                  votes: paperData.votes || { approve: 0, reject: 0, totalVotes: 0 },
                  comments: paperData.comments || []
                };
                
                setSelectedPaper(selectedPaperData);
                setHasAccess(true);
              } else {
                setError('You do not have access to this paper');
              }
            } else {
              setError('Paper not found');
            }
          } catch (err) {
            console.error('Error fetching selected paper:', err);
            setError('Failed to load paper details');
          }
        }
        
      } catch (err) {
        console.error('Error fetching papers:', err);
        setError('Failed to load papers. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPapers();
  }, [paperId, currentUser]);
  
  // Handle payment for paper access
  const handlePayForAccess = async () => {
    try {
      setIsPaymentProcessing(true);
      
      // Check if user's wallet is connected first
      const { walletAddress, isWalletConnected } = useAuth();
      if (!isWalletConnected()) {
        setError('Please connect your wallet first to access this paper');
        setIsPaymentProcessing(false);
        return;
      }
      
      // Mock payment process - would actually involve blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Payment successful
      setHasAccess(true);
      setIsPaymentProcessing(false);
      
      // Update the paper in the list to reflect access
      if (selectedPaper) {
        setPapers(currentPapers => 
          currentPapers.map(paper => 
            paper.id === selectedPaper.id ? { ...paper, hasAccess: true } : paper
          )
        );
      }
      
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment failed. Please try again.');
      setIsPaymentProcessing(false);
    }
  };
  
  // Handle asking a question to AI about the paper
  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    
    try {
      // Add user question to the chat
      const userQuestion = { sender: 'user', text: question, timestamp: new Date().toISOString() };
      setAnswers(prev => [...prev, userQuestion]);
      setQuestion('');
      setIsAiLoading(true);
      
      // In a real app, this would be an API call to your AI service
      // For now, we'll simulate a response after a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulated AI response
      const aiResponse = { 
        sender: 'ai', 
        text: `This is a simulated response to: "${userQuestion.text}". In the actual implementation, this would be a real response from your AI service based on the paper's content.`, 
        timestamp: new Date().toISOString()
      };
      
      setAnswers(prev => [...prev, aiResponse]);
      
    } catch (err) {
      console.error('AI Q&A error:', err);
      // Add error message to the chat
      const errorMessage = { 
        sender: 'system', 
        text: 'Sorry, there was an error processing your question. Please try again.', 
        timestamp: new Date().toISOString() 
      };
      setAnswers(prev => [...prev, errorMessage]);
    } finally {
      setIsAiLoading(false);
    }
  };
  
  // Handle selecting a paper to view details
  const handleSelectPaper = (paper) => {
    setSelectedPaper(paper);
    navigate(`/dashboard/my-papers/${paper.id}`);
  };
  
  // Handle going back to paper list
  const handleBackToList = () => {
    setSelectedPaper(null);
    setAnswers([]);
    navigate('/dashboard/my-papers');
  };
  
  // Auto-scroll to bottom of chat when new messages arrive
  const chatContainerRef = useRef(null);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [answers]);
  
  // Handle PDF zoom
  const handleZoomIn = () => {
    setPdfScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setPdfScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setPdfScale(1);
  };
  
  // Handle viewing paper in full screen
  const handleViewPaper = async () => {
    try {
      if (!selectedPaper?.ipfsHash) {
      setError('Paper file not found');
      return;
    }
    
      // Generate a gateway URL for the IPFS hash
      const gatewayUrl = getIPFSGatewayURL(selectedPaper.ipfsHash);
      
      // Open the paper in a new tab
      window.open(gatewayUrl, '_blank');
      
      // In a real app, you would also track this as a download/view
      // Update download count in Firestore
      // const paperRef = doc(db, 'papers', selectedPaper.id);
      // await updateDoc(paperRef, {
      //   downloads: increment(1)
      // });
      
    } catch (err) {
      console.error('Error viewing paper:', err);
      setError('Failed to open paper. Please try again.');
    }
  };
  
  return (
    <DashboardLayout>
      <div className="p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedPaper ? 'Paper Details' : 'My Papers'}
          </h1>
        {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700">{error}</p>
          </div>
        )}
        </header>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {!selectedPaper ? (
              // Papers list view
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {papers.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <h2 className="text-xl font-medium text-gray-500">You haven't submitted any papers yet</h2>
                    <p className="mt-2 text-gray-500">
                      Once you submit papers, they will appear here.
                    </p>
                      <button
                      onClick={() => navigate('/dashboard/submit-paper')}
                      className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                      Submit a Paper
                      </button>
                  </div>
                ) : (
                  papers.map(paper => (
                    <div 
                      key={paper.id} 
                      className="border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden bg-white"
                      onClick={() => handleSelectPaper(paper)}
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h2 className="text-xl font-semibold text-gray-900 line-clamp-2">{paper.title}</h2>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            paper.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            paper.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            paper.status === 'verified' ? 'bg-blue-100 text-blue-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {paper.status.charAt(0).toUpperCase() + paper.status.slice(1)}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{paper.abstract}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {paper.keywords && paper.keywords.slice(0, 3).map((keyword, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {keyword}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>
                            {new Date(paper.submittedAt).toLocaleDateString()}
                            </span>
                          
                          <div className="flex items-center space-x-3">
                            {paper.blockchain && (
                              <span className="flex items-center space-x-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Verified</span>
                            </span>
                          )}
                            
                            <span>{paper.authors?.length} Author{paper.authors?.length !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // Paper details view
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-start mb-6">
                      <button 
                        onClick={handleBackToList}
                        className="inline-flex items-center text-primary hover:text-primary-dark"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Back to My Papers
                      </button>
                      
                      <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                        selectedPaper.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        selectedPaper.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        selectedPaper.status === 'verified' ? 'bg-blue-100 text-blue-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedPaper.status.charAt(0).toUpperCase() + selectedPaper.status.slice(1)}
                            </span>
                        </div>
                    
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">{selectedPaper.title}</h1>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedPaper.keywords && selectedPaper.keywords.map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {keyword}
                        </span>
                      ))}
                      </div>
                    
                    <div className="mb-6">
                      <h2 className="text-lg font-medium text-gray-900 mb-2">Abstract</h2>
                      <p className="text-gray-700">{selectedPaper.abstract}</p>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6">
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Paper Information</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <h3 className="text-sm font-medium text-gray-500">Authors</h3>
                          <ul className="mt-1 text-gray-700">
                            {selectedPaper.authors && selectedPaper.authors.map((author, index) => (
                              <li key={index}>{author}</li>
                            ))}
                          </ul>
                      </div>
                        
                      <div>
                          <h3 className="text-sm font-medium text-gray-500">Submission Date</h3>
                          <p className="mt-1 text-gray-700">
                          {new Date(selectedPaper.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Category</h3>
                          <p className="mt-1 text-gray-700">{selectedPaper.category}</p>
                        </div>
                        
                      {selectedPaper.publicationDate && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Publication Date</h3>
                            <p className="mt-1 text-gray-700">
                            {new Date(selectedPaper.publicationDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                        
                      {selectedPaper.publisher && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Publisher</h3>
                            <p className="mt-1 text-gray-700">{selectedPaper.publisher}</p>
                        </div>
                      )}
                        
                      {selectedPaper.doi && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">DOI</h3>
                            <p className="mt-1 text-gray-700">{selectedPaper.doi}</p>
                        </div>
                      )}
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Metrics</h3>
                          <div className="mt-1 flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span>{selectedPaper.citations} Citations</span>
                        </div>
                            <div className="flex items-center space-x-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              <span>{selectedPaper.downloads} Downloads</span>
                      </div>
                    </div>
                  </div>
                  
                        {selectedPaper.blockchain && (
                      <div>
                            <h3 className="text-sm font-medium text-gray-500">Blockchain Verification</h3>
                            <div className="mt-1 flex items-center space-x-1 text-green-600">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                              <span>Verified on Blockchain</span>
                          </div>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-500">
                                IPFS CID: <span className="font-mono">{selectedPaper.ipfsHash.substring(0, 8)}...</span>
                              </span>
                              {selectedPaper.citations > 0 && (
                                <span className="text-sm text-gray-500">
                                  {selectedPaper.citations} Citations
                                </span>
                              )}
                        </div>
                          </div>
                        )}
                              </div>
                    </div>
                              </div>
                                
                  {/* Review and votes section - for papers that have been reviewed */}
                  {(selectedPaper.status === 'approved' || selectedPaper.status === 'verified') && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Peer Review Summary</h2>
                      
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                          <div className="mr-4">
                            <div className="text-2xl font-semibold">{
                              selectedPaper.votes && selectedPaper.votes.totalVotes 
                                ? ((selectedPaper.votes.approve / selectedPaper.votes.totalVotes) * 100).toFixed(0) 
                                : 0
                            }%</div>
                            <div className="text-gray-500 text-sm">Approval Rate</div>
                          </div>
                          
                          <div className="w-40 bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-green-600 h-2.5 rounded-full" 
                              style={{ 
                                width: `${selectedPaper.votes && selectedPaper.votes.totalVotes 
                                  ? ((selectedPaper.votes.approve / selectedPaper.votes.totalVotes) * 100).toFixed(0) 
                                  : 0}%` 
                              }}
                            ></div>
                          </div>
                                  </div>
                                  
                        <div className="text-right">
                          <div className="text-lg font-medium">{selectedPaper.votes?.totalVotes || 0}</div>
                          <div className="text-gray-500 text-sm">Reviewers</div>
                            </div>
                          </div>
                          
                      {selectedPaper.comments && selectedPaper.comments.length > 0 ? (
                        <div>
                          <h3 className="text-md font-medium text-gray-900 mb-2">Reviewer Comments</h3>
                          <div className="space-y-4 max-h-60 overflow-y-auto">
                            {selectedPaper.comments.map((comment, index) => (
                              <div key={index} className="border-l-4 border-blue-200 pl-4 py-1">
                                <p className="text-gray-700">{comment.text}</p>
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-sm text-gray-500">{
                                    comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'No date'
                                  }</span>
                                  <span className="text-sm font-medium">{comment.reviewerName || 'Anonymous Reviewer'}</span>
                            </div>
                          </div>
                            ))}
                        </div>
                              </div>
                      ) : (
                        <p className="text-gray-500 italic">No reviewer comments available</p>
                      )}
                              </div>
                            )}
                          </div>
                          
                <div className="lg:col-span-1 space-y-6">
                  {/* Paper file section */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Paper File</h2>
                    
                    {selectedPaper.ipfsHash ? (
                      <>
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-700 truncate max-w-[200px]">{selectedPaper.fileName || 'Paper.pdf'}</span>
                            <span className="text-sm text-gray-500">{
                              selectedPaper.fileSize ? 
                                (selectedPaper.fileSize / 1024 / 1024).toFixed(2) + ' MB' : 
                                'Unknown size'
                            }</span>
                          </div>
                          
                          <div className="flex space-x-2">
                              <button
                              onClick={handleViewPaper}
                              className="flex-1 py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                              View
                              </button>
                          </div>
                        </div>
                        
                        {hasAccess ? (
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Citation</h3>
                            <div className="bg-gray-50 p-3 rounded-md">
                              <p className="text-xs text-gray-700 font-mono">
                                {selectedPaper.authors && selectedPaper.authors.join(', ')} ({
                                  selectedPaper.publicationDate ? 
                                    new Date(selectedPaper.publicationDate).getFullYear() : 
                                    new Date(selectedPaper.submittedAt).getFullYear()
                                }). {selectedPaper.title}. <em>Orion Academic Platform</em>. {
                                  selectedPaper.doi ? `DOI: ${selectedPaper.doi}` : ''
                                }
                              </p>
                            <button
                                className="mt-2 w-full py-1 px-2 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                              onClick={() => {
                                  navigator.clipboard.writeText(
                                    `${selectedPaper.authors && selectedPaper.authors.join(', ')} (${
                                      selectedPaper.publicationDate ? 
                                        new Date(selectedPaper.publicationDate).getFullYear() : 
                                        new Date(selectedPaper.submittedAt).getFullYear()
                                    }). ${selectedPaper.title}. Orion Academic Platform. ${
                                      selectedPaper.doi ? `DOI: ${selectedPaper.doi}` : ''
                                    }`
                                  );
                                  // Show toast or notification that citation was copied
                                }}
                              >
                                Copy Citation
                            </button>
                        </div>
                      </div>
                    ) : (
                          <div className="border-t border-gray-200 pt-4 mt-4">
                            <div className="mb-4 text-center">
                              <p className="text-gray-700 mb-2">
                                Access to this paper requires payment
                              </p>
                              <p className="text-2xl font-semibold mb-2">
                                {selectedPaper.accessFee} ETH
                              </p>
                        </div>
                        
                          <button
                              className={`w-full py-2 px-4 rounded-md text-white transition-colors ${
                                isPaymentProcessing ? 
                                  'bg-gray-400 cursor-not-allowed' : 
                                  'bg-primary hover:bg-primary-dark'
                              }`}
                            onClick={handlePayForAccess}
                            disabled={isPaymentProcessing}
                          >
                            {isPaymentProcessing ? (
                                <span className="flex items-center justify-center">
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                  Processing...
                                </span>
                              ) : 'Pay for Access'}
                            </button>
                          </div>
                        )}
                              </>
                            ) : (
                      <div className="text-center py-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                        <p className="mt-2 text-gray-500">Paper file not available</p>
                      </div>
                    )}
                </div>
                
                  {/* AI Q&A section */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Ask AI About This Paper</h2>
                    
                    {hasAccess ? (
                      <>
                        <div 
                          ref={chatContainerRef}
                          className="h-64 overflow-y-auto mb-4 space-y-3 border border-gray-200 rounded-md p-3 bg-gray-50"
                        >
                      {answers.length === 0 ? (
                            <div className="text-center text-gray-500 py-6">
                              <p>Ask a question about this paper to get started</p>
                              <p className="text-xs mt-2">AI will analyze the paper and answer your questions</p>
                        </div>
                      ) : (
                            answers.map((answer, index) => (
                            <div
                              key={index}
                                className={`p-2 rounded-lg max-w-[85%] ${
                                  answer.sender === 'user' ? 
                                    'bg-primary text-white ml-auto' : 
                                    answer.sender === 'ai' ? 
                                      'bg-gray-200 text-gray-800' : 
                                      'bg-yellow-100 text-yellow-800 mx-auto text-center'
                                }`}
                              >
                                <p className="text-sm">{answer.text}</p>
                                <span className="text-xs opacity-70 block text-right mt-1">
                                  {new Date(answer.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                                  </div>
                            ))
                          )}
                          {isAiLoading && (
                            <div className="bg-gray-200 text-gray-800 p-2 rounded-lg max-w-[85%]">
                              <div className="flex space-x-1 items-center justify-center p-2">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                      )}
                    </div>
                    
                        <div className="flex items-center">
                        <input
                          type="text"
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                            className="flex-1 border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Ask a question about this paper..."
                            disabled={isAiLoading}
                        />
                        <button
                            onClick={handleAskQuestion}
                            disabled={isAiLoading || !question.trim()}
                            className={`py-2 px-4 rounded-r-md text-white ${
                              isAiLoading || !question.trim() ? 
                                'bg-gray-400 cursor-not-allowed' : 
                                'bg-primary hover:bg-primary-dark'
                            }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                        <p className="text-xs text-gray-500 mt-2">
                          AI responses are generated based on the paper's content and may not be fully accurate.
                        </p>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500">Purchase access to use AI Q&A</p>
                                </div>
                              )}
                            </div>
                          </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyPapers; 