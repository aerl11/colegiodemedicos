"""
Servicio central de envío automático de certificados.

Lo usan tanto el comando de gestión `enviar_certificados` como el
programador interno que corre junto al servidor (ver scheduler.py).
"""
from datetime import timedelta

from django.utils import timezone

from inscripcion.models import Inscripcion
from inscripcion.utils import enviar_certificado_email


def enviar_certificados_pendientes(dias_atras=0, log=print):
    """
    Envía los certificados de todas las inscripciones cuya jornada ya culminó
    (fecha_final vencida) y que aún no tienen certificado_enviado=True.

    dias_atras: opcional, limita a jornadas culminadas hace N días o menos.
    log: función para registrar el avance (print, stdout.write, logger.info...).

    Devuelve (enviados, fallidos, total).
    """
    hoy = timezone.now().date()

    pendientes = Inscripcion.objects.filter(
        certificado_enviado=False,
        jornada__fecha_final__lte=hoy,  # la jornada culmina hoy o ya culminó
    ).select_related('usuario', 'usuario__perfil', 'jornada')

    if dias_atras:
        limite = hoy - timedelta(days=dias_atras)
        pendientes = pendientes.filter(jornada__fecha_final__gte=limite)

    total = pendientes.count()
    if total == 0:
        log('No hay certificados pendientes por enviar.')
        return 0, 0, 0

    log(f'Se encontraron {total} certificado(s) pendientes por enviar.')
    enviados, fallidos = 0, 0

    for inscripcion in pendientes:
        try:
            if enviar_certificado_email(inscripcion):
                inscripcion.certificado_enviado = True
                inscripcion.save(update_fields=['certificado_enviado'])
                enviados += 1
                log(f'  [OK] Enviado a {inscripcion.usuario.email} - {inscripcion.jornada.nombre}')
            else:
                fallidos += 1
                log(f'  [FALLO] No se pudo enviar a {inscripcion.usuario.email or "(sin correo)"} - {inscripcion.jornada.nombre}')
        except Exception as e:
            fallidos += 1
            log(f'  [ERROR] {inscripcion.jornada.nombre} -> {e}')

    log(f'Proceso terminado: {enviados} enviado(s), {fallidos} fallido(s), {total - enviados - fallidos} omitido(s).')
    return enviados, fallidos, total
