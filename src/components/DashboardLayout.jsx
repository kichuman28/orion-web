import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleLogout = async () => {
    setError('');
    
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to log out');
    }
  };

  return (
    <div className="flex min-h-screen bg-orion-lightBg">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 pl-64">
        {/* Header */}
        <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-orion-darkGray">Orion Research Platform</h1>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orion-darkGray hover:bg-orion-mediumGray focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orion-darkGray"
              tabIndex="0"
              aria-label="Sign out"
            >
              Sign Out
            </button>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 p-6">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {children}
        </main>
        
        {/* Footer */}
        <footer className="bg-white py-4 px-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Orion Research Platform. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout; 