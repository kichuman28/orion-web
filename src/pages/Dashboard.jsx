import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { userRole, currentUser, loading, fetchUserRole } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [lastCheckedRole, setLastCheckedRole] = useState(null);

  useEffect(() => {
    const redirectBasedOnRole = async () => {
      if (loading || !currentUser || isRedirecting) return;
      
      // Skip if we've already checked this role
      if (lastCheckedRole === userRole) return;
      
      setIsRedirecting(true);
      setLastCheckedRole(userRole);
      console.log("Dashboard: Preparing to redirect based on role:", userRole);
      
      try {
        // Force a fresh role fetch to ensure we have the latest data
        const freshRole = await fetchUserRole(currentUser.uid, currentUser.email);
        console.log("Dashboard: Fresh role check result:", freshRole);
        
        // Small delay to ensure state update has completed
        setTimeout(() => {
          // Use the freshly fetched role rather than the state variable
          console.log("Dashboard: Redirecting with fresh role:", freshRole);
          
          switch(freshRole) {
            case 'admin':
              console.log("Redirecting to admin dashboard");
              navigate('/admin-dashboard');
              break;
            case 'committee':
              console.log("Redirecting to committee dashboard");
              navigate('/committee-dashboard');
              break;
            default:
              console.log("Redirecting to user dashboard");
              navigate('/user-dashboard');
          }
        }, 500);
      } catch (error) {
        console.error("Error during role redirect:", error);
        navigate('/user-dashboard'); // Fallback to user dashboard on error
        setIsRedirecting(false);
      }
    };

    redirectBasedOnRole();
  }, [userRole, loading, navigate, currentUser, isRedirecting, fetchUserRole, lastCheckedRole]);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-orion-lightBg">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orion-darkGray mb-4"></div>
      <p className="text-orion-darkGray font-medium">Preparing your dashboard...</p>
      <p className="text-orion-gray text-sm mt-2">Current role: {userRole}</p>
      <p className="text-orion-gray text-sm mt-1">User: {currentUser?.email}</p>
    </div>
  );
};

export default Dashboard; 