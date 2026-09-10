from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .serializers import JornadaSerializer
from .models import Jornada

# Create your views here.

class JornadaViewSet(viewsets.ModelViewSet):
    queryset = Jornada.objects.all().order_by('-fecha_inicio')
    serializer_class = JornadaSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
