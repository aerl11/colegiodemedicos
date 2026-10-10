from rest_framework import serializers
from .models import Pago
from inscripcion.models import Inscripcion
# CORRECCIÓN: Cambiamos el viejo UsuarioSerializer por el basado en el User nativo
from usuario.serializers import UserListSerializer

class PagoSerializer(serializers.ModelSerializer):
    # Mostramos la data limpia del usuario usando el serializador nativo
    usuario_data = UserListSerializer(source='usuario', read_only=True)
    jornada_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Pago
        # Añadimos 'id' por si React lo necesita para renderizar listas con sus keys
        fields = ['id', 'fecha_pago', 'monto', 'referencia_pago', 'tipo_pago', 'comprobante', 'usuario', 'usuario_data', 'jornada_id']
        read_only_fields = ('id', 'usuario')
        extra_kwargs = {
            'comprobante': {'required': False, 'allow_null': True},
        }

    def validate_referencia_pago(self, value):
        # Validación por código para asegurar que la referencia sea única
        queryset = Pago.objects.filter(referencia_pago=value)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError("Ya este número de referencia está registrado.")
        
        return value
    
    def create(self, validated_data):
        # Extraemos el ID de la jornada que viene del formulario en React
        jornada_id = validated_data.pop('jornada_id')

        # Creamos el registro del pago (validated_data ya tiene el 'usuario' como instancia de User)
        pago = Pago.objects.create(**validated_data)

        # Creamos la inscripción automáticamente vinculando al User nativo, la jornada y el pago
        Inscripcion.objects.create(
            usuario=pago.usuario,  # Este ya es un objeto User nativo perfectamente compatible
            jornada_id=jornada_id,
            pago=pago
        )

        return pago