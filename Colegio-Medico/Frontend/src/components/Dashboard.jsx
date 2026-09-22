import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';
import logoUrl from '../assets/emblema.png';
import { getJornadas, getInscripciones, createPago, logout, createJornada, updateJornada, deleteJornada, getPagos, getAccessToken, getUsers, createUser, updateUser, deleteUser, downloadReportePagosPdf, getProgramaciones, createProgramacion, deleteProgramacion } from '../services/api';

/* ── Iconos ── */
const LogOutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const DollarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const AwardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7"/>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const AdminIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);



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

const getTipoPagoBadge = (tipo) => {
  let bgColor = 'rgba(156, 39, 176, 0.15)'; // purple
  let color = '#e040fb';
  let label = 'Pago Móvil';

  if (tipo === 'TB') {
    bgColor = 'rgba(0, 150, 136, 0.15)'; // teal
    color = '#1de9b6';
    label = 'Transferencia';
  } else if (tipo === 'EF') {
    bgColor = 'rgba(255, 152, 0, 0.15)'; // amber
    color = '#ffd740';
    label = 'Efectivo / Divisas';
  }

  return (
    <span style={{
      backgroundColor: bgColor,
      color: color,
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '0.8rem',
      fontWeight: 'bold',
      display: 'inline-block'
    }}>
      {label}
    </span>
  );
};

