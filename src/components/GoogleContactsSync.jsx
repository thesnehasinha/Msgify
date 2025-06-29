import { useEffect } from 'react';
import { gapi } from 'gapi-script';

const CLIENT_ID = '827783794529-59j2hdphel6fhepvmlf60g47pp4flms4.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/contacts.readonly';

export default function GoogleContactsSync({ onContactsFetched }) {
  useEffect(() => {
    const initClient = () => {
      gapi.client.init({
        clientId: CLIENT_ID,
        scope: SCOPES,
      });
    };
    gapi.load('client:auth2', initClient);
  }, []);

  const handleAuthClick = async () => {
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      await authInstance.signIn();
      const token = authInstance.currentUser.get().getAuthResponse().access_token;

      const response = await fetch(
        'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      const contacts = data.connections?.map((person) => ({
        name: person.names?.[0]?.displayName || '',
        phone: person.phoneNumbers?.[0]?.value || '',
        email: person.emailAddresses?.[0]?.value || '',
      })) || [];

      onContactsFetched(contacts);
    } catch (err) {
      console.error('Google Auth Error:', err);
      alert('Failed to sync contacts.');
    }
  };

  return (
    <div>
      <button
        onClick={handleAuthClick}
        className="bg-primary text-white px-4 py-2 rounded hover:bg-purple-700 mt-4"
      >
        Sync Google Contacts
      </button>
    </div>
  );
}
