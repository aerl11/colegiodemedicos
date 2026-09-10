// ============================================================
//  Servicio API – Colegio de Médicos del Edo. Zulia
//  Centraliza todas las peticiones al backend Django.
// ============================================================

// URL del backend. En desarrollo apunta a localhost; en producción define
// VITE_API_URL en el archivo .env del frontend (ej: VITE_API_URL=https://mi-backend.onrender.com/api)
const BASE_URL = import.meta.env.VITE_API_URL || 'https://colegiodemedicos.onrender.com/api';

// ---------- Helpers de almacenamiento de tokens ----------

export const getAccessToken  = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');

export const saveTokens = (access, refresh) => {
  localStorage.setItem('access_token',  access);
  localStorage.setItem('refresh_token', refresh);
};

export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
};

export const getUserData = () => {
  const data = localStorage.getItem('user_data');
  try {
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// ---------- Función fetch con autorización automática ----------

async function apiFetch(endpoint, options = {}) {
  const headers = {
    ...options.headers,
  };

  // Solo definimos Content-Type: application/json si no es un FormData (los navegadores configuran el boundary automáticamente)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Si el servidor devuelve 401 (token expirado), intenta renovar
  if (response.status === 401 && getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getAccessToken()}`;
      return fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    } else {
      clearTokens();
      window.location.reload();
    }
  }

  return response;
}

// ---------- Renovar token de acceso ----------

async function refreshAccessToken() {
  try {
    const res = await fetch(`${BASE_URL}/usuario/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: getRefreshToken() }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    saveTokens(data.access, data.refresh || getRefreshToken());
    return true;
  } catch {
    return false;
  }
}

// ============================================================
//  ENDPOINTS DE USUARIO
// ============================================================

/**
 * Iniciar sesión.
 * @param {string} username
 * @param {string} password
 * @returns {{ access_token, refresh_token, user, first_name, last_name, email, rol, tipo }}
 */
