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
import { ethers } from 'ethers';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('user'); // Default role
  const [loading, setLoading] = useState(true);
  
  // Wallet state
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [connectionError, setConnectionError] = useState('');
  const [walletBalance, setWalletBalance] = useState(null);

  // Chain details for Open Campus
  const chainDetails = {
    chainId: '0xA045C', // 655854 in hex
    chainName: 'EDU Chain Testnet',
    rpcUrls: ['https://open-campus-codex-sepolia.drpc.org'],
    blockExplorerUrls: ['https://opencampus-codex.blockscout.com'],
    nativeCurrency: {
      name: 'EDU',
      symbol: 'EDU',
      decimals: 18
    }
  };

  // Check if wallet was previously connected
  useEffect(() => {
    const savedWalletAddress = localStorage.getItem('walletAddress');
    if (savedWalletAddress) {
      setWalletAddress(savedWalletAddress);
      // We don't automatically connect to prevent security issues,
      // but we can show the user they had a wallet previously connected
    }
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    if (!window.ethereum) {
      setConnectionError('MetaMask not detected. Please install MetaMask first.');
      return null;
    }

    try {
      setIsConnectingWallet(true);
      setConnectionError('');

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      
      // Create ethers provider and signer
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      const ethSigner = await ethProvider.getSigner();
      
      // Check if the chain ID matches
      const network = await ethProvider.getNetwork();
      const currentChainId = `0x${network.chainId.toString(16)}`;
      
      // Switch to EDU Chain if not already on it
      if (currentChainId.toLowerCase() !== chainDetails.chainId.toLowerCase()) {
        try {
          // Try to switch to the EDU Chain
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: chainDetails.chainId }],
          });
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [chainDetails],
              });
            } catch (addError) {
              throw new Error('Failed to add EDU Chain to MetaMask');
            }
          } else {
            throw switchError;
          }
        }
      }
      
      // Get the balance
      const balance = await ethProvider.getBalance(address);
      const formattedBalance = ethers.formatEther(balance);
      
      // Update state with wallet connection details
      setWalletAddress(address);
      setProvider(ethProvider);
      setSigner(ethSigner);
      setWalletBalance(formattedBalance);
      
      // Save wallet address to localStorage
      localStorage.setItem('walletAddress', address);
      
      // Store wallet address in user document if authenticated
      if (currentUser) {
        await setDoc(doc(db, 'users', currentUser.uid), {
          walletAddress: address
        }, { merge: true });
      }
      
      // Set up listeners for account and chain changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return { address, signer: ethSigner };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setConnectionError(error.message || 'Failed to connect wallet');
      return null;
    } finally {
      setIsConnectingWallet(false);
    }
  };
  
  // Handle account change in MetaMask
  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      // User has disconnected their wallet
      disconnectWallet();
    } else {
      // User has switched accounts
      const newAddress = accounts[0];
      setWalletAddress(newAddress);
      localStorage.setItem('walletAddress', newAddress);
      
      // Update balance
      if (provider) {
        const balance = await provider.getBalance(newAddress);
        setWalletBalance(ethers.formatEther(balance));
      }
      
      // Update the user's wallet address in Firestore
      if (currentUser) {
        await setDoc(doc(db, 'users', currentUser.uid), {
          walletAddress: newAddress
        }, { merge: true });
      }
    }
  };
  
  // Handle chain change in MetaMask
  const handleChainChanged = (_chainId) => {
    // We recommend reloading the page unless you have good reason not to
    window.location.reload();
  };
  
  // Disconnect wallet function
  const disconnectWallet = () => {
    setWalletAddress('');
    setProvider(null);
    setSigner(null);
    setWalletBalance(null);
    localStorage.removeItem('walletAddress');
    
    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  };

  // Check if wallet is connected
  const isWalletConnected = () => {
    return !!walletAddress;
  };

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
        createdAt: new Date().toISOString(),
        walletAddress: walletAddress || null // Include wallet if already connected
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

  // Value to be provided by the context
  const value = {
    currentUser,
    userRole,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserRole,
    fetchUserRole,
    
    // Wallet-related values and functions
    walletAddress,
    isConnectingWallet,
    walletBalance,
    connectionError,
    connectWallet,
    disconnectWallet,
    isWalletConnected,
    provider,
    signer,
    chainDetails
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