from django.contrib import admin
from django.utils.html import format_html, mark_safe
from .models import Jornada

@admin.register(Jornada)
class JornadaAdmin(admin.ModelAdmin):
    search_fields = ['nombre']
    list_display = ('nombre', 'costo', 'fecha_inicio', 'fecha_final', 'estado_jornada', 'preview_imagen')
    list_filter = ('estado_jornada', 'fecha_inicio')
    readonly_fields = ('preview_imagen_detail', 'fecha_registro')
    fields = ('nombre', 'costo', 'fecha_inicio', 'fecha_final', 'uc', 'estado_jornada', 'imagen', 'preview_imagen_detail', 'fecha_registro')

    def preview_imagen(self, obj):
        if obj and getattr(obj, 'imagen', None):
            try:
                if bool(obj.imagen) and hasattr(obj.imagen, 'url') and obj.imagen.name:
                    return format_html(
                        '<img src="{}" style="height: 40px; width: 60px; object-fit: cover; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);" />',
                        obj.imagen.url
                    )
            except Exception:
                pass
        return mark_safe('<span style="color: #999;">Sin imagen</span>')
    preview_imagen.short_description = "Afiche / Imagen"

    def preview_imagen_detail(self, obj):
        if obj and getattr(obj, 'imagen', None):
            try:
                if bool(obj.imagen) and hasattr(obj.imagen, 'url') and obj.imagen.name:
                    return format_html(
                        '<img src="{}" style="max-height: 250px; max-width: 100%; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />',
                        obj.imagen.url
                    )
            except Exception:
                pass
        return "No hay imagen cargada para esta jornada."
    preview_imagen_detail.short_description = "Vista previa de la imagen"