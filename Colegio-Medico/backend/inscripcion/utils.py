from django.core.mail import EmailMessage
from django.conf import settings

from .certificados import generar_certificado_pdf, nombre_archivo_certificado


def enviar_certificado_email(inscripcion):
    """
    Genera el certificado de la inscripción y se lo envía por correo al usuario,
    con un mensaje que alerta que recibió el certificado por su participación
    en la jornada. Devuelve True si el correo se envió correctamente.
    """
    usuario = inscripcion.usuario
    jornada = inscripcion.jornada

    if not usuario.email:
        return False

    try:
        archivo = generar_certificado_pdf(inscripcion)
    except ValueError as e:
        print(f"[Certificados] {e}")
        return False

    saludo_nombre = (usuario.first_name or "").strip() or usuario.username.strip()
    try:
        if usuario.perfil.tipo == 'D':
            saludo_nombre = f"Dra. {saludo_nombre}" if usuario.perfil.genero == 'F' else f"Dr. {saludo_nombre}"
    except Exception:
        pass

    subject = f'🎓 Su certificado de participación está disponible: {jornada.nombre}'

    message = (
        f'Hola {saludo_nombre}, adjuntamos su certificado de participación '
        f'en la jornada "{jornada.nombre}".'
    )

    html_message = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2c3e50; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🎓 ¡Felicidades, {saludo_nombre}!</h1>
        </div>
        <div style="padding: 30px; color: #333333; line-height: 1.6;">
            <p style="font-size: 18px;">Ha recibido este correo porque <strong>participó en la jornada científica
            <strong>{jornada.nombre}</strong> y su certificado está listo.</p>

            <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 25px 0; border-left: 5px solid #27ae60;">
                <h3 style="margin-top: 0; color: #27ae60;">Detalles de la jornada</h3>
                <p style="margin: 5px 0;"><strong>Evento:</strong> {jornada.nombre}</p>
                <p style="margin: 5px 0;"><strong>Fecha de culminación:</strong> {jornada.fecha_final.strftime('%d/%m/%Y')}</p>
                <p style="margin: 5px 0;"><strong>Unidades de crédito:</strong> {jornada.uc or '—'}</p>
            </div>

            <p>El certificado en formato <strong>PDF</strong> va adjunto a este correo. También puede
            descargarlo en cualquier momento desde su panel de inscripciones en la plataforma.</p>

            <p>Gracias por su participación. ¡Esperamos contar con usted en próximas jornadas!</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #999;">
                Este es un correo automático del Colegio de Médicos del Estado Zulia (COMEZU), no es necesario responder.
            </p>
        </div>
    </div>
    """

    correo = EmailMessage(
        subject=subject,
        body=message,
        from_email=settings.EMAIL_HOST_USER,
        to=[usuario.email],
    )
    correo.attach(
        nombre_archivo_certificado(inscripcion),
        archivo.read(),
        'application/pdf'
    )
    try:
        correo.send(fail_silently=False)
        return True
    except Exception as e:
        print(f"[Certificados] Error al enviar el correo a {usuario.email}: {e}")
        return False
