from rest_framework import routers
from .views import PagoViewSet
from django.urls import path, include 

router = routers.DefaultRouter()
router.register(r'', PagoViewSet, basename='pago')

urlpatterns = [
    path('', include(router.urls)),
]