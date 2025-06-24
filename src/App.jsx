import React from 'react';
import ChatRoom from './components/ChatRoom';

function App() {
  const username = "Sneha"; // For now, hardcoded. Later you can add login.
  return (
    <div className="App">
      <h1>MSGIFY</h1>
      <ChatRoom username={username} />
    </div>
  );
}

export default App;
