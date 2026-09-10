# from django.shortcuts import render
# from .models import Usuario
# from .serializers import UsuarioSerializer
# from rest_framework import viewsets
# # Create your views here.

# class UsuarioViewSet(viewsets.ModelViewSet):
#     queryset = Usuario.objects.all()
#     serializer_class = UsuarioSerializer

from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status, viewsets, generics
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView as SimpleJWTTokenRefreshView
from django.contrib.auth.models import User
from jornada.models import Jornada
from inscripcion.models import Inscripcion
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render
from .serializers import LoginSerializer, get_user_role, UserListSerializer, EmployeeCreateUpdateSerializer
from .permissions import HasRole

class EmpleadoViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    required_roles = ["superadmin", "staff","participante"]
    queryset = User.objects.all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return EmployeeCreateUpdateSerializer
        return UserListSerializer

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)
        role = get_user_role(user)

        # Retornamos el JSON completo para que React arme el contexto de autenticación
        return Response(
            {
                "id": user.id,
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
                "user": user.get_username(),
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": getattr(user, "email", "") or "",
                "rol": role,
                # Añadimos tipo por si React quiere saber si es Médico o Estudiante en el login
                "tipo": user.perfil.tipo if hasattr(user, 'perfil') else None,
                "conferencista": user.perfil.conferencista if hasattr(user, 'perfil') else 'NC',
            },
            status=status.HTTP_200_OK,
        )

