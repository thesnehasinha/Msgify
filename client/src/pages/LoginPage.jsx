import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate(); // 💡 This must be inside the component

  const handleLogin = () => {
    if (username.trim() === '') return;
    navigate('/chat', { state: { username } });
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '5rem' }}>
      <h2>MSGIFY Login</h2>
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <br /><br />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default LoginPage;
