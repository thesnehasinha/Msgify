import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getGoogleContacts } from '../utils/fetchGoogleContacts';
import AddContactModal from './AddContactModal';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { useTheme } from '../context/ThemeContext';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const Sidebar = ({ contacts: externalContacts = [], activeChat, setActiveChat }) => {
  const { user } = useUser();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const fetchFirestoreContacts = async () => {
    if (!user?.email) return [];
    const contactList = [];
    const snapshot = await getDocs(collection(db, 'users', user.email, 'contacts'));
    snapshot.forEach(doc => {
      contactList.push(doc.data());
    });
    return contactList;
  };

  const fetchUserMeta = async (email) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', email));
      if (userDoc.exists()) {
        return userDoc.data();
      }
    } catch (err) {
      console.warn(`Error fetching user meta for ${email}:`, err);
    }
    return {};
  };

  const syncContacts = async () => {
    setLoading(true);
    try {
      const [googleContacts, firestoreContacts] = await Promise.all([
        getGoogleContacts(),
        fetchFirestoreContacts()
      ]);

      const combinedMap = new Map();
      googleContacts.forEach(contact => {
        combinedMap.set(contact.email, contact);
      });
      firestoreContacts.forEach(contact => {
        combinedMap.set(contact.email, contact);
      });

      const enhancedContacts = await Promise.all(
        Array.from(combinedMap.values()).map(async (contact) => {
          const meta = await fetchUserMeta(contact.email);
          return {
            ...contact,
            fullName: meta.fullName || contact.name || '',
            status: meta.status || ''
          };
        })
      );

      setContacts(enhancedContacts);
    } catch (error) {
      console.error('Failed to sync contacts:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    syncContacts();
  }, [user]);

  return (
    <div className="bg-gradient-to-b from-indigo-800 to-purple-900 text-white w-72 h-full p-4 flex flex-col shadow-lg border-r border-purple-700">
      {/* Top Section with Settings */}
      <div className="mb-4 flex justify-between items-start">
        <div>
          <div className="text-xl font-bold tracking-wide">{user?.displayName}</div>
          <div className="text-sm text-purple-200">{user?.email}</div>
          <div className="text-sm mt-1 text-yellow-300 cursor-pointer">Set Emoji Status</div>
        </div>
        {/* Settings Icon */}
        <button
          onClick={() => alert('Settings coming soon!')}
          className="text-purple-200 hover:text-white transition"
          title="Settings"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 01.894.553l.447.894a1 1 0 001.341.447l.894-.447A1 1 0 0114 5v2a1 1 0 01.553.894l.894.447a1 1 0 010 1.788l-.894.447A1 1 0 0114 11v2a1 1 0 01-.447.894l-.894.447a1 1 0 01-1.788 0l-.447-.894A1 1 0 0110 15a1 1 0 01-.894-.553l-.447-.894a1 1 0 00-1.341-.447l-.894.447A1 1 0 016 14v-2a1 1 0 01-.553-.894l-.894-.447a1 1 0 010-1.788l.894-.447A1 1 0 016 7V5a1 1 0 01.447-.894l.894-.447a1 1 0 011.788 0l.447.894A1 1 0 0110 3z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Buttons */}
      <button
        onClick={syncContacts}
        className="bg-white text-purple-800 rounded px-4 py-2 mb-2 hover:bg-purple-100 font-semibold shadow"
      >
        {loading ? 'Syncing...' : 'Sync Google Contacts'}
      </button>

      <button
        onClick={toggleTheme}
        className="bg-white text-purple-800 rounded px-4 py-2 mb-2 hover:bg-purple-100 font-semibold shadow"
      >
        Toggle Theme
      </button>

      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white rounded px-4 py-2 mb-4 font-semibold shadow"
      >
        Logout
      </button>

      <button
        onClick={() => setShowAddModal(true)}
        className="bg-pink-500 hover:bg-pink-600 text-white rounded px-4 py-2 mb-4 font-semibold shadow"
      >
        + Add Contact
      </button>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-purple-300 rounded">
        <h3 className="text-sm text-purple-100 mb-3 tracking-widest uppercase font-semibold">Contacts</h3>
        {contacts.length === 0 ? (
          <div className="text-sm text-purple-300">No contacts found</div>
        ) : (
          contacts.map((contact, index) => (
            <div
              key={index}
              onClick={() => setActiveChat(contact)}
              className={`cursor-pointer transition-transform transform hover:scale-[1.03] p-3 mb-2 rounded-lg shadow-md border border-transparent ${
                activeChat?.email === contact.email
                  ? 'bg-purple-700 border-2 border-yellow-300 text-white shadow-lg scale-[1.02]'
                  : 'bg-white dark:bg-[#1e1e2f] text-gray-900 dark:text-white'
              }`}
            >
              <div className="font-semibold text-base">{contact.fullName || contact.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{contact.email}</div>
              {contact.phone && (
                <div className="text-xs text-gray-500 dark:text-gray-400">{contact.phone}</div>
              )}
              {contact.status && (
                <div className="text-xs text-green-400 mt-1">
                  {contact.status === 'online' ? '🟢 Online' : `⏱ ${contact.status}`}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="text-center text-xs text-purple-300 mt-4">
        MSGIFY v1.0.0 — Made with 💜
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <AddContactModal
            onClose={() => setShowAddModal(false)}
            refreshContacts={syncContacts}
          />
        </div>
      )}
    </div>
  );
};

export default Sidebar;
