# 📘 Manual de Usuario — Plataforma de Jornadas Científicas COMEZU

**Colegio de Médicos del Estado Zulia (COMEZU)**
Sistema web para la gestión de jornadas científicas, inscripciones, pagos y certificados.

Versión del manual: 1.0 — [Fecha]

---

## 1. Introducción

Esta aplicación web permite a los médicos colegiados del estado Zulia:

- Registrarse en la plataforma (como médicos titulares o estudiantes).
- Consultar las jornadas científicas disponibles (con afiche, fechas, costo y créditos UC).
- Inscribirse en una jornada reportando su pago (pago móvil, transferencia o efectivo).
- Consultar sus inscripciones y pagos reportados.
- **Descargar su certificado** de participación en PDF una vez culminada la jornada.
- Los administradores (staff / superadmin) pueden además:
  - Gestionar (crear, editar, eliminar) jornadas científicas.
  - Gestionar usuarios de la plataforma.
  - Ver todos los pagos reportados y descargar un reporte general en PDF.

---

## 2. Requisitos de uso

- Un navegador web moderno (Chrome, Edge, Firefox, Safari).
- Conexión a internet.
- Correo electrónico válido para registrarse y recuperar la contraseña.
- Para inscribirse: los datos del comprobante de pago.

---

## 3. Acceso al sistema

### 3.1 Iniciar sesión

1. Abra la aplicación en su navegador.
2. Escriba su **nombre de usuario** y **contraseña**.
3. Presione el botón de acceso.

> 💡 Si ya había iniciado sesión anteriormente y la sesión sigue válida, el sistema lo llevará directamente al panel principal.
> ⏱️ Por seguridad, la sesión **expira tras 5 minutos de inactividad**; si eso ocurre, solo vuelva a iniciar sesión.

### 3.2 Registrarse (crear cuenta nueva)

El registro se realiza en **3 pasos**. Desde la pantalla de acceso, pulse la opción **"Registrarse"**.

**Paso 1 — Información Personal**
- **Identificación**: seleccione si es médico (tipo **D**) u otra categoría (p. ej. estudiante).
- **Cédula de identidad** y **Nacionalidad** (V / E).
- Si selecciona tipo **D** (médico): indique su **Número COMEZU** y **Especialidad**.
- **Sociedad científica a la que pertenece** (lista desplegable con las sociedades del COMEZU).
- Primer y segundo nombre, primer y segundo apellido.
- **Género**.

**Paso 2 — Datos de Contacto**
- Correo electrónico válido.
- Número de teléfono.

**Paso 3 — Crear Cuenta**
- Nombre de usuario.
- Contraseña (mínimo 8 caracteres; evite contraseñas comunes o solo números, el sistema las rechaza).
- Confirmación de contraseña.

Al finalizar, regrese a la pantalla de acceso e ingrese con sus credenciales.

### 3.3 Recuperar / restablecer contraseña

1. Desde la pantalla de acceso, pulse **"¿Olvidaste tu contraseña?"**.
2. Ingrese el correo asociado a su cuenta.
3. Recibirá un **código de 6 dígitos** por correo electrónico.
4. Ingrese el código junto con su nueva contraseña (mínimo 8 caracteres) y confírmela.
5. Inicie sesión con la nueva contraseña.

> Si no recibe el correo, revise la carpeta de spam o solicite un nuevo código.

### 3.4 Cerrar sesión

En el panel principal, abra el **menú de usuario** (icono de perfil, arriba a la derecha) y seleccione **Salir / Cerrar sesión**.

---

## 4. Uso de la aplicación (usuarios médicos)

Al iniciar sesión accede al **Panel principal**, con un menú lateral que contiene las siguientes secciones:

### 4.1 Jornadas (Inicio)

Pantalla principal con tarjetas de cada jornada científica. Cada tarjeta muestra:

- **Afiche** de la jornada (haga clic en la imagen para ampliarlo 🔍).
- **Nombre** y estado (**Activa** / **Inactiva**).
- **Fechas** de inicio y cierre.
- **Costo** en Bs.
- **Valor en créditos (UC)**.

Pulse **"Inscribirse"** en la tarjeta de la jornada deseada (solo disponible si la jornada está activa). Si ya está inscrito, el botón mostrará **"Ya Inscrito"**.

### 4.2 Inscribirse en una jornada y reportar el pago

Al pulsar "Inscribirse" se abre la ventana **"Registrar Pago e Inscripción"**:

