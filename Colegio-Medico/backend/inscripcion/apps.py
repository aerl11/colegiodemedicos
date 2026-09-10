from django.apps import AppConfig

class InscripcionConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'inscripcion'

    def ready(self):
        import inscripcion.signals # Importante para activar el envío

        # Programador automático de certificados: envía los certificados de las
        # jornadas culminadas sin intervención manual. El lock del scheduler
        # evita ejecuciones duplicadas si hay varios procesos del servidor.
        from inscripcion.scheduler import iniciar_scheduler
        iniciar_scheduler()