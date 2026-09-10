from django.contrib import admin
from django.urls import path
from .models import Pago
from .utils import generar_pdf_pagos

@admin.register(Pago)
class PagoAdmin(admin.ModelAdmin):
    change_list_template = 'admin/pago/pago/change_list.html'
    search_fields = [
        'referencia_pago',
        'usuario__username',
        'usuario__first_name',
        'usuario__last_name',
        'usuario__perfil__cedula'
    ]
    autocomplete_fields = ['usuario']
    list_display = (
        'id',
        'referencia_pago',
        'get_usuario_nombre',
        'get_usuario_cedula',
        'tipo_pago',
        'monto',
        'fecha_pago',
        'get_jornada'
    )
    list_filter = ('tipo_pago', 'fecha_pago')
    date_hierarchy = 'fecha_pago'
    actions = ['descargar_reporte_pdf']

    def get_usuario_nombre(self, obj):
        return f"{obj.usuario.first_name} {obj.usuario.last_name}".strip() or obj.usuario.username
    get_usuario_nombre.short_description = "Participante"

    def get_usuario_cedula(self, obj):
        perfil = getattr(obj.usuario, 'perfil', None)
        return perfil.cedula if perfil and perfil.cedula else "-"
    get_usuario_cedula.short_description = "Cédula"

    def get_jornada(self, obj):
        if hasattr(obj, 'inscripcion') and obj.inscripcion and obj.inscripcion.jornada:
            return obj.inscripcion.jornada.nombre
        return "-"
    get_jornada.short_description = "Jornada Inscrita"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'descargar-reporte-general-pdf/',
                self.admin_site.admin_view(self.descargar_reporte_general_pdf),
                name='pago_reporte_general_pdf'
            ),
        ]
        return custom_urls + urls

    def descargar_reporte_general_pdf(self, request):
        pagos = Pago.objects.all().select_related(
            'usuario', 'usuario__perfil', 'inscripcion', 'inscripcion__jornada'
        ).order_by('-fecha_pago', '-id')
        return generar_pdf_pagos(
            pagos,
            request.user,
            titulo_personalizado="REPORTE GENERAL DE TODOS LOS PAGOS - ADMINISTRACIÓN DJANGO"
        )

    @admin.action(description="📄 Descargar reporte en PDF de los pagos seleccionados")
    def descargar_reporte_pdf(self, request, queryset):
        pagos = queryset.select_related(
            'usuario', 'usuario__perfil', 'inscripcion', 'inscripcion__jornada'
        ).order_by('-fecha_pago', '-id')
        return generar_pdf_pagos(
            pagos,
            request.user,
            titulo_personalizado="REPORTE DE PAGOS SELECCIONADOS - ADMINISTRACIÓN DJANGO"
        )
