# Generated manually - programaciones de jornada
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('jornada', '0006_jornada_imagen'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProgramacionJornada',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('titulo', models.CharField(blank=True, max_length=200, null=True, verbose_name='Título (opcional)')),
                ('imagen', models.ImageField(upload_to='jornadas/programaciones/', verbose_name='Imagen de programación')),
                ('fecha_subida', models.DateTimeField(auto_now_add=True)),
                ('jornada', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='programaciones', to='jornada.jornada', verbose_name='Jornada')),
            ],
            options={
                'verbose_name': 'Programación de Jornada',
                'verbose_name_plural': 'Programaciones de Jornada',
                'ordering': ['id'],
            },
        ),
    ]
