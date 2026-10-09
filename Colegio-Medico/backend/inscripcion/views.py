import os
import re
from django.conf import settings
from django.utils import timezone
from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404
from django.contrib.admin.views.decorators import staff_member_required
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Inscripcion
from .serializers import InscripcionSerializer
from .certificados import generar_certificado_pdf, nombre_archivo_certificado
from jornada.models import Jornada
from usuario.permissions import HasRole
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import action

# Elementos de ReportLab para armar el PDF de forma estética
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

# --- API ENDPOINT PARA REACT ---
class InscripcionViewSet(viewsets.ModelViewSet):
    # authentication_classes = [JWTAuthentication, SessionAuthentication]
    # permission_classes = [HasRole]
    # required_roles = ["superadmin", "staff", "participante"]
    serializer_class = InscripcionSerializer

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Inscripcion.objects.none()
        # Si es superadmin o tiene rol staff/superadmin, ve todas
        user_roles = set(user.groups.values_list("name", flat=True))
        if user.is_superuser or "superadmin" in user_roles or "staff" in user_roles:
            return Inscripcion.objects.all()
        # Si es participante, solo ve las suyas
        return Inscripcion.objects.filter(usuario=user)

    @action(detail=True, methods=['get'])
    def certificado(self, request, pk=None):
        inscripcion = get_object_or_404(Inscripcion, id=pk)
        usuario = inscripcion.usuario
        jornada = inscripcion.jornada

        # Validar si la jornada ya culminó
        hoy = timezone.now().date()
        es_admin = (
            getattr(request.user, 'is_superuser', False) or
            getattr(request.user, 'is_staff', False) or
            (request.user.is_authenticated and request.user.groups.filter(name__in=['superadmin', 'staff']).exists())
        )

        if jornada.fecha_final and hoy < jornada.fecha_final and not es_admin:
            fecha_culminacion = jornada.fecha_final.strftime('%d/%m/%Y')
            return Response(
                {
                    "detail": f"El certificado no está disponible aún. Podrá descargarlo a partir del {fecha_culminacion}, una vez culminada la jornada científica."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generar el certificado reutilizando la lógica central (la misma que usa el envío por correo)
        try:
            archivo = generar_certificado_pdf(inscripcion)
        except ValueError as e:
            return HttpResponse(f"Error: {e}", status=404)

        # Configurar la respuesta para la descarga del archivo
        response = HttpResponse(
            archivo.read(),
            content_type='application/pdf'
        )
        response['Content-Disposition'] = f'attachment; filename="{nombre_archivo_certificado(inscripcion)}"'
        return response

# @staff_member_required
# def reporte_jornada_pdf_view(request, jornada_id):
#     jornada = get_object_or_404(Jornada, id=jornada_id)

#     # Traemos las inscripciones de esa jornada (asumiendo que tienes relación con el Pago)
#     # NOTA: Ajusta 'pago' según cómo se llame la relación inversa o el campo en tu modelo Inscripcion
#     inscritos = Inscripcion.objects.filter(jornada=jornada).select_related('usuario', 'usuario__perfil', 'pago')
#     # Configurar respuesta HTTP para descargar PDF en horizontal (landscape) para que quepan todas las columnas
#     response = HttpResponse(content_type='application/pdf')
#     nombre_pdf = f"Reporte_{jornada.nombre.replace(' ', '_')}.pdf"
#     response['Content-Disposition'] = f'attachment; filename="{nombre_pdf}"'
#     # Crear el documento en formato carta y horizontal
#     doc = SimpleDocTemplate(response, pagesize=landscape(letter), rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
#     story = []

#     # Estilos de texto
#     styles = getSampleStyleSheet()
#     title_style = ParagraphStyle(
#         'TitleStyle',
#         parent=styles['Heading1'],
#         fontSize=18,
#         leading=22,
#         textColor=colors.HexColor('#0f172a'),
#         spaceAfter=5
#     )
#     subtitle_style = ParagraphStyle(
#         'SubTitleStyle',
#         parent=styles['Normal'],
#         fontSize=12,
#         leading=16,
#         textColor=colors.HexColor('#475569'),
#         spaceAfter=20
#     )
#     cell_style = ParagraphStyle('Cell', parent=styles['Normal'], fontSize=9, leading=11)
#     header_style = ParagraphStyle('HeaderCell', parent=styles['Normal'], fontSize=9, leading=11, textColor=colors.white, fontName='Helvetica-Bold')
#     # Encabezado del PDF
#     story.append(Paragraph("COLEGIO DE MÉDICOS DEL ESTADO ZULIA (COMEZU)", title_style))
#     story.append(Paragraph(f"LISTADO OFICIAL DE PARTICIPANTES Y PAGOS - {jornada.nombre.upper()}", subtitle_style))
#     story.append(Spacer(1, 10))
#     # Definir los títulos de la tabla
#     headers = [
#         Paragraph("Cédula", header_style),
#         Paragraph("Nombre Completo", header_style),
#         Paragraph("Teléfono", header_style),
#         Paragraph("Correo", header_style),
#         Paragraph("Referencia", header_style),
#         Paragraph("Monto", header_style),
#         Paragraph("Fecha Pago", header_style)
#     ]

#     data_tabla = [headers]
#     # Rellenar la tabla con la data de la BD
#     for ins in inscritos:
#         perfil = getattr(ins.usuario, 'perfil', None)
#         pago = getattr(ins, 'pago', None) # Ajusta según tu modelo real

#         cedula = perfil.cedula if perfil else "-"
#         nombre = f"{ins.usuario.first_name} {ins.usuario.last_name}"
#         telefono = perfil.telefono if perfil else "-"
#         correo = ins.usuario.email

#         # Datos del pago (manejamos campos vacíos por si acaso)
#         ref = pago.referencia_pago if pago else "-"
#         monto = f"{pago.monto} Bs" if pago else "-" # O la moneda que manejes
#         fecha_pago = pago.fecha_pago.strftime('%d/%m/%Y') if pago and pago.fecha_pago else "-"
#         row = [
#             Paragraph(cedula, cell_style),
#             Paragraph(nombre, cell_style),
#             Paragraph(telefono, cell_style),
#             Paragraph(correo, cell_style),
#             Paragraph(ref, cell_style),
#             Paragraph(monto, cell_style),
#             Paragraph(fecha_pago, cell_style)
#         ]
#         data_tabla.append(row)
#     # Diseñar la tabla (Anchos de columnas proporcionales en formato Horizontal)
#     # Total disponible aprox: 732 puntos
#     tabla_pdf = Table(data_tabla, colWidths=[70, 150, 80, 160, 80, 72, 120])

#     # Aplicar estilos visuales elegantes (Estilo institucional)
#     tabla_pdf.setStyle(TableStyle([
#         ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')), # Encabezado oscuro azul/negro
#         ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
#         ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
#         ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
#         ('TOPPADDING', (0, 0), (-1, 0), 8),
#         ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]), # Filas alternadas gris claro
#         ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')), # Bordes delgados y limpios
#         ('TOPPADDING', (0, 1), (-1, -1), 6),
#         ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
#     ]))
#     story.append(tabla_pdf)

#     # Construir el PDF
#     doc.build(story)
#     return response

@staff_member_required
def reporte_jornada_pdf_view(request, jornada_id):
    jornada = get_object_or_404(Jornada, id=jornada_id)

    inscritos = Inscripcion.objects.filter(jornada=jornada).select_related('usuario', 'usuario__perfil', 'pago')

    # 🌟 OBTENEMOS EL TOTAL DE PARTICIPANTES
    total_participantes = inscritos.count()

    response = HttpResponse(content_type='application/pdf')
    nombre_pdf = f"Reporte_{jornada.nombre.replace(' ', '_')}.pdf"
    response['Content-Disposition'] = f'attachment; filename="{nombre_pdf}"'

    doc = SimpleDocTemplate(response, pagesize=landscape(letter), rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
    story = []

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=5
    )
    subtitle_style = ParagraphStyle(
        'SubTitleStyle',
        parent=styles['Normal'],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#475569'),
        spaceAfter=10  # Reducido un poco para dar espacio al total
    )

    # 🌟 NUEVO ESTILO PARA EL CAMPO DEL TOTAL DE PARTICIPANTES
    total_style = ParagraphStyle(
        'TotalStyle',
        parent=styles['Normal'],
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#1e40af'),  # Azul institucional destacado
        fontName='Helvetica-Bold',
        spaceAfter=15
    )

    cell_style = ParagraphStyle('Cell', parent=styles['Normal'], fontSize=9, leading=11)
    header_style = ParagraphStyle('HeaderCell', parent=styles['Normal'], fontSize=9, leading=11, textColor=colors.white, fontName='Helvetica-Bold')

    # Encabezado del PDF
    story.append(Paragraph("COLEGIO DE MÉDICOS DEL ESTADO ZULIA (COMEZU)", title_style))
    story.append(Paragraph(f"LISTADO OFICIAL DE PARTICIPANTES Y PAGOS - {jornada.nombre.upper()}", subtitle_style))

    # 🌟 AGREGAMOS EL CAMPO DESTACADO CON EL TOTAL DE INSCRITOS
    story.append(Paragraph(f"Total de Participantes Inscritos: {total_participantes}", total_style))
    story.append(Spacer(1, 5))

    headers = [
        Paragraph("Cédula", header_style),
        Paragraph("Nombre Completo", header_style),
        Paragraph("Teléfono", header_style),
        Paragraph("Correo", header_style),
        Paragraph("Referencia", header_style),
        Paragraph("Monto", header_style),
        Paragraph("Fecha Pago", header_style)
    ]

    data_tabla = [headers]

    for ins in inscritos:
        perfil = getattr(ins.usuario, 'perfil', None)
        pago = getattr(ins, 'pago', None)

        cedula = perfil.cedula if perfil else "-"
        nombre = f"{ins.usuario.first_name} {ins.usuario.last_name}"
        telefono = perfil.telefono if perfil else "-"
        correo = ins.usuario.email

        ref = pago.referencia_pago if pago else "-"
        monto = f"{pago.monto} Bs" if pago else "-"
        fecha_pago = pago.fecha_pago.strftime('%d/%m/%Y') if pago and pago.fecha_pago else "-"

        row = [
            Paragraph(cedula, cell_style),
            Paragraph(nombre, cell_style),
            Paragraph(telefono, cell_style),
            Paragraph(correo, cell_style),
            Paragraph(ref, cell_style),
            Paragraph(monto, cell_style),
            Paragraph(fecha_pago, cell_style)
        ]
        data_tabla.append(row)

    tabla_pdf = Table(data_tabla, colWidths=[70, 150, 80, 160, 80, 72, 120])

    tabla_pdf.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
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