class CurrentUserView(APIView):
    """
    Endpoint para obtener los datos del usuario autenticado actualmente (token JWT).
    Permite validar la sesión activa al recargar la aplicación en el Frontend.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = get_user_role(user)
        perfil = getattr(user, 'perfil', None)

        return Response(
            {
                "id": user.id,
                "user": user.get_username(),
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": getattr(user, "email", "") or "",
                "rol": role,
                "tipo": perfil.tipo if perfil else None,
                "nacionalidad": perfil.nacionalidad if perfil else None,
                "cedula": perfil.cedula if perfil else "",
                "telefono": perfil.telefono if perfil else "",
                "comezu": perfil.comezu if perfil else "",
                "especialidad": perfil.especialidad if perfil else "",
                "genero": perfil.genero if perfil else "",
                "conferencista": perfil.conferencista if perfil and perfil.conferencista else 'NC',
            },
            status=status.HTTP_200_OK,
        )

class MedicosListView(generics.ListAPIView):
    permission_classes = [HasRole]
    required_roles = ["superadmin", "staff"]

    # CORRECCIÓN: Filtramos a los usuarios cuyo perfil extendido sea Tipo 'D' (Doctor)
    # y usamos select_related para traer la data del perfil sin sobrecargar la BD
    queryset = User.objects.filter(perfil__tipo='D').select_related('perfil')
    serializer_class = UserListSerializer

class TokenRefreshView(SimpleJWTTokenRefreshView):
    permission_classes = [AllowAny]

class RegistroPublicoView(APIView):
    permission_classes = [AllowAny] # Permite el acceso sin enviar Token JWT

    def post(self, request):
        # Reutilizamos tu serializer de creación que ya tiene todas las validaciones
        serializer = EmployeeCreateUpdateSerializer(data=request.data)

        if serializer.is_valid():
            # Forzamos que cualquier registro desde este endpoint sea obligatoriamente 'participante'
            # Evita que un usuario malintencionado intente mandarse como 'superadmin' en el JSON
            serializer.validated_data['rol'] = 'participante'

            serializer.save()
            return Response({
                "message": "¡Registro exitoso! Ya puedes iniciar sesión en la plataforma."
            }, status=status.HTTP_201_CREATED)

        # Si la cédula, correo o COMEZU ya existen, devuelve los errores automáticamente a React
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@staff_member_required
def panel_certificados_view(request):
    # 1. Traemos todas las jornadas para llenar la barra de selección
    jornadas = Jornada.objects.all().order_by('-fecha_inicio')

    # 2. Capturamos si el administrador ya seleccionó una jornada
    jornada_seleccionada_id = request.GET.get('jornada_id')
    inscritos = None
    jornada_actual = None
    if jornada_seleccionada_id:
        jornada_actual = Jornada.objects.filter(id=jornada_seleccionada_id).first()
        # Traemos solo los inscritos de esa jornada con sus perfiles cargados
        inscritos = Inscripcion.objects.filter(jornada_id=jornada_seleccionada_id).select_related('usuario', 'usuario__perfil')
    context = {
        'jornadas': jornadas,
        'inscritos': inscritos,
        'jornada_actual': jornada_actual,
    }

    return render(request, 'usuario/panel_certificado.html', context)


from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from inscripcion.models import Inscripcion # Asegúrate de importar tu modelo
from jornada.models import Jornada

@staff_member_required
def reporte_conferencistas_pdf_view(request, jornada_id):
    jornada = get_object_or_404(Jornada, id=jornada_id)

    # 🌟 Filtramos las inscripciones: de esta jornada y que sean conferencistas ('C')
    conferencistas = Inscripcion.objects.filter(
        jornada=jornada,
        usuario__perfil__conferencista='C'
    ).select_related('usuario', 'usuario__perfil')

    response = HttpResponse(content_type='application/pdf')
    nombre_pdf = f"Conferencistas_{jornada.nombre.replace(' ', '_')}.pdf"
    response['Content-Disposition'] = f'attachment; filename="{nombre_pdf}"'

    doc = SimpleDocTemplate(response, pagesize=landscape(letter), rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
    story = []

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'TitleStyle', parent=styles['Heading1'], fontSize=18, leading=22, textColor=colors.HexColor('#0f172a'), spaceAfter=5
    )
    subtitle_style = ParagraphStyle(
        'SubTitleStyle', parent=styles['Normal'], fontSize=12, leading=16, textColor=colors.HexColor('#0284c7'), spaceAfter=20
    )
    cell_style = ParagraphStyle('Cell', parent=styles['Normal'], fontSize=9, leading=11)
    header_style = ParagraphStyle('HeaderCell', parent=styles['Normal'], fontSize=9, leading=11, textColor=colors.white, fontName='Helvetica-Bold')

    story.append(Paragraph("COLEGIO DE MÉDICOS DEL ESTADO ZULIA (COMEZU)", title_style))
    story.append(Paragraph(f"LISTADO OFICIAL DE CONFERENCISTAS - {jornada.nombre.upper()}", subtitle_style))
    story.append(Spacer(1, 10))

    # Encabezados de tabla sin campos de pago vacíos
    headers = [
        Paragraph("Cédula", header_style),
        Paragraph("Nombre Completo", header_style),
        Paragraph("Teléfono", header_style),
        Paragraph("Correo", header_style),
        Paragraph("COMEZU", header_style),
        Paragraph("Especialidad", header_style)
    ]

    data_tabla = [headers]

    for ins in conferencistas:
        perfil = getattr(ins.usuario, 'perfil', None)
        cedula = perfil.cedula if perfil else "-"
        nombre = f"{ins.usuario.first_name} {ins.usuario.last_name}"
        telefono = perfil.telefono if perfil else "-"
        correo = ins.usuario.email
        comezu = perfil.comezu if perfil and perfil.comezu else "-"
        especialidad = perfil.especialidad if perfil and perfil.especialidad else "-"

        row = [
            Paragraph(cedula, cell_style),
            Paragraph(nombre, cell_style),
            Paragraph(telefono, cell_style),
            Paragraph(correo, cell_style),
            Paragraph(comezu, cell_style),
            Paragraph(especialidad, cell_style)
        ]
        data_tabla.append(row)

    tabla_pdf = Table(data_tabla, colWidths=[72, 160, 90, 160, 80, 170])
    tabla_pdf.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e3a8a')), # Azul marino institucional
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
    ]))
    story.append(tabla_pdf)

    doc.build(story)
    return response