# 📑 Documentación: Jornadas, Pagos e Inscripciones
**Colegio de Médicos del Estado Zulia**

Este documento detalla la estructura de datos, endpoints y el flujo unificado para la publicación de jornadas científicas, reporte de pagos y el proceso automático de inscripción de los participantes.

---

## 🗺️ Diagrama del Flujo Unificado (Mermaid)

El sistema utiliza un flujo unificado y simplificado. En lugar de realizar dos llamadas API por separado (una para registrar el pago y otra para inscribir), el frontend realiza **una sola llamada**. El backend gestiona de manera transaccional e íntegra el alta de ambos modelos.

```mermaid
sequenceDiagram
    autonumber
    actor P as Participante (React)
    participant API as Backend (Django REST)
    database DB as Base de Datos (PostgreSQL/SQLite)

    Note over P: Visualiza las Jornadas y hace clic en "Inscribirse"
    P->>API: POST /api/pago/ (monto, ref, fecha, jornada_id) con Token JWT
    Note over API: Valida Token JWT e identifica al usuario autenticado
    
    rect rgb(240, 248, 255)
        Note over API: PagoSerializer.create()
        API->>DB: Guarda el registro en tabla "Pago"
        API->>DB: Crea registro en tabla "Inscripcion" (usuario, jornada, pago)
    end
    
    API-->>P: Retorna 201 Created (Éxito en Pago e Inscripción)
    
    Note over API: Enviar correo automático en segundo plano
    API-)P: Notificación por Correo Electrónico
```

---

## 💾 Modelos de Base de Datos

### 1. Jornada Científica (`jornada.models.Jornada`)
Representa cada evento o curso científico organizado por el Colegio de Médicos.

*   `nombre` (CharField): Nombre descriptivo de la jornada.
*   `fecha_inicio` (DateField): Fecha de inicio del evento.
*   `fecha_final` (DateField): Fecha en la que concluye.
*   `costo` (DecimalField): Precio de la entrada/inscripción en Bolívares (Bs.).
*   `uc` (IntegerField): Créditos de valoración gremial asignados (Unidades de Crédito).
*   `estado_jornada` (CharField): Estado actual del evento (`A` para Activa, `I` para Inactiva).

### 2. Pago (`pago.models.Pago`)
Almacena el reporte del pago del participante mediante transferencia bancaria o depósito.

*   `usuario` (ForeignKey a User): Participante que realizó el pago.
*   `referencia_pago` (CharField): Código de referencia único de la transacción bancaria.
*   `monto` (DecimalField): Cantidad depositada o transferida.
*   `fecha_pago` (DateField): Fecha en la que se efectuó la transacción.

### 3. Inscripción (`inscripcion.models.Inscripcion`)
Entidad pivote que asocia a un usuario con una jornada científica una vez que su pago es registrado.

*   `usuario` (ForeignKey a User): Participante inscrito.
*   `jornada` (ForeignKey a Jornada): Jornada a la que se inscribe.
*   `pago` (OneToOneField a Pago): Relación única con el comprobante de pago.
*   `fecha_inscripcion` (DateTimeField): Fecha y hora del registro automático de la inscripción (`auto_now_add=True`).

*Restricciones*: Tiene una llave única compuesta (`unique_together = ('usuario', 'jornada')`) para evitar que un usuario se inscriba más de una vez a una misma jornada.

---

## 🔌 Especificación de la API (Endpoints)

### 1. Obtener Jornadas
*   **Ruta**: `GET /api/jornada/`
*   **Autenticación**: Ninguna (Público).
*   **Respuesta Exitosa (200 OK)**:
    ```json
    [
      {
        "id": 1,
        "nombre": "Congreso de Cardiología 2026",
        "fecha_inicio": "2026-06-15",
        "fecha_final": "2026-06-18",
        "costo": "150.00",
        "uc": 5,
        "estado_jornada": "A"
      }
    ]
    ```

### 2. Registrar Pago e Inscripción (Flujo Unificado)
*   **Ruta**: `POST /api/pago/`
*   **Autenticación**: Requerida (Cabecera `Authorization: Bearer <JWT_TOKEN>`).
*   **Payload del Request**:
    ```json
    {
      "referencia_pago": "REF12345678",
      "monto": "150.00",
      "fecha_pago": "2026-06-02",
      "jornada_id": 1
    }
    ```
*   **Respuesta Exitosa (201 Created)**:
    ```json
    {
      "id": 12,
      "referencia_pago": "REF12345678",
      "monto": "150.00",
      "fecha_pago": "2026-06-02",
      "usuario": 3
    }
    ```
    *(Nota: El backend crea automáticamente la fila de `Inscripcion` vinculando el usuario autenticado con la jornada y envía un correo electrónico de confirmación).*

### 3. Obtener Mis Inscripciones
*   **Ruta**: `GET /api/inscripcion/`
*   **Autenticación**: Requerida (Cabecera `Authorization: Bearer <JWT_TOKEN>`).
*   **Respuesta Exitosa (200 OK)** (Filtra de forma segura para retornar solo los registros del usuario logueado):
    ```json
    [
      {
        "id": 5,
        "usuario": 3,
        "usuario_data": {
          "id": 3,
          "username": "CarloMa02@gmail.com",
          "first_name": "Carlos",
          "last_name": "Maldonado",
          "email": "CarloMa02@gmail.com",
          "rol": "participante",
          "tipo": "D",
          "cedula": "24123456",
          "telefono": "04122812685",
          "genero": "M",
          "is_active": true
        },
        "jornada": 1,
        "jornada_data": {
          "id": 1,
          "nombre": "Congreso de Cardiología 2026",
          "fecha_inicio": "2026-06-15",
          "fecha_final": "2026-06-18",
          "costo": "150.00",
          "uc": 5,
          "estado_jornada": "A"
        },
        "pago": 12,
        "pago_data": {
          "id": 12,
          "referencia_pago": "REF12345678",
          "monto": "150.00",
          "fecha_pago": "2026-06-02"
        },
        "fecha_inscripcion": "2026-06-02T14:31:00Z"
      }
    ]
    ```

---

## 📧 Notificaciones por Correo Integradas
Cuando se completa con éxito el registro del pago, el backend dispara de forma asíncrona un correo de confirmación de inscripción al participante con el siguiente formato:
*   **Asunto**: `Inscripción Confirmada - Colegio de Médicos del Edo. Zulia`
*   **Contenido**: Detalles del participante, título del evento científico, monto reportado y referencia bancaria guardada.
