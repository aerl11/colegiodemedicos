# from django.db import models
# from usuario.models import PerfilUsuario
# from jornada.models import Jornada
# from pago.models import Pago
# # Create your models here.

# class Inscripcion(models.Model):
#     usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='inscripcion_usuario')
#     jornada = models.ForeignKey(Jornada, on_delete=models.CASCADE, related_name='inscripcion_jornada')
#     pago = models.ForeignKey(Pago, on_delete=models.CASCADE, related_name='inscripcion_pago')

from django.db import models
from django.contrib.auth.models import User
from jornada.models import Jornada
from pago.models import Pago

class Inscripcion(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='inscripciones')


    jornada = models.ForeignKey(Jornada, on_delete=models.CASCADE, related_name='inscripciones')


    pago = models.OneToOneField(Pago, on_delete=models.SET_NULL, null=True, blank=True, related_name='inscripcion')


    fecha_inscripcion = models.DateTimeField(auto_now_add=True)

    # Marca para no enviar más de una vez el certificado por correo al culminar la jornada
    certificado_enviado = models.BooleanField(default=False, verbose_name="Certificado enviado por correo")

    class Meta:
        verbose_name = "Inscripción"
        verbose_name_plural = "Inscripciones"
        unique_together = ('usuario', 'jornada')

    def __str__(self):
        return f"{self.usuario.username} inscrito en {self.jornada.nombre}"
