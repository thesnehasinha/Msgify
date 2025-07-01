import { useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useUser } from '../context/UserContext';

const AddContactModal = ({ onClose }) => {
  const { user } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('');
  const [showInvite, setShowInvite] = useState(false);

  const handleAddContact = async () => {
    if (!name || !email) {
      setStatus('Name and Email are required');
      return;
    }

    const contactRef = doc(db, 'users', email);
    const docSnap = await getDoc(contactRef);

    if (docSnap.exists()) {
      const userContactsRef = doc(db, 'users', user.email, 'contacts', email);
      await setDoc(userContactsRef, {
        name,
        email,
        phone: phone || '',
        addedAt: new Date()
      });

      setStatus('Contact added successfully!');
      setShowInvite(false);
    } else {
      setStatus('This user is not on MSGIFY');
      setShowInvite(true);
    }
  };

  const inviteMessage = `Hey! I'm chatting on MSGIFY. Join me here: https://msgify.app`;

  return (
    <div className="bg-white rounded-xl p-6 shadow-xl w-80 text-black">
      <h2 className="text-lg font-semibold mb-4 text-center text-gray-800">Add New Contact</h2>

      <label className="text-sm text-gray-700">Name</label>
      <input
        type="text"
        className="w-full border rounded px-3 py-2 mb-3"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Enter name"
      />

      <label className="text-sm text-gray-700">Email</label>
      <input
        type="email"
        className="w-full border rounded px-3 py-2 mb-3"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter email"
      />

      <label className="text-sm text-gray-700">Phone (optional)</label>
      <input
        type="tel"
        className="w-full border rounded px-3 py-2 mb-4"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        placeholder="Enter phone number"
      />

      {status && (
        <p className={`text-sm mb-3 ${showInvite ? 'text-yellow-600' : 'text-green-600'}`}>{status}</p>
      )}

      <button
        onClick={handleAddContact}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 mb-3"
      >
        Save Contact
      </button>

      {showInvite && (
        <a
          href={`mailto:${email}?subject=Join MSGIFY&body=${encodeURIComponent(inviteMessage)}`}
          className="block text-center text-blue-600 underline text-sm mb-3"
        >
          Invite to MSGIFY
        </a>
      )}

      <button
        onClick={onClose}
        className="w-full bg-gray-200 text-gray-700 rounded px-4 py-2 text-sm"
      >
        Cancel
      </button>
    </div>
  );
};

export default AddContactModal;