1. **Forma de pago** — seleccione una:
   - **Pago Móvil (PM)**: se muestran los datos del banco BNC, teléfono y RIF del colegio. Realice el pago primero y luego registre la referencia.
   - **Transferencia Bancaria (TB)**: se muestra el número de cuenta corriente del BNC y el beneficiario (Colegio de Médicos del Estado Zulia, RIF J-07012462-8).
   - **Efectivo / Divisas (EF)**: realice el pago directamente en la taquilla de administración, donde le entregarán el comprobante y número de referencia.
2. **Número de referencia del pago** — copie la referencia del comprobante (obligatorio).
3. **Monto** — se precarga con el costo de la jornada; debe ser mayor a cero.
4. **Fecha de pago** — por defecto el día de hoy.
5. Pulse el botón de **registrar/confirmar**. Su inscripción queda registrada con el pago reportado.

### 4.3 Mis Inscripciones

Tabla con todas sus inscripciones:

| Columna | Descripción |
|---|---|
| Jornada Científica | Nombre de la jornada |
| Fecha de Inscripción | Fecha en que se inscribió |
| Monto Reportado | Monto del pago reportado |
| Referencia de Pago | Número de referencia y forma de pago |
| Estado | Inscrito / Pago Reportado |
| Acciones | **Descargar Certificado** |

> 🔒 **Certificados**: el botón de descarga permanece bloqueado hasta que **culmine la jornada** (fecha final). Una vez culminada, puede descargar su certificado en PDF. Los administradores pueden descargar certificados en cualquier momento.

### 4.4 Mis Pagos

Listado de sus pagos reportados: referencia, forma de pago, monto y fecha. Si tiene pagos registrados, puede pulsar **"Descargar Reporte PDF"** para obtener un listado oficial en PDF.

---

## 5. Secciones de administración (solo staff / superadmin)

Estas secciones aparecen en el menú lateral únicamente para usuarios con rol **staff** o **superadmin**.

### 5.1 Panel de Control de Jornadas

- **+ Nueva Jornada**: crea una jornada indicando nombre, fechas (inicio/fin), costo, créditos (UC), estado (Activa/Inactiva) y afiche (imagen).
- **Editar**: modifica los datos de una jornada existente (puede reemplazar o eliminar el afiche).
- **Eliminar**: elimina definitivamente una jornada (se pedirá confirmación).

En esta tabla también se ve el estado, costo y créditos de cada jornada, y se puede ampliar el afiche haciendo clic en la miniatura.

### 5.2 Panel de Control de Usuarios

- Lista todos los usuarios con su nombre, cédula, correo y **rol** (superadmin, staff o usuario).
- **Buscador**: filtre usuarios por nombre, apellido o cédula.
- **+ Nuevo Usuario**: crea cuentas manualmente.
- **Editar / Eliminar** usuarios existentes.

### 5.3 Inscripciones y Pagos globales

En las secciones **Inscripciones** y **Pagos**, los administradores ven la información de **todos** los participantes (columnas adicionales: Participante, correo y Cédula) y pueden:

- Descargar el **certificado** de cualquier inscripción.
- Descargar el **Reporte PDF general de pagos**.

---

## 6. Preguntas frecuentes (FAQ)

**❓ No puedo inscribirme en una jornada.**
Verifique que la jornada esté **Activa**. Las jornadas inactivas no permiten inscripción.

**❓ Ya pagué pero el botón dice "Ya Inscrito" sin confirmación de pago verificado.**
El sistema registra su pago como "reportado". Si hay algún inconveniente con la verificación, comuníquese con la administración del colegio.

**❓ No aparece el botón de descarga del certificado.**
El certificado se habilita automáticamente **a partir de la fecha final de la jornada**. Al pasar el cursor sobre el botón bloqueado se muestra la fecha de disponibilidad.

**❓ Mi sesión se cerró sola.**
Por seguridad la sesión expira tras **5 minutos de inactividad**. Vuelva a iniciar sesión.

**❓ Olvidé mi contraseña.**
Use la opción de recuperación: recibirá un código de 6 dígitos por correo electrónico.

**❓ El registro rechaza mi contraseña.**
Debe tener mínimo 8 caracteres, no puede ser muy común ni contener solo números.

---

## 7. Recomendaciones de seguridad

- No comparta su contraseña ni su sesión con otras personas.
- Use una contraseña única con letras, números y símbolos.
- Cierre sesión al terminar de usar la aplicación, especialmente en equipos compartidos.
- Verifique siempre los datos bancarios mostrados en la ventana de pago antes de transferir.

---

*Manual generado para la plataforma COMEZU (frontend React + backend Django REST).*
