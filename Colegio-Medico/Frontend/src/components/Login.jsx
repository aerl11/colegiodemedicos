import React, { useState } from 'react';
import './shared.css';
import './Login.css';
import logoUrl from '../assets/emblema.png';
import { login } from '../services/api';

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);



const SpinnerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="spin-icon">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

const Login = ({ onRegister, onForgot, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await login(username.trim(), password);
      console.log('Login exitoso:', data);
      onLoginSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">

      <div className="background-watermark">
        <img src={logoUrl} alt="Watermark" className="watermark-logo" />
      </div>

      <div className="login-container">
        <div className="login-card animate-fade-in">
          <div className="logo-section">
            <img src={logoUrl} alt="COMEZU Logo" className="main-logo" />
          </div>

          <h1 className="login-title">Iniciar Sesión</h1>
          <div className="login-subtitle">
            <div>Colegio de Médicos del</div>
            <div>Edo. Zulia - Portal Oficial</div>
          </div>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-field">
              <span className="field-icon"><UserIcon /></span>
              <input
                id="login-username"
                type="text"
                placeholder="Usuario"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="input-field">
              <span className="field-icon"><LockIcon /></span>
              <input
                id="login-password"
                type="password"
                placeholder="Contraseña"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <><SpinnerIcon /> Verificando…</> : 'Entrar'}
            </button>

            <div className="form-footer" style={{ justifyContent: 'center' }}>
              <button type="button" className="forgot-btn" onClick={onForgot}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>

          <div className="card-divider"></div>

          <p className="register-text">
            No tienes una cuenta? <button onClick={onRegister} className="register-btn-link">REGISTRARTE</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
