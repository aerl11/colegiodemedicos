"""
Storage que guarda los archivos de imagen directamente en la base de datos
(como bytea en Postgres/Neon) en vez del disco local.

Ventaja: las imágenes sobreviven a los deploys/reinicios de Render porque
viven en la misma BD que el resto de los datos.
"""
import os
import uuid

from django.core.files.base import ContentFile
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible


def _archivo_model():
    from .models import ArchivoImagen
    return ArchivoImagen


@deconstructible
class DatabaseStorage(Storage):
    """Django Storage API respaldado por la tabla jornada_archivoimagen."""

    def __init__(self):
        pass

    # ---------- Lectura ----------

    def _open(self, name, mode='rb'):
        try:
            archivo = _archivo_model().objects.get(ruta=name)
        except _archivo_model().DoesNotExist:
            raise FileNotFoundError(name)
        return ContentFile(archivo.contenido, name=name)

    def url(self, name):
        from django.urls import reverse
        try:
            return reverse('jornada-media', kwargs={'ruta': name})
        except Exception:
            return f"/api/jornada/media/{name}"

    # ---------- Escritura ----------

    def _save(self, name, content):
        # Genera una ruta única conservando carpeta y extensión
        carpeta, nombre_archivo = os.path.split(name)
        _, ext = os.path.splitext(nombre_archivo)
        ruta = os.path.join(carpeta, f"{uuid.uuid4().hex}{ext}").replace('\\', '/')

        content.seek(0)
        datos = content.read()

        content_type = getattr(content, 'content_type', '') or ''
        if not content_type:
            from mimetypes import guess_type
            content_type = guess_type(ruta)[0] or 'application/octet-stream'

        _archivo_model().objects.create(
            ruta=ruta,
            contenido=datos,
            content_type=content_type,
            tamano=len(datos),
        )
        return ruta

    # ---------- Utilidades ----------

    def exists(self, name):
        return _archivo_model().objects.filter(ruta=name).exists()

    def delete(self, name):
        _archivo_model().objects.filter(ruta=name).delete()

    def listdir(self, path=''):
        rutas = _archivo_model().objects.values_list('ruta', flat=True)
        dirs, files = set(), []
        for ruta in rutas:
            carpeta, nombre = os.path.split(ruta)
            if carpeta == path:
                files.append(nombre)
            elif carpeta.startswith(path):
                dirs.add(carpeta[len(path):].strip('/').split('/')[0])
        return list(dirs), files

    def size(self, name):
        try:
            return _archivo_model().objects.get(ruta=name).tamano
        except _archivo_model().DoesNotExist:
            return 0

    def get_available_name(self, name, max_length=None):
        # _save ya genera rutas únicas
        return name

    def generate_filename(self, filename):
        # upload_to ya viene aplicado por el FieldFile; solo normaliza separadores
        return filename.replace('\\', '/')

    def get_accessed_time(self, name):
        return _archivo_model().objects.get(ruta=name).fecha_subida

    def get_created_time(self, name):
        return _archivo_model().objects.get(ruta=name).fecha_subida

    def get_modified_time(self, name):
        return _archivo_model().objects.get(ruta=name).fecha_subida
