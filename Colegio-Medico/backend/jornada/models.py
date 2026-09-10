from django.db import models

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
    imagen = models.ImageField(upload_to='jornadas/', null=True, blank=True, verbose_name="Imagen / Afiche de la Jornada")
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre


