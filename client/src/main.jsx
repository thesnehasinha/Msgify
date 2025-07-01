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
import { ThemeProvider } from './context/ThemeContext'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <UserProvider>
    <ContactsProvider>
      <BrowserRouter>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/chat" element={<ChatPage />} /> 
          <Route path="*" element={<App />} />
        </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </ContactsProvider>
  </UserProvider>
);
