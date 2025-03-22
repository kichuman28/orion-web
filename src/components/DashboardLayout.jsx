import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  const { logout, walletAddress, connectWallet, disconnectWallet, isConnectingWallet, connectionError } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);

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

  const handleWalletAction = async () => {
    if (walletAddress) {
      setWalletDropdownOpen(!walletDropdownOpen);
    } else {
      try {
        await connectWallet();
      } catch (err) {
        console.error('Wallet connection error:', err);
        setError('Failed to connect wallet');
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById('wallet-dropdown');
      if (dropdown && !dropdown.contains(event.target) && 
          !event.target.closest('[data-wallet-button]')) {
        setWalletDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
            {/* Wallet Connection Button */}
            <div className="relative">
              <button
                data-wallet-button
                onClick={handleWalletAction}
                disabled={isConnectingWallet}
                className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium flex items-center ${
                  walletAddress 
                    ? 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200' 
                    : 'bg-orion-darkGray text-white hover:bg-orion-mediumGray'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orion-darkGray transition-all`}
                tabIndex="0"
                aria-label={walletAddress ? "Wallet connected" : "Connect wallet with MetaMask"}
              >
                <svg className="mr-2 h-4 w-4" width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.875 10.9375H3.125C1.39911 10.9375 0 12.3366 0 14.0625V20.3125C0 22.0384 1.39911 23.4375 3.125 23.4375H21.875C23.6009 23.4375 25 22.0384 25 20.3125V14.0625C25 12.3366 23.6009 10.9375 21.875 10.9375Z" fill="currentColor"/>
                  <path d="M21.875 1.5625H3.125C1.39911 1.5625 0 2.96161 0 4.6875V6.25C0 7.97589 1.39911 9.375 3.125 9.375H21.875C23.6009 9.375 25 7.97589 25 6.25V4.6875C25 2.96161 23.6009 1.5625 21.875 1.5625Z" fill="currentColor"/>
                </svg>
                {isConnectingWallet ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </span>
                ) : walletAddress ? (
                  <span>
                    {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
                  </span>
                ) : (
                  <span>Connect Wallet</span>
                )}
              </button>
              
              {/* Wallet Dropdown */}
              {walletDropdownOpen && walletAddress && (
                <div 
                  id="wallet-dropdown"
                  className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                >
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                      Connected Wallet
                    </div>
                    <div className="px-4 py-2 text-sm text-gray-700 truncate border-b border-gray-100">
                      {walletAddress}
                    </div>
                    <button
                      onClick={() => {
                        disconnectWallet();
                        setWalletDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sign Out Button */}
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
          {(error || connectionError) && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error || connectionError}</span>
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