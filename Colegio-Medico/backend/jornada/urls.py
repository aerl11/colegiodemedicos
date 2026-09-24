from django.urls import path, include
from rest_framework import routers 
from .views import JornadaViewSet, ProgramacionJornadaViewSet, servir_imagen
router = routers.DefaultRouter()
router.register(r'programaciones', ProgramacionJornadaViewSet, basename='programacion-jornada')
router.register(r'', JornadaViewSet, basename='jornada')
urlpatterns = [
    # Sirve imágenes guardadas en la BD: /api/jornada/media/jornadas/<archivo>
    path('media/<path:ruta>', servir_imagen, name='jornada-media'),
    path('', include(router.urls)),
]