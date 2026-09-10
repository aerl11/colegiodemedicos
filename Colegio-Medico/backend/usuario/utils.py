from django.core.mail import send_mail
from django.conf import settings

def enviar_confirmacion_registro(email_usuario, nombre_usuario, apellido_usuario):
    subject = '¡Bienvenido! Registro Exitoso'

    # Texto plano (respaldo)
    message = f'Hola {nombre_usuario}, tu registro se ha completado con éxito.'

    # Diseño HTML sencillo
    html_message = f"""
    <div style="font-family: sans-serif; color: #333; max-width: 500px; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #2c3e50;">¡Hola, {nombre_usuario} {apellido_usuario}!</h2>
        <p style="font-size: 16px;">Te informamos que tu cuenta ha sido creada exitosamente en nuestra plataforma.</p>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">


        <p style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">
            Este es un correo automático, no es necesario responder.
        </p>
    </div>
    """

    try:
        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,
            [email_usuario],
            fail_silently=False,
            html_message=html_message
        )

    except Exception as e:
        print(f"Error al enviar al correo: {e}")


from django.core.mail import send_mail
from django.conf import settings

def enviar_correo_inscripcion(email_usuario, nombre_usuario, tipo_usuario, nombre_jornada, monto, referencia):
    subject = f'Confirmación de Inscripción: {nombre_jornada}'

    if tipo_usuario == 'D':
        saludo_nombre = f"Dr(a). {nombre_usuario}"
    else:
        saludo_nombre = nombre_usuario

    message = f'Hola {saludo_nombre}, tu inscripción a la jornada {nombre_jornada} ha sido procesada.'

    html_message = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2c3e50; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Confirmación de Inscripción</h1>
        </div>
        <div style="padding: 30px; color: #333333; line-height: 1.6;">
            <p style="font-size: 18px;">Estimado(a) <strong>{saludo_nombre}</strong>,</p>
            <p>Es un placer saludarte. Te confirmamos que tu proceso de inscripción ha sido exitoso.</p>

            <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 25px 0; border-left: 5px solid #27ae60;">
                <h3 style="margin-top: 0; color: #27ae60;">Detalles de la Inscripción</h3>
                <p style="margin: 5px 0;"><strong>Evento:</strong> {nombre_jornada}</p>
                <p style="margin: 5px 0;"><strong>Monto pagado:</strong> Bs.{monto}</p>
                <p style="margin: 5px 0;"><strong>Referencia de pago:</strong> {referencia}</p>
            </div>

            <p>A partir de ahora, ya formas parte de este evento.</p>
        </div>
    </div>
    """

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [email_usuario],
        fail_silently=False,
        html_message=html_message
    )


from django.db import connection

def reset_model_sequence(sender):
    """
    Reinicia el contador autoincremental de la tabla de la base de datos
    al valor máximo actual (MAX(id)).
    Si la tabla queda vacía, reinicia el contador para que el siguiente ID sea 1.
    Compatible con SQLite, PostgreSQL y MySQL/MariaDB.
    """
    try:
        # Ignorar modelos abstractos o proxy que no tienen tabla física propia
        if not hasattr(sender, '_meta') or sender._meta.abstract or sender._meta.proxy:
            return

        table_name = sender._meta.db_table
        pk_field = sender._meta.pk
        if not pk_field:
            return

        pk_col = pk_field.column
        vendor = connection.vendor

        with connection.cursor() as cursor:
            if vendor == 'sqlite':
                # Comprobar si existe la tabla de secuencias de SQLite
                cursor.execute(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name='sqlite_sequence';"
                )
                if cursor.fetchone():
                    cursor.execute(f'SELECT MAX("{pk_col}") FROM "{table_name}"')
                    row = cursor.fetchone()
                    max_id = row[0] if (row and row[0] is not None) else 0

                    if max_id == 0:
                        cursor.execute("DELETE FROM sqlite_sequence WHERE name = %s", [table_name])
                    else:
                        cursor.execute(
                            "UPDATE sqlite_sequence SET seq = %s WHERE name = %s",
                            [max_id, table_name]
                        )
                        if cursor.rowcount == 0:
                            cursor.execute(
                                "INSERT INTO sqlite_sequence (name, seq) VALUES (%s, %s)",
                                [table_name, max_id]
                            )

            elif vendor == 'postgresql':
                cursor.execute(f'SELECT MAX("{pk_col}") FROM "{table_name}"')
                row = cursor.fetchone()
                max_id = row[0]
                if max_id is not None:
                    cursor.execute("SELECT setval(pg_get_serial_sequence(%s, %s), %s, true);", [table_name, pk_col, max_id])
                else:
                    cursor.execute("SELECT setval(pg_get_serial_sequence(%s, %s), 1, false);", [table_name, pk_col])

            elif vendor == 'mysql':
                cursor.execute(f'SELECT MAX(`{pk_col}`) FROM `{table_name}`')
                row = cursor.fetchone()
                max_id = row[0] if (row and row[0] is not None) else 0
                cursor.execute(f'ALTER TABLE `{table_name}` AUTO_INCREMENT = {max_id + 1};')

    except Exception:
        # No bloquear operaciones si ocurre un problema en tablas no autoincrementales
        pass
