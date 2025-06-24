import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import socket from '../socket';

const dummyUsers = ['Alice', 'Bob', 'Charlie', 'Sneha'];

function ChatPage() {
  const location = useLocation();
  const currentUser = location.state?.username || 'You';

  const [selectedUser, setSelectedUser] = useState(dummyUsers[0]);
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState({});

  // Receive message from others
  useEffect(() => {
    socket.on('receive_message', data => {
      const { to, from, text, time } = data;

      // Show only messages sent *to* the current user
      if (to === currentUser) {
        setChatLog(prev => ({
          ...prev,
          [from]: [...(prev[from] || []), { sender: from, text, time }]
        }));
      }
    });

    return () => socket.off('receive_message');
  }, [currentUser]);

  // Send message
  const sendMessage = () => {
    if (message.trim() === '') return;

    const msgObj = {
      from: currentUser,
      to: selectedUser,
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Show it in own chat
    setChatLog(prev => ({
      ...prev,
      [selectedUser]: [...(prev[selectedUser] || []), { sender: currentUser, text: message, time: msgObj.time }]
    }));

    socket.emit('send_message', msgObj);
    setMessage('');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial' }}>
      {/* Sidebar */}
      <div style={{ width: '20%', background: '#282c34', color: '#fff', padding: '1rem' }}>
        <h3 style={{ color: '#61dafb' }}>Users</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {dummyUsers
            .filter(user => user !== currentUser)
            .map(user => (
              <li
                key={user}
                onClick={() => setSelectedUser(user)}
                style={{
                  padding: '10px',
                  cursor: 'pointer',
                  backgroundColor: selectedUser === user ? '#444' : 'transparent',
                  borderRadius: '5px',
                  marginBottom: '5px'
                }}
              >
                {user}
              </li>
          ))}
        </ul>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, padding: '1rem', background: '#f9f9f9' }}>
        <h2>Welcome, {currentUser}</h2>
        <h3>Chatting with {selectedUser}</h3>

        <div style={{
          height: '70vh',
          overflowY: 'auto',
          border: '1px solid #ccc',
          padding: '1rem',
          background: '#fff',
          marginBottom: '1rem',
          borderRadius: '6px'
        }}>
          {(chatLog[selectedUser] || []).map((msg, idx) => (
            <div key={idx} style={{ marginBottom: '1rem' }}>
              <strong>{msg.sender}</strong> <small>{msg.time}</small>
              <p>{msg.text}</p>
            </div>
          ))}
        </div>

        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          style={{ width: '75%', padding: '8px' }}
        />
        <button onClick={sendMessage} style={{ marginLeft: '10px', padding: '8px 12px' }}>
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatPage;
