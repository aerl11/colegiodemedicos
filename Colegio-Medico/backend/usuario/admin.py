# from django.contrib import admin
# from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
# from django.contrib.auth.models import User
# from .models import PerfilUsuario

# class PerfilUsuarioInline(admin.StackedInline):
#     model = PerfilUsuario
#     can_delete = False
#     verbose_name_plural = 'Datos del Perfil (Médico/Estudiante / Conferencista)'
#     fk_name = 'user'
#     # Declaramos explícitamente los campos para asegurar que aparezca el nuevo atributo
#     fields = ('tipo', 'nacionalidad', 'cedula', 'telefono', 'comezu', 'especialidad', 'genero', 'conferencista')

# class PersonalizadoUserAdmin(BaseUserAdmin):
#     inlines = (PerfilUsuarioInline,)

#     # CORRECCIÓN: Buscamos en los campos nativos de User y en la cédula del perfil relacionado
#     search_fields = ('username', 'first_name', 'last_name', 'email', 'perfil__cedula')

#     # Agregamos 'get_conferencista' a la lista de visualización principal
#     list_display = ('username', 'first_name', 'last_name', 'email', 'get_tipo', 'get_conferencista', 'is_staff')

#     # Filtros laterales optimizados para incluir el tipo de participante y el estatus de ponente
#     list_filter = ('is_staff', 'is_active', 'perfil__tipo', 'perfil__conferencista')

#     def get_tipo(self, obj):
#         try:
#             return obj.perfil.get_tipo_display()
#         except PerfilUsuario.DoesNotExist:
#             return 'Sin Perfil'
#     get_tipo.short_description = 'Tipo de Usuario'

#     # NUEVO MÉTODO: Muestra de forma limpia el estado del conferencista en la lista principal
#     def get_conferencista(self, obj):
#         try:
#             return obj.perfil.get_conferencista_display()
#         except PerfilUsuario.DoesNotExist:
#             return 'No Definido'
#     get_conferencista.short_description = '¿Es Ponente?'

# admin.site.unregister(User)
# admin.site.register(User, PersonalizadoUserAdmin)

# # CORRECCIÓN: Adaptamos el administrador secundario de PerfilUsuario
# @admin.register(PerfilUsuario)
# class UsuarioPerfilAdmin(admin.ModelAdmin):
#     # Buscamos por la cédula o por los datos del usuario principal al que está amarrado
#     search_fields = ('cedula', 'user__first_name', 'user__last_name', 'user__username')

#     # Mostramos los datos que sí pertenecen físicamente a la tabla PerfilUsuario, incluyendo conferencista
#     list_display = ('user', 'cedula', 'tipo', 'conferencista', 'telefono', 'comezu', 'especialidad')
#     list_filter = ('tipo', 'conferencista')

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import PerfilUsuario
# 🌟 IMPORTACIÓN DE LA FUNCIÓN DE GMAIL
from .utils import enviar_confirmacion_registro

class PerfilUsuarioInline(admin.StackedInline):
    model = PerfilUsuario
    can_delete = False
    verbose_name_plural = 'Datos del Perfil (Médico/Estudiante / Conferencista)'
    fk_name = 'user'
    # Declaramos explícitamente los campos para asegurar que aparezca el nuevo atributo
    fields = ('tipo', 'nacionalidad', 'cedula', 'telefono', 'comezu', 'especialidad', 'sociedad', 'genero', 'conferencista', 'coordinador')

class PersonalizadoUserAdmin(BaseUserAdmin):
    inlines = (PerfilUsuarioInline,)

    # CORRECCIÓN: Buscamos en los campos nativos de User y en la cédula del perfil relacionado
    search_fields = ('username', 'first_name', 'last_name', 'email', 'perfil__cedula')

    # Agregamos 'get_conferencista' a la lista de visualización principal
    list_display = ('username', 'first_name', 'last_name', 'email', 'get_tipo', 'get_conferencista', 'is_staff')

    # Filtros laterales optimizados para incluir el tipo de participante y el estatus de ponente
    list_filter = ('is_staff', 'is_active', 'perfil__tipo', 'perfil__conferencista')

    # 🌟 SE CAMBIÓ A SAVE_RELATED PARA ASEGURAR QUE EL PERFIL YA EXISTA AL ENVIAR EL CORREO
    def save_related(self, request, form, formsets, change):
        es_nuevo = not change  # Si change es False, el usuario se está creando de cero

        # 1. Primero obligamos a Django a guardar el usuario principal y sus inlines (el perfil)
        super().save_related(request, form, formsets, change)

        # 2. Obtenemos la instancia del usuario ya guardada completamente con su perfil
        obj = form.instance

        # 3. Si es un registro nuevo y tiene correo, procedemos a enviar el email
        if es_nuevo and obj.email:
            try:
                # Intentamos usar los campos nativos que llenó el administrador
                nombre = obj.first_name or obj.username
                apellido = obj.last_name or ""

                enviar_confirmacion_registro(obj.email, nombre, apellido)
            except Exception as e:
                # Alerta visual en el admin si algo con la API de Gmail falla
                self.message_user(request, f"Usuario creado, pero falló el envío de correo de confirmación: {e}", level='WARNING')

    def get_tipo(self, obj):
        try:
            return obj.perfil.get_tipo_display()
        except PerfilUsuario.DoesNotExist:
            return 'Sin Perfil'
    get_tipo.short_description = 'Tipo de Usuario'

    # NUEVO MÉTODO: Muestra de forma limpia el estado del conferencista en la lista principal
    def get_conferencista(self, obj):
        try:
            return obj.perfil.get_conferencista_display()
        except PerfilUsuario.DoesNotExist:
            return 'No Definido'
    get_conferencista.short_description = '¿Es Ponente?'

admin.site.unregister(User)
admin.site.register(User, PersonalizadoUserAdmin)

# CORRECCIÓN: Adaptamos el administrador secundario de PerfilUsuario
@admin.register(PerfilUsuario)
class UsuarioPerfilAdmin(admin.ModelAdmin):
    # Buscamos por la cédula o por los datos del usuario principal al que está amarrado
    search_fields = ('cedula', 'user__first_name', 'user__last_name', 'user__username')

    # Mostramos los datos que sí pertenecen físicamente a la tabla PerfilUsuario, incluyendo conferencista
    list_display = ('user', 'cedula', 'tipo', 'conferencista', 'coordinador', 'sociedad', 'telefono', 'comezu', 'especialidad')
    list_filter = ('tipo', 'conferencista', 'coordinador', 'sociedad')