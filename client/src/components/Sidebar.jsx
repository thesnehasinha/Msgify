import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import {
  UserCircle, LogOut, Sun, Moon, RefreshCcw, Plus
} from 'lucide-react';
import { fetchGoogleContacts } from '../utils/fetchGoogleContacts';
import { useNavigate } from 'react-router-dom';
import AddContactModal from './AddContactModal';

export default function Sidebar({ activeChat, setActiveChat }) {
  const { user } = useUser();
  const { theme, toggleTheme } = useTheme();
  const [googleContacts, setGoogleContacts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const syncContacts = async () => {
    const contacts = await fetchGoogleContacts();
    setGoogleContacts(contacts);
  };

  return (
    <div className="h-screen w-72 bg-[#1e293b] text-[#f1f5f9] flex flex-col shadow-lg">
      
      {/* Profile Header */}
      <div className="p-4 flex items-center gap-3 border-b border-gray-700 bg-gradient-to-r from-purple-700 to-cyan-700 rounded-br-xl">
        <UserCircle className="w-10 h-10 text-white" />
        <div>
          <p className="font-semibold">{user?.displayName || 'Anonymous'}</p>
          <p className="text-sm text-cyan-100 cursor-pointer hover:underline">Set Emoji Status</p>
        </div>
      </div>

      {/* Functional Buttons */}
      <div className="text-sm border-b border-gray-700 px-2 pt-3">
        <button
          className="flex items-center gap-3 px-3 py-2 hover:bg-[#334155] w-full rounded transition-colors"
          onClick={syncContacts}
        >
          <RefreshCcw size={18} /> Sync Google Contacts
        </button>
        <button
          className="flex items-center gap-3 px-3 py-2 hover:bg-[#334155] w-full rounded transition-colors"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          className="flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-[#3b2b2b] w-full rounded transition-colors"
          onClick={handleLogout}
        >
          <LogOut size={18} /> Logout
        </button>
        <button
          className="flex items-center gap-3 px-3 py-2 mt-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded shadow hover:brightness-110 transition-all"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} /> Add Contact
        </button>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto text-sm px-3 py-4">
        <h3 className="text-xs text-cyan-300 font-semibold px-1 mb-2">CONTACTS</h3>
        {googleContacts.length === 0 ? (
          <p className="text-gray-400 text-sm px-2">No contacts synced yet</p>
        ) : (
          googleContacts.map((contact, index) => (
            <button
              key={index}
              onClick={() => setActiveChat(contact)}
              className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-all hover:bg-[#334155] ${
                activeChat?.email === contact.email
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-md'
                  : ''
              }`}
            >
              <p className="font-medium truncate">{contact.name}</p>
              <p className="text-xs text-slate-300 truncate">{contact.email}</p>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="text-xs text-center text-gray-500 p-3 border-t border-gray-700">
        MSGIFY v1.0.0 — Made with 💙
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <AddContactModal onClose={() => setShowAddModal(false)} />
        </div>
      )}
    </div>
  );
}
