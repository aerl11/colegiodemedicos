import React, { useState } from 'react';
import './shared.css';
import './Register.css';
import emblema from '../assets/emblema.png';
import { register } from '../services/api';

const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.21 12 19.79 19.79 0 0 1 1.14 3.4 2 2 0 0 1 3.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const IdCardIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2"></rect>
    <circle cx="9" cy="10" r="2"></circle>
    <line x1="15" y1="8" x2="19" y2="8"></line>
    <line x1="15" y1="12" x2="19" y2="12"></line>
    <line x1="7" y1="16" x2="17" y2="16"></line>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const KeyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
  </svg>
);

const AwardIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7"></circle>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
  </svg>
);

const GenderIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="7"></line>
    <line x1="9" y1="4" x2="15" y2="4"></line>
    <line x1="12" y1="17" x2="12" y2="23"></line>
    <line x1="9" y1="20" x2="15" y2="20"></line>
  </svg>
);

/* ── Sociedades científicas (COMEZU) ── */
const SOCIEDADES = [
  "Grupo de cirugía general",
  "S.V. Cardiología capítulo Zulia",
  "S.V. Pediatría Puericultura capítulo Zulia",
  "S.V. Coloproctología capítulo Zulia",
  "S.V. Anestesiología capítulo Zulia",
  "S.V. Gastroenterología capítulo Zulia",
  "S.V. Fisiatría capítulo Falcón Zulia",
  "S.V. Endocrinología capítulo Zulia",
  "S.V. Neurología capítulo Zulia",
  "S.V. Ginecología y Obstetricia capítulo Zulia",
  "Grupo de Oftalmología",
  "S.V. Traumatología y Ortopedia capítulo Zulia",
  "S.V. Urología capítulo Zulia",
  "S.V. Hepatología capítulo Zulia",
  "S.V. Radiología e Imagen Diagnóstica capítulo Zulia",
  "S.V. Asma, Alergias e Inmunología capítulo Zulia",
  "S.V. Medicina Clínica capítulo Zulia",
  "S.V. Neumología, Cirugía Pediátrica capítulo Zulia",
  "S.V. Genética capítulo Zulia",
  "S.V. Medicina Familiar capítulo Zulia",
  "S.V. Mastología Capítulo Occidental",
  "S.V. Hematología capítulo Zulia",
  "S.V. Neurocirugía capítulo Zulia",
  "S.V. O.R.L. capítulo Zulia",
  "S.V. Psiquiatría capítulo Zulia",
  "S.V. Microbiota (nivel nacional)",
  "S.V. Cirugía Plástica capítulo Zulia",
  "Academia"
];

/* ── Especialidades Médicas Categorizadas ── */
const ESPECIALIDADES = {
  "Especialidades Clínicas": [
    "Medicina Interna",
    "Cardiología",
    "Pediatría",
    "Neumología",
    "Gastroenterología",
    "Neurología",
    "Endocrinología",
    "Nefrología",
    "Dermatología",
    "Oncología Médica",
    "Reumatología",
    "Infectología",
    "Alergología",
    "Hematología",
    "Geriatría",
    "Fisiatría (Medicina Física y Rehabilitación)",
    "Psiquiatría"
  ],
  "Especialidades Quirúrgicas": [
    "Cirugía General",
    "Cirugía Cardiovascular",
    "Neurocirugía",
    "Traumatología y Ortopedia",
    "Cirugía Plástica, Estética y Reparadora",
    "Urología",
    "Otorrinolaringología",
    "Oftalmología",
    "Cirugía Pediátrica",
    "Cirugía Torácica",
    "Cirugía Maxilofacial",
    "Angiología y Cirugía Vascular"
  ],
  "Especialidades Materno-Infantiles": [
    "Ginecología y Obstetricia"
  ],
  "Especialidades de Diagnóstico, Soporte y Emergencias": [
    "Radiología / Diagnóstico por Imágenes",
    "Anestesiología y Reanimación",
    "Medicina de Emergencias / Urgenciología",
    "Medicina Intensiva",
    "Anatomía Patológica",
    "Medicina Nuclear",
    "Medicina Legal y Forense",
    "Medicina del Trabajo",
    "Medicina Familiar y Comunitaria"
  ]
};

