"""Señales para limpiar archivos de imagen de la BD cuando se borran o reemplazan."""
from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver

from .models import Jornada, ProgramacionJornada


@receiver(post_delete, sender=Jornada)
@receiver(post_delete, sender=ProgramacionJornada)
def borrar_archivo_al_eliminar(sender, instance, **kwargs):
    """Al borrar el registro, borra también su archivo de la tabla ArchivoImagen."""
    if instance.imagen and instance.imagen.name:
        instance.imagen.delete(save=False)


@receiver(pre_save, sender=Jornada)
@receiver(pre_save, sender=ProgramacionJornada)
def borrar_archivo_al_reemplazar(sender, instance, **kwargs):
    """Si se reemplaza la imagen por otra, borra el archivo viejo de la BD."""
    if not instance.pk:
        return
    try:
        vieja = sender.objects.get(pk=instance.pk).imagen
    except sender.DoesNotExist:
        return
    nueva_name = instance.imagen.name if instance.imagen else None
    vieja_name = vieja.name if vieja else None
    if vieja_name and vieja_name != nueva_name:
        vieja.delete(save=False)
