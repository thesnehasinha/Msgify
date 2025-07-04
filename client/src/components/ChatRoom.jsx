import { useEffect, useRef, useState } from 'react';
import { db } from '../firebase';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  setDoc,
  getDocs,
} from 'firebase/firestore';
import { useUser } from '../context/UserContext';
import CryptoJS from 'crypto-js';
import { motion } from 'framer-motion';
import { Check, CheckCheck } from 'lucide-react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

const secretKey = import.meta.env.VITE_SECRET_KEY;

const ChatRoom = ({ currentUser, selectedUser, selectedUserName }) => {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedUserOnline, setSelectedUserOnline] = useState(false);
  const [isChatActive, setIsChatActive] = useState(true);
  const [senderInfo, setSenderInfo] = useState({});
  const [contacts, setContacts] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const chatId = [currentUser, selectedUser].sort().join('_');

  useEffect(() => {
    setIsChatActive(true);
    return () => setIsChatActive(false);
  }, [currentUser, selectedUser]);

  // 🧠 Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      const contactRef = collection(db, 'users', currentUser, 'contacts');
      const snapshot = await getDocs(contactRef);
      setContacts(snapshot.docs.map(doc => doc.id));
    };
    if (currentUser) fetchContacts();
  }, [currentUser]);

  const isInContacts = (email) => contacts.includes(email);

  const handleSaveContact = async (email, name) => {
    const contactRef = doc(db, 'users', currentUser, 'contacts', email);
    await setDoc(contactRef, {
      email,
      name,
      addedAt: serverTimestamp(),
    });
    setContacts((prev) => [...prev, email]);
    alert(`${name} added to your contacts`);
  };

  useEffect(() => {
    if (!currentUser || !selectedUser) return;
    const q = query(collection(db, 'messages', chatId, 'chats'), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const decryptedMessages = snapshot.docs.map((doc) => {
        const data = doc.data();
        const decryptedText = secretKey
          ? CryptoJS.AES.decrypt(data.text, secretKey).toString(CryptoJS.enc.Utf8)
          : '[Encryption Key Missing]';
        return { ...data, id: doc.id, text: decryptedText };
      });
      setMessages(decryptedMessages);
    });

    return () => unsubscribe();
  }, [currentUser, selectedUser]);

  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.to === currentUser && !msg.seen) {
        const msgRef = doc(db, 'messages', chatId, 'chats', msg.id);
        updateDoc(msgRef, { seen: true });
      }
    });
  }, [messages]);

  useEffect(() => {
    if (!selectedUser) return;
    const userDocRef = doc(db, 'users', selectedUser);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      const data = docSnap.data();
      setSelectedUserOnline(data?.status === 'online');
    });
    return () => unsubscribe();
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!chatId || !currentUser) return;

    const typingDocRef = doc(db, 'typingStatus', chatId);
    const unsubscribe = onSnapshot(typingDocRef, (docSnap) => {
      const data = docSnap.data();
      if (data && isChatActive) {
        const partnerTypingStatus = currentUser === data.user1
          ? data.user2Typing
          : data.user1Typing;
        setPartnerTyping(partnerTypingStatus);
      } else {
        setPartnerTyping(false);
      }
    });

    return () => unsubscribe();
  }, [chatId, currentUser, isChatActive]);

  const updateTypingStatus = async (isTyping) => {
    if (!chatId || !currentUser) return;
    const typingDocRef = doc(db, 'typingStatus', chatId);
    const fieldToUpdate = currentUser < selectedUser ? 'user1Typing' : 'user2Typing';
    const userField = currentUser < selectedUser ? 'user1' : 'user2';
    await setDoc(typingDocRef, {
      [fieldToUpdate]: isTyping,
      [userField]: currentUser,
    }, { merge: true });
  };

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;
    if (!secretKey) {
      console.error('VITE_SECRET_KEY is not defined');
      return;
    }
    try {
      const encryptedText = CryptoJS.AES.encrypt(newMessage, secretKey).toString();
      const msgRef = collection(db, 'messages', chatId, 'chats');
      await addDoc(msgRef, {
        from: currentUser,
        fromName: user?.displayName,
        to: selectedUser,
        text: encryptedText,
        timestamp: serverTimestamp(),
        seen: false,
      });
      await updateTypingStatus(false);
      setNewMessage('');
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = timestamp?.toDate?.();
    return date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  };

  const statusTick = (msg) => {
    if (msg.from !== currentUser) return null;
    if (msg.seen) return <CheckCheck size={14} className="text-blue-500 ml-1" />;
    if (selectedUserOnline) return <CheckCheck size={14} className="text-gray-500 ml-1" />;
    return <Check size={14} className="text-gray-400 ml-1" />;
  };

  return (
    <div className="flex flex-col h-full px-4 py-2 bg-gradient-to-b from-[#f9fbff] to-[#e0eaff] dark:from-[#101624] dark:to-[#1c2433] text-black dark:text-white">
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-2 scrollbar-thin">
        {messages.map((msg) => {
          const isMe = msg.from === currentUser;
          const showSavePrompt = !isMe && !isInContacts(msg.from);
          return (
            <div key={msg.id} className="relative">
              {showSavePrompt && (
                <div className="bg-yellow-100 text-black text-sm p-2 rounded mb-1 shadow">
                  <p>
                    <strong>{msg.fromName || msg.from}</strong> ({msg.from}) sent you a message.
                  </p>
                  <button
                    onClick={() => handleSaveContact(msg.from, msg.fromName || msg.from)}
                    className="bg-blue-600 text-white px-2 py-1 rounded mt-1 text-xs"
                  >
                    Save Contact
                  </button>
                </div>
              )}
              <div
                className={`px-4 py-3 rounded-2xl shadow-md break-words relative text-sm sm:text-base max-w-[75%] sm:max-w-[60%] md:max-w-[50%] transition-all duration-300
                  ${isMe
                    ? 'ml-auto bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-none'
                    : 'mr-auto bg-gradient-to-bl from-gray-100 to-gray-300 text-black dark:from-[#2c3a50] dark:to-[#1f2a38] dark:text-white rounded-bl-none'}
                `}
              >
                <div>{msg.text}</div>
                <div className="text-xs text-right mt-1">
                  {formatTime(msg.timestamp)} {statusTick(msg)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {partnerTyping && (
        <motion.div className="text-xs text-gray-400 mb-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {selectedUserName} is typing <span className="animate-pulse">...</span>
        </motion.div>
      )}

      <div className="flex items-center gap-2 mt-2 bg-gradient-to-br from-[#e8f0ff] to-[#dbe7ff] dark:from-[#1e273a] dark:to-[#2a3550] rounded-xl px-4 py-2 shadow-lg border border-gray-200 dark:border-[#2e3a4e]">
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="text-xl px-2 hover:scale-110 transition-transform"
        >
          😊
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            updateTypingStatus(true);
            if (typingTimeout.current) clearTimeout(typingTimeout.current);
            typingTimeout.current = setTimeout(() => updateTypingStatus(false), 1500);
          }}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={`Message ${selectedUserName}...`}
          className="flex-1 px-4 py-2 rounded-md bg-transparent focus:outline-none text-sm sm:text-base"
        />
        <button
          onClick={sendMessage}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2 rounded-lg font-semibold shadow-md transition-all duration-200"
        >
          Send
        </button>
      </div>

      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 z-50">
          <Picker
            data={data}
            onEmojiSelect={(emoji) => setNewMessage((prev) => prev + emoji.native)}
            theme="auto"
          />
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
