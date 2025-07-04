import React, { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';

dayjs.extend(isToday);
dayjs.extend(isYesterday);

export default function Header({ contact }) {
  const [status, setStatus] = useState('offline');
  const [lastSeen, setLastSeen] = useState(null);

  useEffect(() => {
    const userRef = doc(db, 'users', contact.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      const data = docSnap.data();
      if (data) {
        setStatus(data.status);
        setLastSeen(data.lastSeen?.toDate?.());
      }
    });

    return () => unsubscribe();
  }, [contact.uid]);

  const formatLastSeen = (date) => {
    if (!date) return 'Offline';
    if (dayjs(date).isToday()) {
      return `Last seen today at ${dayjs(date).format('h:mm A')}`;
    } else if (dayjs(date).isYesterday()) {
      return `Last seen yesterday at ${dayjs(date).format('h:mm A')}`;
    } else {
      return `Last seen ${dayjs(date).format('MMM D [at] h:mm A')}`;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3">
        <img
          src={contact.avatar || '/default-avatar.png'}
          className="w-10 h-10 rounded-full"
          alt={contact.name}
        />
        <div>
          <div className="font-semibold">{contact.name}</div>
          <div className="text-sm text-green-500 dark:text-green-400">
            {status === 'online'
              ? 'Online'
              : formatLastSeen(lastSeen)}
          </div>
        </div>
      </div>
      <ThemeToggle />
    </div>
  );
}
