from rest_framework import serializers
from .models import Jornada, ProgramacionJornada

class ProgramacionJornadaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramacionJornada
        fields = ['id', 'jornada', 'titulo', 'imagen', 'fecha_subida']
        read_only_fields = ('id', 'fecha_subida')


class JornadaSerializer(serializers.ModelSerializer):
    imagen = serializers.ImageField(required=False, allow_null=True)
    programaciones = ProgramacionJornadaSerializer(many=True, read_only=True)

    def __init__(self, *args, incluir_programaciones=True, **kwargs):
        # Permite omitir 'programaciones' en listados grandes (evita N+1 queries)
        super().__init__(*args, **kwargs)
        if not incluir_programaciones:
            self.fields.pop('programaciones', None)

    class Meta:
        model = Jornada
        fields = ['id', 'nombre', 'costo', 'fecha_inicio', 'fecha_final', 'uc', 'estado_jornada', 'imagen', 'programaciones', 'fecha_registro']
        read_only_fields = ('id',)

    def to_internal_value(self, data):
        # Si envían 'imagen': '' (string vacío desde FormData) o 'null', interpretarlo como None para limpiar la imagen
        if hasattr(data, 'copy'):
            data = data.copy()
        if 'imagen' in data and (data['imagen'] == '' or data['imagen'] == 'null' or data['imagen'] is None):
            data['imagen'] = None
        return super().to_internal_value(data)

