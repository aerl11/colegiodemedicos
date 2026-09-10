from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from inscripcion.servicios_certificados import enviar_certificados_pendientes


class Command(BaseCommand):
    help = (
        'Envía por correo el certificado (.pptx) a las personas inscritas en jornadas '
        'que culminan hoy o ya culminaron. Marca cada inscripción para no enviar duplicados.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--dias-atras',
            type=int,
            default=0,
            help='Enviar también certificados de jornadas culminadas hace N días o menos (por defecto 0 = todas las pendientes).',
        )

    def handle(self, *args, **options):
        def log(mensaje):
            self.stdout.write(mensaje)

        enviar_certificados_pendientes(dias_atras=options['dias_atras'], log=log)
