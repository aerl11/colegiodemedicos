# from django.contrib import admin
# from django.contrib.auth.admin import UserAdmin
# from django.contrib.auth.models import User
# from usuario.models import PerfilUsuario

# class PerfilUsuarioInline(admin.StackedInline):
#     model = PerfilUsuario
#     can_delete = False
#     verbose_name_plural = 'Información Colegial del Médico / Estudiante'
#     fk_name = 'user'

# class PersonalizadoUserAdmin(UserAdmin):
#     inlines = (PerfilUsuarioInline, )
#     list_display = ('username', 'first_name', 'last_name', 'email', 'get_tipo', 'get_cedula', 'is_staff')
#     list_filter = ('groups', 'is_staff', 'is_active')

#     def get_tipo(self, instance):
#         try:
#             return instance.perfil.get_tipo_display()
#         except PerfilUsuario.DoesNotExist:
#             return 'Sin Tipo'
#     get_tipo.short_description = 'Tipo de Participante'

#     def get_cedula(self, instance):
#         try:
#             return instance.perfil.cedula
#         except PerfilUsuario.DoesNotExist:
#             return '-'
#     get_cedula.short_description = 'Cédula'

#     def save_formset(self, request, form, formset, change):
#         instances = formset.save(commit=False)
#         for instance in instances:
#             instance.save()
#         formset.save_m2m()

# admin.site.unregister(User)
# admin.site.register(User, PersonalizadoUserAdmin)


from django.contrib import admin
from .models import Inscripcion

@admin.register(Inscripcion)
class InscripcionAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario', 'jornada', 'fecha_inscripcion', 'pago')
    list_filter = ('jornada', 'fecha_inscripcion')
    search_fields = ('usuario__username', 'usuario__first_name', 'usuario__last_name', 'jornada__nombre')
    
    # NUEVO: Esto transforma el menú desplegable de 'pago' en un buscador predictivo (Select2)
    # También lo aplicamos a 'usuario' y 'jornada' para que todo el formulario sea rápido de usar
    autocomplete_fields = ('pago', 'usuario', 'jornada')