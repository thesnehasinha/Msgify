import { useEffect, useRef, useState } from 'react';
import { db, storage } from '../firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { encryptMessage, decryptMessage, generateChatKey } from '../utils/encryptiom';
import MessageBubble from './MessageBubble';

export default function ChatRoom({ currentUser, selectedUser, selectedUserName }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactionTarget, setReactionTarget] = useState(null);
  const [uploading, setUploading] = useState(false);

  const scrollRef = useRef();
  const messagesRef = collection(db, 'messages');
  const chatId = [currentUser, selectedUser].sort().join('_');
  const typingRef = doc(db, 'typingStatus', chatId);
  const reactionOptions = ['❤️', '😂', '👍', '😢', '😮', '❌'];

  const key = generateChatKey(currentUser, selectedUser);

  useEffect(() => {
    const q = query(messagesRef, orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        const id = doc.id;

        if (data.to === currentUser && !data.delivered) {
          updateDoc(doc.ref, { delivered: true });
        }

        return { id, ...data };
      });

      const filtered = msgs.filter(
        msg =>
          (msg.from === currentUser && msg.to === selectedUser) ||
          (msg.from === selectedUser && msg.to === currentUser)
      );

      setMessages(filtered);
    });

    return unsubscribe;
  }, [currentUser, selectedUser]);

  useEffect(() => {
    messages.forEach(msg => {
      if (msg.from === selectedUser && msg.to === currentUser && !msg.seen) {
        const docRef = doc(db, 'messages', msg.id);
        updateDoc(docRef, { seen: true });
      }
    });
  }, [messages, currentUser, selectedUser]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const unsub = onSnapshot(typingRef, (docSnap) => {
      const data = docSnap.data();
      if (data?.from === selectedUser && data?.to === currentUser) {
        setPartnerTyping(data.isTyping);
      }
    });
    return () => unsub();
  }, [currentUser, selectedUser]);

  const handleTyping = async (e) => {
    setNewMsg(e.target.value);
    await setDoc(typingRef, {
      from: currentUser,
      to: selectedUser,
      isTyping: true,
      updatedAt: serverTimestamp(),
    });

    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(async () => {
      await setDoc(typingRef, {
        from: currentUser,
        to: selectedUser,
        isTyping: false,
        updatedAt: serverTimestamp(),
      });
    }, 1500);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    const encryptedText = encryptMessage(newMsg, key);

    await addDoc(messagesRef, {
      text: encryptedText,
      createdAt: serverTimestamp(),
      from: currentUser,
      to: selectedUser,
      delivered: false,
      seen: false,
      reactions: {}
    });

    setNewMsg('');
    setShowEmojiPicker(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const storageRef = ref(storage, `chat_files/${chatId}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    await addDoc(messagesRef, {
      fileUrl: downloadURL,
      fileName: file.name,
      createdAt: serverTimestamp(),
      from: currentUser,
      to: selectedUser,
      delivered: false,
      seen: false,
      reactions: {}
    });

    setUploading(false);
  };

  const handleReact = async (msgId, emoji) => {
    const msgRef = doc(db, 'messages', msgId);
    await updateDoc(msgRef, {
      [`reactions.${currentUser}`]: emoji
    });
    setReactionTarget(null);
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-ivory dark:bg-charcoal text-gray-900 dark:text-white relative transition-colors duration-500">
      <div className="p-2">
        <h2 className="text-lg font-semibold">Chatting with {selectedUserName}</h2>
        {partnerTyping && (
          <div className="text-sm text-gray-500 italic mt-1">
            {selectedUserName} is typing...
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            currentUser={currentUser}
            selectedUserName={selectedUserName}
            chatKey={key}
            setReactionTarget={setReactionTarget}
          />
        ))}
        <div ref={scrollRef} />
      </div>

      {reactionTarget && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1E1E2F] p-2 rounded shadow-lg flex gap-2">
          {reactionOptions.map(emoji => (
            <button
              key={emoji}
              className="text-2xl"
              onClick={() => handleReact(reactionTarget.id, emoji)}
            >
              {emoji}
            </button>
          ))}
          <button onClick={() => setReactionTarget(null)} className="text-sm text-gray-400 ml-2">×</button>
        </div>
      )}

      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 z-50">
          <Picker
            data={data}
            onEmojiSelect={(emoji) => {
              setNewMsg(prev => prev + emoji.native);
              setShowEmojiPicker(false);
            }}
            theme="auto"
          />
        </div>
      )}

      <form onSubmit={handleSend} className="flex items-center gap-2 mt-2">
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="text-xl px-2"
        >
          😊
        </button>
        <input
          type="text"
          autoFocus
          placeholder={`Message ${selectedUserName}...`}
          className="flex-1 px-4 py-2 rounded-md bg-white dark:bg-[#1E1E2F] border border-gray-300 dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition"
          value={newMsg}
          onChange={handleTyping}
        />
        <input type="file" onChange={handleFileUpload} className="hidden" id="fileInput" />
        <label htmlFor="fileInput" className="cursor-pointer text-xl px-2">📌</label>
        <button
          type="submit"
          className="bg-primary hover:bg-purple-700 text-white px-4 py-2 rounded-md transition"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
