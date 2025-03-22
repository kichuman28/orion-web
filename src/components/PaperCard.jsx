import React from 'react';
import { Link } from 'react-router-dom';

const PaperCard = ({ paper }) => {
  const { id, title, abstract, status, submittedAt, authors, category, blockchain } = paper;
  
  // Get status badge color
  const getStatusColor = () => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'verified':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get status text
  const getStatusText = () => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      case 'under_review':
        return 'Under Review';
      case 'verified':
        return 'Verified on Blockchain';
      default:
        return 'Unknown Status';
    }
  };
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg text-orion-darkGray">{title}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{abstract}</p>
        
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Submitted on {formatDate(submittedAt)}</span>
          </div>
          
          <div className="flex items-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>{category}</span>
          </div>
          
          {blockchain && (
            <div className="flex items-center text-xs text-purple-600">
              <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Blockchain Verified</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs text-gray-500">Authors:</span>
          {authors?.length > 0 ? (
            authors.map((author, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                {author}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-500">No authors listed</span>
          )}
        </div>
        
        <Link
          to={`/paper/${id}`}
          className="flex justify-center w-full py-2 px-4 border border-orion-darkGray rounded-md shadow-sm text-sm font-medium text-orion-darkGray hover:bg-orion-darkGray hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orion-darkGray transition-colors"
          tabIndex="0"
          aria-label={`View paper: ${title}`}
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default PaperCard; 