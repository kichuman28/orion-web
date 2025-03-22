import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('user'); // Default role
  const [loading, setLoading] = useState(true);

  // Sign up function
  const signup = async (email, password, fullName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email,
        fullName,
        role: 'user', // Default role for new users
        createdAt: new Date().toISOString()
      });
      
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Sign in function
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful:", userCredential.user.email);
      
      // Fetch and update user role immediately after login
      const role = await fetchUserRole(userCredential.user.uid, userCredential.user.email);
      console.log("User role after login:", role);
      setUserRole(role);
      
      return userCredential;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Sign in with Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      console.log("Google login successful:", userCredential.user.email);
      
      // Fetch and update user role immediately after Google login
      const role = await fetchUserRole(userCredential.user.uid, userCredential.user.email);
      console.log("User role after Google login:", role);
      setUserRole(role);
      
      return userCredential;
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  // Sign out function
  const logout = () => {
    return signOut(auth);
  };

  // Reset password
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Update user role
  const updateUserRole = async (uid, role) => {
    try {
      await setDoc(doc(db, 'users', uid), { role }, { merge: true });
      if (currentUser && currentUser.uid === uid) {
        setUserRole(role);
      }
    } catch (error) {
      throw error;
    }
  };

  // Fetch user role from Firestore
  const fetchUserRole = async (uid, email) => {
    console.log(`Attempting to fetch role for UID: ${uid}, Email: ${email}`);
    
    if (!uid) {
      console.error("No UID provided to fetchUserRole");
      return "user"; // Default role
    }
    
    try {
      // First approach: Try to fetch by UID
      console.log(`Fetching document by UID: ${uid}`);
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const role = userData.role || "user";
        console.log(`User document found by UID. Role: ${role}`, userData);
        return role;
      }
      
      console.log(`No document found with UID: ${uid}, trying by email...`);
      
      // Second approach: If not found by UID, try to find by email
      if (email) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          console.log(`User document found by email: ${email}. Role: ${userData.role}`, userData);
          
          // If found by email but with different UID, update the Firestore document UID
          if (userDoc.id !== uid) {
            console.log(`Updating document ID from ${userDoc.id} to ${uid}`);
            try {
              // Create new document with correct UID
              await setDoc(doc(db, "users", uid), {
                ...userData,
                uid: uid
              });
              // Delete the old document
              await deleteDoc(doc(db, "users", userDoc.id));
              console.log("Document ID updated successfully");
            } catch (error) {
              console.error("Error updating document ID:", error);
            }
          }
          
          return userData.role || "user";
        }
        
        // Special case: If email matches admin email but no document exists
        if (email === "admin@orion.com") {
          console.log("Admin email detected! Creating admin document.");
          try {
            await setDoc(doc(db, "users", uid), {
              email: email,
              role: "admin",
              uid: uid,
              name: "Admin User",
              createdAt: serverTimestamp()
            });
            console.log("Admin document created successfully");
            return "admin";
          } catch (error) {
            console.error("Error creating admin document:", error);
          }
        }
      }
      
      console.log(`No user document found for UID: ${uid}, Email: ${email}`);
      
      // Create a new user document if none exists
      if (email) {
        console.log(`Creating new user document for: ${email}`);
        try {
          await setDoc(doc(db, "users", uid), {
            email: email,
            role: "user",
            uid: uid,
            createdAt: serverTimestamp()
          });
          console.log("New user document created successfully");
        } catch (error) {
          console.error("Error creating user document:", error);
        }
      }
      
      return "user"; // Default role if no document found
    } catch (error) {
      console.error("Error fetching user role:", error);
      return "user"; // Default to user role on error
    }
  };

  // Effect to set current user and fetch role on auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      console.log('Auth state changed:', user ? `User logged in: ${user.email}` : 'User logged out');
      
      if (user) {
        setCurrentUser(user);
        
        // Fetch and set user role
        const role = await fetchUserRole(user.uid, user.email);
        console.log(`Setting user role on auth state change: ${role}`);
        setUserRole(role);
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    loading,
    login,
    signup,
    logout,
    resetPassword,
    loginWithGoogle,
    fetchUserRole, // Explicitly expose fetchUserRole
    setUserRole // Expose setUserRole for direct state updates
  };

  console.log("Current user:", currentUser?.uid);
  console.log("Current role:", userRole);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext; 