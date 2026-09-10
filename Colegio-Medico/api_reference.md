# URLs del Backend — Colegio de Médicos del Edo. Zulia

Base: `http://127.0.0.1:8000`

---

## 🔓 Públicas (sin token)

| Método | URL completa | Uso |
|--------|-------------|-----|
| `POST` | `http://127.0.0.1:8000/api/usuario/auth/login/` | Iniciar sesión |
| `POST` | `http://127.0.0.1:8000/api/usuario/auth/refresh/` | Renovar token |
| `POST` | `http://127.0.0.1:8000/api/usuario/auth/verify/` | Verificar validez de token |
| `POST` | `http://127.0.0.1:8000/api/usuario/auth/register/` | Registrar cuenta nueva |

---

## 🔐 Autenticadas (Cualquier usuario logueado con Token Bearer)

| Método | URL completa | Uso |
|--------|-------------|-----|
| `GET` | `http://127.0.0.1:8000/api/usuario/auth/me/` | Obtener datos del usuario logueado / persistencia de sesión |

---

## 👑 Superadmin

| Método | URL completa | Uso |
|--------|-------------|-----|
| `GET` | `http://127.0.0.1:8000/api/usuario/gestion-usuarios/` | Listar todos los usuarios |
| `POST` | `http://127.0.0.1:8000/api/usuario/gestion-usuarios/` | Crear usuario con cualquier rol |
| `GET` | `http://127.0.0.1:8000/api/usuario/gestion-usuarios/{id}/` | Ver un usuario |
| `PUT` | `http://127.0.0.1:8000/api/usuario/gestion-usuarios/{id}/` | Editar usuario completo |
| `PATCH` | `http://127.0.0.1:8000/api/usuario/gestion-usuarios/{id}/` | Editar campo específico |
| `DELETE` | `http://127.0.0.1:8000/api/usuario/gestion-usuarios/{id}/` | Eliminar usuario |
| `GET` | `http://127.0.0.1:8000/api/usuario/medicos-lista/` | Listar solo médicos |

---

## 🧑‍💼 Staff + Superadmin

| Método | URL completa | Uso |
|--------|-------------|-----|
| `GET` | `http://127.0.0.1:8000/api/usuario/medicos-lista/` | Listar médicos registrados |

---

## 👤 Participante + Staff + Superadmin

| Método | URL completa | Uso |
|--------|-------------|-----|
| `GET` | `http://127.0.0.1:8000/api/inscripcion/` | Listar inscripciones |
| `POST` | `http://127.0.0.1:8000/api/inscripcion/` | Crear inscripción |
| `GET` | `http://127.0.0.1:8000/api/inscripcion/{id}/` | Ver inscripción |
| `PUT` | `http://127.0.0.1:8000/api/inscripcion/{id}/` | Editar inscripción completa |
| `PATCH` | `http://127.0.0.1:8000/api/inscripcion/{id}/` | Editar campo de inscripción |
| `DELETE` | `http://127.0.0.1:8000/api/inscripcion/{id}/` | Eliminar inscripción |

---

## 📅 Cualquier usuario autenticado

| Método | URL completa | Uso |
|--------|-------------|-----|
| `GET` | `http://127.0.0.1:8000/api/jornada/` | Listar jornadas |
| `POST` | `http://127.0.0.1:8000/api/jornada/` | Crear jornada |
| `GET` | `http://127.0.0.1:8000/api/jornada/{id}/` | Ver jornada |
| `PUT` | `http://127.0.0.1:8000/api/jornada/{id}/` | Editar jornada completa |
| `PATCH` | `http://127.0.0.1:8000/api/jornada/{id}/` | Editar campo de jornada |
| `DELETE` | `http://127.0.0.1:8000/api/jornada/{id}/` | Eliminar jornada |

---

## 💳 Pagos (Participante / Staff / Superadmin)

| Método | URL completa | Uso |
|--------|-------------|-----|
| `GET` | `http://127.0.0.1:8000/api/pago/` | Listar pagos |
| `GET` | `http://127.0.0.1:8000/api/pago/reporte-pdf/` | Descargar reporte oficial de pagos en formato PDF |
| `POST` | `http://127.0.0.1:8000/api/pago/` | Registrar pago |
| `GET` | `http://127.0.0.1:8000/api/pago/{id}/` | Ver pago |
| `PUT` | `http://127.0.0.1:8000/api/pago/{id}/` | Editar pago completo |
| `PATCH` | `http://127.0.0.1:8000/api/pago/{id}/` | Editar campo de pago |
| `DELETE` | `http://127.0.0.1:8000/api/pago/{id}/` | Eliminar pago |

---

## 🔧 Admin Django

| URL | Uso |
|-----|-----|
| `http://127.0.0.1:8000/admin/` | Panel de administración (requiere is_staff o is_superuser) |
