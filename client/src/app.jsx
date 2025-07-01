import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './context/UserContext';

function App() {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user === undefined) return; // Still loading auth state
    if (!user) navigate('/login');  // Redirect if not logged in
    else navigate('/chat');         // Go to ChatPage if logged in
  }, [user]);

  return null; // No UI here, only redirection
}

export default App;
