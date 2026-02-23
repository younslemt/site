import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // 1. Try to fetch user details from Firestore by UID
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as User;
            
            // Only override Admin role if needed for safety
            if (userDocSnap.id === 'AAlznCj00vNpekjZpLc4a9f67E03') {
                userData.role = 'admin';
            }
            
            setCurrentUser({ id: userDocSnap.id, ...userData });
          } else {
            // 2. If not found by UID, try to find by Email
            // This handles cases where the Admin created the user with a generated ID instead of the Auth UID
            console.log("User not found by UID, trying email lookup for:", firebaseUser.email);
            
            let foundUser: User | null = null;
            
            if (firebaseUser.email) {
                const q = query(collection(db, 'users'), where('email', '==', firebaseUser.email));
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    foundUser = { id: doc.id, ...doc.data() } as User;
                    console.log("User found by email:", foundUser);
                }
            }

            if (foundUser) {
                 setCurrentUser(foundUser);
            } else {
                console.warn("User document not found in Firestore for UID or Email:", firebaseUser.uid);
                
                let role: 'admin' | 'client' = 'client';
                let orgId = '';

                if (firebaseUser.uid === 'AAlznCj00vNpekjZpLc4a9f67E03') {
                    role = 'admin';
                } else if (firebaseUser.uid === 'laIe3SMHQjFOfEf7KPYl6YmdUlMQx2') {
                    role = 'client';
                    orgId = 'org-fiduciaire';
                }

                 setCurrentUser({
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || 'User',
                    email: firebaseUser.email || '',
                    role: role,
                    organizationId: orgId
                  });
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
