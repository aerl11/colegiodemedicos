import os
from decimal import Decimal
from django.conf import settings
from django.http import HttpResponse
from django.utils import timezone
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generar_pdf_pagos(pagos, user, titulo_personalizado=None):
    """
    Genera y descarga un reporte oficial en PDF de los pagos suministrados,
    incluyendo el logotipo del Colegio de Médicos, encabezados y totales.
    """
    es_admin = (
        getattr(user, 'is_superuser', False) or
        getattr(user, 'is_staff', False) or
        (user.is_authenticated and user.groups.filter(name__in=['superadmin', 'staff']).exists())
    )

    response = HttpResponse(content_type='application/pdf')
    fecha_actual_str = timezone.now().strftime('%Y%m%d_%H%M%S')
    nombre_pdf = f"Reporte_Pagos_{fecha_actual_str}.pdf"
    response['Content-Disposition'] = f'attachment; filename="{nombre_pdf}"'

    # Documento en orientación horizontal (landscape letter)
    doc = SimpleDocTemplate(
        response,
        pagesize=landscape(letter),
        rightMargin=25,
        leftMargin=25,
        topMargin=25,
        bottomMargin=25
    )
    story = []

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=15,
        leading=18,
        textColor=colors.HexColor('#0f172a'),
        fontName='Helvetica-Bold',
        spaceAfter=2
    )
    subtitle_style = ParagraphStyle(
        'SubTitleStyle',
        parent=styles['Normal'],
        fontSize=10.5,
        leading=13,
        textColor=colors.HexColor('#0284c7'),
        fontName='Helvetica-Bold',
        spaceAfter=6
    )
    meta_style = ParagraphStyle(
        'MetaStyle',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#475569')
    )
    cell_style = ParagraphStyle(
        'Cell',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=10,
        textColor=colors.HexColor('#1e293b')
    )
    header_style = ParagraphStyle(
        'HeaderCell',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=10,
        textColor=colors.white,
        fontName='Helvetica-Bold'
    )
    total_style = ParagraphStyle(
        'TotalCell',
        parent=styles['Normal'],
        fontSize=9,
        leading=11,
        textColor=colors.HexColor('#0f172a'),
        fontName='Helvetica-Bold'
    )

    # Definición del título
    if titulo_personalizado:
        subtitulo_texto = titulo_personalizado
    elif es_admin:
        subtitulo_texto = "REPORTE GENERAL DE PAGOS - ADMINISTRACIÓN"
    else:
        nombre_user = f"{user.first_name} {user.last_name}".strip() or user.username
        subtitulo_texto = f"REPORTE DE PAGOS REGISTRADOS - {nombre_user}"

    ahora = timezone.now().strftime('%d/%m/%Y %I:%M %p')
    generado_por = f"{user.first_name} {user.last_name}".strip() or user.username

    # Ubicación del logotipo del Colegio de Médicos
    posibles_rutas_logo = [
        os.path.join(settings.BASE_DIR, 'static', 'img', 'emblema.png'),
        os.path.join(settings.BASE_DIR.parent, 'img', 'emblema.png'),
        os.path.join(settings.BASE_DIR.parent, 'Frontend', 'src', 'assets', 'emblema.png'),
    ]

    logo_element = None
    for ruta in posibles_rutas_logo:
        if os.path.exists(ruta):
            try:
                logo_element = RLImage(ruta, width=54, height=54)
                break
            except Exception:
                pass

    info_flowables = [
        Paragraph("COLEGIO DE MÉDICOS DEL ESTADO ZULIA (COMEZU)", title_style),
        Paragraph(subtitulo_texto, subtitle_style),
        Paragraph(f"<b>Fecha de emisión:</b> {ahora} &nbsp;&nbsp;|&nbsp;&nbsp; <b>Generado por:</b> {generado_por}", meta_style)
    ]

    if logo_element:
        header_table = Table([[logo_element, info_flowables]], colWidths=[65, 677])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ALIGN', (0, 0), (0, 0), 'CENTER'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(header_table)
    else:
        story.extend(info_flowables)

    story.append(Spacer(1, 10))

    headers = [
        Paragraph("N°", header_style),
        Paragraph("Participante", header_style),
        Paragraph("Cédula", header_style),
        Paragraph("Referencia", header_style),
        Paragraph("Forma de Pago", header_style),
        Paragraph("Jornada", header_style),
        Paragraph("Fecha Pago", header_style),
        Paragraph("Monto (Bs.)", header_style),
    ]

    data_tabla = [headers]
    total_recaudado = Decimal('0.00')

    for idx, p in enumerate(pagos, start=1):
        total_recaudado += Decimal(str(p.monto))

        u = p.usuario
        nombre_participante = f"{u.first_name} {u.last_name}".strip() or u.username
        perfil = getattr(u, 'perfil', None)
        cedula = perfil.cedula if perfil and perfil.cedula else "-"
        ref = p.referencia_pago or "-"
        tipo = p.get_tipo_pago_display()
        jornada_nombre = "-"
        if hasattr(p, 'inscripcion') and p.inscripcion and p.inscripcion.jornada:
            jornada_nombre = p.inscripcion.jornada.nombre

        fecha_pago_str = p.fecha_pago.strftime('%d/%m/%Y') if p.fecha_pago else "-"
        monto_str = f"Bs. {p.monto:,.2f}"

        row = [
            Paragraph(str(idx), cell_style),
            Paragraph(nombre_participante, cell_style),
            Paragraph(cedula, cell_style),
            Paragraph(ref, cell_style),
            Paragraph(tipo, cell_style),
            Paragraph(jornada_nombre, cell_style),
            Paragraph(fecha_pago_str, cell_style),
            Paragraph(monto_str, cell_style),
        ]
        data_tabla.append(row)

    fila_total = [
        Paragraph("", total_style),
        Paragraph(f"<b>TOTAL REGISTROS: {len(pagos)}</b>", total_style),
        Paragraph("", total_style),
        Paragraph("", total_style),
        Paragraph("", total_style),
        Paragraph("", total_style),
        Paragraph("<b>TOTAL RECAUDADO:</b>", total_style),
        Paragraph(f"<b>Bs. {total_recaudado:,.2f}</b>", total_style),
    ]
    data_tabla.append(fila_total)

    # 742 pt disponible en landscape(letter)
    tabla_pdf = Table(data_tabla, colWidths=[25, 140, 65, 85, 100, 180, 65, 82])
    tabla_pdf.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e3a8a')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('TOPPADDING', (0, 0), (-1, 0), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.HexColor('#f8fafc')]),
        ('GRID', (0, 0), (-1, -2), 0.5, colors.HexColor('#cbd5e1')),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#e2e8f0')),
        ('LINEABOVE', (0, -1), (-1, -1), 1.5, colors.HexColor('#0f172a')),
        ('TOPPADDING', (0, 1), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
    ]))

    story.append(tabla_pdf)
    doc.build(story)
    return response
