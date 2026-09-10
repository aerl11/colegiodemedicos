import React from 'react';
import './shared.css';
import './ForgotPassword.css';
import emblema from '../assets/emblema.png';

const KeyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.778-7.778zM12 7l.343.343a2.414 2.414 0 0 0 3.414 0l1.643-1.643a1.5 1.5 0 0 1 2.122 0l1.293 1.293a1.5 1.5 0 0 1 0 2.122l-1.643 1.643a2.414 2.414 0 0 0 0 3.414l.343.343" />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const ForgotPassword = ({ onBack, theme, toggleTheme }) => {
  return (
    <div className="reset-wrapper" data-theme={theme}>
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      </button>

      {/* Marca de agua de fondo */}
      <div className="background-watermark">
        <img src={emblema} alt="Watermark" className="watermark-logo" />
      </div>

      <div className="reset-container">
        <div className="reset-card animate-fade-in">
          {/* Header del Card (Azul) */}
          <div className="card-header-reset">
            <div className="header-logo-section">
              <img src={emblema} alt="Logo COMEZU" className="header-logo" />
            </div>
            <h2 className="reset-title">Restablecer Contraseña</h2>
          </div>

          <div className="card-separator">
            <div className="separator-line"></div>
          </div>

          {/* Body del Card (Blanco) */}
          <div className="card-body-reset">
            <form className="reset-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label className="input-label">Nueva Contraseña</label>
                <div className="input-with-icon">
                  <span className="field-icon"><LockIcon /></span>
                  <input type="password" placeholder="Mínimo 8 caracteres" className="reset-input" />
                </div>
              </div>

              <div className="form-group">
                <label className="input-label">Confirmar Nueva Contraseña</label>
                <div className="input-with-icon">
                  <span className="field-icon"><LockIcon /></span>
                  <input type="password" placeholder="Repite la contraseña" className="reset-input" />
                </div>
              </div>

              <div className="reset-actions">
                <button type="submit" className="continue-btn">
                  CONTINUAR
                </button>
                <button type="button" className="cancel-btn" onClick={onBack}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

