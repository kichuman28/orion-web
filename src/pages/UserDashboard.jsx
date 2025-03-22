import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import LessonCard from '../components/LessonCard';
import NotificationItem from '../components/NotificationItem';
import PaperCard from '../components/PaperCard';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const { currentUser, walletAddress } = useAuth();
  
  // Mock data - in a real app, this would come from Firestore/API
  const [stats, setStats] = useState({
    papersSubmitted: 5,
    papersVerified: 2,
    pendingReviews: 1,
    tokensEarned: 45
  });
  
  const [lessons, setLessons] = useState([
    {
      id: 1,
      title: 'Introduction to Blockchain Technology',
      description: 'Learn the fundamentals of blockchain technology and how it can be used to secure academic papers.',
      progress: 75,
      image: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      category: 'Blockchain',
      duration: '45 min'
    },
    {
      id: 2,
      title: 'Academic Writing Best Practices',
      description: 'Master the art of academic writing with these best practices and tips from experts.',
      progress: 30,
      image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      category: 'Writing',
      duration: '60 min'
    },
    {
      id: 3,
      title: 'Research Methodology for Academic Papers',
      description: 'Explore different research methodologies that can be applied to academic papers.',
      progress: 0,
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      category: 'Research',
      duration: '90 min'
    },
  ]);
  
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Paper Approved',
      message: 'Your paper "Blockchain in Education" has been approved by the committee.',
      type: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      read: false,
      link: '/paper/1'
    },
    {
      id: 2,
      title: 'Review in Progress',
      message: 'Your paper "Machine Learning Applications" is currently under review.',
      type: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      read: true,
      link: '/paper/2'
    },
    {
      id: 3,
      title: 'Blockchain Verification Complete',
      message: 'Your paper "Smart Contracts" has been verified on the blockchain.',
      type: 'paper',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      read: true,
      link: '/paper/3'
    },
  ]);
  
  const [papers, setPapers] = useState([
    {
      id: 1,
      title: 'Blockchain in Education',
      abstract: 'This paper explores the potential applications of blockchain technology in educational systems, focusing on credential verification and academic record security.',
      status: 'approved',
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      authors: ['John Doe', 'Jane Smith'],
      category: 'Blockchain',
      blockchain: true
    },
    {
      id: 2,
      title: 'Machine Learning Applications',
      abstract: 'An exploration of modern machine learning applications in various fields and industries, with case studies and practical implementations.',
      status: 'under_review',
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
      authors: ['John Doe'],
      category: 'Machine Learning',
      blockchain: false
    },
    {
      id: 3,
      title: 'Smart Contracts',
      abstract: 'A comprehensive look at smart contracts, their implementation, use cases, and potential for disrupting traditional contractual relationships.',
      status: 'verified',
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(), // 20 days ago
      authors: ['John Doe', 'Robert Johnson', 'Sarah Williams'],
      category: 'Blockchain',
      blockchain: true
    },
  ]);
  
  const [timelineItems, setTimelineItems] = useState([
    {
      id: 1,
      title: 'Paper Submitted',
      description: 'You submitted "Blockchain in Education"',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      icon: (
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 2,
      title: 'Certificate Awarded',
      description: 'Completed "Introduction to Blockchain Technology"',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
      icon: (
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      id: 3,
      title: 'Account Created',
      description: 'You joined Orion',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(), // 45 days ago
      icon: (
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
  ]);
  
  const [chartData, setChartData] = useState({
    papers: [0, 1, 2, 3, 2, 5],
    months: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
  });

  const firstName = currentUser?.email?.split('@')[0]?.split('.')?.[0] || 'User';
  
  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-orion-darkGray mb-2">
          Welcome back, <span className="capitalize">{firstName}</span>
        </h1>
        <p className="text-gray-600">
          Here's an overview of your academic journey and recent activities.
        </p>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Papers Submitted"
          value={stats.papersSubmitted}
          icon={
            <svg className="w-6 h-6 text-orion-darkGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          trend="up"
          trendValue="20%"
          bgColor="bg-purple-50"
        />
        
        <StatCard
          title="Papers Verified"
          value={stats.papersVerified}
          icon={
            <svg className="w-6 h-6 text-orion-darkGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          bgColor="bg-green-50"
        />
        
        <StatCard
          title="Pending Reviews"
          value={stats.pendingReviews}
          icon={
            <svg className="w-6 h-6 text-orion-darkGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          bgColor="bg-yellow-50"
        />
        
        <StatCard
          title="Tokens Earned"
          value={stats.tokensEarned}
          icon={
            <svg className="w-6 h-6 text-orion-darkGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          bgColor="bg-blue-50"
        />
      </div>
      
      {/* Wallet Status */}
      {!walletAddress && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-8" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                Please connect your wallet using the button in the header to fully utilize the platform's features.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Papers */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Recent Paper Submissions</h2>
              <Link to="/papers" className="text-orion-primary hover:text-orion-primaryDark text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {papers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Educational Resources</h2>
              <Link to="/resources" className="text-orion-primary hover:text-orion-primaryDark text-sm font-medium">
                Browse All
              </Link>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {lessons.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} />
              ))}
            </div>
          </div>
        </div>
        
        {/* Sidebar - Notifications & Quick Actions */}
        <div className="lg:col-span-1 space-y-8">
          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-4">
              <Link to="/submit-paper" className="block w-full px-4 py-3 bg-orion-primary text-white text-center font-medium rounded-md hover:bg-orion-primaryDark">
                Submit New Paper
              </Link>
              <Link to="/tokens" className="block w-full px-4 py-3 bg-white border border-gray-300 text-orion-darkGray text-center font-medium rounded-md hover:bg-gray-50">
                View Tokens & Rewards
              </Link>
              <Link to="/community" className="block w-full px-4 py-3 bg-white border border-gray-300 text-orion-darkGray text-center font-medium rounded-md hover:bg-gray-50">
                Join Research Community
              </Link>
            </div>
          </div>
          
          {/* Notifications */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
              <Link to="/notifications" className="text-orion-primary hover:text-orion-primaryDark text-sm font-medium">
                View All
              </Link>
            </div>
            <div>
              {notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard; 