# URLs e Interfaces del Colegio de Médicos

Aquí tienes las rutas principales para acceder a las diferentes partes del sistema.

## 🌐 Frontend (React)

El frontend está corriendo localmente en el puerto 5173. Dado que la aplicación usa un enrutador basado en estados (Single Page Application sin React Router), todas las vistas se manejan desde la URL principal.

*   **URL Principal**: [http://localhost:5173](http://localhost:5173)

### Vistas Disponibles en el Frontend:

Al entrar a la URL principal, podrás navegar por las siguientes interfaces dependiendo de tus acciones:

1.  **Inicio de Sesión (Login)**: Es la pantalla por defecto al entrar si no tienes una sesión activa.
2.  **Registro**: Accesible haciendo clic en "¿No tienes cuenta? Regístrate aquí" desde la pantalla de Login.
3.  **Recuperar Contraseña**: Accesible haciendo clic en "¿Olvidaste tu contraseña?" desde la pantalla de Login.
4.  **Dashboard Principal**:
    *   Accesible automáticamente después de iniciar sesión correctamente.
    *   **Pestaña Jornadas**: Muestra la lista de jornadas científicas disponibles con opción a inscribirse/pagar.
    *   **Pestaña Historial**: Muestra las inscripciones y pagos realizados por el usuario actual.

---

## ⚙️ Backend (Django)

El backend expone la API y el panel de administración. Está corriendo localmente en el puerto 8000.

### Panel de Administración

Puedes acceder al panel de Django para administrar usuarios, jornadas, pagos e inscripciones directamente:

*   **URL**: [http://localhost:8000/admin/](http://localhost:8000/admin/)
*   **Credenciales**: Necesitarás una cuenta de superusuario (`superuser`) de Django para entrar aquí.

### Endpoints de la API REST

Estas son las rutas principales de la API. (No diseñadas para navegar por el navegador, sino para consumirse vía frontend o Postman/Insomnia):

*   **Autenticación y Usuarios**:
    *   Login (Obtener Token): `POST http://localhost:8000/api/token/`
    *   Refresh Token: `POST http://localhost:8000/api/token/refresh/`
    *   Registro de Usuario: `POST http://localhost:8000/api/register/`
    *   Perfil Actual: `GET http://localhost:8000/api/perfil/`
*   **Jornadas**:
    *   Listar Jornadas: `GET http://localhost:8000/api/jornada/`
*   **Pagos e Inscripciones**:
    *   Listar Mis Pagos: `GET http://localhost:8000/api/pago/`
    *   Registrar un Pago (e Inscripción): `POST http://localhost:8000/api/pago/`
    *   Listar Mis Inscripciones: `GET http://localhost:8000/api/inscripcion/`
