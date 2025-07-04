import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const checkUserExistsByEmail = async (email) => {
  const userRef = doc(db, 'users', email);
  const docSnap = await getDoc(userRef);
  return docSnap.exists() ? docSnap.data() : null;
};
