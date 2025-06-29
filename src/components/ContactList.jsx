import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import GoogleContactsSync from './GoogleContactsSync';

export default function ContactList({ currentUser, onSelectContact }) {
  const [contacts, setContacts] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
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
        userMap[data.phone.replace(/\s/g, '')] = {
          id: doc.id,
          name: `${data.firstName} ${data.lastName}`
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

    const registeredUsers = {};
    userSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.phone) {
        registeredUsers[data.phone.replace(/\s/g, '')] = {
          id: doc.id,
          name: `${data.firstName} ${data.lastName}`
        };
      }
    });

    const matchedContacts = [];

    for (let gContact of googleContacts) {
      if (!gContact.phone) continue;
      const cleanedPhone = gContact.phone.replace(/\s/g, '');
      if (registeredUsers[cleanedPhone]) {
        matchedContacts.push({
          contactName: gContact.name || 'Unknown',
          phone: cleanedPhone
        });
      }
    }

    const contactsRef = collection(db, `users/${user.uid}/contacts`);
    const existingSnapshot = await getDocs(contactsRef);
    const existingPhones = existingSnapshot.docs.map(doc => doc.data().phone);

    const newContacts = matchedContacts.filter(c => !existingPhones.includes(c.phone));
    for (let contact of newContacts) {
      await addDoc(contactsRef, contact);
    }

    if (newContacts.length > 0) {
      alert(`${newContacts.length} MSGIFY users from your Google Contacts were added!`);
      setContacts(prev => [...prev, ...newContacts]);
    } else {
      alert('No new MSGIFY users found in your Google Contacts.');
    }
  };

  const handleManualAdd = async () => {
    const contactName = prompt('Enter contact name:');
    const phone = prompt('Enter contact phone number:');
    if (!contactName || !phone) return;

    const newContact = { contactName, phone: phone.replace(/\s/g, '') };
    await addDoc(collection(db, `users/${auth.currentUser.uid}/contacts`), newContact);
    setContacts(prev => [...prev, newContact]);
  };

  const filteredContacts = contacts.filter(c =>
    c.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Contacts</h2>
        <div className="space-x-2">
          <button onClick={fetchContacts} className="text-sm text-blue-500 underline">Refresh</button>
          <button onClick={handleManualAdd} className="text-sm text-green-600 underline">+ Add</button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search contacts..."
        className="mb-3 w-full px-3 py-2 border rounded-lg text-sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <GoogleContactsSync onContactsFetched={handleGoogleContactsFetched} />

      {filteredContacts.length === 0 ? (
        <p className="text-sm text-gray-500 mt-2">No contacts found.</p>
      ) : (
        <ul className="space-y-3 mt-4">
          {filteredContacts.map((c, i) => {
            const registered = registeredUsers[c.phone];
            return (
              <li
                key={i}
                onClick={() =>
                  registered
                    ? onSelectContact({ uid: registered.id, name: registered.name })
                    : null
                }
                className={`p-3 rounded-xl shadow-md bg-white hover:bg-purple-50 cursor-pointer ${
                  !registered ? 'opacity-60' : ''
                }`}
              >
                <div className="font-medium">{c.contactName}</div>
                <div className="text-sm text-gray-500">{c.phone}</div>
                {!registered && (
                  <button
                    className="mt-1 text-xs text-primary underline"
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
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
