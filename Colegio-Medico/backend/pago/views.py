from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action

from .models import Pago
from .serializers import PagoSerializer
from .utils import generar_pdf_pagos
from usuario.permissions import HasRole

# Create your views here.
class PagoViewSet(viewsets.ModelViewSet):
    permission_classes = [HasRole]
    required_roles = ["superadmin", "staff", "participante"]
    serializer_class = PagoSerializer

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Pago.objects.none()
        user_roles = set(user.groups.values_list("name", flat=True))
        if user.is_superuser or "superadmin" in user_roles or "staff" in user_roles:
            return Pago.objects.all().select_related('usuario', 'usuario__perfil', 'inscripcion', 'inscripcion__jornada').order_by('-fecha_pago', '-id')
        return Pago.objects.filter(usuario=user).select_related('usuario', 'usuario__perfil', 'inscripcion', 'inscripcion__jornada').order_by('-fecha_pago', '-id')

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    @action(detail=False, methods=['get'], url_path='reporte-pdf')
    def reporte_pdf(self, request):
        """
        Genera y descarga un reporte consolidado en PDF con logotipo del Colegio de Médicos
        de todos los pagos registrados (superadmin/staff) o del participante actual.
        """
        pagos = self.get_queryset()
        return generar_pdf_pagos(pagos, request.user)

