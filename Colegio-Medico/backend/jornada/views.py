from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .serializers import JornadaSerializer, ProgramacionJornadaSerializer
from .models import Jornada, ProgramacionJornada, ArchivoImagen

# Create your views here.

class JornadaViewSet(viewsets.ModelViewSet):
    queryset = Jornada.objects.prefetch_related('programaciones').order_by('-fecha_inicio')
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


def servir_imagen(request, ruta):
    """Sirve una imagen almacenada en la base de datos (Neon).
    Ruta esperada: jornadas/<archivo.ext> o jornadas/programaciones/<archivo.ext>"""
    try:
        archivo = ArchivoImagen.objects.get(ruta=ruta)
    except (ArchivoImagen.DoesNotExist, ValueError):
        return HttpResponse(status=404)
    resp = HttpResponse(archivo.contenido, content_type=archivo.content_type or 'image/png')
    resp['Cache-Control'] = 'public, max-age=3600'
    return resp
