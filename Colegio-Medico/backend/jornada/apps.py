from django.apps import AppConfig

class JornadaConfig(AppConfig):
    name = 'jornada'

    def ready(self):
        # Limpieza de archivos de imagen de la BD al borrar/reemplazar
        from . import signals  # noqa: F401
