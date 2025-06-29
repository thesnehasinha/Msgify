import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ChatRoom from '../components/ChatRoom';
import ContactList from '../components/ContactLIst';
import { auth } from '../firebase';

export default function ChatPage() {
  const loc = useLocation();

  const currentUser = auth.currentUser; 
  const [selectedUser, setSelectedUser] = useState(null); // { uid, name }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 border-r">
        <ContactList
          currentUser={currentUser?.uid}
          onSelectContact={(user) => setSelectedUser(user)}
        />
      </div>

      {/* Chat section */}
      <div className="flex-1 bg-gray-100 flex flex-col">
        <div className="p-4 border-b bg-white shadow-sm">
          <h2 className="text-lg font-semibold">Welcome, {currentUser}</h2>
          {selectedUser ? (
            <h3 className="text-sm text-gray-500">Chatting with {selectedUser.name}</h3>
          ) : (
            <h3 className="text-sm text-gray-400">Select a contact to start chatting</h3>
          )}
        </div>

        {selectedUser && (
          <ChatRoom
            currentUser={currentUser?.uid}
            selectedUser={selectedUser.uid}
            selectedUserName={selectedUser.name}
          />
        )}
      </div>
    </div>
  );
}
