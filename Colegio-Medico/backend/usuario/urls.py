# from rest_framework import routers
# from .views import UsuarioViewSet
# from django.urls import path, include

# router = routers.DefaultRouter()
# router.register(r'', UsuarioViewSet, basename='usuario')

# urlpatterns = [
#     path('', include(router.urls)),
# ]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenVerifyView
from .views import (
    LoginView,
    CurrentUserView,
    EmpleadoViewSet,
    RegistroPublicoView,
    TokenRefreshView,
    MedicosListView,
    panel_certificados_view,
    reporte_conferencistas_pdf_view,
    SolicitudResetPasswordView,
)

router = DefaultRouter()
router.register(r'gestion-usuarios', EmpleadoViewSet, basename='usuarios')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/me/', CurrentUserView.as_view(), name='current_user'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('medicos-lista/', MedicosListView.as_view(), name='medicos-list'),
    path('auth/register/', RegistroPublicoView.as_view(), name='registro_publico'),
    path('password-reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),
    path('password-reset/solicitar/', SolicitudResetPasswordView.as_view(), name='solicitud_reset_password'),
    path('control-certificados/', panel_certificados_view, name='panel_certificados'),
    path('control-certificados/jornada/<int:jornada_id>/conferencistas-pdf/', reporte_conferencistas_pdf_view, name='reporte_conferencistas_pdf'),
]