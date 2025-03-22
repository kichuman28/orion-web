import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import PaperCard from '../components/PaperCard';
import { Link } from 'react-router-dom';

const CommitteeDashboard = () => {
  const { currentUser } = useAuth();
  
  // Mock data - in a real app, this would come from Firestore/API
  const [stats, setStats] = useState({
    papersToReview: 8,
    reviewsCompleted: 24,
    approvalRate: 75,
    averageScore: 4.2
  });

  const [pendingReviews, setPendingReviews] = useState([
    {
      id: 1,
      title: 'The Impact of Artificial Intelligence on Modern Healthcare',
      abstract: 'This paper explores how AI technologies are transforming healthcare delivery, from diagnosis to treatment planning and patient monitoring.',
      status: 'pending',
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      authors: ['Sarah Wilson', 'Mark Johnson'],
      category: 'Artificial Intelligence',
      blockchain: false
    },
    {
      id: 2,
      title: 'Blockchain-Based Supply Chain Management',
      abstract: 'A comprehensive analysis of how blockchain technology can improve transparency, security, and efficiency in global supply chain management systems.',
      status: 'pending',
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      authors: ['Alex Chen', 'Jessica Rodriguez'],
      category: 'Blockchain',
      blockchain: false
    },
  ]);

  const [recentReviews, setRecentReviews] = useState([
    {
      id: 3,
      title: 'Quantum Computing: Current State and Future Prospects',
      abstract: 'An exploration of the current state of quantum computing technology, recent breakthroughs, and potential applications in the near future.',
      status: 'approved',
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
      authors: ['David Lee', 'Priya Sharma'],
      category: 'Quantum Computing',
      blockchain: true,
      reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
      yourRating: 4.5
    },
    {
      id: 4,
      title: 'Sustainable Energy Solutions for Developing Nations',
      abstract: 'This paper analyzes cost-effective and environmentally sustainable energy solutions that can be implemented in developing countries.',
      status: 'rejected',
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
      authors: ['John Smith', 'Fatima Al-Farsi'],
      category: 'Sustainability',
      blockchain: false,
      reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      yourRating: 2.0
    },
  ]);

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-orion-darkGray mb-2">
          Committee Dashboard
        </h1>
        <p className="text-gray-600">
          Review and manage paper submissions from the academic community.
        </p>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Papers to Review"
          value={stats.papersToReview}
          icon={
            <svg className="w-6 h-6 text-orion-darkGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          trend="up"
          trendValue="15%"
          bgColor="bg-blue-50"
        />
        
        <StatCard
          title="Reviews Completed"
          value={stats.reviewsCompleted}
          icon={
            <svg className="w-6 h-6 text-orion-darkGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
          bgColor="bg-blue-50"
        />
        
        <StatCard
          title="Approval Rate"
          value={`${stats.approvalRate}%`}
          icon={
            <svg className="w-6 h-6 text-orion-darkGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          }
          bgColor="bg-blue-50"
        />
        
        <StatCard
          title="Average Rating"
          value={stats.averageScore}
          icon={
            <svg className="w-6 h-6 text-orion-darkGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
          bgColor="bg-blue-50"
        />
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Reviews - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          {/* Papers pending review */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-orion-darkGray">Papers Pending Review</h2>
              <Link
                to="/review-papers"
                className="text-sm font-medium text-orion-darkGray hover:text-orion-mediumGray transition-colors"
                tabIndex="0"
                aria-label="View all papers pending review"
              >
                View All
              </Link>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {pendingReviews.length > 0 ? (
                pendingReviews.map((paper) => (
                  <div key={paper.id} className="bg-white rounded-xl border border-blue-100 overflow-hidden hover:shadow-md transition-all">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-orion-darkGray">{paper.title}</h3>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Awaiting Review
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{paper.abstract}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        <div className="flex items-center text-xs text-gray-500">
                          <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Submitted on {new Date(paper.submittedAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span>{paper.category}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="text-xs text-gray-500">Authors:</span>
                        {paper.authors?.map((author, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                            {author}
                          </span>
                        ))}
                      </div>
                      
                      <Link
                        to={`/review-paper/${paper.id}`}
                        className="flex justify-center w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        tabIndex="0"
                        aria-label={`Review paper: ${paper.title}`}
                      >
                        Start Review
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">No papers are waiting for your review.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Side column - 1/3 width */}
        <div className="space-y-8">
          {/* Your recent reviews */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-orion-darkGray mb-6">Your Recent Reviews</h2>
            
            <div className="space-y-4">
              {recentReviews.length > 0 ? (
                recentReviews.map((paper) => (
                  <div key={paper.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-orion-darkGray">{paper.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        paper.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {paper.status === 'approved' ? 'Approved' : 'Rejected'}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-2">Your rating:</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${star <= paper.yourRating ? 'text-yellow-400' : 'text-gray-300'}`}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Reviewed on {new Date(paper.reviewedAt).toLocaleDateString()}
                    </div>
                    
                    <Link
                      to={`/paper/${paper.id}`}
                      className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      tabIndex="0"
                      aria-label={`View paper details: ${paper.title}`}
                    >
                      View Details
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">You haven't reviewed any papers yet.</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link
                to="/my-reviews"
                className="text-sm font-medium text-orion-darkGray flex justify-center hover:underline"
                tabIndex="0"
                aria-label="View all your reviews"
              >
                View All Reviews
              </Link>
            </div>
          </div>
          
          {/* Committee guidelines */}
          <div className="bg-blue-50 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-orion-darkGray mb-4">Review Guidelines</h2>
            
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Evaluate papers based on originality, methodology, and significance</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Complete reviews within 7 days of assignment</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Provide constructive feedback for authors</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Maintain confidentiality of all submissions</span>
              </li>
            </ul>
            
            <Link
              to="/committee-guidelines"
              className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
              tabIndex="0"
              aria-label="View full committee guidelines"
            >
              <span>View Full Guidelines</span>
              <svg className="w-4 h-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CommitteeDashboard; 