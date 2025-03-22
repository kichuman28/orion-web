import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import LessonCard from '../components/LessonCard';
import NotificationItem from '../components/NotificationItem';
import PaperCard from '../components/PaperCard';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const { currentUser } = useAuth();
  
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
        />
        
        <StatCard
          title="Papers Verified"
          value={stats.papersVerified}
          icon={
            <svg className="w-6 h-6 text-orion-darkGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        />
        
        <StatCard
          title="Pending Reviews"
          value={stats.pendingReviews}
          icon={
            <svg className="w-6 h-6 text-orion-darkGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
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
        />
      </div>
      
      {/* Main content - 2 column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          {/* Paper Submissions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-orion-darkGray">Your Papers</h2>
              
              <div className="flex gap-2">
                <Link
                  to="/my-papers"
                  className="text-sm font-medium text-orion-darkGray hover:text-orion-mediumGray transition-colors"
                  tabIndex="0"
                  aria-label="View all papers"
                >
                  View All
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  to="/submit-paper"
                  className="text-sm font-medium text-orion-darkGray hover:text-orion-mediumGray transition-colors"
                  tabIndex="0"
                  aria-label="Submit new paper"
                >
                  Submit New
                </Link>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {papers.length > 0 ? (
                papers.slice(0, 2).map((paper) => (
                  <PaperCard key={paper.id} paper={paper} />
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">You haven't submitted any papers yet.</p>
                  <Link
                    to="/submit-paper"
                    className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orion-darkGray hover:bg-orion-mediumGray focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orion-darkGray"
                    tabIndex="0"
                    aria-label="Submit your first paper"
                  >
                    Submit Your First Paper
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Progress Charts */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-orion-darkGray mb-6">Your Progress</h2>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Simple bar chart visualization */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Paper Submissions Over Time</h3>
                <div className="h-48 flex items-end justify-between">
                  {chartData.papers.map((value, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="w-10 bg-gradient-to-t from-orion-darkGray to-orion-mediumGray rounded-t"
                        style={{ height: `${value * 30}px` }}
                      ></div>
                      <div className="text-xs text-gray-500 mt-2">{chartData.months[index]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Access Shortcuts */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-orion-darkGray mb-6">Quick Actions</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Link
                to="/submit-paper"
                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                tabIndex="0"
                aria-label="Submit a new paper"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-orion-darkGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-orion-darkGray">Submit Paper</span>
              </Link>
              
              <Link
                to="/learning"
                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                tabIndex="0"
                aria-label="Browse lessons"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-orion-darkGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-orion-darkGray">Browse Lessons</span>
              </Link>
              
              <Link
                to="/profile"
                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                tabIndex="0"
                aria-label="Edit your profile"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-orion-darkGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-orion-darkGray">Edit Profile</span>
              </Link>
              
              <Link
                to="/my-certificates"
                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                tabIndex="0"
                aria-label="View your certificates"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-orion-darkGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-orion-darkGray">Certificates</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Right column - 1/3 width */}
        <div className="space-y-8">
          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-orion-darkGray">Notifications</h2>
                <span className="bg-blue-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {notifications.filter(n => !n.read).length} New
                </span>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No notifications yet</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <Link
                to="/notifications"
                className="text-sm font-medium text-orion-darkGray flex justify-center hover:underline"
                tabIndex="0"
                aria-label="View all notifications"
              >
                View All Notifications
              </Link>
            </div>
          </div>
          
          {/* Timeline / Activity Feed */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-orion-darkGray mb-6">Activity Timeline</h2>
            
            <div className="flow-root">
              <ul className="-mb-8">
                {timelineItems.map((item, index) => (
                  <li key={item.id}>
                    <div className="relative pb-8">
                      {index !== timelineItems.length - 1 ? (
                        <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      ) : null}
                      <div className="relative flex items-start space-x-3">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                            {item.icon}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div>
                            <div className="text-sm font-medium text-orion-darkGray">{item.title}</div>
                            <p className="mt-0.5 text-sm text-gray-500">
                              {new Date(item.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="mt-2 text-sm text-gray-700">
                            <p>{item.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard; 