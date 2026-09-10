import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import { getAccessToken, getMe, clearTokens } from './services/api';
import './App.css';
import logoUrl from './assets/emblema.png';

function App() {
  const [view, setView] = useState(() => {
    return getAccessToken() ? 'dashboard' : 'login';
  });
  const [checkingAuth, setCheckingAuth] = useState(() => {
    return Boolean(getAccessToken());
  });

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setCheckingAuth(false);
      return;
    }

    let isMounted = true;

    // Verificamos el token y actualizamos la sesión con el backend
    getMe()
      .then(() => {
        if (isMounted) {
          setView('dashboard');
        }
      })
      .catch((err) => {
        console.warn('Sesión no válida o expirada:', err);
        if (isMounted) {
          clearTokens();
          setView('login');
        }
      })
      .finally(() => {
        if (isMounted) {
          setCheckingAuth(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (checkingAuth) {
    return (
      <div className="app-container auth-loading-screen" data-theme="dark">
        <div className="auth-loader-card">
          <img src={logoUrl} alt="COMEZU" className="auth-loader-logo" />
          <div className="auth-spinner"></div>
          <p className="auth-loader-text">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" data-theme="dark">
      {view === 'login' && (
        <Login
          onRegister={() => setView('register')}
          onForgot={() => setView('forgot')}
          onLoginSuccess={() => setView('dashboard')}
        />
      )}
      {view === 'register' && (
        <Register
          onBack={() => setView('login')}
        />
      )}
      {view === 'forgot' && (
        <ForgotPassword
          onBack={() => setView('login')}
        />
      )}
      {view === 'dashboard' && (
        <Dashboard
          onLogout={() => setView('login')}
        />
      )}
    </div>
  );
}

export default App;


