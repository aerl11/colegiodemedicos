import os
import re
from io import BytesIO

from django.conf import settings
from pptx import Presentation

from .models import Inscripcion


def _construir_nombre_titulado(usuario):
    """Aplica el protocolo del gremio (Dr./Dra.) y roles sobre el nombre del usuario."""
    first_name = (usuario.first_name or "").strip()
    last_name = (usuario.last_name or "").strip()
    nombre_base = f"{first_name} {last_name}".strip() or usuario.username.strip()

    # Limpiar cualquier prefijo ingresado manualmente en el nombre
    nombre_limpio = re.sub(r'^(dr\.|dra\.|dr|dra)\s+', '', nombre_base, flags=re.IGNORECASE).strip()

    prefijo = ""
    try:
        if usuario.perfil.tipo == 'D':
            prefijo = "Dra. " if usuario.perfil.genero == 'F' else "Dr. "
    except Exception:
        pass

    nombre_titulado = f"{prefijo}{nombre_limpio.upper()}"

    # Rol de Coordinador(a) — se asigna únicamente desde el admin de Django.
    rol_certificado = ""
    try:
        if usuario.perfil.coordinador:
            rol_certificado = "Coordinadora" if usuario.perfil.genero == 'F' else "Coordinador"
    except Exception:
        pass

    if rol_certificado:
        nombre_titulado = f"{nombre_titulado} — {rol_certificado}"

    return nombre_titulado


def generar_certificado_pptx(inscripcion):
    """
    Genera el certificado (archivo .pptx en memoria) para una inscripción.
    Devuelve un BytesIO listo para descargarse o adjuntarse a un correo.
    Lanza ValueError si no existe la plantilla.
    """
    usuario = inscripcion.usuario
    jornada = inscripcion.jornada

    nombre_titulado = _construir_nombre_titulado(usuario)

    # Sociedad científica del participante
    sociedad_certificado = ""
    try:
        sociedad_certificado = (usuario.perfil.sociedad or "").strip()
    except Exception:
        pass

    fecha_inicio_formateada = jornada.fecha_inicio.strftime('%d/%m/%Y')
    fecha_final_formateada = jornada.fecha_final.strftime('%d/%m/%Y')

    ruta_plantilla = os.path.join(settings.BASE_DIR, 'static', 'templates', 'plantilla_certificado.pptx')
    if not os.path.exists(ruta_plantilla):
        raise ValueError(f"No se encontró la plantilla en {ruta_plantilla}")

    prs = Presentation(ruta_plantilla)

    etiquetas = ['[NOMBRE_DOCTOR]', '[NOMBRE_JORNADA]', '[UC]', '[FECHA_INICIO]', '[FECHA_FINAL]', '[ROL]', '[SOCIEDAD]']

    def procesar_reemplazo(shape):
        if not shape.has_text_frame:
            return

        for paragraph in shape.text_frame.paragraphs:
            p_text = paragraph.text
            if any(tag in p_text for tag in etiquetas):
                p_text = p_text.replace('[NOMBRE_DOCTOR]', nombre_titulado)
                p_text = p_text.replace('[NOMBRE_JORNADA]', jornada.nombre)
                p_text = p_text.replace('[UC]', str(jornada.uc))
                p_text = p_text.replace('[FECHA_INICIO]', fecha_inicio_formateada)
                p_text = p_text.replace('[FECHA_FINAL]', fecha_final_formateada)
                p_text = p_text.replace('[ROL]', "")
                p_text = p_text.replace('[SOCIEDAD]', sociedad_certificado)

                # Blindaje: vaciamos los runs fragmentados y consolidamos el nuevo texto
                if paragraph.runs:
                    paragraph.runs[0].text = p_text
                    for run in paragraph.runs[1:]:
                        run.text = ""
                else:
                    paragraph.text = p_text

    for slide in prs.slides:
        for shape in slide.shapes:
            procesar_reemplazo(shape)
            if shape.has_table:
                for row in shape.table.rows:
                    for cell in row.cells:
                        procesar_reemplazo(cell)

    archivo = BytesIO()
    prs.save(archivo)
    archivo.seek(0)
    return archivo


def nombre_archivo_certificado(inscripcion):
    usuario = inscripcion.usuario
    return f"Certificado_{usuario.first_name}_{usuario.last_name}.pptx"