export async function login(username, password) {
  const res = await fetch(`${BASE_URL}/usuario/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    // Django devuelve { detail: "..." } o { non_field_errors: [...] }
    const msg =
      data?.detail ||
      data?.non_field_errors?.[0] ||
      'Usuario o contraseña incorrectos.';
    throw new Error(msg);
  }

  // Guardar tokens y datos del usuario
  saveTokens(data.access_token, data.refresh_token);
  localStorage.setItem('user_data', JSON.stringify({
    id:         data.id,
    username:   data.user,
    first_name: data.first_name,
    last_name:  data.last_name,
    email:      data.email,
    rol:        data.rol,
    tipo:       data.tipo,
    conferencista: data.conferencista,
  }));

  return data;
}

/**
 * Obtener la información del usuario autenticado actualmente en el backend.
 * Permite validar la sesión activa al recargar la página.
 */
export async function getMe() {
  const res = await apiFetch('/usuario/auth/me/');
  if (!res.ok) {
    throw new Error('Sesión inválida o expirada.');
  }
  const data = await res.json();

  localStorage.setItem('user_data', JSON.stringify({
    id:            data.id,
    username:      data.user,
    first_name:    data.first_name,
    last_name:     data.last_name,
    email:         data.email,
    rol:           data.rol,
    tipo:          data.tipo,
    nacionalidad:  data.nacionalidad,
    cedula:        data.cedula,
    telefono:      data.telefono,
    comezu:        data.comezu,
    especialidad:  data.especialidad,
    genero:        data.genero,
    conferencista: data.conferencista,
  }));

  return data;
}

/**
 * Registrar un nuevo usuario (participante público).
 * @param {object} formData – campos que acepta EmployeeCreateUpdateSerializer
 */
export async function register(formData) {
  const res = await fetch(`${BASE_URL}/usuario/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  const data = await res.json();

  if (!res.ok) {
    // Devuelve el primer mensaje de error del servidor
    const firstKey = Object.keys(data)[0];
    const msg = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
    throw new Error(msg || 'Error al registrar usuario.');
  }

  return data; // { message: "¡Registro exitoso!..." }
}

/**
 * Cerrar sesión (elimina tokens locales).
 */
export function logout() {
  clearTokens();
}

// ============================================================
//  ENDPOINTS PROTEGIDOS (ejemplos para uso futuro)
// ============================================================

export async function getMedicosList() {
  const res = await apiFetch('/usuario/medicos-lista/');
  if (!res.ok) throw new Error('No autorizado o error al obtener médicos.');
  return res.json();
}

/**
 * Obtener lista de todos los usuarios (solo superadmin/staff).
 */
export async function getUsers() {
  const res = await apiFetch('/usuario/gestion-usuarios/');
  if (!res.ok) throw new Error('No autorizado o error al obtener usuarios.');
  return res.json();
}

/**
 * Crear un nuevo usuario (solo superadmin/staff).
 */
export async function createUser(userData) {
  const res = await apiFetch('/usuario/gestion-usuarios/', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const data = await res.json();
    const firstKey = Object.keys(data)[0];
    const msg = Array.isArray(data[firstKey]) ? data[firstKey][0] : (data?.detail || 'Error al crear el usuario.');
    throw new Error(msg);
  }
  return res.json();
}

/**
 * Actualizar un usuario existente (solo superadmin/staff).
 */
export async function updateUser(id, userData) {
  const res = await apiFetch(`/usuario/gestion-usuarios/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const data = await res.json();
    const firstKey = Object.keys(data)[0];
    const msg = Array.isArray(data[firstKey]) ? data[firstKey][0] : (data?.detail || 'Error al actualizar el usuario.');
    throw new Error(msg);
  }
  return res.json();
}

/**
 * Eliminar un usuario (solo superadmin/staff).
 */
export async function deleteUser(id) {
  const res = await apiFetch(`/usuario/gestion-usuarios/${id}/`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Error al eliminar el usuario.');
  }
  return true;
}

// ============================================================
//  ENDPOINTS PARA JORNADAS, PAGOS E INSCRIPCIONES
// ============================================================

/**
 * Obtener la lista de Jornadas.
 */
export async function getJornadas() {
  const res = await apiFetch('/jornada/');
  if (!res.ok) throw new Error('Error al obtener la lista de jornadas.');
  return res.json();
}

/**
 * Crear una nueva Jornada.
 */
export async function createJornada(jornadaData) {
  const isFormData = jornadaData instanceof FormData;
  const res = await apiFetch('/jornada/', {
    method: 'POST',
    body: isFormData ? jornadaData : JSON.stringify(jornadaData),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    let msg = 'Error al crear la jornada.';
    if (data && typeof data === 'object') {
      if (data.detail) {
        msg = data.detail;
      } else {
        const keys = Object.keys(data);
        if (keys.length > 0) {
          const val = data[keys[0]];
          msg = Array.isArray(val) ? val[0] : (typeof val === 'string' ? val : JSON.stringify(val));
        }
      }
    }
    throw new Error(msg);
  }
  return res.json();
}

/**
 * Actualizar una Jornada existente.
 */
export async function updateJornada(id, jornadaData) {
  const isFormData = jornadaData instanceof FormData;
  const res = await apiFetch(`/jornada/${id}/`, {
    method: 'PATCH',
    body: isFormData ? jornadaData : JSON.stringify(jornadaData),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    let msg = 'Error al actualizar la jornada.';
    if (data && typeof data === 'object') {
      if (data.detail) {
        msg = data.detail;
      } else {
        const keys = Object.keys(data);
        if (keys.length > 0) {
          const val = data[keys[0]];
          msg = Array.isArray(val) ? val[0] : (typeof val === 'string' ? val : JSON.stringify(val));
        }
      }
    }
    throw new Error(msg);
  }
  return res.json();
}

/**
 * Eliminar una Jornada.
 */
export async function deleteJornada(id) {
  const res = await apiFetch(`/jornada/${id}/`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Error al eliminar la jornada.');
  }
  return true;
}

/**
 * Registrar un Pago (el backend también crea la Inscripción automáticamente via jornada_id).
 * @param {object} pagoData – { fecha_pago, monto, referencia_pago, usuario, jornada_id }
 */
export async function createPago(pagoData) {
  const res = await apiFetch('/pago/', {
    method: 'POST',
    body: JSON.stringify(pagoData),
  });
  if (!res.ok) {
    const data = await res.json();
    const firstKey = Object.keys(data)[0];
    const msg = Array.isArray(data[firstKey]) ? data[firstKey][0] : (data?.detail || 'Error al procesar el pago.');
    throw new Error(msg);
  }
  return res.json();
}

/**
 * Obtener la lista de Pagos (el participante ve los suyos y el administrador ve todos).
 */
export async function getPagos() {
  const res = await apiFetch('/pago/');
  if (!res.ok) throw new Error('Error al obtener la lista de pagos.');
  return res.json();
}

/**
 * Crear una Inscripción (asocia usuario, jornada y pago).
 * @param {object} inscripcionData – { jornada, pago }
 */
export async function createInscripcion(inscripcionData) {
  const res = await apiFetch('/inscripcion/', {
    method: 'POST',
    body: JSON.stringify(inscripcionData),
  });
  if (!res.ok) {
    const data = await res.json();
    const msg = data?.detail || 'Error al procesar la inscripción.';
    throw new Error(msg);
  }
  return res.json();
}

/**
 * Obtener las inscripciones del usuario.
 */
export async function getInscripciones() {
  const res = await apiFetch('/inscripcion/');
  if (!res.ok) throw new Error('Error al obtener tus inscripciones.');
  return res.json();
}

/**
 * Descargar el reporte completo de pagos en formato PDF.
 */
export async function downloadReportePagosPdf() {
  const res = await apiFetch('/pago/reporte-pdf/');
  if (!res.ok) {
    throw new Error('Error al generar el reporte de pagos en PDF.');
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Reporte_Pagos_${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

