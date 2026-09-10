from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from datetime import date
from .models import Jornada
from .serializers import JornadaSerializer

class JornadaModelAndSerializerTests(TestCase):
    def test_create_jornada_without_image(self):
        """
        Verifica que una jornada se pueda crear sin imagen (imagen es opcional).
        """
        jornada = Jornada.objects.create(
            nombre="Congreso de Cardiología",
            costo=120.00,
            fecha_inicio=date(2026, 5, 10),
            fecha_final=date(2026, 5, 12),
            uc="6"
        )
        self.assertIsNotNone(jornada.id)
        self.assertFalse(bool(jornada.imagen))
        serializer = JornadaSerializer(jornada)
        self.assertIn('imagen', serializer.data)
        self.assertIsNone(serializer.data['imagen'])

    def test_create_jornada_with_image(self):
        """
        Verifica que una jornada pueda almacenar y serializar una imagen correctamente.
        """
        # Crear un archivo de imagen simulado
        small_gif = (
            b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\x05\x04\x04'
            b'\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44'
            b'\x01\x00\x3b'
        )
        uploaded_image = SimpleUploadedFile(
            name='test_banner.gif',
            content=small_gif,
            content_type='image/gif'
        )

        jornada = Jornada.objects.create(
            nombre="Jornada de Pediatría",
            costo=80.00,
            fecha_inicio=date(2026, 6, 1),
            fecha_final=date(2026, 6, 2),
            imagen=uploaded_image
        )
        self.assertTrue(bool(jornada.imagen))
        self.assertIn('jornadas/', jornada.imagen.name)

        serializer = JornadaSerializer(jornada)
        self.assertIsNotNone(serializer.data['imagen'])
