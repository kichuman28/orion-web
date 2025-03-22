import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import OrionLogo from '../assets/OrionLogo';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const AdminDashboard = () => {
  const { currentUser, logout, fetchUserRole, userRole } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('committee');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const navigate = useNavigate();

  // Verify that we are actually on the admin dashboard with admin privileges
  useEffect(() => {
    const verifyAdminStatus = async () => {
      if (currentUser) {
        console.log("AdminDashboard: Verifying admin status for", currentUser.email);
        const role = await fetchUserRole(currentUser.uid, currentUser.email);
        console.log("AdminDashboard: Current user role:", role);
        
        if (role !== 'admin') {
          console.warn("Non-admin user accessing admin dashboard, redirecting to dashboard");
          navigate('/dashboard');
        } else {
          // Fetch users if admin status confirmed
          fetchAllUsers();
        }
      }
    };
    
    verifyAdminStatus();
  }, [currentUser, navigate, fetchUserRole]);

  const fetchAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);
      
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log("AdminDashboard: Fetched users:", usersData);
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

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

  const handleRoleAssignment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email) {
      setError('Please enter an email address');
      return;
    }
    
    setLoading(true);
    
    try {
      // Find the user in our collection or create them
      const usersRef = collection(db, "users");
      const q = usersRef;
      const querySnapshot = await getDocs(q);
      
      let userId = null;
      let existingUser = null;
      
      // Try to find user by email
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.email?.toLowerCase() === email.toLowerCase()) {
          userId = doc.id;
          existingUser = userData;
        }
      });
      
      if (existingUser) {
        // Update existing user's role
        await setDoc(doc(db, "users", userId), {
          ...existingUser,
          role: selectedRole
        });
        
        setSuccess(`Updated ${email}'s role to ${selectedRole}`);
      } else {
        // Create new user with this role (they'll sync with auth when they first log in)
        const newUserData = {
          email: email,
          role: selectedRole,
          createdAt: new Date().toISOString(),
          createdBy: currentUser.email
        };
        
        // Use email as temporary ID
        await setDoc(doc(db, "users", email.replace(/[.#$]/g, '_')), newUserData);
        
        setSuccess(`Created new user ${email} with role ${selectedRole}`);
      }
      
      // Refresh user list
      fetchAllUsers();
      setEmail('');
    } catch (error) {
      console.error('Role assignment error:', error);
      setError(error.message || 'Failed to update user role');
    } finally {
      setLoading(false);
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
              {currentUser?.email} <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">Admin</span>
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
          
          {success && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <p>{success}</p>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-xl font-semibold text-orion-darkGray">
                Admin Dashboard
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-orion-gray">
                Manage users, committee members, and platform settings.
              </p>
              <p className="mt-1 text-xs text-orion-gray">
                Current role: {userRole} | UID: {currentUser?.uid}
              </p>
            </div>
          </div>

          {/* Role assignment section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-orion-darkGray">Assign User Roles</h3>
              <p className="mt-1 max-w-2xl text-sm text-orion-gray">
                Update roles for existing users.
              </p>
            </div>
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <form onSubmit={handleRoleAssignment} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-orion-darkGray">
                      User Email
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orion-darkGray focus:border-orion-darkGray sm:text-sm"
                        tabIndex="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-orion-darkGray">
                      Select Role
                    </label>
                    <div className="mt-1">
                      <select
                        id="role"
                        name="role"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orion-darkGray focus:border-orion-darkGray sm:text-sm rounded-md"
                        tabIndex="0"
                      >
                        <option value="user">Regular User</option>
                        <option value="committee">Committee Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orion-darkGray hover:bg-orion-mediumGray focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orion-darkGray"
                      tabIndex="0"
                      aria-label="Assign role to user"
                    >
                      {loading ? 'Updating...' : 'Update Role'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* User list section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-orion-darkGray">Manage Users</h3>
              <p className="mt-1 max-w-2xl text-sm text-orion-gray">
                View and manage all users in the system.
              </p>
            </div>
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                {loadingUsers ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orion-darkGray"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            UID
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                              No users found
                            </td>
                          </tr>
                        ) : (
                          users.map((user) => (
                            <tr key={user.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {user.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full
                                  ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                                    user.role === 'committee' ? 'bg-blue-100 text-blue-800' : 
                                    'bg-green-100 text-green-800'}`}>
                                  {user.role || 'user'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className="truncate max-w-xs block">{user.id}</span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Statistics section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-orion-darkGray">Platform Statistics</h3>
              <p className="mt-1 max-w-2xl text-sm text-orion-gray">
                Overview of submissions and reviews.
              </p>
            </div>
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-orion-lightBg p-4 rounded-lg">
                    <p className="text-2xl font-bold text-orion-darkGray">0</p>
                    <p className="text-sm text-orion-gray">Total Papers</p>
                  </div>
                  <div className="bg-orion-lightBg p-4 rounded-lg">
                    <p className="text-2xl font-bold text-orion-darkGray">0</p>
                    <p className="text-sm text-orion-gray">Under Review</p>
                  </div>
                  <div className="bg-orion-lightBg p-4 rounded-lg">
                    <p className="text-2xl font-bold text-orion-darkGray">0</p>
                    <p className="text-sm text-orion-gray">Completed Reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard; 