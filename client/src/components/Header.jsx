import React from 'react';
import ThemeToggle from './ThemeToggle';
import TypingIndicator from './TypingIndicator';

export default function Header({ contact }) {
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
          <TypingIndicator uid={contact.uid} />
        </div>
      </div>
      <ThemeToggle />
    </div>
  );
}
