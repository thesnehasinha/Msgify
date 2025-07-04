import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useContacts } from '../context/ContactsContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ChatRoom from '../components/ChatRoom';
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChatPage() {
  const { user } = useUser();
  const { contacts } = useContacts();
  const { theme } = useTheme();
  const [activeChat, setActiveChat] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSelectContact = (contact) => {
    setActiveChat(contact);
    setSidebarOpen(false);
  };

  return (
    <div
      className={`h-screen w-screen flex transition-colors duration-300 font-sans ${
        theme === 'dark'
          ? 'bg-[#0f172a] text-white'
          : 'bg-white text-gray-800'
      }`}
    >
      {/* Sidebar (Left) */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: sidebarOpen ? 0 : -320 }}
        transition={{ duration: 0.3 }}
        className={`z-40 sm:z-auto fixed sm:relative h-full w-72 shrink-0 bg-gradient-to-b ${
          theme === 'dark'
            ? 'from-[#1e293b] to-[#0f172a]'
            : 'from-indigo-100 to-purple-100'
        } shadow-lg border-r border-purple-700`}
      >
        <Sidebar
          contacts={contacts}
          activeChat={activeChat}
          setActiveChat={handleSelectContact}
          sidebarOpen={sidebarOpen}
        />
      </motion.div>

      {/* Sidebar Toggle on Mobile */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-4 left-4 sm:hidden z-50 bg-white dark:bg-[#1e293b] p-2 rounded-full shadow-md"
      >
        <Menu className="w-5 h-5 text-gray-700 dark:text-white" />
      </button>

      {/* Chat Content (Right) */}
      <div className="flex-1 flex flex-col h-full ml-0 sm:ml-72 bg-transparent">
        {activeChat ? (
          <>
            <Header contact={activeChat} />
            <div className="flex-1 overflow-y-auto">
              <ChatRoom
                currentUser={user.uid}
                selectedUser={activeChat.uid}
                selectedUserName={activeChat.name}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center text-gray-400 dark:text-gray-500">
            <img
              src="https://cdn-icons-png.flaticon.com/512/9068/9068672.png"
              alt="No chat selected"
              className="w-24 h-24 mb-4 opacity-70"
            />
            <h2 className="text-xl font-semibold mb-2">No chat selected</h2>
            <p className="text-sm">Please select a contact from the sidebar to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}
