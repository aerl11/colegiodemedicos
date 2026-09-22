from django.urls import path, include
from rest_framework import routers 
from .views import JornadaViewSet, ProgramacionJornadaViewSet

router = routers.DefaultRouter()
router.register(r'programaciones', ProgramacionJornadaViewSet, basename='programacion-jornada')
router.register(r'', JornadaViewSet, basename='jornada')

urlpatterns = [
    path('', include(router.urls)),
]