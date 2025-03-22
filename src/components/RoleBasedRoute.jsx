import { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleBasedRoute = ({ allowedRoles }) => {
  const { currentUser, userRole, loading, fetchUserRole } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verifiedRole, setVerifiedRole] = useState(null);

  useEffect(() => {
    // Create a function to verify the user's role by forcing a fresh fetch
    const verifyUserRole = async () => {
      console.log(`🔒 Verifying access - Allowed roles: ${allowedRoles.join(', ')}`);
      console.log(`🔒 Current user: ${currentUser?.email}, Current role state: ${userRole}`);

      if (!currentUser) {
        console.log('❌ No authenticated user found, redirecting to login');
        setIsVerifying(false);
        return;
      }

      try {
        // Force a fresh role check directly from Firestore
        const freshRole = await fetchUserRole(currentUser.uid, currentUser.email);
        console.log(`✅ Fresh role verification result: ${freshRole}`);
        setVerifiedRole(freshRole);

        // Check if the user has the required role
        const hasRequiredRole = allowedRoles.includes(freshRole);
        console.log(`${hasRequiredRole ? '✅' : '❌'} User has required role: ${hasRequiredRole}`);
      } catch (error) {
        console.error('Error verifying user role:', error);
        setVerifiedRole('user'); // Default to user on error
      } finally {
        setIsVerifying(false);
      }
    };

    if (!loading) {
      verifyUserRole();
    }
  }, [currentUser, userRole, loading, allowedRoles, fetchUserRole]);

  // Show loading while auth state is being determined or role is being verified
  if (loading || isVerifying) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-orion-lightBg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orion-darkGray mb-4"></div>
        <p className="text-orion-darkGray font-medium">Verifying access...</p>
        <p className="text-orion-gray text-sm mt-2">This might take a moment</p>
      </div>
    );
  }

  // If no user is logged in, redirect to login
  if (!currentUser) {
    console.log('⚠️ RoleBasedRoute: No authenticated user - redirecting to login');
    return <Navigate to="/login" />;
  }

  // Use the verified role for access control
  const roleToCheck = verifiedRole || userRole;
  
  // If user doesn't have the required role, redirect to dashboard
  if (!allowedRoles.includes(roleToCheck)) {
    console.log(`⚠️ Access denied - User role ${roleToCheck} not in allowed roles: ${allowedRoles.join(', ')}`);
    return <Navigate to="/dashboard" />;
  }

  // User has correct role, grant access
  console.log(`✅ Access granted - User role ${roleToCheck} matches allowed roles`);
  return <Outlet />;
};

export default RoleBasedRoute; 