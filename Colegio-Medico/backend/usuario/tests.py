from django.test import TestCase
from django.conf import settings
from datetime import date, timedelta
from rest_framework_simplejwt.tokens import RefreshToken
from jornada.models import Jornada
from pago.models import Pago
from django.contrib.auth.models import User
from usuario.utils import reset_model_sequence

class SessionAndAuthTimeoutTests(TestCase):
    def test_session_settings_configured_for_five_minutes_inactivity(self):
        """
        Verifica que la sesión de Django expire a los 5 minutos (300 segundos)
        y se renueve con cada petición activa.
        """
        self.assertEqual(settings.SESSION_COOKIE_AGE, 300)
        self.assertTrue(settings.SESSION_SAVE_EVERY_REQUEST)
        self.assertTrue(settings.SESSION_EXPIRE_AT_BROWSER_CLOSE)

    def test_jwt_token_lifetime_configured_for_five_minutes(self):
        """
        Verifica que los tokens de acceso y refresco de JWT tengan una duración de 5 minutos
        y que la rotación de refresh tokens esté habilitada.
        """
        self.assertEqual(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'], timedelta(minutes=5))
        self.assertEqual(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'], timedelta(minutes=5))
        self.assertTrue(settings.SIMPLE_JWT['ROTATE_REFRESH_TOKENS'])

    def test_jwt_token_payload_expiration(self):
        """
        Verifica que al generar un token para un usuario, la expiración del access token sea exactamente 5 minutos (300 segundos).
        """
        user = User.objects.create_user(username="testuser", password="password123")
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token

        # Diferencia entre exp e iat debe ser 300 segundos (5 minutos)
        exp = access_token.payload['exp']
        iat = access_token.payload['iat']
        self.assertEqual(exp - iat, 300)

class SequenceResetTests(TestCase):
    def test_sequence_resets_after_deleting_last_record(self):
        """
        Verifica que al borrar el último registro de una tabla,
        el siguiente registro creado tome el ID libre en vez de saltarlo.
        """
        # Crear 2 jornadas
        j1 = Jornada.objects.create(
            nombre="Jornada 1",
            costo=50.0,
            fecha_inicio=date(2026, 1, 1),
            fecha_final=date(2026, 1, 2)
        )
        j2 = Jornada.objects.create(
            nombre="Jornada 2",
            costo=75.0,
            fecha_inicio=date(2026, 2, 1),
            fecha_final=date(2026, 2, 2)
        )
        self.assertEqual(j1.id, 1)
        self.assertEqual(j2.id, 2)

        # Borramos j2 (ID 2)
        j2.delete()

        # Al crear j3, debe volver a usar el ID 2 en lugar de saltar al ID 3
        j3 = Jornada.objects.create(
            nombre="Jornada 3",
            costo=100.0,
            fecha_inicio=date(2026, 3, 1),
            fecha_final=date(2026, 3, 2)
        )
        self.assertEqual(j3.id, 2)

    def test_sequence_resets_to_one_when_table_empty(self):
        """
        Verifica que al vaciar una tabla, la secuencia se reinicie
        y el siguiente registro empiece de nuevo en el ID 1.
        """
        j = Jornada.objects.create(
            nombre="Jornada Inicial",
            costo=10.0,
            fecha_inicio=date(2026, 1, 1),
            fecha_final=date(2026, 1, 2)
        )
        j.delete()

        j_nuevo = Jornada.objects.create(
            nombre="Jornada Nueva",
            costo=20.0,
            fecha_inicio=date(2026, 1, 1),
            fecha_final=date(2026, 1, 2)
        )
        self.assertEqual(j_nuevo.id, 1)

