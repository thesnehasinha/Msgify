import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useUser } from '../context/UserContext';
import { checkUserExistsByEmail } from '../utils/checkUserExists';

const AddContactModal = ({ onClose, refreshContacts }) => {
  const { user } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("👤 Context user:", user);
    console.log("🔐 Firebase auth user:", auth.currentUser);
  }, [user]);

  const handleAddContact = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedEmail) {
      setStatus('❌ Email is required');
      return;
    }

    const currentEmail = auth.currentUser?.email;
    const contextEmail = user?.email;

    console.log("🔐 Firebase auth user:", auth.currentUser?.email);
    console.log("👤 Context user from context:", user?.email);
    console.log(`📁 Will save to: users/${auth.currentUser?.email}/contacts/${email}`);

    if (!currentEmail || !contextEmail) {
      setStatus('❌ User not logged in');
      return;
    }

    if (trimmedEmail === currentEmail.toLowerCase()) {
      setStatus('❌ You cannot add yourself as a contact');
      return;
    }

    if (currentEmail.toLowerCase() !== contextEmail.toLowerCase()) {
      setStatus('❌ Auth mismatch — contact save blocked');
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      const existingUser = await checkUserExistsByEmail(trimmedEmail);

      if (!existingUser) {
        setStatus('❌ This user is not on MSGIFY');
        setLoading(false);
        return;
      }

      const contactName = trimmedName || existingUser.fullName || 'No Name';

      const contactRef = doc(db, 'users', currentEmail, 'contacts', trimmedEmail);
      await setDoc(contactRef, {
        name: contactName,
        email: trimmedEmail,
        phone: trimmedPhone || '',
        uid: existingUser.uid || '',
        addedAt: serverTimestamp()
      });

      setStatus('✅ Contact added successfully!');
      setName('');
      setEmail('');
      setPhone('');

      refreshContacts && refreshContacts();
      setTimeout(onClose, 1000);
    } catch (error) {
      console.error('❌ Error saving contact:', error);
      setStatus('❌ Failed to add contact — check console');
    }

    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-[#1e1e2f] to-[#29293d] text-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-purple-600">
      <h2 className="text-2xl font-extrabold mb-5 text-center text-purple-300">📇 Add New Contact</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-purple-200">Full Name</label>
          <input
            type="text"
            className="w-full p-3 rounded-lg bg-[#2e2e42] text-white border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-purple-200">Email</label>
          <input
            type="email"
            className="w-full p-3 rounded-lg bg-[#2e2e42] text-white border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-purple-200">Phone (optional)</label>
          <input
            type="tel"
            className="w-full p-3 rounded-lg bg-[#2e2e42] text-white border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone"
          />
        </div>
      </div>

      {status && (
        <div className={`text-sm mt-4 font-semibold ${status.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>{status}</div>
      )}

      <div className="flex justify-end mt-6 space-x-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-5 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleAddContact}
          disabled={loading}
          className="px-5 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-sm disabled:opacity-60"
        >
          {loading ? 'Saving...' : 'Save Contact'}
        </button>
      </div>
    </div>
  );
};

export default AddContactModal;