const Dashboard = ({ onLogout }) => {
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `http://127.0.0.1:8000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const [user, setUser] = useState({});
  const [jornadas, setJornadas] = useState([
    {
      id: 1,
      nombre: "Congreso de Cardiología 2026",
      costo: "150.00",
      fecha_inicio: "2026-06-15",
      fecha_final: "2026-06-18",
      uc: 5,
      estado_jornada: "A"
    },
    {
      id: 2,
      nombre: "Jornadas de Pediatría del Zulia",
      costo: "100.00",
      fecha_inicio: "2026-07-10",
      fecha_final: "2026-07-12",
      uc: 3,
      estado_jornada: "A"
    }
  ]);
  const [inscripciones, setInscripciones] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [activeTab, setActiveTab] = useState('jornadas'); // 'jornadas' o 'inscripciones'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null); // { url, title }

  // Estado del modal de Programación de Jornada (imágenes del cronograma)
  const [programacionModal, setProgramacionModal] = useState(null); // { jornada, imagenes: [] }
  const [programacionLoading, setProgramacionLoading] = useState(false);
  const [programacionError, setProgramacionError] = useState('');
  const [programacionIndex, setProgramacionIndex] = useState(0);

  // Auto-avance del carrusel cada 5 segundos
  useEffect(() => {
    if (!programacionModal || programacionModal.imagenes.length < 2) return;
    const timer = setInterval(() => {
      setProgramacionIndex(prev => (prev + 1) % programacionModal.imagenes.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [programacionModal]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLightboxImage(null);
        setProgramacionModal(null);
      }
      if (programacionModal && programacionModal.imagenes.length > 1) {
        if (e.key === 'ArrowRight') {
          setProgramacionIndex(prev => (prev + 1) % programacionModal.imagenes.length);
        } else if (e.key === 'ArrowLeft') {
          setProgramacionIndex(prev => (prev - 1 + programacionModal.imagenes.length) % programacionModal.imagenes.length);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [programacionModal]);

  // Estado de zoom del lightbox (escala y posición de paneo)
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [lightboxPos, setLightboxPos] = useState({ x: 0, y: 0 });
  const isDraggingImage = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });

  const resetLightboxZoom = () => {
    setLightboxZoom(1);
    setLightboxPos({ x: 0, y: 0 });
  };

  const openLightbox = (payload) => {
    setLightboxImage(payload);
    resetLightboxZoom();
  };

  const clampLightboxPos = (zoom, pos) => {
    // Limita el paneo para no perder la imagen de la vista
    const limit = (zoom - 1) * 50; // porcentaje
    return {
      x: Math.max(-limit, Math.min(limit, pos.x)),
      y: Math.max(-limit, Math.min(limit, pos.y)),
    };
  };

  const handleLightboxWheel = (e) => {
    e.preventDefault();
    setLightboxZoom(prev => {
      const next = Math.min(8, Math.max(1, prev + (e.deltaY < 0 ? 0.25 : -0.25)));
      setLightboxPos(p => clampLightboxPos(next, p));
      return next;
    });
  };

  const handleLightboxMouseDown = (e) => {
    if (lightboxZoom <= 1) return;
    isDraggingImage.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, px: lightboxPos.x, py: lightboxPos.y };
  };

  const handleLightboxMouseMove = (e) => {
    if (!isDraggingImage.current) return;
    setLightboxPos(clampLightboxPos(lightboxZoom, {
      x: dragStart.current.px + (e.clientX - dragStart.current.x),
      y: dragStart.current.py + (e.clientY - dragStart.current.y),
    }));
  };

  const handleLightboxMouseUp = () => {
    isDraggingImage.current = false;
  };

  // Estado para el modal de inscripción / pago
  const [selectedJornada, setSelectedJornada] = useState(null);
  const [pagoForm, setPagoForm] = useState({
    referencia_pago: '',
    monto: '',
    fecha_pago: new Date().toISOString().split('T')[0],
    tipo_pago: ''
  });
  const [pagoLoading, setPagoLoading] = useState(false);
  const [pagoError, setPagoError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  // Estado para el CRUD de Jornadas (superadmin / staff)
  const [jornadaModalOpen, setJornadaModalOpen] = useState(false);
  const [editingJornada, setEditingJornada] = useState(null);
  const [jornadaForm, setJornadaForm] = useState({
    nombre: '',
    fecha_inicio: '',
    fecha_final: '',
    costo: '',
    uc: '',
    estado_jornada: 'A'
  });
  const [jornadaLoading, setJornadaLoading] = useState(false);
  const [jornadaError, setJornadaError] = useState('');
  const [jornadaSuccess, setJornadaSuccess] = useState('');

  // Estado para el CRUD de Usuarios (superadmin / staff)
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    rol: 'participante',
    tipo: 'D',
    nacionalidad: 'V',
    cedula: '',
    telefono: '',
    comezu: '',
    especialidad: '',
    sociedad: '',
    genero: 'M',
    is_active: true
  });
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');

  const openJornadaModal = (jornada = null) => {
    if (jornada) {
      setEditingJornada(jornada);
      setJornadaForm({
        nombre: jornada.nombre,
        fecha_inicio: jornada.fecha_inicio,
        fecha_final: jornada.fecha_final,
        costo: jornada.costo,
        uc: jornada.uc || '',
        estado_jornada: jornada.estado_jornada,
        imagen: null,
        imagenPreview: jornada.imagen ? getImageUrl(jornada.imagen) : '',
        eliminarImagen: false
      });
    } else {
      setEditingJornada(null);
      setJornadaForm({
        nombre: '',
        fecha_inicio: '',
        fecha_final: '',
        costo: '',
        uc: '',
        estado_jornada: 'A',
        imagen: null,
        imagenPreview: '',
        eliminarImagen: false
      });
    }
    setJornadaError('');
    setJornadaSuccess('');
    setJornadaModalOpen(true);
  };

  const closeJornadaModal = () => {
    setJornadaModalOpen(false);
    setEditingJornada(null);
  };

  const handleJornadaChange = (e) => {
    const { name, value } = e.target;
    setJornadaForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveJornada = async (e) => {
    e.preventDefault();
    if (!jornadaForm.nombre.trim()) {
      setJornadaError('El nombre es requerido.');
      return;
    }
    if (!jornadaForm.fecha_inicio || !jornadaForm.fecha_final) {
      setJornadaError('Las fechas son requeridas.');
      return;
    }
    if (!jornadaForm.costo || parseFloat(jornadaForm.costo) < 0) {
      setJornadaError('El costo debe ser mayor o igual a cero.');
      return;
    }

    setJornadaLoading(true);
    setJornadaError('');
    try {
      const formData = new FormData();
      formData.append('nombre', jornadaForm.nombre);
      formData.append('fecha_inicio', jornadaForm.fecha_inicio);
      formData.append('fecha_final', jornadaForm.fecha_final);
      formData.append('costo', jornadaForm.costo);
      formData.append('estado_jornada', jornadaForm.estado_jornada);
      if (jornadaForm.uc) {
        formData.append('uc', parseInt(jornadaForm.uc));
      } else {
        formData.append('uc', '');
      }
      if (jornadaForm.imagen instanceof File) {
        formData.append('imagen', jornadaForm.imagen);
      } else if (jornadaForm.eliminarImagen) {
        formData.append('imagen', '');
      }

      if (editingJornada) {
        await updateJornada(editingJornada.id, formData);
        setJornadaSuccess('¡Jornada actualizada exitosamente!');
      } else {
        await createJornada(formData);
        setJornadaSuccess('¡Jornada creada exitosamente!');
      }
      setTimeout(() => {
        closeJornadaModal();
        fetchData();
      }, 1500);
    } catch (err) {
      setJornadaError(err.message || 'Error al guardar la jornada.');
    } finally {
      setJornadaLoading(false);
    }
  };

  const handleDeleteJornada = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta jornada científica?')) {
      return;
    }
    try {
      await deleteJornada(id);
      fetchData();
    } catch (err) {
      setError('Error al eliminar la jornada. Intente nuevamente.');
      console.error(err);
    }
  };

  // ─── Programación de Jornada (imágenes del cronograma) ───
  const openProgramacionModal = async (jornada) => {
    setProgramacionIndex(0); // el carrusel siempre arranca en la primera imagen
    setProgramacionModal({ jornada, imagenes: jornada.programaciones || [] });
    setProgramacionError('');
  };

  const closeProgramacionModal = () => {
    setProgramacionModal(null);
    setProgramacionError('');
  };

  const handleUploadProgramacion = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ''; // permitir subir el mismo archivo de nuevo
    if (!files.length || !programacionModal) return;

    setProgramacionLoading(true);
    setProgramacionError('');
    let exitosas = 0;
    const errores = [];
    try {
      // Subir cada imagen de forma independiente: si una falla, las demás continúan
      for (const file of files) {
        try {
          const fd = new FormData();
          fd.append('jornada', programacionModal.jornada.id);
          fd.append('imagen', file);
          fd.append('titulo', '');
          await createProgramacion(fd);
          exitosas += 1;
        } catch (err) {
          errores.push(`${file.name}: ${err.message || 'error'}`);
        }
      }

      // Refrescar la lista completa desde el servidor
      const actualizadas = await getProgramaciones(programacionModal.jornada.id);
      const lista = Array.isArray(actualizadas) ? actualizadas : (actualizadas.results || []);
      setProgramacionModal(prev => ({ ...prev, imagenes: lista }));
      fetchData(); // refrescar el contador de programaciones embebidas

      if (errores.length > 0) {
        setProgramacionError(
          `Se subieron ${exitosas} de ${files.length} imágenes. Errores: ${errores.join(' | ')}`
        );
      }
    } catch (err) {
      setProgramacionError(err.message || 'Error al subir la programación.');
    } finally {
      setProgramacionLoading(false);
    }
  };

  const handleDeleteProgramacion = async (id) => {
    if (!window.confirm('¿Eliminar esta imagen de programación?')) return;
    setProgramacionLoading(true);
    setProgramacionError('');
    try {
      await deleteProgramacion(id);
      const actualizadas = await getProgramaciones(programacionModal.jornada.id);
      setProgramacionModal(prev => ({ ...prev, imagenes: actualizadas }));
      fetchData();
    } catch (err) {
      setProgramacionError(err.message || 'Error al eliminar la programación.');
    } finally {
      setProgramacionLoading(false);
    }
  };

  const openUserModal = (selectedUser = null) => {
    if (selectedUser) {
      setEditingUser(selectedUser);
      setUserForm({
        username: selectedUser.username || '',
        password: '',
        first_name: selectedUser.first_name || '',
        last_name: selectedUser.last_name || '',
        email: selectedUser.email || '',
        rol: selectedUser.rol || 'participante',
        tipo: selectedUser.tipo || 'D',
        nacionalidad: selectedUser.nacionalidad || 'V',
        cedula: selectedUser.cedula || '',
        telefono: selectedUser.telefono || '',
        comezu: selectedUser.comezu || '',
        especialidad: selectedUser.especialidad || '',
        sociedad: selectedUser.sociedad || '',
        genero: selectedUser.genero || 'M',
        is_active: selectedUser.is_active !== undefined ? selectedUser.is_active : true
      });
    } else {
      setEditingUser(null);
      setUserForm({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        email: '',
        rol: 'participante',
        tipo: 'D',
        nacionalidad: 'V',
        cedula: '',
        telefono: '',
        comezu: '',
        especialidad: '',
        sociedad: '',
        genero: 'M',
        is_active: true
      });
    }
    setUserError('');
    setUserSuccess('');
    setUserModalOpen(true);
  };

  const closeUserModal = () => {
    setUserModalOpen(false);
    setEditingUser(null);
  };

  const handleUserChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!userForm.username.trim()) {
      setUserError('El nombre de usuario es requerido.');
      return;
    }
    if (!editingUser && !userForm.password) {
      setUserError('La contraseña es requerida para nuevos usuarios.');
      return;
    }
    if (!userForm.first_name.trim() || !userForm.last_name.trim()) {
      setUserError('Nombre y apellido son requeridos.');
      return;
    }

    setUserLoading(true);
    setUserError('');

    // Prepare data
    const payload = { ...userForm };
    if (editingUser && !payload.password) {
      delete payload.password; // Do not send empty password on edit
    }

    try {
      if (editingUser) {
        await updateUser(editingUser.id, payload);
        setUserSuccess('¡Usuario actualizado exitosamente!');
      } else {
        await createUser(payload);
        setUserSuccess('¡Usuario creado exitosamente!');
      }
      setTimeout(() => {
        closeUserModal();
        fetchData();
      }, 1500);
    } catch (err) {
      setUserError(err.message || 'Error al guardar el usuario.');
    } finally {
      setUserLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este usuario?')) {
      return;
    }
    try {
      await deleteUser(id);
      fetchData();
    } catch (err) {
      setError('Error al eliminar el usuario. Intente nuevamente.');
      console.error(err);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const dataJornadas = await getJornadas();
      const dataInscripciones = await getInscripciones();
      const dataPagos = await getPagos();
      setJornadas(dataJornadas);
      setInscripciones(dataInscripciones);
      setPagos(dataPagos);

      const userData = localStorage.getItem('user_data');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.rol === 'superadmin' || parsedUser.rol === 'staff') {
          const dataUsers = await getUsers();
          setUsers(dataUsers);
        }
      }
    } catch (err) {
      setError('Error al cargar la información. Por favor, intente de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const isJornadaCulminada = (fechaFinal) => {
    if (!fechaFinal) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parts = fechaFinal.split('-');
    if (parts.length === 3) {
      const endDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      endDate.setHours(0, 0, 0, 0);
      return today >= endDate;
    }
    return new Date(fechaFinal) <= today;
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const parts = fechaStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return new Date(fechaStr).toLocaleDateString();
  };

  const handleDownloadReportePagos = async () => {
    setPdfLoading(true);
    try {
      await downloadReportePagosPdf();
    } catch (err) {
      alert(err.message || 'Error al descargar el reporte de pagos.');
      console.error(err);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadCertificate = async (inscripcionId, userFullName) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/inscripcion/${inscripcionId}/certificado/`, {
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`
        }
      });
      if (!response.ok) {
        let errorMsg = 'Error al descargar el certificado.';
        try {
          const errData = await response.json();
          errorMsg = errData.detail || errorMsg;
        } catch {
          // No es JSON
        }
        throw new Error(errorMsg);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificado_${userFullName.replace(/\s+/g, '_')}.pptx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Ocurrió un error al descargar el certificado. Por favor, intente de nuevo.');
      console.error(err);
    }
  };

  const openInscripcionModal = (jornada) => {
    setSelectedJornada(jornada);
    setPagoForm({
      referencia_pago: '',
      monto: parseFloat(jornada.costo).toFixed(2),
      fecha_pago: new Date().toISOString().split('T')[0],
      tipo_pago: ''
    });
    setPagoError('');
    setSuccessMsg('');
  };

  const closeInscripcionModal = () => {
    setSelectedJornada(null);
  };

  const handlePagoChange = (e) => {
    const { name, value } = e.target;
    setPagoForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConfirmInscripcion = async (e) => {
    e.preventDefault();
    if (!pagoForm.tipo_pago) {
      setPagoError('Por favor, seleccione una forma de pago.');
      return;
    }
    if (!pagoForm.referencia_pago.trim()) {
      setPagoError('El número de referencia es requerido.');
      return;
    }
    if (!pagoForm.monto || parseFloat(pagoForm.monto) <= 0) {
      setPagoError('El monto debe ser mayor a cero.');
      return;
    }

    setPagoLoading(true);
    setPagoError('');
    try {
      // PagoSerializer crea el Pago y la Inscripción en un solo paso usando jornada_id
      await createPago({
        fecha_pago: pagoForm.fecha_pago,
        monto: pagoForm.monto,
        referencia_pago: pagoForm.referencia_pago.trim(),
        tipo_pago: pagoForm.tipo_pago,
        jornada_id: selectedJornada.id
      });

      setSuccessMsg('¡Inscripción y pago registrados exitosamente!');
      setTimeout(() => {
        closeInscripcionModal();
        fetchData();
      }, 1500);

    } catch (err) {
      setPagoError(err.message || 'Ocurrió un error al procesar el pago.');
    } finally {
      setPagoLoading(false);
    }
  };

  const isUserInscribed = (jornadaId) => {
    return inscripciones.some(ins => ins.jornada === jornadaId);
  };

  return (
    <div className={`dashboard-wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Marca de agua del emblema (misma estética del Login) */}
      <div className="dashboard-watermark">
        <img src={logoUrl} alt="" />
      </div>

      {/* Sidebar de Navegación */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <img src={logoUrl} alt="Logo" className="sidebar-logo" />
          <div className="sidebar-brand">
            <span className="brand-title">Colegio Médico</span>
            <span className="brand-subtitle">Edo. Zulia</span>
          </div>
          <button className="sidebar-close-btn" onClick={() => setIsSidebarOpen(false)} title="Cerrar menú">
            <CloseIcon />
          </button>
        </div>

        <nav className="sidebar-nav-menu">
          <button
            className={`menu-item ${activeTab === 'jornadas' ? 'active' : ''}`}
            onClick={() => { setActiveTab('jornadas'); setIsSidebarOpen(false); }}
          >
            <span className="menu-icon"><CalendarIcon /></span>
            <span className="menu-text">Jornadas Científicas</span>
          </button>

          <button
            className={`menu-item ${activeTab === 'inscripciones' ? 'active' : ''}`}
            onClick={() => { setActiveTab('inscripciones'); setIsSidebarOpen(false); }}
          >
            <span className="menu-icon"><AwardIcon /></span>
            <span className="menu-text">Mis Inscripciones</span>
          </button>

          <button
            className={`menu-item ${activeTab === 'pagos' ? 'active' : ''}`}
            onClick={() => { setActiveTab('pagos'); setIsSidebarOpen(false); }}
          >
            <span className="menu-icon"><DollarIcon /></span>
            <span className="menu-text">
              {user.rol === 'superadmin' || user.rol === 'staff' ? 'Todos los Pagos' : 'Mis Pagos'}
            </span>
          </button>

          {(user.rol === 'superadmin' || user.rol === 'staff') && (
            <>
              <div className="menu-divider">Administración</div>
              <button
                className={`menu-item ${activeTab === 'gestion_jornadas' ? 'active' : ''}`}
                onClick={() => { setActiveTab('gestion_jornadas'); setIsSidebarOpen(false); }}
              >
                <span className="menu-icon"><AdminIcon /></span>
                <span className="menu-text">Gestionar Jornadas</span>
              </button>

              <button
                className={`menu-item ${activeTab === 'gestion_usuarios' ? 'active' : ''}`}
                onClick={() => { setActiveTab('gestion_usuarios'); setIsSidebarOpen(false); }}
              >
                <span className="menu-icon"><UserIcon /></span>
                <span className="menu-text">Gestionar Usuarios</span>
              </button>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogout} title="Cerrar sesión">
            <LogOutIcon />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Backdrop de Sidebar para móvil */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* Contenedor del contenido principal */}
      <div className="dashboard-content">
        {/* Navbar Superior */}
        <header className="dashboard-topbar">
          <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(true)} title="Abrir menú">
            <MenuIcon />
          </button>

          <div className="topbar-right">
            <div className="topbar-user-container" style={{ position: 'relative' }}>
              <button
                className="user-avatar-btn"
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Ver perfil"
              >
                <span className="user-avatar"><UserIcon /></span>
              </button>

              {profileOpen && (
                <div className="user-profile-popover animate-fade-in">
                  <div className="popover-section">
                    <div className="popover-label">Rol</div>
                    <div className="popover-value">
                      {user.tipo === 'D' ? 'Médico' : user.tipo === 'E' ? 'Estudiante' : 'Administrador'}
                    </div>
                  </div>

                  <div className="popover-section">
                    <div className="popover-label">Nombre Completo</div>
                    <div className="popover-value">
                      {user.first_name} {user.last_name}
                    </div>
                  </div>

                  {user.email && (
                    <div className="popover-section">
                      <div className="popover-label">Correo</div>
                      <div className="popover-value-muted">{user.email}</div>
                    </div>
                  )}

                  {user.telefono && (
                    <div className="popover-section">
                      <div className="popover-label">Teléfono</div>
                      <div className="popover-value-muted">{user.telefono}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Panel Principal */}
        <main className="dashboard-main animate-fade-in">
          {error && <div className="error-alert">{error}</div>}

          {/* Header de Bienvenida */}
          <header className="welcome-header">
            <h1>Bienvenido al Portal Oficial</h1>
            <p>Consulta las jornadas científicas disponibles, inscríbete y reporta tus pagos de manera ágil.</p>
          </header>

          {/* Detalle del Panel Activo */}
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            <p>Cargando información...</p>
          </div>
        ) : (
          <div className="tab-content">
            {activeTab === 'jornadas' && (
              <div className="jornadas-grid">
                {jornadas.length === 0 ? (
                  <p className="no-data-msg">No hay jornadas científicas disponibles en este momento.</p>
                ) : (
                  jornadas.map((jornada) => {
                    const inscrito = isUserInscribed(jornada.id);
                    const imageUrl = getImageUrl(jornada.imagen);

                    return (
                      <div className="jornada-card" key={jornada.id}>
                        <button
                          type="button"
                          className="jornada-card-programacion-btn"
                          onClick={() => openProgramacionModal(jornada)}
                          title="Haz clic para ver la programación de esta jornada"
                        >
                          <div
                            className={`jornada-card-image-container ${!imageUrl ? 'jornada-card-image-placeholder' : ''}`}
                            onClick={(e) => {
                              if (imageUrl) {
                                e.stopPropagation();
                                openLightbox({ url: imageUrl, title: jornada.nombre });
                              }
                            }}
                            title={imageUrl ? "Haz clic para ver el afiche en tamaño completo" : ""}
                          >
                            {imageUrl ? (
                              <>
                                <img
                                  src={imageUrl}
                                  alt={jornada.nombre}
                                  className="jornada-card-image"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.classList.add('jornada-card-image-placeholder');
                                  }}
                                />
                                <div className="jornada-image-zoom-badge">
                                  <span>🔍 Ampliar afiche</span>
                                </div>
                              </>
                            ) : (
                              <img src={logoUrl} alt="COMEZU" className="jornada-placeholder-logo" />
                            )}
                          </div>

                          <div className="jornada-card-header">
                            <h3>{jornada.nombre}</h3>
                            <span className={`status-badge ${jornada.estado_jornada === 'A' ? 'active' : 'inactive'}`}>
                              {jornada.estado_jornada === 'A' ? 'Activa' : 'Inactiva'}
                            </span>
                          </div>
                          <div className="jornada-card-body">
                            <div className="detail-item">
                              <CalendarIcon />
                              <span>
                                {new Date(jornada.fecha_inicio + 'T00:00:00').toLocaleDateString()} - {new Date(jornada.fecha_final + 'T00:00:00').toLocaleDateString()}
                              </span>
                            </div>
                            <div className="detail-item">
                              <DollarIcon />
                              <span className="price-tag">Costo: Bs. {parseFloat(jornada.costo).toFixed(2)}</span>
                            </div>
                            {jornada.uc && (
                              <div className="detail-item">
                                <AwardIcon />
                                <span>Valor de Crédito: {jornada.uc} UC</span>
                              </div>
                            )}
                          </div>
                          <div className="jornada-card-programacion-hint">
                            Ver Programación {(jornada.programaciones || []).length > 0 && `(${jornada.programaciones.length})`}
                          </div>
                        </button>
                        <div className="jornada-card-footer">
                          {inscrito ? (
                            <button className="btn-inscribed" disabled>
                              Ya Inscrito
                            </button>
                          ) : (
                            <button
                              className="btn-enroll"
                              disabled={jornada.estado_jornada !== 'A'}
                              onClick={() => openInscripcionModal(jornada)}
                            >
                              Inscribirse
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'inscripciones' && (
              <div className="inscripciones-table-wrapper">
                {inscripciones.length === 0 ? (
                  <p className="no-data-msg">Aún no estás inscrito en ninguna jornada científica.</p>
                ) : (
                  <table className="inscripciones-table">
                    <thead>
                      <tr>
                        {(user.rol === 'superadmin' || user.rol === 'staff') && <th>Participante</th>}
                        <th>Jornada Científica</th>
                        <th>Fecha de Inscripción</th>
                        <th>Monto Reportado</th>
                        <th>Referencia de Pago</th>
                        <th>Estado de Inscripción</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inscripciones.map((ins) => (
                        <tr key={ins.id}>
                          {(user.rol === 'superadmin' || user.rol === 'staff') && (
                            <td className="table-bold">
                              {ins.usuario_data?.first_name} {ins.usuario_data?.last_name}
                              <br/>
                              <small style={{ color: '#c5a059' }}>{ins.usuario_data?.email}</small>
                            </td>
                          )}
                          <td className="table-bold">{ins.jornada_data?.nombre || 'Jornada'}</td>
                          <td>{ins.fecha_inscripcion ? new Date(ins.fecha_inscripcion).toLocaleDateString() : 'N/A'}</td>
                          <td>Bs. {parseFloat(ins.pago_data?.monto || 0).toFixed(2)}</td>
                          <td>
                            <code>{ins.pago_data?.referencia_pago || 'N/A'}</code>
                            {ins.pago_data?.tipo_pago && (
                              <div style={{ marginTop: '4px' }}>
                                {getTipoPagoBadge(ins.pago_data.tipo_pago)}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className="status-badge active">Inscrito / Pago Reportado</span>
                          </td>
                          <td>
                            {(() => {
                              const fechaFinal = ins.jornada_data?.fecha_final;
                              const culminada = isJornadaCulminada(fechaFinal);
                              const esAdmin = user.rol === 'superadmin' || user.rol === 'staff';

                              if (culminada || esAdmin) {
                                return (
                                  <button
                                    className="btn-enroll"
                                    style={{ padding: '6px 12px', fontSize: '0.85rem', width: 'auto' }}
                                    onClick={() => handleDownloadCertificate(ins.id, `${ins.usuario_data?.first_name || 'Participante'} ${ins.usuario_data?.last_name || ''}`)}
                                  >
                                    Descargar Certificado
                                  </button>
                                );
                              }

                              return (
                                <button
                                  className="btn-disabled"
                                  disabled
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '0.8rem',
                                    width: 'auto',
                                    background: 'rgba(148, 163, 184, 0.12)',
                                    color: '#94a3b8',
                                    border: '1px solid rgba(148, 163, 184, 0.25)',
                                    borderRadius: '6px',
                                    cursor: 'not-allowed',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}
                                  title={`El certificado estará disponible a partir del ${formatearFecha(fechaFinal)}, una vez culminada la jornada.`}
                                >
                                  <span>🔒</span>
                                  <span>Disponible tras culminar ({formatearFecha(fechaFinal)})</span>
                                </button>
                              );
                            })()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'pagos' && (
              <div className="inscripciones-table-wrapper">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}>
                    {user.rol === 'superadmin' || user.rol === 'staff' ? 'Todos los Pagos Reportados' : 'Mis Pagos Reportados'}
                  </h2>
                  {pagos.length > 0 && (
                    <button
                      className="btn-enroll"
                      style={{
                        padding: '8px 16px',
                        fontSize: '0.88rem',
                        width: 'auto',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                      }}
                      onClick={handleDownloadReportePagos}
                      disabled={pdfLoading}
                      title="Descargar listado oficial de pagos en formato PDF"
                    >
                      <span>📄</span>
                      <span>{pdfLoading ? 'Generando PDF...' : 'Descargar Reporte PDF'}</span>
                    </button>
                  )}
                </div>
                {pagos.length === 0 ? (
                  <p className="no-data-msg">No hay reportes de pago registrados.</p>
                ) : (
                  <table className="inscripciones-table">
                    <thead>
                      <tr>
                        {(user.rol === 'superadmin' || user.rol === 'staff') && <th>Participante</th>}
                        {(user.rol === 'superadmin' || user.rol === 'staff') && <th>Cédula</th>}
                        <th>Referencia de Pago</th>
                        <th>Forma de Pago</th>
                        <th>Monto Reportado</th>
                        <th>Fecha de Pago</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagos.map((pago) => (
                        <tr key={pago.id}>
                          {(user.rol === 'superadmin' || user.rol === 'staff') && (
                            <td className="table-bold">
                              {pago.usuario_data?.first_name} {pago.usuario_data?.last_name}
                              <br/>
                              <small style={{ color: '#c5a059' }}>{pago.usuario_data?.email}</small>
                            </td>
                          )}
                          {(user.rol === 'superadmin' || user.rol === 'staff') && (
                            <td>{pago.usuario_data?.cedula || 'N/A'}</td>
                          )}
                          <td><code>{pago.referencia_pago}</code></td>
                          <td>{getTipoPagoBadge(pago.tipo_pago)}</td>
                          <td className="table-bold" style={{ color: '#4caf50' }}>Bs. {parseFloat(pago.monto).toFixed(2)}</td>
                          <td>{new Date(pago.fecha_pago + 'T00:00:00').toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'gestion_jornadas' && (user.rol === 'superadmin' || user.rol === 'staff') && (
              <div className="gestion-jornadas-container">
                <div className="gestion-jornadas-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}>Panel de Control de Jornadas</h2>
                  <button className="btn-submit-pago" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => openJornadaModal()}>
                    + Nueva Jornada
                  </button>
                </div>

                <div className="inscripciones-table-wrapper">
                  {jornadas.length === 0 ? (
                    <p className="no-data-msg">No hay jornadas creadas.</p>
                  ) : (
                    <table className="inscripciones-table">
                      <thead>
                        <tr>
                          <th>Afiche</th>
                          <th>Nombre</th>
                          <th>Fecha Inicio</th>
                          <th>Fecha Fin</th>
                          <th>Costo</th>
                          <th>Créditos (UC)</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jornadas.map((jornada) => {
                          const thumbUrl = getImageUrl(jornada.imagen);
                          return (
                          <tr key={jornada.id}>
                            <td>
                              {thumbUrl ? (
                                <div
                                  className="jornada-table-thumb-container"
                                  onClick={() => openLightbox({ url: thumbUrl, title: jornada.nombre })}
                                  title="Clic para ver afiche completo"
                                >
                                  <img
                                    src={thumbUrl}
                                    alt={jornada.nombre}
                                    className="jornada-table-thumb"
                                  />
                                </div>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Sin imagen</span>
                              )}
                            </td>
                            <td className="table-bold">{jornada.nombre}</td>
                            <td>{new Date(jornada.fecha_inicio + 'T00:00:00').toLocaleDateString()}</td>
                            <td>{new Date(jornada.fecha_final + 'T00:00:00').toLocaleDateString()}</td>
                            <td>Bs. {parseFloat(jornada.costo).toFixed(2)}</td>
                            <td>{jornada.uc ? `${jornada.uc} UC` : 'N/A'}</td>
                            <td>
                              <span className={`status-badge ${jornada.estado_jornada === 'A' ? 'active' : 'inactive'}`}>
                                {jornada.estado_jornada === 'A' ? 'Activa' : 'Inactiva'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                  className="btn-enroll"
                                  style={{ padding: '4px 10px', fontSize: '0.85rem' }}
                                  onClick={() => openJornadaModal(jornada)}
                                >
                                  Editar
                                </button>
                                <button
                                  className="btn-cancel"
                                  style={{ padding: '4px 10px', fontSize: '0.85rem', background: '#d32f2f' }}
                                  onClick={() => handleDeleteJornada(jornada.id)}
                                >
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'gestion_usuarios' && (user.rol === 'superadmin' || user.rol === 'staff') && (
              <div className="gestion-jornadas-container">
                <div className="gestion-jornadas-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}>Panel de Control de Usuarios</h2>
                  <button className="btn-submit-pago" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => openUserModal()}>
                    + Nuevo Usuario
                  </button>
                </div>

                {/* Buscador de usuarios */}
                <div style={{ marginBottom: '20px' }}>
                  <input
                    type="text"
                    placeholder="Buscar por nombre, usuario, correo o cédula..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.07)',
                      border: '1px solid rgba(168, 138, 77, 0.3)',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div className="inscripciones-table-wrapper">
                  {(() => {
                    const filteredUsers = users.filter(u => {
                      const searchLower = userSearch.toLowerCase();
                      return (
                        (u.username || '').toLowerCase().includes(searchLower) ||
                        (u.email || '').toLowerCase().includes(searchLower) ||
                        (u.first_name || '').toLowerCase().includes(searchLower) ||
                        (u.last_name || '').toLowerCase().includes(searchLower) ||
                        (u.cedula || '').toLowerCase().includes(searchLower)
                      );
                    });

                    if (filteredUsers.length === 0) {
                      return <p className="no-data-msg">No se encontraron usuarios.</p>;
                    }

                    return (
                      <table className="inscripciones-table">
                        <thead>
                          <tr>
                            <th>Usuario / Correo</th>
                            <th>Nombre Completo</th>
                            <th>Cédula</th>
                            <th>Rol</th>
                            <th>Tipo</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((u) => (
                            <tr key={u.id}>
                              <td className="table-bold">
                                {u.username}
                                <br />
                                <small style={{ color: '#c5a059' }}>{u.email || 'Sin correo'}</small>
                              </td>
                              <td>{u.first_name} {u.last_name}</td>
                              <td>{u.cedula || 'N/A'}</td>
                              <td>
                                <span style={{
                                  backgroundColor: u.rol === 'superadmin' ? 'rgba(244, 63, 94, 0.15)' : u.rol === 'staff' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                                  color: u.rol === 'superadmin' ? '#fb7185' : u.rol === 'staff' ? '#60a5fa' : '#94a3b8',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold'
                                }}>
                                  {u.rol}
                                </span>
                              </td>
                              <td>
                                {u.tipo === 'D' ? 'Médico' : u.tipo === 'E' ? 'Estudiante' : 'Administrador'}
                              </td>
                              <td>
                                <span className={`status-badge ${u.is_active ? 'active' : 'inactive'}`}>
                                  {u.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                  <button
                                    className="btn-enroll"
                                    style={{ padding: '4px 10px', fontSize: '0.85rem' }}
                                    onClick={() => openUserModal(u)}
                                  >
                                    Editar
                                  </button>
                                  <button
                                    className="btn-cancel"
                                    style={{ padding: '4px 10px', fontSize: '0.85rem', background: '#d32f2f' }}
                                    onClick={() => handleDeleteUser(u.id)}
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}
        </main>
      </div>

      {/* Modal de Inscripción y Pago */}
      {selectedJornada && (
        <div className="modal-backdrop">
          <div className="modal-card animate-fade-in">
            <div className="modal-header">
              <h2>Registrar Pago e Inscripción</h2>
              <button className="btn-close-modal" onClick={closeInscripcionModal}>&times;</button>
            </div>
            <form onSubmit={handleConfirmInscripcion} className="modal-form">
              <div className="modal-info-box">
                <p>Estás inscribiéndote en: <strong>{selectedJornada.nombre}</strong></p>
                <p>Costo del evento: <strong>Bs. {parseFloat(selectedJornada.costo).toFixed(2)}</strong></p>
              </div>

              {pagoError && <div className="error-alert">{pagoError}</div>}
              {successMsg && <div className="success-alert">{successMsg}</div>}

              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Forma de Pago</label>
                  <select
                    name="tipo_pago"
                    value={pagoForm.tipo_pago}
                    onChange={handlePagoChange}
                    className="register-input"
                    required
                    disabled={pagoLoading}
                  >
                    <option value="" disabled style={{ backgroundColor: '#0e1f3d' }}>Selecciona una opción de pago</option>
                    <option value="PM" style={{ backgroundColor: '#0e1f3d' }}>Pago Móvil</option>
                    <option value="TB" style={{ backgroundColor: '#0e1f3d' }}>Transferencia Bancaria</option>
                    <option value="EF" style={{ backgroundColor: '#0e1f3d' }}>Efectivo / Divisas (Taquilla)</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Número de Referencia del Pago</label>
                  <input
                    type="text"
                    name="referencia_pago"
                    value={pagoForm.referencia_pago}
                    onChange={handlePagoChange}
                    placeholder="Ingrese la referencia"
                    className="register-input"
                    required
                    disabled={pagoLoading}
                  />
                </div>
              </div>

              {/* Caja informativa dinámica con los detalles de pago */}
              <div className="payment-instructions-box" style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderLeft: '4px solid #c5a059',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                color: '#e0e0e0',
                lineHeight: '1.4',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderLeftWidth: '4px'
              }}>
                {!pagoForm.tipo_pago && (
                  <div>
                    <p style={{ margin: 0, fontStyle: 'italic', color: '#94a3b8', textAlign: 'center' }}>
                      Seleccione una opción de pago arriba para ver los detalles bancarios.
                    </p>
                  </div>
                )}
                {pagoForm.tipo_pago === 'PM' && (
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#c5a059', fontSize: '0.9rem' }}>Detalles de Pago Móvil:</h4>
                    <p style={{ margin: '2px 0' }}><strong>Banco:</strong> BANCO NACIONAL DE CREDITO (BNC) | <strong>Teléfono:</strong> 0412-7629170 | <strong>RIF:</strong> J-07012462-8</p>
                    <p style={{ margin: '4px 0 0 0', fontStyle: 'italic', fontSize: '0.75rem', color: '#aaa' }}>
                      Realice el pago móvil antes de registrar la referencia.
                    </p>
                  </div>
                )}
                {pagoForm.tipo_pago === 'TB' && (
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#c5a059', fontSize: '0.9rem' }}>Detalles de Transferencia Bancaria:</h4>
                    <p style={{ margin: '2px 0' }}><strong>Banco:</strong> BANCO NACIONAL DE CREDITO (BNC) | <strong>Cuenta Corriente:</strong> 0191-0565-22-2100659008</p>
                    <p style={{ margin: '2px 0' }}><strong>Beneficiario:</strong> Colegio de Médicos del Estado Zulia | <strong>RIF:</strong> J-07012462-8</p>
                    <p style={{ margin: '2px 0' }}><strong>Correo:</strong> institutodeestudiosmedicos@gmail.com</p>
                  </div>
                )}
                {pagoForm.tipo_pago === 'EF' && (
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#c5a059', fontSize: '0.9rem' }}>Pago en Efectivo o Divisas:</h4>
                    <p style={{ margin: '2px 0' }}><strong>Ubicación:</strong> Sede del Colegio de Médicos del Estado Zulia, Maracaibo.</p>
                    <p style={{ margin: '4px 0 0 0', fontStyle: 'italic', fontSize: '0.75rem', color: '#aaa' }}>
                      Realice su pago directamente en la taquilla de administración para obtener su comprobante físico y número de referencia.
                    </p>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Monto a Reportar (Bs.)</label>
                  <input
                    type="number"
                    name="monto"
                    step="0.01"
                    value={pagoForm.monto}
                    onChange={handlePagoChange}
                    className="register-input"
                    required
                    disabled={pagoLoading}
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Fecha de Pago</label>
                  <input
                    type="date"
                    name="fecha_pago"
                    value={pagoForm.fecha_pago}
                    onChange={handlePagoChange}
                    className="register-input"
                    required
                    disabled={pagoLoading}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeInscripcionModal}
                  disabled={pagoLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-submit-pago"
                  disabled={pagoLoading}
                >
                  {pagoLoading ? 'Procesando...' : 'Confirmar Inscripción'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal de Crear / Editar Jornada */}
      {jornadaModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card animate-fade-in">
            <div className="modal-header">
              <h2>{editingJornada ? 'Editar Jornada Científica' : 'Crear Nueva Jornada Científica'}</h2>
              <button className="btn-close-modal" onClick={closeJornadaModal}>&times;</button>
            </div>
            <form onSubmit={handleSaveJornada} className="modal-form">
              {jornadaError && <div className="error-alert">{jornadaError}</div>}
              {jornadaSuccess && <div className="success-alert">{jornadaSuccess}</div>}

              <div className="form-group">
                <label>Nombre de la Jornada</label>
                <input
                  type="text"
                  name="nombre"
                  value={jornadaForm.nombre}
                  onChange={handleJornadaChange}
                  placeholder="Ej. Congreso Anual de Pediatría"
                  className="register-input"
                  required
                  disabled={jornadaLoading}
                />
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Fecha de Inicio</label>
                  <input
                    type="date"
                    name="fecha_inicio"
                    value={jornadaForm.fecha_inicio}
                    onChange={handleJornadaChange}
                    className="register-input"
                    required
                    disabled={jornadaLoading}
                  />
                </div>

                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Fecha Final</label>
                  <input
                    type="date"
                    name="fecha_final"
                    value={jornadaForm.fecha_final}
                    onChange={handleJornadaChange}
                    className="register-input"
                    required
                    disabled={jornadaLoading}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Costo (Bs.)</label>
                  <input
                    type="number"
                    name="costo"
                    step="0.01"
                    value={jornadaForm.costo}
                    onChange={handleJornadaChange}
                    className="register-input"
                    required
                    disabled={jornadaLoading}
                  />
                </div>

                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Créditos (UC)</label>
                  <input
                    type="number"
                    name="uc"
                    value={jornadaForm.uc}
                    onChange={handleJornadaChange}
                    placeholder="Ej. 4"
                    className="register-input"
                    disabled={jornadaLoading}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ margin: 0 }}>Afiche / Imagen de la Jornada (Opcional)</label>
                  {jornadaForm.imagenPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setJornadaForm(prev => ({
                          ...prev,
                          imagen: null,
                          imagenPreview: '',
                          eliminarImagen: true
                        }));
                      }}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#fca5a5',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '6px',
                        padding: '3px 10px',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Eliminar afiche de esta jornada"
                    >
                      <span>🗑️</span>
                      <span>Quitar imagen</span>
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  name="imagen"
                  key={jornadaForm.imagenPreview ? 'has-image' : 'no-image'}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setJornadaForm(prev => ({
                        ...prev,
                        imagen: file,
                        imagenPreview: URL.createObjectURL(file),
                        eliminarImagen: false
                      }));
                    }
                  }}
                  className="register-input"
                  disabled={jornadaLoading}
                  style={{ padding: '8px' }}
                />
                {jornadaForm.imagenPreview && (
                  <div className="jornada-image-preview-box" style={{ position: 'relative' }}>
                    <img src={jornadaForm.imagenPreview} alt="Vista previa afiche" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Estado de la Jornada</label>
                <select
                  name="estado_jornada"
                  value={jornadaForm.estado_jornada}
                  onChange={handleJornadaChange}
                  className="register-input"
                  required
                  disabled={jornadaLoading}
                  style={{ width: '100%', background: '#0a192f', color: '#fff', border: '1px solid #c5a059', padding: '10px' }}
                >
                  <option value="A">Activa (Inscripciones abiertas)</option>
                  <option value="I">Inactiva (Cerrada)</option>
                </select>
              </div>

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeJornadaModal}
                  disabled={jornadaLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-submit-pago"
                  disabled={jornadaLoading}
                >
                  {jornadaLoading ? 'Guardando...' : (editingJornada ? 'Actualizar' : 'Crear Jornada')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal de Crear / Editar Usuario */}
      {userModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card animate-fade-in" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2>{editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
              <button className="btn-close-modal" onClick={closeUserModal}>&times;</button>
            </div>
            <form onSubmit={handleSaveUser} className="modal-form">
              {userError && <div className="error-alert">{userError}</div>}
              {userSuccess && <div className="success-alert">{userSuccess}</div>}

              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Nombre de Usuario</label>
                  <input
                    type="text"
                    name="username"
                    value={userForm.username}
                    onChange={handleUserChange}
                    placeholder="Ej. dr.perez"
                    className="register-input"
                    required
                    disabled={userLoading || editingUser}
                  />
                </div>

                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>{editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}</label>
                  <input
                    type="password"
                    name="password"
                    value={userForm.password}
                    onChange={handleUserChange}
                    placeholder={editingUser ? "Dejar en blanco para no cambiar" : "Contraseña"}
                    className="register-input"
                    required={!editingUser}
                    disabled={userLoading}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Nombres</label>
                  <input
                    type="text"
                    name="first_name"
                    value={userForm.first_name}
                    onChange={handleUserChange}
                    placeholder="Nombres"
                    className="register-input"
                    required
                    disabled={userLoading}
                  />
                </div>

                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Apellidos</label>
                  <input
                    type="text"
                    name="last_name"
                    value={userForm.last_name}
                    onChange={handleUserChange}
                    placeholder="Apellidos"
                    className="register-input"
                    required
                    disabled={userLoading}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Correo Electrónico</label>
                  <input
                    type="email"
                    name="email"
                    value={userForm.email}
                    onChange={handleUserChange}
                    placeholder="correo@ejemplo.com"
                    className="register-input"
                    required
                    disabled={userLoading}
                  />
                </div>

                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    value={userForm.telefono}
                    onChange={handleUserChange}
                    placeholder="Ej. 04141234567"
                    className="register-input"
                    disabled={userLoading}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Rol en el Sistema</label>
                  <select
                    name="rol"
                    value={userForm.rol}
                    onChange={handleUserChange}
                    className="register-input"
                    required
                    disabled={userLoading}
                    style={{ width: '100%', background: '#0a192f', color: '#fff', border: '1px solid #c5a059', padding: '10px' }}
                  >
                    <option value="participante">Participante</option>
                    <option value="staff">Staff (Administrativo)</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Tipo de Participante</label>
                  <select
                    name="tipo"
                    value={userForm.tipo}
                    onChange={handleUserChange}
                    className="register-input"
                    required
                    disabled={userLoading}
                    style={{ width: '100%', background: '#0a192f', color: '#fff', border: '1px solid #c5a059', padding: '10px' }}
                  >
                    <option value="D">Médico (Doctor)</option>
                    <option value="E">Estudiante</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Nacionalidad</label>
                  <select
                    name="nacionalidad"
                    value={userForm.nacionalidad}
                    onChange={handleUserChange}
                    className="register-input"
                    required
                    disabled={userLoading}
                    style={{ width: '100%', background: '#0a192f', color: '#fff', border: '1px solid #c5a059', padding: '10px' }}
                  >
                    <option value="V">Venezolano</option>
                    <option value="E">Extranjero</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Número de Cédula / ID</label>
                  <input
                    type="text"
                    name="cedula"
                    value={userForm.cedula}
                    onChange={handleUserChange}
                    placeholder="Ej. 12345678"
                    className="register-input"
                    required
                    disabled={userLoading}
                  />
                </div>
              </div>

              {/* Mostrar campos adicionales solo si es Médico/Doctor */}
              {userForm.tipo === 'D' && (
                <>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label>COMEZU</label>
                    <input
                      type="text"
                      name="comezu"
                      value={userForm.comezu}
                      onChange={handleUserChange}
                      placeholder="Nº COMEZU"
                      className="register-input"
                      disabled={userLoading}
                    />
                  </div>

                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label>Especialidad</label>
                    <input
                      type="text"
                      name="especialidad"
                      value={userForm.especialidad}
                      onChange={handleUserChange}
                      placeholder="Ej. Pediatría"
                      className="register-input"
                      disabled={userLoading}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'center' }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label>Sociedad científica</label>
                    <select
                      name="sociedad"
                      value={userForm.sociedad || ''}
                      onChange={handleUserChange}
                      className="register-input"
                      disabled={userLoading}
                      style={{ width: '100%', background: '#0a192f', color: '#fff', border: '1px solid #c5a059', padding: '10px' }}
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

              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'center' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Género</label>
                  <select
                    name="genero"
                    value={userForm.genero}
                    onChange={handleUserChange}
                    className="register-input"
                    required
                    disabled={userLoading}
                    style={{ width: '100%', background: '#0a192f', color: '#fff', border: '1px solid #c5a059', padding: '10px' }}
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1, marginBottom: 0, display: 'flex', alignItems: 'center', gap: '10px', marginTop: '22px' }}>
                  <input
                    type="checkbox"
                    id="is_active_checkbox"
                    name="is_active"
                    checked={userForm.is_active}
                    onChange={handleUserChange}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    disabled={userLoading}
                  />
                  <label htmlFor="is_active_checkbox" style={{ margin: 0, cursor: 'pointer', fontSize: '0.85rem' }}>Cuenta Activa</label>
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeUserModal}
                  disabled={userLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-submit-pago"
                  disabled={userLoading}
                >
                  {userLoading ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear Usuario')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Programación de Jornada (imágenes del cronograma) */}
      {programacionModal && (
        <div className="lightbox-backdrop" onClick={closeProgramacionModal}>
          <div className="programacion-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close-btn" onClick={closeProgramacionModal} title="Cerrar programación">
              &times;
            </button>
            <div className="programacion-modal-header">
              <h2>📋 Programación — {programacionModal.jornada.nombre}</h2>
            </div>

            {programacionError && <div className="error-alert" style={{ margin: '0 20px 10px' }}>{programacionError}</div>}

            <div className="programacion-modal-body">
              {(user.rol === 'superadmin' || user.rol === 'staff') && (
                <label className="programacion-upload-btn" style={{ opacity: programacionLoading ? 0.6 : 1 }}>
                  {programacionLoading ? '⏳ Subiendo...' : '📤 Subir imágenes de programación'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUploadProgramacion}
                    style={{ display: 'none' }}
                    disabled={programacionLoading}
                  />
                </label>
              )}

              {programacionModal.imagenes.length === 0 ? (
                <p className="programacion-empty-msg">
                  {user.rol === 'superadmin' || user.rol === 'staff'
                    ? 'Aún no hay imágenes de programación. Usa el botón de arriba para subirlas.'
                    : 'Aún no hay imágenes de programación disponibles para esta jornada.'}
                </p>
              ) : (
                <div className="programacion-carrusel">
                  {/* Track deslizante */}
                  <div
                    className="programacion-carrusel-track"
                    style={{ transform: `translateX(-${programacionIndex * 100}%)` }}
                  >
                    {programacionModal.imagenes.map((prog, idx) => {
                      const progUrl = getImageUrl(prog.imagen);
                      return (
                        <div
                          className={`programacion-slide ${idx === programacionIndex ? 'is-active' : ''}`}
                          key={prog.id}
                        >
                          <img
                            src={progUrl}
                            alt={prog.titulo || `Programación ${prog.id}`}
                            className="programacion-image"
                            onClick={() => openLightbox({ url: progUrl, title: prog.titulo || `Programación — ${programacionModal.jornada.nombre}` })}
                            title="Haz clic para ver en tamaño completo"
                          />
                          {(user.rol === 'superadmin' || user.rol === 'staff') && (
                            <button
                              type="button"
                              className="programacion-delete-btn"
                              onClick={() => handleDeleteProgramacion(prog.id)}
                              disabled={programacionLoading}
                              title="Eliminar esta imagen"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Flechas de navegación */}
                  {programacionModal.imagenes.length > 1 && (
                    <>
                      <button
                        type="button"
                        className="programacion-flecha programacion-flecha-izq"
                        onClick={() => setProgramacionIndex(prev => (prev - 1 + programacionModal.imagenes.length) % programacionModal.imagenes.length)}
                        title="Anterior"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        className="programacion-flecha programacion-flecha-der"
                        onClick={() => setProgramacionIndex(prev => (prev + 1) % programacionModal.imagenes.length)}
                        title="Siguiente"
                      >
                        ›
                      </button>

                      {/* Contador de posición */}
                      <div className="programacion-contador">
                        {programacionIndex + 1} / {programacionModal.imagenes.length}
                      </div>

                      {/* Indicadores (puntos) */}
                      <div className="programacion-dots">
                        {programacionModal.imagenes.map((prog, idx) => (
                          <button
                            type="button"
                            key={prog.id}
                            className={`programacion-dot ${idx === programacionIndex ? 'is-active' : ''}`}
                            onClick={() => setProgramacionIndex(idx)}
                            title={`Ir a imagen ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
              <span className="programacion-hint">
                {programacionModal.imagenes.length > 1
                  ? 'Usa las flechas o las teclas ← → para navegar — clic en la imagen para ampliar — ESC para cerrar'
                  : 'Clic en la imagen para ampliar — ESC o clic afuera para cerrar'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal / Lightbox para ver afiche ampliado (con zoom libre) */}
      {lightboxImage && (
        <div className="lightbox-backdrop" onClick={() => { setLightboxImage(null); resetLightboxZoom(); }}>
          <div
            className="lightbox-modal animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            onWheel={handleLightboxWheel}
            onMouseMove={handleLightboxMouseMove}
            onMouseUp={handleLightboxMouseUp}
            onMouseLeave={handleLightboxMouseUp}
          >
            <button className="lightbox-close-btn" onClick={() => { setLightboxImage(null); resetLightboxZoom(); }} title="Cerrar vista previa">
              &times;
            </button>

            {/* Barra de controles de zoom */}
            <div className="lightbox-zoom-controls">
              <button
                className="lightbox-zoom-btn"
                onClick={() => setLightboxZoom(prev => { const n = Math.max(1, prev - 0.5); setLightboxPos(p => clampLightboxPos(n, p)); return n; })}
                title="Alejar (-)"
              >
                −
              </button>
              <span className="lightbox-zoom-label">{Math.round(lightboxZoom * 100)}%</span>
              <button
                className="lightbox-zoom-btn"
                onClick={() => setLightboxZoom(prev => Math.min(8, prev + 0.5))}
                title="Acercar (+)"
              >
                +
              </button>
              <button
                className="lightbox-zoom-btn lightbox-zoom-reset"
                onClick={resetLightboxZoom}
                title="Restablecer zoom (doble clic en la imagen)"
                disabled={lightboxZoom === 1}
              >
                ⟲
              </button>
            </div>

            <div className="lightbox-image-wrapper">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title || 'Afiche'}
                className={`lightbox-image ${lightboxZoom > 1 ? 'is-zoomed' : ''}`}
                style={{
                  transform: `scale(${lightboxZoom}) translate(${lightboxPos.x}px, ${lightboxPos.y}px)`,
                }}
                onDoubleClick={resetLightboxZoom}
                onMouseDown={handleLightboxMouseDown}
                draggable={false}
              />
            </div>
            {lightboxImage.title && (
              <div className="lightbox-caption">
                <h3>{lightboxImage.title}</h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {lightboxZoom > 1
                    ? 'Rueda del mouse o +/− para zoom — arrastra para mover — doble clic restablece — ESC cierra'
                    : 'Rueda del mouse para zoom — doble clic restablece — ESC o clic afuera cierran'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
