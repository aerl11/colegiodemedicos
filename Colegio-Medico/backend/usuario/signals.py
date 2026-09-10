# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from .models import Usuario
# # Importa aquí tu función de correo
# from .utils import enviar_confirmacion_registro

# @receiver(post_save, sender=Usuario)
# def notificar_registro_exitoso(sender, instance, created, **kwargs):
#     if created:
#         try:
#             enviar_confirmacion_registro(
#                 instance.email,
#                 instance.nombre,
#                 instance.apellido
#             )
#             print(f"Correo enviado a {instance.email}")
#         except Exception as e:
#             print(f"Error al enviar correo: {e}")

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User  # CORRECCIÓN: Importamos el User nativo de Django
from .utils import enviar_confirmacion_registro
from django_rest_passwordreset.signals import reset_password_token_created
from django.core.mail import send_mail
from django.conf import settings

@receiver(post_save, sender=User)  # CORRECCIÓN: Escucha cuando se crea un User
def notificar_registro_exitoso(sender, instance, created, **kwargs):
    if created:
        # Verificamos que tenga correo y nombre antes de intentar enviar
        if instance.email and instance.first_name:
            try:
                enviar_confirmacion_registro(
                    instance.email,
                    instance.first_name,  # En User es first_name, no nombre
                    instance.last_name    # En User es last_name, no apellido
                )
                print(f"Correo de confirmación enviado exitosamente a {instance.email}")
            except Exception as e:
                print(f"Error al enviar correo en la señal post_save: {e}")


from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.apps import AppConfig

@receiver(post_migrate)
def crear_grupos_defecto(sender, **kwargs):
    # Evitamos que se ejecute múltiples veces por cada app;
    # solo nos interesa cuando se termine de migrar la app 'usuario'
    if sender.name == 'usuario':
        from django.contrib.auth.models import Group

        roles = ['superadmin', 'staff', 'participante']
        for rol in roles:
            # get_or_create verifica si ya existe antes de intentar insertarlo
            grupo, creado = Group.objects.get_or_create(name=rol)
            if creado:
                print(f"[OK] Grupo creado automaticamente: {rol}")



@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
    context = {
        'current_user': reset_password_token.user,
        'first_name': reset_password_token.user.first_name,
        'last_name': reset_password_token.user.last_name,
        'email': reset_password_token.user.email,
        'token': reset_password_token.key
    }

    # Mensaje de respaldo en texto plano
    text_message = f"""
Estimado(a) {context['first_name']} {context['last_name']},

Se ha solicitado un restablecimiento de contraseña para su cuenta en la plataforma del Colegio de Médicos del Estado Zulia.

Su código de recuperación es: {context['token']}

Si usted no solicitó este cambio, por favor ignore este correo electrónico.
"""

    # Diseño HTML Institucional - Colegio de Médicos
    html_message = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">

        <div style="background-color: #0f172a; padding: 25px; text-align: center; border-bottom: 4px solid #1d4ed8;">
            <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px;">
                COLEGIO DE MÉDICOS DEL ESTADO ZULIA
            </h2>
            <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 12px; font-weight: 500; letter-spacing: 1px;">
                SISTEMA DE GESTIÓN DE JORNADAS Científicas
            </p>
        </div>

        <div style="padding: 30px; background-color: #ffffff;">
            <p style="font-size: 16px; margin: 0 0 16px 0; color: #334155;">
                Estimado(a) <strong>Dr(a). {context['first_name']} {context['last_name']}</strong>,
            </p>

            <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                Hemos recibido una solicitud para restablecer la contraseña de acceso a su cuenta institucional en nuestra plataforma.
            </p>

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <p style="margin: 0 0 10px 0; font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                    Código de Verificación Temporal
                </p>
                <p style="margin: 0; font-size: 26px; font-weight: 700; color: #1e40af; letter-spacing: 5px; font-family: 'Courier New', Courier, monospace;">
                    {context['token']}
                </p>
                <p style="margin: 10px 0 0 0; font-size: 11px; color: #94a3b8;">
                    Este código es de uso único y expirará por motivos de seguridad.
                </p>
            </div>

            <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0;">
                Si usted no ha realizado esta solicitud, puede ignorar este mensaje de forma segura. Las credenciales actuales permanecerán sin modificaciones.
            </p>
        </div>

        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Este es un correo automatizado generado por el sistema. Por favor no responda a esta dirección.
            </p>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #94a3b8; font-weight: 600;">
                COMEZU &copy; 2026
            </p>
        </div>
    </div>
    """

    # Despachamos el correo directamente utilizando la configuración SMTP del Colegio
    send_mail(
        subject="Restablecimiento de Contraseña - COMEZU",
        message=text_message,
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[context['email']],
        fail_silently=False,
        html_message=html_message
    )


# ==============================================================================
# 🔄 REINICIO AUTOMÁTICO DE SECUENCIAS / AUTOINCREMENTO AL ELIMINAR REGISTROS
# ==============================================================================
from django.db.models.signals import post_delete
from .utils import reset_model_sequence

@receiver(post_delete)
def auto_reset_sequence_on_delete(sender, **kwargs):
    """
    Se ejecuta automáticamente al eliminar cualquier registro en Django
    (Django Admin, API o consultas ORM), ajustando la secuencia de la base
    de datos para que los próximos IDs no salten números innecesariamente.
    """
    reset_model_sequence(sender)
