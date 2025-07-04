import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const getUserDetails = async (email) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', email));
    if (userDoc.exists()) {
      return userDoc.data(); 
    }
    return null;
  } catch (err) {
    console.error('Error fetching user details:', err);
    return null;
  }
};
