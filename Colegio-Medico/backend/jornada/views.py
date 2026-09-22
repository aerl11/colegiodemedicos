from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .serializers import JornadaSerializer, ProgramacionJornadaSerializer
from .models import Jornada, ProgramacionJornada

# Create your views here.

class JornadaViewSet(viewsets.ModelViewSet):
    queryset = Jornada.objects.all().order_by('-fecha_inicio')
    serializer_class = JornadaSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)


class ProgramacionJornadaViewSet(viewsets.ModelViewSet):
    """CRUD de las imágenes de programación de cada jornada.
    Filtrable con ?jornada=<id> para obtener las de una jornada concreta."""
    queryset = ProgramacionJornada.objects.select_related('jornada').all()
    serializer_class = ProgramacionJornadaSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        jornada_id = self.request.query_params.get('jornada')
        if jornada_id:
            queryset = queryset.filter(jornada_id=jornada_id)
        return queryset
