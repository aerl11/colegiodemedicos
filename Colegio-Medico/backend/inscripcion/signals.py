from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Inscripcion
from usuario.utils import enviar_correo_inscripcion

@receiver(post_save, sender=Inscripcion)
def notificar_inscripcion(sender, instance, created, **kwargs):
    if created:
        try:
            user = instance.usuario
            nombre_completo = f"{user.first_name} {user.last_name}".strip()
            if not nombre_completo:
                nombre_completo = user.username
            
            perfil = getattr(user, 'perfil', None)
            tipo_usuario = perfil.tipo if perfil else 'E'
            
            pago = instance.pago
            monto_pago = pago.monto if pago else "0.00"
            ref_pago = f"{pago.referencia_pago} ({pago.get_tipo_pago_display()})" if pago else "N/A"

            enviar_correo_inscripcion(
                email_usuario=user.email,
                nombre_usuario=nombre_completo,
                tipo_usuario=tipo_usuario,
                nombre_jornada=instance.jornada.nombre,
                monto=monto_pago,
                referencia=ref_pago
            )
            print(f"Correo de inscripción enviado a: {user.email}")
        except Exception as e:
            print(f"Error al enviar correo de inscripción: {e}")

