from django.urls import path, include
from rest_framework import routers
from .views import InscripcionViewSet, reporte_jornada_pdf_view

router = routers.DefaultRouter()
# Registrado en la raíz del módulo inscripcion
router.register(r'', InscripcionViewSet, basename='inscripcion')

urlpatterns = [
    # 🌟 CORRECCIÓN 1: Cambiado '=' por ':' en <int:jornada_id>
    # 🌟 CORRECCIÓN 2: Se movió arriba para evitar conflictos con el router
    path('jornada/<int:jornada_id>/reporte-pdf/', reporte_jornada_pdf_view, name='reporte_jornada_pdf'),
    
    path('', include(router.urls)),
]