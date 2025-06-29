import React, { useEffect, useState } from 'react';
import ChatRoom from './components/ChatRoom';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const dummyUsers = ['Alice', 'Bob', 'Charlie', 'Sneha'];

function App() {
  const [user, setUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState('Alice');
  const [darkMode, setDarkMode] = useState(() => {
  const saved = localStorage.getItem('theme');
  if (saved) return saved === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
});
  const navigate = useNavigate();

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, currentUser => {
      if (currentUser) setUser(currentUser);
      else navigate('/login');
    });
    return () => unsub();
  }, []);

  // Theme handler
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Sidebar */}
      <div className="w-1/5 bg-gray-800 text-white p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-blue-400">Users</h2>
          <button
            onClick={() => signOut(auth)}
            className="bg-red-600 px-2 py-1 text-xs rounded"
          >
            Logout
          </button>
        </div>
        <ul>
          {dummyUsers.filter(u => u !== user.email).map(u => (
            <li
              key={u}
              onClick={() => setSelectedUser(u)}
              className={`p-2 cursor-pointer rounded ${
                selectedUser === u ? 'bg-gray-700' : ''
              }`}
            >
              {u}
            </li>
          ))}
        </ul>
        {/* Dark Mode Toggle */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="mt-2 bg-gray-600 hover:bg-gray-700 px-3 py-1 text-sm rounded transition"
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-white dark:bg-gray-800 shadow">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MSGIFY</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Logged in as <strong>{user.email}</strong> | Chatting with <strong>{selectedUser}</strong>
          </p>
        </div>
        <ChatRoom currentUser={user.email} selectedUser={selectedUser} />
      </div>
    </div>
  );
}

export default App;
