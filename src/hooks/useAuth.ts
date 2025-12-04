import { useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/types';

export const useAuth = () => {
  const { user, loading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser?.email);
      setLoading(true);
      
      if (firebaseUser) {
        const userData: User = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || undefined,
          createdAt: new Date(),
        };
        
        const firestoreData = {
          ...userData,
          createdAt: Timestamp.now(),
        };
        
        // Create or update user in Firestore
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          await setDoc(userRef, firestoreData, { merge: true });
          console.log('User data saved, setting user state');
          setUser(userData);
        } catch (error) {
          console.error('Error creating user:', error);
          setUser(userData); // Set user even if Firestore fails
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Sign in successful:', result.user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    logout,
  };
};