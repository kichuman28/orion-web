import { useState } from 'react';

/**
 * Component to display plagiarism check results for a paper
 * @param {Object} props - Component props
 * @param {Object} props.plagiarismData - Plagiarism check data
 * @param {boolean} props.showDetails - Whether to initially show detailed results
 */
const PlagiarismResultsCard = ({ plagiarismData, showDetails = false }) => {
  const [isExpanded, setIsExpanded] = useState(showDetails);

  // Handle cases where plagiarism data is not available
  if (!plagiarismData) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 mt-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-gray-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-gray-600">Plagiarism check not performed</span>
        </div>
      </div>
    );
  }

  // Handle error state
  if (plagiarismData.status === 'error') {
    return (
      <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mt-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-yellow-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm text-yellow-800">Error during plagiarism check: {plagiarismData.errorMessage}</span>
        </div>
      </div>
    );
  }

  // Determine status styling
  const getStatusStyles = () => {
    if (plagiarismData.status === 'pending') {
      return {
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-100', 
        textColor: 'text-blue-800',
        iconColor: 'text-blue-400'
      };
    }
    
    if (plagiarismData.isUnavailable) {
      return {
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-800',
        iconColor: 'text-gray-500'
      };
    }
    
    if (plagiarismData.isPlagiarized) {
      return {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-100',
        textColor: 'text-red-800',
        iconColor: 'text-red-500'
      };
    }
    
    return {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100',
      textColor: 'text-green-800',
      iconColor: 'text-green-500'
    };
  };

  const styles = getStatusStyles();

  // Format date string
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className={`${styles.bgColor} border ${styles.borderColor} rounded-lg p-4 mt-4`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {plagiarismData.status === 'pending' ? (
            <svg className="w-5 h-5 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : plagiarismData.isUnavailable ? (
            <svg className={`w-5 h-5 ${styles.iconColor} mr-2`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : plagiarismData.isPlagiarized ? (
            <svg className={`w-5 h-5 ${styles.iconColor} mr-2`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className={`w-5 h-5 ${styles.iconColor} mr-2`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}

          <div>
            <h3 className={`text-sm font-medium ${styles.textColor}`}>
              Plagiarism Check: {plagiarismData.overallStatus}
            </h3>
            <p className="text-xs text-gray-600">
              {plagiarismData.status === 'pending' 
                ? 'Check in progress...' 
                : `Checked on ${formatDate(plagiarismData.checkDate)}`}
            </p>
          </div>
        </div>
        
        {/* Toggle button - only if there are results */}
        {plagiarismData.status === 'completed' && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm font-medium text-gray-600 hover:text-gray-800"
            aria-label={isExpanded ? "Hide details" : "Show details"}
            tabIndex="0"
          >
            {isExpanded ? (
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        )}
      </div>
      
      {/* Summary row */}
      {plagiarismData.status === 'completed' && (
        <div className="mt-2 text-sm">
          <p className={styles.textColor}>
            {plagiarismData.matchesFound} similarity {plagiarismData.matchesFound === 1 ? 'match' : 'matches'} found 
            {plagiarismData.isPlagiarized ? ' (potential plagiarism detected)' : ' (within acceptable limits)'}
          </p>
        </div>
      )}
      
      {/* Detailed results */}
      {isExpanded && plagiarismData.status === 'completed' && plagiarismData.similarityScores?.length > 0 && (
        <div className="mt-3 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Similarity matches:</h4>
          <div className="max-h-64 overflow-y-auto">
            {plagiarismData.similarityScores.map((score, index) => (
              <div key={index} className="bg-white rounded border p-2 mb-2">
                <div className="flex justify-between">
                  <span className="text-xs font-medium">{score.reference_file || `Source ${index + 1}`}</span>
                  <span className={`text-xs font-medium ${score.is_match ? 'text-red-600' : 'text-green-600'}`}>
                    {Math.round(score.similarity * 100)}% match
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlagiarismResultsCard; 