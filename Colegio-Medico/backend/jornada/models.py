from django.db import models
from .db_storage import DatabaseStorage


class ArchivoImagen(models.Model):
    """Tabla que guarda los bytes de las imágenes de jornadas/programaciones
    directamente en la base de datos (bytea en Postgres/Neon)."""
    ruta = models.CharField(max_length=500, unique=True, db_index=True)
    contenido = models.BinaryField()
    content_type = models.CharField(max_length=100, default='image/png')
    tamano = models.IntegerField(default=0)
    fecha_subida = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Archivo de imagen"
        verbose_name_plural = "Archivos de imagen"

    def __str__(self):
        return self.ruta

# Create your models here.


class Jornada(models.Model):

    class EstadoJornada(models.TextChoices):
        ACTIVA = 'A', 'Activa'
        INACTIVA = 'I', 'Inactiva'

    nombre = models.CharField(max_length=500, null=False, blank=False)
    costo = models.DecimalField(max_digits=10, decimal_places=2, blank=False, null=False)
    fecha_inicio = models.DateField()
    fecha_final = models.DateField()
    uc = models.CharField(max_length=20, null=True, blank=True)
    estado_jornada = models.CharField(max_length=2, choices=EstadoJornada.choices, default=EstadoJornada.ACTIVA)
    imagen = models.ImageField(upload_to='jornadas/', storage=DatabaseStorage(), null=True, blank=True, verbose_name="Imagen / Afiche de la Jornada")
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre


class ProgramacionJornada(models.Model):
    """Imágenes de programación (cronograma / agenda) de una jornada científica."""
    jornada = models.ForeignKey(
        Jornada,
        on_delete=models.CASCADE,
        related_name='programaciones',
        verbose_name="Jornada"
    )
    titulo = models.CharField(max_length=200, blank=True, null=True, verbose_name="Título (opcional)")
    imagen = models.ImageField(upload_to='jornadas/programaciones/', storage=DatabaseStorage(), verbose_name="Imagen de programación")
    fecha_subida = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']
        verbose_name = "Programación de Jornada"
        verbose_name_plural = "Programaciones de Jornada"

    def __str__(self):
        return self.titulo if self.titulo else f"Programación de {self.jornada.nombre}"


