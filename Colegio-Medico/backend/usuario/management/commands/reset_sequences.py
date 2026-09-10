from django.core.management.base import BaseCommand
from django.apps import apps
from usuario.utils import reset_model_sequence

class Command(BaseCommand):
    help = 'Reinicia las secuencias / autoincrementos de todas las tablas de la base de datos al MAX(id) actual.'

    def handle(self, *args, **options):
        models = apps.get_models()
        count = 0
        for model in models:
            if not getattr(model._meta, 'abstract', False) and not getattr(model._meta, 'proxy', False) and not getattr(model._meta, 'auto_created', False):
                reset_model_sequence(model)
                count += 1
                self.stdout.write(self.style.SUCCESS(f"[OK] Secuencia ajustada: {model._meta.db_table}"))

        self.stdout.write(self.style.SUCCESS(f"Se sincronizaron exitosamente las secuencias de {count} tablas."))
