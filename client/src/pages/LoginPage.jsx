import { useState } from 'react';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // ✅ Save user to Firestore using email (not UID)
  const saveUserToFirestore = async (user) => {
    console.log("🔥 Trying to save user to Firestore:", user.email);
    try {
      const userRef = doc(db, 'users', user.email); // ✅ FIXED HERE
      await setDoc(userRef, {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid,
        lastSeen: serverTimestamp()
      }, { merge: true });
      console.log('✅ User saved to Firestore!');
    } catch (error) {
      console.error('❌ Error saving user to Firestore:', error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/chat');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log("👉 Inside handleGoogleSignIn");

    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    provider.addScope('https://www.googleapis.com/auth/userinfo.email');
    provider.addScope('https://www.googleapis.com/auth/userinfo.profile');

    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken || result?._tokenResponse?.oauthAccessToken;

      if (accessToken) {
        localStorage.setItem('googleAccessToken', accessToken);
        console.log('✅ Google access token stored!');
      } else {
        console.warn('⚠ No access token found from Google login');
      }

      await saveUserToFirestore(result.user); // ✅ ensure it's saved by email
      navigate('/chat');
    } catch (error) {
      console.error('❌ Google Sign-In Error:', error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-[#1a1a2e] text-white p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        <h2 className="text-3xl font-semibold text-center text-purple-400 mb-6">Msgify Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-[#0f0c29] border border-purple-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-[#0f0c29] border border-purple-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 transition-all duration-300 font-semibold"
          >
            Log In
          </button>
        </form>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-t border-gray-600" />
          <span className="mx-2 text-gray-400">or</span>
          <hr className="flex-grow border-t border-gray-600" />
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full py-2 border border-gray-500 rounded-xl text-white hover:bg-white hover:text-black transition-all duration-300"
        >
          Sign in with Google
        </button>

        <p className="mt-4 text-center text-sm text-gray-400">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-purple-400 hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
