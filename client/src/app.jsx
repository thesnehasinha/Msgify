import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './context/UserContext';

function App() {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    navigate(user ? '/chat' : '/login');
  }, [user, loading]);

  return null;
}

export default App;
