import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Dark mode class toggling
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <div className="font-sans bg-white text-gray-800 dark:bg-gray-900 dark:text-white transition-colors duration-500">
      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full bg-white dark:bg-gray-800 shadow z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-white">MSGIFY</h1>

          {/* Desktop Nav */}
          <nav className="space-x-6 hidden md:flex">
            <Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-300">Login</Link>
            <Link to="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">Sign Up</Link>
            <button onClick={() => setDark(!dark)} className="ml-2 border px-3 py-1 rounded text-sm">
              {dark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </nav>

          {/* Mobile Nav Toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-2xl text-blue-600 dark:text-white">
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden px-6 pb-4 space-y-2 bg-white dark:bg-gray-800">
            <Link to="/login" className="block hover:text-blue-600 dark:hover:text-blue-300">Login</Link>
            <Link to="/signup" className="block bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700">Sign Up</Link>
            <button onClick={() => setDark(!dark)} className="block border px-3 py-1 rounded text-sm mt-2">
              {dark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="pt-28">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center opacity-0 animate-fade-in">
          <div>
            <h2 className="text-4xl font-bold mb-4">
              Chat Smarter with <span className="text-blue-600 dark:text-blue-400">MSGIFY</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Secure, real-time messaging for teams, friends, and everyone in between.
            </p>
            <Link to="/signup" className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700">
              Get Started
            </Link>
          </div>
          <div>
            <img src="/chat-illustration.svg" alt="Chat" className="w-full max-w-md mx-auto" />
          </div>
        </section>

        {/* Features */}
        <section className="bg-gray-50 dark:bg-gray-800 py-16 transition-colors">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-2xl font-semibold text-center mb-12">Why Choose MSGIFY?</h3>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="p-6 bg-white dark:bg-gray-700 rounded-xl shadow hover:shadow-md transition">
                <h4 className="font-bold mb-2 text-blue-600 dark:text-blue-400">Real-Time Messaging</h4>
                <p>Chat without delays. Enjoy seamless real-time sync using Firebase.</p>
              </div>
              <div className="p-6 bg-white dark:bg-gray-700 rounded-xl shadow hover:shadow-md transition">
                <h4 className="font-bold mb-2 text-blue-600 dark:text-blue-400">Secure & Private</h4>
                <p>End-to-end security with Firestore ensures your messages stay yours.</p>
              </div>
              <div className="p-6 bg-white dark:bg-gray-700 rounded-xl shadow hover:shadow-md transition">
                <h4 className="font-bold mb-2 text-blue-600 dark:text-blue-400">Easy to Use</h4>
                <p>Smooth login, intuitive UI, and a clean chat interface you'll love.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-white dark:bg-gray-900 transition-colors">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h3 className="text-2xl font-semibold mb-8">What Our Users Say</h3>
            <div className="bg-blue-50 dark:bg-gray-700 p-6 rounded-lg shadow">
              <p className="italic">"MSGIFY changed the way we communicate — it's lightning fast and super secure."</p>
              <div className="mt-4 font-semibold">— Sneha, Developer</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-800 py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-300">
          <p>&copy; {new Date().getFullYear()} MSGIFY. All rights reserved.</p>
          <div className="space-x-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-300">About</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-300">Contact</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-300">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
