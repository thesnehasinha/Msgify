// ChatPage.jsx — Updated Design
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

  return (
    <div
      className={`h-screen flex flex-col sm:flex-row transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white'
          : 'bg-gradient-to-br from-white via-slate-100 to-white text-gray-800'
      }`}
    >
      {/* Sidebar (Animated Collapse) */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className="z-40 sm:relative fixed sm:translate-x-0"
      >
        <Sidebar
          contacts={contacts}
          activeChat={activeChat}
          setActiveChat={(contact) => {
            setActiveChat(contact);
            setSidebarOpen(false);
          }}
          sidebarOpen={sidebarOpen}
        />
      </motion.div>

      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-4 left-4 sm:hidden z-50 bg-white dark:bg-[#1e293b] p-2 rounded-full shadow-md"
      >
        <Menu className="w-5 h-5 text-gray-700 dark:text-white" />
      </button>

      {/* Chat Panel */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {activeChat ? (
          <>
            <Header contact={activeChat} />
            <div className="flex-1 bg-transparent">
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
