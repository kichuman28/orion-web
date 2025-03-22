import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

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
      try {
        setIsLoading(true);
        setError('');
        
        // Mock data - in a real app, this would come from Firestore/API/Blockchain
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
            accessFee: 5, // In tokens or ETH
            hasAccess: true, // This user owns the paper or has paid
            publisher: 'Orion Academy',
            publicationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
            doi: '10.1234/orion.2023.0001',
            keywords: ['blockchain', 'education', 'credentials', 'security'],
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
            accessFee: 3, // In tokens or ETH
            hasAccess: false, // User needs to pay
            publisher: 'Orion Academy',
            publicationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
            doi: '10.1234/orion.2023.0002',
            keywords: ['machine learning', 'AI', 'case studies', 'industry applications'],
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
            accessFee: 0,
            hasAccess: true,
            publisher: '',
            publicationDate: null,
            doi: '',
            keywords: ['smart contracts', 'blockchain', 'legal tech'],
            citations: 0,
            downloads: 0
          },
        ];
        
        setPapers(mockPapers);
        
        // If paperId is provided, set the selected paper
        if (paperId) {
          const paper = mockPapers.find(p => p.id === parseInt(paperId));
          if (paper) {
            setSelectedPaper(paper);
            setHasAccess(paper.hasAccess);
          } else {
            setError('Paper not found');
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
  }, [paperId]);
  
  // Handle payment for paper access
  const handlePayForAccess = async () => {
    try {
      setIsPaymentProcessing(true);
      
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
  
  // Handle AI Q&A
  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    
    try {
      setIsAiLoading(true);
      
      // Add user question to the answers array
      setAnswers(prev => [...prev, { 
        type: 'question', 
        content: question,
        timestamp: new Date().toISOString()
      }]);
      
      // Store the question before clearing input
      const currentQuestion = question;
      
      // Clear the question input immediately for better UX
      setQuestion('');
      
      // Add typing indicator
      setAnswers(prev => [...prev, { 
        type: 'typing', 
        content: '',
        timestamp: new Date().toISOString()
      }]);
      
      // Mock AI response - would actually call your RAG API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Remove typing indicator and add AI response
      setAnswers(prev => {
        const withoutTyping = prev.filter(a => a.type !== 'typing');
        return [...withoutTyping, { 
          type: 'answer', 
          content: `This is a simulated AI response to your question: "${currentQuestion}". In a real implementation, this would use a RAG system to provide an answer based on the paper's content, including citations and references to specific sections.`,
          timestamp: new Date().toISOString()
        }];
      });
      
    } catch (err) {
      console.error('AI Q&A error:', err);
      setError('Failed to get an answer. Please try again.');
      // Remove typing indicator if there was an error
      setAnswers(prev => prev.filter(a => a.type !== 'typing'));
    } finally {
      setIsAiLoading(false);
    }
  };
  
  // Handle paper selection
  const handleSelectPaper = (paper) => {
    setSelectedPaper(paper);
    setHasAccess(paper.hasAccess);
    setAnswers([]);
    navigate(`/papers/${paper.id}`);
  };
  
  // Handle back to list
  const handleBackToList = () => {
    setSelectedPaper(null);
    setAnswers([]);
    navigate('/papers');
  };
  
  // Add this near the other useEffect hooks
  useEffect(() => {
    // Scroll to the bottom of the chat container when new messages arrive
    if (answers.length > 0) {
      const chatContainer = document.getElementById('chat-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [answers]);
  
  // Handle PDF zoom in/out
  const handleZoomIn = () => {
    setPdfScale(prev => Math.min(prev + 0.2, 2.5));
  };

  const handleZoomOut = () => {
    setPdfScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetZoom = () => {
    setPdfScale(1);
  };
  
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-orion-darkGray mb-2">
            {selectedPaper ? 'Paper Details' : 'My Papers'}
          </h1>
          <p className="text-gray-600">
            {selectedPaper 
              ? 'View paper details, access content, and interact with AI-powered Q&A'
              : 'Browse your submitted, published, and verified academic papers'
            }
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
          <>
            {/* Render content based on whether a paper is selected */}
            {selectedPaper ? (
              // Paper detail view with PDF viewer and AI Q&A
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column - Paper details and PDF viewer */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Paper Details Card */}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center mb-6">
                      <button
                        onClick={handleBackToList}
                        className="mr-4 p-2 rounded-full hover:bg-gray-100"
                        tabIndex="0"
                        aria-label="Back to papers list"
                      >
                        <svg className="w-5 h-5 text-orion-darkGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                      </button>
                      
                      <div>
                        <h2 className="text-xl font-bold text-orion-darkGray">{selectedPaper.title}</h2>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedPaper.status === 'approved' && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              Approved
                            </span>
                          )}
                          {selectedPaper.status === 'verified' && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              Verified
                            </span>
                          )}
                          {selectedPaper.status === 'rejected' && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              Rejected
                            </span>
                          )}
                          {selectedPaper.status === 'pending' && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                              Under Review
                            </span>
                          )}
                          {selectedPaper.blockchain && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                              Blockchain Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Paper metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Authors</h3>
                        <p className="text-orion-darkGray">
                          {selectedPaper.authors.join(', ')}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Category</h3>
                        <p className="text-orion-darkGray">{selectedPaper.category}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Submitted On</h3>
                        <p className="text-orion-darkGray">
                          {new Date(selectedPaper.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {selectedPaper.publicationDate && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Published On</h3>
                          <p className="text-orion-darkGray">
                            {new Date(selectedPaper.publicationDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {selectedPaper.publisher && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Publisher</h3>
                          <p className="text-orion-darkGray">{selectedPaper.publisher}</p>
                        </div>
                      )}
                      {selectedPaper.doi && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">DOI</h3>
                          <p className="text-orion-darkGray">{selectedPaper.doi}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Keywords */}
                    {selectedPaper.keywords && selectedPaper.keywords.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedPaper.keywords.map((keyword, index) => (
                            <span 
                              key={index}
                              className="px-3 py-1 text-xs rounded-full bg-gray-100 text-orion-darkGray"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Abstract */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Abstract</h3>
                      <p className="text-orion-darkGray">{selectedPaper.abstract}</p>
                    </div>
                  </div>
                  
                  {/* PDF Viewer Card */}
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-xl font-bold text-orion-darkGray">Paper Content</h2>
                    </div>
                    
                    {hasAccess ? (
                      <div>
                        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
                          <h3 className="text-lg font-medium text-orion-darkGray">Paper Content</h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleZoomOut}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                              aria-label="Zoom out"
                              tabIndex="0"
                            >
                              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                            </button>
                            <button
                              onClick={handleResetZoom}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                              aria-label="Reset zoom"
                              tabIndex="0"
                            >
                              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                              </svg>
                            </button>
                            <button
                              onClick={handleZoomIn}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                              aria-label="Zoom in"
                              tabIndex="0"
                            >
                              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                            <button
                              onClick={() => window.open(`https://ipfs.io/ipfs/${selectedPaper.ipfsCid}`, '_blank')}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                              aria-label="Open in new tab"
                              tabIndex="0"
                            >
                              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <div 
                          ref={pdfContainerRef}
                          className="overflow-auto h-[800px] bg-gray-100 relative"
                        >
                          <div className="min-h-full flex justify-center">
                            {/* PDF Viewer */}
                            <div 
                              style={{ 
                                transform: `scale(${pdfScale})`, 
                                transformOrigin: 'top center',
                                transition: 'transform 0.2s ease-in-out',
                              }}
                              className="bg-white shadow-lg my-4 w-[8.5in] min-h-[11in]"
                            >
                              {/* Mock PDF content - In production, use a PDF viewer library like react-pdf */}
                              <div className="p-8">
                                <h1 className="text-2xl font-bold mb-6 text-center">{selectedPaper.title}</h1>
                                <div className="text-sm text-center mb-8">
                                  <p className="font-semibold mb-2">{selectedPaper.authors.join(', ')}</p>
                                  <p className="text-gray-600">{selectedPaper.publisher}</p>
                                  {selectedPaper.doi && <p className="text-gray-600">DOI: {selectedPaper.doi}</p>}
                          </div>
                                
                                <div className="mb-6">
                                  <h2 className="text-xl font-semibold mb-2">Abstract</h2>
                                  <p className="text-gray-800">{selectedPaper.abstract}</p>
                              </div>
                                
                                <div className="mb-6">
                                  <h2 className="text-xl font-semibold mb-2">Keywords</h2>
                                  <p className="text-gray-800">{selectedPaper.keywords.join(', ')}</p>
                              </div>
                                
                                <div className="space-y-4">
                                  <h2 className="text-xl font-semibold">1. Introduction</h2>
                                  <p className="text-gray-800">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                  </p>
                                  <p className="text-gray-800">
                                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
                                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                                  </p>
                                  
                                  <h2 className="text-xl font-semibold">2. Methods</h2>
                                  <p className="text-gray-800">
                                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, 
                                    totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                                  </p>
                                  
                                  <h2 className="text-xl font-semibold">3. Results</h2>
                                  <p className="text-gray-800">
                                    Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur 
                                    magni dolores eos qui ratione voluptatem sequi nesciunt.
                                  </p>
                                  
                                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200 my-4">
                                    <p className="text-center font-medium mb-2">Figure 1: Sample Data Analysis</p>
                                    <div className="h-40 bg-gray-200 flex items-center justify-center">
                                      <p className="text-gray-500">[Figure placeholder]</p>
                          </div>
                                    <p className="text-sm text-gray-600 mt-2">
                                      Caption: This figure represents the key findings of our analysis. The data shows significant trends in the studied parameters.
                                    </p>
                                  </div>
                                  
                                  <h2 className="text-xl font-semibold">4. Discussion</h2>
                                  <p className="text-gray-800">
                                    At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum 
                                    deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.
                                  </p>
                                  
                                  <h2 className="text-xl font-semibold">5. Conclusion</h2>
                                  <p className="text-gray-800">
                                    Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod 
                                    maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* PDF page indicators */}
                          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                            <div className="bg-white px-4 py-2 rounded-full shadow-md text-sm text-gray-600">
                              Page 1 of {Math.floor(Math.random() * 10) + 5}
                            </div>
                          </div>
                        </div>
                        
                        {/* Citations, Downloads & Actions toolbar */}
                        <div className="p-4 border-t border-gray-200 flex flex-wrap justify-between items-center">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">
                              IPFS CID: <span className="font-mono">{selectedPaper.ipfsCid.substring(0, 8)}...</span>
                            </span>
                            {selectedPaper.citations > 0 && (
                              <div className="flex items-center">
                                <svg className="w-5 h-5 mr-1 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                                <span className="text-sm">{selectedPaper.citations} Citations</span>
                              </div>
                            )}
                            {selectedPaper.downloads > 0 && (
                              <div className="flex items-center">
                                <svg className="w-5 h-5 mr-1 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span className="text-sm">{selectedPaper.downloads} Downloads</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex space-x-3 mt-2 sm:mt-0">
                            <button
                              className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orion-darkGray hover:bg-orion-mediumGray focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orion-darkGray"
                              tabIndex="0"
                              aria-label="Download paper"
                              onClick={() => {
                                // Simulating download - in production would trigger actual download
                                alert('Downloading paper...');
                              }}
                            >
                              <svg className="mr-1.5 -ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download PDF
                            </button>
                            
                            {selectedPaper.blockchain && (
                              <button
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-orion-darkGray bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orion-darkGray"
                                tabIndex="0"
                                aria-label="View blockchain verification"
                                onClick={() => {
                                  // Would open blockchain explorer with verification details
                                  alert('Opening blockchain verification...');
                                }}
                              >
                                <svg className="mr-1.5 -ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                View on Blockchain
                              </button>
                            )}
                            
                            <button
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-orion-darkGray bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orion-darkGray"
                              tabIndex="0"
                              aria-label="Cite this paper"
                              onClick={() => {
                                // Would show citation formats
                                alert('Showing citation formats...');
                              }}
                            >
                              <svg className="mr-1.5 -ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2" />
                              </svg>
                              Cite
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Payment required UI
                      <div className="bg-gray-50 p-8">
                        <div className="text-center mb-8">
                          <svg className="w-16 h-16 text-orion-darkGray mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <h3 className="text-lg font-medium text-orion-darkGray mb-2">
                            Access Required
                          </h3>
                          <p className="text-gray-500 max-w-md mx-auto mb-6">
                            This paper requires payment to access. Your payment will support the authors and the Orion platform.
                          </p>
                          
                          <div className="border border-gray-200 rounded-lg p-4 max-w-sm mx-auto mb-6">
                            <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-3">
                              <span className="font-medium text-orion-darkGray">Access Fee:</span>
                              <div className="flex items-center">
                                <svg className="w-5 h-5 text-gray-600 mr-1" viewBox="0 0 33 53" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M16.3576 0L16 1.11273V36.3028L16.3576 36.6611L32.2976 27.5559L16.3576 0Z" fill="#343434"/>
                                  <path d="M16.3578 0L0.417847 27.5559L16.3578 36.6611V19.6374V0Z" fill="#8C8C8C"/>
                                  <path d="M16.3575 39.7374L16.1567 39.9827V52.4515L16.3575 53L32.3066 30.6377L16.3575 39.7374Z" fill="#3C3C3B"/>
                                  <path d="M16.3578 53.0001V39.7375L0.417847 30.6378L16.3578 53.0001Z" fill="#8C8C8C"/>
                                  <path d="M16.3575 36.6611L32.2973 27.556L16.3575 19.6375V36.6611Z" fill="#141414"/>
                                  <path d="M0.417847 27.556L16.3576 36.6611V19.6375L0.417847 27.556Z" fill="#393939"/>
                                </svg>
                                <span className="text-xl font-bold text-orion-darkGray">{selectedPaper.accessFee} ETH</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mb-3">
                              Payment is made directly to the authors through the blockchain. Your access will be permanently recorded.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex justify-center">
                          <button
                            onClick={handlePayForAccess}
                            disabled={isPaymentProcessing}
                            className={`
                              inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white 
                              ${isPaymentProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-orion-darkGray hover:bg-orion-mediumGray'} 
                              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orion-darkGray
                            `}
                            tabIndex="0"
                            aria-label="Pay for access"
                          >
                            {isPaymentProcessing ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing Payment...
                              </>
                            ) : (
                              <>
                                <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Pay for Access Now
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right column - AI Q&A */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-xl font-bold text-orion-darkGray">AI Paper Assistant</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Ask questions about this paper and get instant answers
                      </p>
                    </div>
                    
                    {/* Message container */}
                    <div className="flex-1 p-4 bg-gray-50 overflow-y-auto h-96" id="chat-container">
                      {answers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <svg className="w-16 h-16 text-gray-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          <h3 className="text-lg font-medium text-gray-500 mb-1">No Questions Yet</h3>
                          <p className="text-gray-400 max-w-xs">
                            Ask a question about this paper to get insights from our AI assistant
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {answers.map((answer, index) => (
                            <div
                              key={index}
                              className={`flex ${answer.type === 'question' ? 'justify-end' : 'justify-start'}`}
                            >
                              {answer.type === 'typing' ? (
                                <div className="max-w-xs md:max-w-md rounded-lg p-3 bg-white border border-gray-200 text-orion-darkGray rounded-bl-none">
                                  <div className="flex space-x-2">
                                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                                  </div>
                                </div>
                              ) : (
                                <div 
                                  className={`
                                    max-w-xs md:max-w-md rounded-lg p-3 
                                    ${answer.type === 'question' 
                                      ? 'bg-orion-darkGray text-white rounded-br-none' 
                                      : 'bg-white border border-gray-200 text-orion-darkGray rounded-bl-none'}
                                  `}
                                >
                                  <p className="text-sm whitespace-pre-wrap">{answer.content}</p>
                                  <p className="text-xs mt-1 opacity-70 text-right">
                                    {new Date(answer.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Input form */}
                    <div className="p-4 border-t border-gray-200">
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleAskQuestion();
                        }}
                        className="flex space-x-2"
                      >
                        <input
                          type="text"
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orion-darkGray focus:border-transparent"
                          placeholder="Ask a question about this paper..."
                          disabled={isAiLoading || !hasAccess}
                          tabIndex="0"
                        />
                        <button
                          type="submit"
                          disabled={isAiLoading || !question.trim() || !hasAccess}
                          className={`
                            inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white 
                            ${isAiLoading || !question.trim() || !hasAccess ? 'bg-gray-400 cursor-not-allowed' : 'bg-orion-darkGray hover:bg-orion-mediumGray'} 
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orion-darkGray
                          `}
                          tabIndex="0"
                          aria-label="Send question"
                        >
                          {isAiLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                          )}
                        </button>
                      </form>
                      
                      {!hasAccess && (
                        <p className="mt-2 text-sm text-red-500">
                          You need to pay for access to use the AI assistant.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Paper list view
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-orion-darkGray">Your Published Papers</h2>
                  <div className="flex items-center space-x-2">
                    <select 
                      className="p-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orion-darkGray focus:border-transparent"
                      defaultValue="all"
                    >
                      <option value="all">All Papers</option>
                      <option value="approved">Approved</option>
                      <option value="verified">Verified</option>
                      <option value="rejected">Rejected</option>
                      <option value="pending">Under Review</option>
                    </select>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Search papers..." 
                        className="p-2 pl-8 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orion-darkGray focus:border-transparent"
                      />
                      <svg 
                        className="w-4 h-4 text-gray-400 absolute left-2 top-2.5" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {papers.length === 0 ? (
                  <div className="text-center py-10">
                    <svg 
                      className="w-16 h-16 text-gray-300 mx-auto mb-4" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-500 mb-2">No papers found</h3>
                    <p className="text-gray-400 max-w-md mx-auto mb-6">
                      You haven't submitted any papers yet or none match your current filters.
                    </p>
                    <button
                      onClick={() => navigate('/submit-paper')}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orion-darkGray hover:bg-orion-mediumGray focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orion-darkGray"
                      tabIndex="0"
                      aria-label="Submit a new paper"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Submit a Paper
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {papers.map((paper) => (
                      <div
                        key={paper.id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 
                                className="text-lg font-semibold text-orion-darkGray hover:text-orion-mediumGray cursor-pointer"
                                onClick={() => handleSelectPaper(paper)}
                                tabIndex="0"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') handleSelectPaper(paper);
                                }}
                              >
                                {paper.title}
                              </h3>
                              {paper.status === 'approved' && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                  Approved
                                </span>
                              )}
                              {paper.status === 'verified' && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                  Verified
                                </span>
                              )}
                              {paper.status === 'rejected' && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                  Rejected
                                </span>
                              )}
                              {paper.status === 'pending' && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                  Under Review
                                </span>
                              )}
                              {paper.blockchain && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                                  Blockchain Verified
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                              {paper.abstract}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>
                                  {paper.authors.length > 1
                                    ? `${paper.authors[0]} +${paper.authors.length - 1}`
                                    : paper.authors[0]}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                <span>{paper.category}</span>
                              </div>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{new Date(paper.submittedAt).toLocaleDateString()}</span>
                              </div>
                              {paper.publicationDate && (
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span>Published: {new Date(paper.publicationDate).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col ml-6 text-center justify-center">
                            {paper.doi && (
                              <div className="mb-2 text-xs text-gray-500">DOI: {paper.doi}</div>
                            )}
                            <div className="flex space-x-2 mb-2">
                              {paper.citations > 0 && (
                                <div className="flex flex-col items-center">
                                  <span className="text-lg font-medium text-orion-darkGray">{paper.citations}</span>
                                  <span className="text-xs text-gray-500">Citations</span>
                                </div>
                              )}
                              {paper.downloads > 0 && (
                                <div className="flex flex-col items-center">
                                  <span className="text-lg font-medium text-orion-darkGray">{paper.downloads}</span>
                                  <span className="text-xs text-gray-500">Downloads</span>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleSelectPaper(paper)}
                              className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-orion-darkGray hover:bg-orion-mediumGray focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orion-darkGray"
                              tabIndex="0"
                              aria-label={`View details of ${paper.title}`}
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyPapers; 