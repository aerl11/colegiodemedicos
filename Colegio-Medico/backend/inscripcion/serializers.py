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
    # incluir_programaciones=False: en listados grandes evita 2 queries extra por fila
    jornada_data = JornadaSerializer(source='jornada', read_only=True, incluir_programaciones=False)

    class Meta:
        model = Inscripcion
        
        fields = ['id', 'usuario', 'usuario_data', 'jornada', 'jornada_data', 'pago', 'pago_data', 'fecha_inscripcion']
        read_only_fields = ('id', 'fecha_inscripcion')

    def to_representation(self, instance):
        """
        Al listar inscripciones no necesitamos las imágenes de programaciones de
        la jornada (pesan y disparan 2 queries extra por fila). Las omitimos aquí;
        el detalle de jornada (/jornada/) sigue incluyéndolas.
        """
        rep = super().to_representation(instance)
        jdata = rep.get('jornada_data')
        if isinstance(jdata, dict) and 'programaciones' in jdata:
            jdata.pop('programaciones')
        return rep

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