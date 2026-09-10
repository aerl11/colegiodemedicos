from rest_framework import serializers
from .models import Inscripcion
from pago.models import Pago
from usuario.serializers import UserListSerializer
from pago.serializers import PagoSerializer
from jornada.serializers import JornadaSerializer
from usuario.utils import enviar_correo_inscripcion

class InscripcionSerializer(serializers.ModelSerializer):
    usuario_data = UserListSerializer(source='usuario', read_only=True)
    pago_data = PagoSerializer(source='pago', read_only=True)
    jornada_data = JornadaSerializer(source='jornada', read_only=True)

    class Meta:
        model = Inscripcion
        
        fields = ['id', 'usuario', 'usuario_data', 'jornada', 'jornada_data', 'pago', 'pago_data', 'fecha_inscripcion']
        read_only_fields = ('id', 'fecha_inscripcion')

    def validate_pago(self, value):
        if value:
            queryset = Inscripcion.objects.filter(pago=value)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError("Este pago ya ha sido registrado en otra inscripción.")
        return value
    
    def create(self, validated_data):
        return Inscripcion.objects.create(**validated_data)