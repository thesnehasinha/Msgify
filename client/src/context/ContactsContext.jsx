import React, { createContext, useContext, useState } from 'react';
import { fetchGoogleContacts } from '../utils/fetchContacts';

const ContactsContext = createContext();

export const useContacts = () => useContext(ContactsContext);

export function ContactsProvider({ children }) {
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);

  // ✅ This is the method your App.jsx is trying to use
  const fetchAndStoreContacts = async () => {
    const token = sessionStorage.getItem('googleAccessToken');
    if (!token) {
      setLoadingContacts(false);
      return;
    }

    try {
      const googleContacts = await fetchGoogleContacts(token);
      setContacts(googleContacts);
    } catch (error) {
      console.error('Error fetching Google contacts:', error);
    } finally {
      setLoadingContacts(false);
    }
  };

  return (
    <ContactsContext.Provider
      value={{ contacts, setContacts, loadingContacts, fetchAndStoreContacts }}
    >
      {children}
    </ContactsContext.Provider>
  );
}
