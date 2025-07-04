export const getGoogleContacts = async () => {
  const accessToken = localStorage.getItem('googleAccessToken');

  if (!accessToken) {
    console.warn("No access token found");
    return [];
  }

  try {
    const response = await fetch(
      'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,photos',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();

    if (!data.connections) return [];

    const contacts = data.connections.map((person) => {
      const name = person.names?.[0]?.displayName || 'Unnamed';
      const email = person.emailAddresses?.[0]?.value || null;
      const photoUrl = person.photos?.[0]?.url || null;

      return { name, email, photoUrl };
    });

    return contacts.filter((c) => c.email);
  } catch (err) {
    console.error('Failed to fetch contacts:', err);
    return [];
  }
};

