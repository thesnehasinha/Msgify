import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore'; // ✅ Ensure getDoc is imported

const UserContext = createContext(null);
export const useUser = () => useContext(UserContext);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("👤 Auth State Changed:", currentUser);

      if (currentUser) {
        setUser(currentUser);

        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          console.log("📌 User does not exist, creating Firestore document...");
          await setDoc(userDocRef, {
            uid: currentUser.uid,
            email: currentUser.email || '',
            name: currentUser.displayName || '',
            photoURL: currentUser.photoURL || '',
            lastseen: serverTimestamp(),
          });
          console.log("✅ User document created!");
        } else {
          console.log("✅ User already exists in Firestore");
        }
      } else {
        console.log("🚪 No user logged in");
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}
