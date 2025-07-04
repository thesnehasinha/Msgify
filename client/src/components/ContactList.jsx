import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import GoogleContactsSync from './GoogleContactsSync';

export default function ContactList({ currentUser, onSelectContact }) {
  const [contacts, setContacts] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchContacts();
    fetchRegisteredUsers();
  }, []);

  const fetchContacts = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const contactsRef = collection(db, `users/${user.uid}/contacts`);
    const snapshot = await getDocs(contactsRef);
    const contactData = snapshot.docs.map(doc => doc.data());
    setContacts(contactData);
  };

  const fetchRegisteredUsers = async () => {
    const snapshot = await getDocs(collection(db, 'users'));
    const userMap = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.phone) {
        const cleanedPhone = data.phone.replace(/\s/g, '');
        userMap[cleanedPhone] = {
          id: doc.id,
          name: `${data.firstName} ${data.lastName}`.trim() || 'Unnamed User'
        };
      }
    });
    setRegisteredUsers(userMap);
  };

  const handleGoogleContactsFetched = async (googleContacts) => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = collection(db, 'users');
    const userSnapshot = await getDocs(userRef);

    const phoneMap = {};
    userSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.phone) {
        phoneMap[data.phone.replace(/\s/g, '')] = {
          id: doc.id,
          name: `${data.firstName} ${data.lastName}`.trim()
        };
      }
    });

    const matched = googleContacts
      .filter(gc => gc.phone)
      .map(gc => {
        const cleaned = gc.phone.replace(/\s/g, '');
        return phoneMap[cleaned]
          ? { contactName: gc.name || 'Unknown', phone: cleaned }
          : null;
      })
      .filter(Boolean);

    const contactsRef = collection(db, `users/${user.uid}/contacts`);
    const existingSnapshot = await getDocs(contactsRef);
    const existingPhones = existingSnapshot.docs.map(doc => doc.data().phone);

    const newContacts = matched.filter(c => !existingPhones.includes(c.phone));
    for (const contact of newContacts) {
      await addDoc(contactsRef, contact);
    }

    if (newContacts.length) {
      alert(`${newContacts.length} MSGIFY users added from Google Contacts!`);
      setContacts(prev => [...prev, ...newContacts]);
    } else {
      alert('No new MSGIFY users found in your Google Contacts.');
    }
  };

  const handleManualAdd = async () => {
    const contactName = prompt('Enter contact name:');
    const phone = prompt('Enter contact phone number:');
    if (!contactName || !phone) return;

    const cleanedPhone = phone.replace(/\s/g, '');
    const newContact = { contactName, phone: cleanedPhone };

    await addDoc(collection(db, `users/${auth.currentUser.uid}/contacts`), newContact);
    setContacts(prev => [...prev, newContact]);
  };

  const filteredContacts = contacts.filter(c =>
    c.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="p-4 text-gray-800 dark:text-white">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold">My Contacts</h2>
        <div className="space-x-2">
          <button onClick={fetchContacts} className="text-sm text-blue-500 underline">Refresh</button>
          <button onClick={handleManualAdd} className="text-sm text-green-600 underline">+ Add</button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search contacts..."
        className="w-full mb-4 px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <GoogleContactsSync onContactsFetched={handleGoogleContactsFetched} />

      {filteredContacts.length === 0 ? (
        <p className="text-sm text-gray-500 mt-4">No contacts found.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {filteredContacts.map((c, i) => {
            const registered = registeredUsers[c.phone];
            return (
              <li
                key={i}
                onClick={() =>
                  registered && onSelectContact({ uid: registered.id, name: registered.name })
                }
                className={`p-3 rounded-lg shadow hover:shadow-md transition cursor-pointer bg-white dark:bg-gray-700 ${
                  !registered ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                <div className="font-semibold text-base">{c.contactName}</div>
                <div className="text-sm text-gray-500">{c.phone}</div>
                {!registered && (
                  <div className="mt-2">
                    <button
                      className="text-xs text-primary underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(
                          `Hey! Join me on MSGIFY. It's awesome! [msgify.link]`
                        );
                        alert('Invite link copied to clipboard!');
                      }}
                    >
                      Invite to MSGIFY
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
