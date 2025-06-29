import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      let emailToUse = identifier;
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmail = emailPattern.test(identifier);

      if (!isEmail) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('phone', '==', identifier));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          alert('Phone number not found. Please sign up first.');
          return;
        }
        emailToUse = snapshot.docs[0].data().email;
      }

      await signInWithEmailAndPassword(auth, emailToUse, password);
      console.log('User logged in');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error.message);
      alert('Login failed. Please check your credentials.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      console.log('Google login successful');
      navigate('/');
    } catch (error) {
      console.error('Google login error:', error.message);
      alert('Google login failed.');
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) navigate('/');
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory dark:bg-charcoal">
      <form onSubmit={handleLogin} className="bg-white dark:bg-[#1E1E2F] p-8 rounded-2xl shadow-xl space-y-4 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-primary">Login</h2>

        <input
          type="text"
          placeholder="Email or Phone Number"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
          required
        />

        <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg hover:bg-purple-700 transition">
          Log In
        </button>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">or</div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full border py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          Sign in with Google
        </button>

        <p className="text-center text-sm text-gray-700 dark:text-gray-300">
          Don’t have an account? <Link to="/signup" className="text-primary underline">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
