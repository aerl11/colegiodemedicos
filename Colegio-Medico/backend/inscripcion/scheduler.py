"""
Programador interno: revisa periódicamente si hay jornadas culminadas con
certificados pendientes y los envía automáticamente por correo.

Arranca una sola vez junto con el servidor Django (ver apps.py ready()).
Se ejecuta en un hilo daemon, por lo que no bloquea las peticiones ni
impide que el servidor se apague normalmente.

Es idempotente: el campo certificado_enviado de cada inscripción evita
envíos duplicados, y cada proceso usa un lock de archivo para que si
corren varios servidores (runserver + workers) solo uno revise a la vez.
"""
import os
import threading
import time
from datetime import datetime

from django.conf import settings

INTERVALO_SEGUNDOS = 60 * 60  # revisa cada hora
_lock_file = os.path.join(settings.BASE_DIR, '.certificados_scheduler.lock')


def _adquirir_lock():
    """Lock simple basado en archivo para evitar ejecuciones concurrentes."""
    try:
        if os.path.exists(_lock_file):
            edad = time.time() - os.path.getmtime(_lock_file)
            # Si el lock tiene más de 2 horas, asumimos que quedó huérfano tras un crash
            if edad < INTERVALO_SEGUNDOS * 2:
                return False
        with open(_lock_file, 'w') as f:
            f.write(str(os.getpid()))
        return True
    except OSError:
        return False


def _liberar_lock():
    try:
        if os.path.exists(_lock_file):
            os.remove(_lock_file)
    except OSError:
        pass


def _log(mensaje):
    print(f'[Certificados {datetime.now().strftime("%d/%m/%Y %H:%M")}] {mensaje}', flush=True)


def _bucle_scheduler():
    # Primera revisión poco después de arrancar el servidor
    time.sleep(15)

    while True:
        if _adquirir_lock():
            try:
                from inscripcion.servicios_certificados import enviar_certificados_pendientes
                enviar_certificados_pendientes(log=_log)
            except Exception as e:
                _log(f'[ERROR] Falló la revisión de certificados: {e}')
            finally:
                _liberar_lock()
        time.sleep(INTERVALO_SEGUNDOS)


def iniciar_scheduler():
    hilo = threading.Thread(target=_bucle_scheduler, name='scheduler-certificados', daemon=True)
    hilo.start()
    _log('Programador de certificados iniciado (revisa cada hora).')
