import React, { useState } from 'react';
import './shared.css';
import './ForgotPassword.css';
import emblema from '../assets/emblema.png';
import { requestPasswordReset, confirmPasswordReset } from '../services/api';

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

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
    <path d="M22 6l-10 7L2 6" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12.5l2.5 2.5L16 9.5" />
  </svg>
);

/**
 * Flujo de recuperación de contraseña en 3 pasos:
 *  1) Se pide el correo y se envía un código de confirmación al email.
 *  2) El usuario introduce el código y su nueva contraseña.
 *  3) Se muestra la confirmación (el backend envía el correo de éxito).
 */
const ForgotPassword = ({ onBack, theme, toggleTheme }) => {
  const [step, setStep] = useState(1); // 1: correo, 2: código + nueva contraseña, 3: éxito
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Paso 1: pedir el código por correo
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) {
      setError('Introduce un correo electrónico válido.');
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setStep(2);
    } catch (err) {
      setError(err.message || 'No se pudo enviar el código. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: validar código y restablecer contraseña
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!code.trim()) {
      setError('Introduce el código de confirmación enviado a tu correo.');
      return;
    }
    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      await confirmPasswordReset(code.trim(), newPassword);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Código inválido o expirado. Verifica e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
    } catch (err) {
      setError(err.message || 'No se pudo reenviar el código.');
    } finally {
      setLoading(false);
    }
  };

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

            {/* PASO 1: Solicitar código al correo */}
            {step === 1 && (
              <form className="reset-form" onSubmit={handleSendCode}>
                <p className="reset-hint">
                  Introduce el correo electrónico asociado a tu cuenta y te enviaremos
                  un código de confirmación para validar tu identidad.
                </p>
                <div className="form-group">
                  <label className="input-label">Correo Electrónico</label>
                  <div className="input-with-icon">
                    <span className="field-icon"><MailIcon /></span>
                    <input
                      type="email"
                      placeholder="tucorreo@ejemplo.com"
                      className="reset-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {error && <span className="field-error-text">{error}</span>}

                <div className="reset-actions">
                  <button type="submit" className="continue-btn" disabled={loading}>
                    {loading ? 'ENVIANDO...' : 'ENVIAR CÓDIGO'}
                  </button>
                  <button type="button" className="cancel-btn" onClick={onBack} disabled={loading}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {/* PASO 2: Código + nueva contraseña */}
            {step === 2 && (
              <form className="reset-form" onSubmit={handleResetPassword}>
                <p className="reset-hint">
                  Enviamos un código de confirmación a <strong>{email}</strong>.
                  Introdúcelo junto con tu nueva contraseña.
                </p>

                <div className="form-group">
                  <label className="input-label">Código de Confirmación</label>
                  <div className="input-with-icon">
                    <span className="field-icon"><ShieldIcon /></span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Código de 6 dígitos"
                      className="reset-input"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      disabled={loading}
                      autoComplete="one-time-code"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="input-label">Nueva Contraseña</label>
                  <div className="input-with-icon">
                    <span className="field-icon"><LockIcon /></span>
                    <input
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      className="reset-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="input-label">Confirmar Nueva Contraseña</label>
                  <div className="input-with-icon">
                    <span className="field-icon"><LockIcon /></span>
                    <input
                      type="password"
                      placeholder="Repite la contraseña"
                      className="reset-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {error && <span className="field-error-text">{error}</span>}

                <div className="reset-actions">
                  <button type="submit" className="continue-btn" disabled={loading}>
                    {loading ? 'VALIDANDO...' : 'RESTABLECER'}
                  </button>
                  <button type="button" className="cancel-btn" onClick={handleResendCode} disabled={loading}>
                    Reenviar código
                  </button>
                </div>
              </form>
            )}

            {/* PASO 3: Éxito */}
            {step === 3 && (
              <div className="reset-success" style={{ textAlign: 'center', padding: '10px 0 20px' }}>
                <div style={{ marginBottom: '12px' }}><CheckIcon /></div>
                <h3 style={{ margin: '0 0 8px', color: '#059669' }}>¡Contraseña restablecida!</h3>
                <p className="reset-hint" style={{ marginBottom: '4px' }}>
                  Tu contraseña fue recuperada exitosamente. Te enviamos un correo de
                  confirmación a <strong>{email}</strong>.
                </p>
                <p className="reset-hint">Ya puedes iniciar sesión con tu nueva contraseña.</p>
                <div className="reset-actions" style={{ marginTop: '16px' }}>
                  <button type="button" className="continue-btn" onClick={onBack}>
                    VOLVER AL LOGIN
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

