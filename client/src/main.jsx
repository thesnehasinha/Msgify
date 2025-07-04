import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ChatPage from './pages/ChatPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import { UserProvider } from './context/UserContext';
import { ContactsProvider } from './context/ContactsContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// ✅ Theme-aware wrapper
function ThemedApp() {
  const { theme } = useTheme();
  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="*" element={<App />} />
      </Routes>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <ContactsProvider>
        <ThemeProvider>
          <BrowserRouter>
            <ThemedApp />
          </BrowserRouter>
        </ThemeProvider>
      </ContactsProvider>
    </UserProvider>
  </React.StrictMode>
);