/* ── Componente principal ── */
const Register = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [emailDomain, setEmailDomain] = useState('gmail.com');

  const EMAIL_DOMAINS = [
    'gmail.com',
    'hotmail.com',
    'yahoo.com',
    'outlook.com',
    'live.com',
    'icloud.com',
    'aol.com',
    'protonmail.com',
    'hotmail.es',
    'yahoo.es',
    'hotmail.co.uk'
  ];

  const [formData, setFormData] = useState({
    tipo: '', // '' = Seleccionar opción, 'D' = Médico, 'E' = Estudiante
    nacionalidad: 'V', // 'V' = Venezolano, 'E' = Extranjero
    cedula: '',
    first_name: '',
    second_name: '',
    last_name: '',
    second_last_name: '',
    genero: '', // 'M' o 'F'
    email: '',
    telefono: '',
    comezu: '',
    especialidad: '',
    sociedad: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // El teléfono solo acepta números (máximo 12 dígitos)
    const finalValue = name === 'telefono' ? value.replace(/\D/g, '').slice(0, 12) : value;
    setFormData((prev) => ({
      ...prev,
      [name]: finalValue
    }));

    // Limpiar error del campo modificado
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleTipoChange = (tipoValue) => {
    setFormData((prev) => ({
      ...prev,
      tipo: tipoValue,
      // Si cambia a estudiante o vacío, limpiar comezu, especialidad y sociedad
      comezu: tipoValue === 'D' ? prev.comezu : '',
      especialidad: tipoValue === 'D' ? prev.especialidad : '',
      sociedad: tipoValue === 'D' ? prev.sociedad : ''
    }));

    if (errors.tipo) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.tipo;
        return next;
      });
    }
  };

  // Validaciones locales por paso
  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.tipo) newErrors.tipo = 'Debe seleccionar una identificación';
      if (!formData.cedula.trim()) newErrors.cedula = 'La cédula es requerida';
      if (!formData.first_name.trim()) newErrors.first_name = 'El primer nombre es requerido';
      if (!formData.last_name.trim()) newErrors.last_name = 'El primer apellido es requerido';
      if (!formData.genero) newErrors.genero = 'El género es requerido';

      if (formData.tipo === 'D') {
        if (!formData.comezu.trim()) newErrors.comezu = 'El número COMEZU es requerido';
        if (!formData.especialidad.trim()) newErrors.especialidad = 'La especialidad es requerida';
      }
    } else if (step === 2) {
      if (!formData.email.trim()) {
        newErrors.email = 'El correo electrónico es requerido';
      } else {
        const local = formData.email.split('@')[0];
        const domain = formData.email.split('@')[1];
        if (!local || !domain || !EMAIL_DOMAINS.includes(domain)) {
          newErrors.email = 'El correo no es válido';
        }
      }
      if (!formData.telefono.trim()) {
        newErrors.telefono = 'El teléfono es requerido';
      } else if (!/^\d{12}$/.test(formData.telefono.trim())) {
        newErrors.telefono = 'El teléfono debe tener exactamente 12 dígitos numéricos';
      }
    } else if (step === 3) {
      if (!formData.username.trim()) newErrors.username = 'El nombre de usuario es requerido';
      if (!formData.password) newErrors.password = 'La contraseña es requerida';
      if (formData.password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setLoading(true);
    setErrors({});

    // Preparar datos para el backend
    // Concatenamos nombres y apellidos si es necesario, o los mandamos según lo espera el backend
    const fullFirstName = formData.second_name.trim()
      ? `${formData.first_name.trim()} ${formData.second_name.trim()}`
      : formData.first_name.trim();

    const fullLastName = formData.second_last_name.trim()
      ? `${formData.last_name.trim()} ${formData.second_last_name.trim()}`
      : formData.last_name.trim();

    const payload = {
      username: formData.username.trim(),
      password: formData.password,
      first_name: fullFirstName,
      last_name: fullLastName,
      email: formData.email.trim(),
      tipo: formData.tipo,
      nacionalidad: formData.nacionalidad,
      cedula: formData.cedula.trim(),
      telefono: formData.telefono.trim(),
      genero: formData.genero,
      comezu: formData.tipo === 'D' ? formData.comezu.trim() : null,
      especialidad: formData.tipo === 'D' ? formData.especialidad : null,
      sociedad: formData.tipo === 'D' ? (formData.sociedad || null) : null,
    };

    try {
      const response = await register(payload);
      setSuccessMessage(response.message || '¡Registro exitoso!');
      setTimeout(() => {
        onBack(); // Redireccionar al login
      }, 3500);
    } catch (err) {
      // Si el backend devuelve un error estructurado, mapearlo a los campos
      const errorMsg = err.message || 'Ocurrió un error al registrar.';
      setErrors({ apiError: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">

      {/* Marca de agua de fondo */}
      <div className="background-watermark">
        <img src={emblema} alt="Watermark" className="watermark-logo" />
      </div>

      {/* Card central */}
      <div className="register-container">
        <div className="register-card">

          {/* Header */}
          <div className="card-header">
            <img src={emblema} alt="Logo COMEZU" className="register-logo" />
            <h1 className="register-title">
              {currentStep === 1 && 'Información Personal'}
              {currentStep === 2 && 'Datos de Contacto'}
              {currentStep === 3 && 'Crear Cuenta'}
            </h1>
            <p className="register-subtitle">Colegio de Médicos del Edo. Zulia — Portal Oficial</p>
          </div>

          {/* Errores globales y Éxito */}
          {errors.apiError && <div className="error-alert">{errors.apiError}</div>}
          {successMessage && <div className="success-alert">{successMessage}</div>}

          {/* Formulario */}
          <form className="register-form" onSubmit={(e) => e.preventDefault()}>

            {/* ── PASO 1: DATOS PERSONALES ── */}
            {currentStep === 1 && (
              <>
                {/* Fila: Identificación | Cédula | Nacionalidad */}
                <div className="form-row">
                  <div className="form-group-container" style={{ flex: '1 1 auto', minWidth: '110px' }}>
                    <label className="section-label">Identificación</label>
                    <select
                      name="tipo"
                      className={`register-input ${errors.tipo ? 'input-error' : ''}`}
                      value={formData.tipo}
                      onChange={(e) => handleTipoChange(e.target.value)}
                      style={{ cursor: 'pointer', paddingLeft: '10px' }}
                    >
                      <option value="">Seleccione opción</option>
                      <option value="D">Médico</option>
                      <option value="E">Estudiante</option>
                    </select>
                    {errors.tipo && <span className="field-error-text">{errors.tipo}</span>}
                  </div>

                  <div className="form-group-container">
                    <label className="section-label">Cédula de Identidad</label>
                    <div className="input-with-icon-wrapper">
                      <div className="input-icon"><IdCardIcon /></div>
                      <input
                        type="text"
                        name="cedula"
                        placeholder="Cédula"
                        className={`register-input ${errors.cedula ? 'input-error' : ''}`}
                        value={formData.cedula}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.cedula && <span className="field-error-text">{errors.cedula}</span>}
                  </div>

                  <div className="form-group-container" style={{ minWidth: '70px' }}>
                    <label className="section-label">Nac.</label>
                    <select
                      name="nacionalidad"
                      className="register-input"
                      value={formData.nacionalidad}
                      onChange={handleChange}
                      style={{ cursor: 'pointer', paddingLeft: '10px' }}
                    >
                      <option value="V">V</option>
                      <option value="E">E</option>
                    </select>
                  </div>
                </div>

                {formData.tipo === 'D' && (
                  <>
                  <div className="form-row" style={{ marginTop: '6px', marginBottom: '10px' }}>
                    <div className="form-group-container">
                      <label>Número COMEZU</label>
                      <div className="input-with-icon">
                        <div className="input-icon"><IdCardIcon /></div>
                        <input
                          type="text"
                          name="comezu"
                          placeholder="Número COMEZU"
                          className={`register-input ${errors.comezu ? 'input-error' : ''}`}
                          value={formData.comezu}
                          onChange={handleChange}
                        />
                      </div>
                      {errors.comezu && <span className="field-error-text">{errors.comezu}</span>}
                    </div>

                    <div className="form-group-container">
                      <label>Especialidad</label>
                      <div className="input-with-icon">
                        <div className="input-icon"><AwardIcon /></div>
                        <input
                          type="text"
                          name="especialidad"
                          placeholder="Especialidad médica"
                          className={`register-input ${errors.especialidad ? 'input-error' : ''}`}
                          value={formData.especialidad}
                          onChange={handleChange}
                        />
                      </div>
                      {errors.especialidad && <span className="field-error-text">{errors.especialidad}</span>}
                    </div>
                  </div>

                  <div className="form-group-container" style={{ gridColumn: '1 / -1' }}>
                    <label>Sociedad científica a la que pertenece </label>
                    <div className="input-with-icon">
                      <div className="input-icon"><AwardIcon /></div>
                      <select
                        name="sociedad"
                        className={`register-input ${errors.sociedad ? 'input-error' : ''}`}
                        value={formData.sociedad}
                        onChange={handleChange}
                      >
                        <option value="">Selecciona tu sociedad…</option>
                        {SOCIEDADES.map((soc) => (
                          <option key={soc} value={soc}>{soc}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  </>
                )}

                <div className="form-section-title">Datos Personales</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Primer Nombre</label>
                    <div className="input-with-icon">
                      <div className="input-icon"><UserIcon /></div>
                      <input
                        type="text"
                        name="first_name"
                        placeholder=""
                        className={`register-input ${errors.first_name ? 'input-error' : ''}`}
                        value={formData.first_name}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.first_name && <span className="field-error-text">{errors.first_name}</span>}
                  </div>
                  <div className="form-group">
                    <label>Segundo Nombre</label>
                    <div className="input-with-icon">
                      <div className="input-icon"><UserIcon /></div>
                      <input
                        type="text"
                        name="second_name"
                        placeholder=""
                        className="register-input"
                        value={formData.second_name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Primer Apellido</label>
                    <div className="input-with-icon">
                      <div className="input-icon"><UserIcon /></div>
                      <input
                        type="text"
                        name="last_name"
                        placeholder=""
                        className={`register-input ${errors.last_name ? 'input-error' : ''}`}
                        value={formData.last_name}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.last_name && <span className="field-error-text">{errors.last_name}</span>}
                  </div>
                  <div className="form-group">
                    <label>Segundo Apellido</label>
                    <div className="input-with-icon">
                      <div className="input-icon"><UserIcon /></div>
                      <input
                        type="text"
                        name="second_last_name"
                        placeholder=""
                        className="register-input"
                        value={formData.second_last_name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Selección de Género */}
                <div className="form-group" style={{ marginTop: '4px' }}>
                  <label>Género</label>
                  <div className="input-with-icon">
                    <div className="input-icon"><GenderIcon /></div>
                    <select
                      name="genero"
                      className={`register-input ${errors.genero ? 'input-error' : ''}`}
                      value={formData.genero}
                      onChange={handleChange}
                      style={{ paddingLeft: '34px', cursor: 'pointer' }}
                    >
                      <option value="">Seleccione Género</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  </div>
                  {errors.genero && <span className="field-error-text">{errors.genero}</span>}
                </div>
              </>
            )}

            {/* ── PASO 2: CONTACTO Y ESPECIALIDAD ── */}
            {currentStep === 2 && (
              <>
                <div className="form-section-title">Información de Contacto</div>
                <div className="form-group-stack">
                  <div className="form-group">
                    <label>Correo Electrónico</label>
                    <div className="input-with-icon-wrapper">
                      <div className="input-icon"><MailIcon /></div>
                      <input
                        type="text"
                        name="email"
                        placeholder="Correo electrónico"
                        className={`register-input ${errors.email ? 'input-error' : ''}`}
                        value={formData.email ? formData.email.split('@')[0] : ''}
                        onChange={(e) => {
                          const local = e.target.value.replace(/@/g, '');
                          handleChange({ target: { name: 'email', value: local ? `${local}@${emailDomain}` : '' } });
                        }}
                        style={{ paddingRight: '170px' }}
                      />
                      <select
                        value={emailDomain}
                        onChange={(e) => {
                          const domain = e.target.value;
                          setEmailDomain(domain);
                          const local = formData.email ? formData.email.split('@')[0] : '';
                          handleChange({ target: { name: 'email', value: local ? `${local}@${domain}` : '' } });
                        }}
                        className="email-domain-select"
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '150px'
                        }}
                      >
                        {EMAIL_DOMAINS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    {errors.email && <span className="field-error-text">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label>Número de Contacto</label>
                    <div className="input-with-icon">
                      <div className="input-icon"><PhoneIcon /></div>
                      <input
                        type="text"
                        name="telefono"
                        placeholder="Teléfono"
                        maxLength={12}
                        className={`register-input ${errors.telefono ? 'input-error' : ''}`}
                        value={formData.telefono}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.telefono && <span className="field-error-text">{errors.telefono}</span>}
                  </div>
                </div>
              </>
            )}

            {/* ── PASO 3: CUENTA Y CREDENCIALES ── */}
            {currentStep === 3 && (
              <>
                <div className="form-section-title">Credenciales de Acceso</div>
                <div className="form-group-stack">
                  <div className="form-group">
                    <label>Nombre de Usuario</label>
                    <div className="input-with-icon-wrapper">
                      <div className="input-icon"><UserIcon /></div>
                      <input
                        type="text"
                        name="username"
                        placeholder="Usuario"
                        className={`register-input ${errors.username ? 'input-error' : ''}`}
                        value={formData.username}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.username && <span className="field-error-text">{errors.username}</span>}
                  </div>

                  <div className="form-group">
                    <label>Contraseña</label>
                    <div className="input-with-icon-wrapper">
                      <div className="input-icon"><KeyIcon /></div>
                      <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        className={`register-input ${errors.password ? 'input-error' : ''}`}
                        value={formData.password}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.password && <span className="field-error-text">{errors.password}</span>}
                  </div>

                  <div className="form-group">
                    <label>Confirmar Contraseña</label>
                    <div className="input-with-icon-wrapper">
                      <div className="input-icon"><KeyIcon /></div>
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="••••••••"
                        className={`register-input ${errors.confirmPassword ? 'input-error' : ''}`}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.confirmPassword && <span className="field-error-text">{errors.confirmPassword}</span>}
                  </div>
                </div>
              </>
            )}

            {/* Acciones */}
            <div className="form-actions">
              {currentStep === 1 ? (
                <button type="button" className="btn-back" onClick={onBack}>
                  <ArrowLeftIcon /> Volver al Login
                </button>
              ) : (
                <button type="button" className="btn-back" onClick={handlePrev}>
                  <ArrowLeftIcon /> Anterior
                </button>
              )}

              {currentStep < 3 ? (
                <button type="button" className="btn-continue" onClick={handleNext}>
                  Continuar <ArrowRightIcon />
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-continue"
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Registrando...' : 'Registrar'}
                </button>
              )}
            </div>

          </form>
        </div>
      </div>

    </div>
  );
};

export default Register;
