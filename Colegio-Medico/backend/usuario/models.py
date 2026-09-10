from django.db import models
from django.contrib.auth.models import User

class PerfilUsuario(models.Model):
    class TipoParticipante(models.TextChoices):
        DOCTOR = 'D', 'Doctor'
        ESTUDIANTE = 'E', 'Estudiante'

    class NacionalidadUsuario(models.TextChoices):
        VENEZOLANO = 'V', 'Venezolano'
        EXTRANJERO = 'E', 'Extranjero'

    class GeneroUsuario(models.TextChoices):
        MASCULINO = 'M', 'Masculino'
        FEMENINO = 'F', 'Femenino'

    class Conferencista(models.TextChoices):
        CONFERENCISTA = 'C', 'Conferencista'
        NO_CONFERENCISTA = 'NC', 'NoConferencista'

    class Sociedad(models.TextChoices):
        CIRUGIA_GENERAL = 'Grupo de cirugía general', 'Grupo de cirugía general'
        CARDIOLOGIA = 'S.V. Cardiología capítulo Zulia', 'S.V. Cardiología capítulo Zulia'
        PEDIATRIA = 'S.V. Pediatría Puericultura capítulo Zulia', 'S.V. Pediatría Puericultura capítulo Zulia'
        COLOPROCTOLOGIA = 'S.V. Coloproctología capítulo Zulia', 'S.V. Coloproctología capítulo Zulia'
        ANESTESIOLOGIA = 'S.V. Anestesiología capítulo Zulia', 'S.V. Anestesiología capítulo Zulia'
        GASTROENTEROLOGIA = 'S.V. Gastroenterología capítulo Zulia', 'S.V. Gastroenterología capítulo Zulia'
        FISIATRIA = 'S.V. Fisiatría capítulo Falcón Zulia', 'S.V. Fisiatría capítulo Falcón Zulia'
        ENDOCRINOLOGIA = 'S.V. Endocrinología capítulo Zulia', 'S.V. Endocrinología capítulo Zulia'
        NEUROLOGIA = 'S.V. Neurología capítulo Zulia', 'S.V. Neurología capítulo Zulia'
        GINECOLOGIA = 'S.V. Ginecología y Obstetricia capítulo Zulia', 'S.V. Ginecología y Obstetricia capítulo Zulia'
        OFTALMOLOGIA = 'Grupo de Oftalmología', 'Grupo de Oftalmología'
        TRAUMATOLOGIA = 'S.V. Traumatología y Ortopedia capítulo Zulia', 'S.V. Traumatología y Ortopedia capítulo Zulia'
        UROLOGIA = 'S.V. Urología capítulo Zulia', 'S.V. Urología capítulo Zulia'
        HEPATOLOGIA = 'S.V. Hepatología capítulo Zulia', 'S.V. Hepatología capítulo Zulia'
        RADIOLOGIA = 'S.V. Radiología e Imagen Diagnóstica capítulo Zulia', 'S.V. Radiología e Imagen Diagnóstica capítulo Zulia'
        ASMA_ALERGIAS = 'S.V. Asma, Alergias e Inmunología capítulo Zulia', 'S.V. Asma, Alergias e Inmunología capítulo Zulia'
        MEDICINA_CLINICA = 'S.V. Medicina Clínica capítulo Zulia', 'S.V. Medicina Clínica capítulo Zulia'
        NEUMOLOGIA_CIR_PED = 'S.V. Neumología, Cirugía Pediátrica capítulo Zulia', 'S.V. Neumología, Cirugía Pediátrica capítulo Zulia'
        GENETICA = 'S.V. Genética capítulo Zulia', 'S.V. Genética capítulo Zulia'
        MEDICINA_FAMILIAR = 'S.V. Medicina Familiar capítulo Zulia', 'S.V. Medicina Familiar capítulo Zulia'
        MASTOLOGIA = 'S.V. Mastología Capítulo Occidental', 'S.V. Mastología Capítulo Occidental'
        HEMATOLOGIA = 'S.V. Hematología capítulo Zulia', 'S.V. Hematología capítulo Zulia'
        NEUROCIRUGIA = 'S.V. Neurocirugía capítulo Zulia', 'S.V. Neurocirugía capítulo Zulia'
        ORL = 'S.V. O.R.L. capítulo Zulia', 'S.V. O.R.L. capítulo Zulia'
        PSIQUIATRIA = 'S.V. Psiquiatría capítulo Zulia', 'S.V. Psiquiatría capítulo Zulia'
        MICROBIOTA = 'S.V. Microbiota (nivel nacional)', 'S.V. Microbiota (nivel nacional)'
        CIRUGIA_PLASTICA = 'S.V. Cirugía Plástica capítulo Zulia', 'S.V. Cirugía Plástica capítulo Zulia'
        ACADEMIA = 'Academia', 'Academia'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    tipo = models.CharField(max_length=2, choices=TipoParticipante.choices, default=TipoParticipante.DOCTOR)
    nacionalidad = models.CharField(max_length=2, choices=NacionalidadUsuario.choices, default=NacionalidadUsuario.VENEZOLANO)
    cedula = models.CharField(max_length=20, unique=True, null=True, blank=True)

    telefono = models.CharField(max_length=30, blank=True, null=True)
    comezu = models.CharField(max_length=50, blank=True, null=True)
    especialidad = models.CharField(max_length=200, blank=True, null=True)

    sociedad = models.CharField(max_length=100, choices=Sociedad.choices, blank=True, null=True)
    coordinador = models.BooleanField(
        default=False,
        verbose_name='Coordinador(a)',
        help_text='Rol asignable únicamente desde el panel de administración de Django. Aparece en el certificado como Coordinador (hombre) o Coordinadora (mujer).'
    )
    genero = models.CharField(max_length=2, choices=GeneroUsuario.choices, blank=True, null=True)
    conferencista = models.CharField(max_length=2, choices=Conferencista.choices, blank=True, null=True)

    def __str__(self):
        return f"Perfil de {self.user.username} - {self.get_tipo_display()}"