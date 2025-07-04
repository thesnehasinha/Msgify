import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; 

const firebaseConfig = {
  apiKey: "AIzaSyA5lqm03AEMBO_G_mJaEtMJPp326T733ys",
  authDomain: "msgify-d6389.firebaseapp.com",
  projectId: "msgify-d6389",
  storageBucket: "msgify-d6389.firebasestorage.app",
  messagingSenderId: "245561476588",
  appId: "1:245561476588:web:0d2a0e941f8c0342632cc9"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); 
