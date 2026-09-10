# from django.db import models
# from usuario.models import Usuario

# # Create your models here.

# class Pago(models.Model):

#     fecha_pago = models.DateField()
#     monto = models.DecimalField(max_digits=10, decimal_places=2, blank=False, null=False)
#     referencia_pago = models.CharField(max_length=50)
#     usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='usuario')

#     def __str__(self):
#         return f"Ref: {self.referencia_pago} - Bs.{self.monto} - {self.usuario}"

from django.db import models
from django.contrib.auth.models import User  # CORRECCIÓN OBLIGATORIA: Usamos el User nativo de Django

class Pago(models.Model):
    TIPO_PAGO_CHOICES = [
        ('PM', 'Pago Móvil'),
        ('TB', 'Transferencia Bancaria'),
        ('EF', 'Efectivo / Divisas'),
    ]

    fecha_pago = models.DateField()
    monto = models.DecimalField(max_digits=10, decimal_places=2, blank=False, null=False)
    referencia_pago = models.CharField(max_length=50)
    tipo_pago = models.CharField(max_length=2, choices=TIPO_PAGO_CHOICES, default='PM')
    
    # CORRECCIÓN OBLIGATORIA: Apuntamos al modelo User correcto y mejoramos el related_name a 'pagos'
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pagos')

    def __str__(self):
        return f"Ref: {self.referencia_pago} - {self.get_tipo_pago_display()} - {self.usuario.username}"