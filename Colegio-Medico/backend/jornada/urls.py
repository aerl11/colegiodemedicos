from django.urls import path, include
from rest_framework import routers 
from .views import JornadaViewSet

router = routers.DefaultRouter()
router.register(r'', JornadaViewSet, basename='jornada')

urlpatterns = [
    path('', include(router.urls)),
]