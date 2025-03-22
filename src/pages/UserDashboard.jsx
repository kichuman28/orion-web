import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import OrionLogo from '../assets/OrionLogo';

const UserDashboard = () => {
  const { currentUser, logout } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogout = async () => {
    setError('');
    
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to log out');
    }
  };

  return (
    <div className="min-h-screen bg-orion-lightBg">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <OrionLogo className="w-8 h-8 text-orion-darkGray" />
            <h1 className="text-2xl font-bold text-orion-darkGray">Orion</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-orion-gray">
              {currentUser?.email}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orion-darkGray hover:bg-orion-mediumGray focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orion-darkGray"
              tabIndex="0"
              aria-label="Sign out"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-xl font-semibold text-orion-darkGray">
                Welcome to your Orion Dashboard
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-orion-gray">
                Your personal space to manage papers and submissions.
              </p>
            </div>
          </div>

          {/* Papers section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-orion-darkGray">Your Papers</h3>
                <p className="mt-1 max-w-2xl text-sm text-orion-gray">
                  Manage your submissions and track their status.
                </p>
              </div>
              <button
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orion-darkGray hover:bg-orion-mediumGray focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orion-darkGray"
                tabIndex="0"
                aria-label="Submit a new paper"
              >
                Submit New Paper
              </button>
            </div>
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="text-center py-10">
                  <p className="text-orion-gray">You haven't submitted any papers yet.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard; 