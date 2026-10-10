"""
Importa los usuarios del archivo 'bdd form.xlsx' (respuestas del formulario)
a la base de datos del sistema COMEZU.

Crea por cada fila: User (username = cédula), PerfilUsuario (Doctor/Estudiante),
Pago (fecha, monto y referencia si son válidos) e Inscripción en la Jornada id=1
(Congreso Cientifico). Las filas duplicadas (misma cédula) se omiten.
"""
import re
import os
import unicodedata
from datetime import datetime, date

import openpyxl

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'colegio_backend.settings')

import django
django.setup()

from django.contrib.auth.models import User
from django.db import transaction

from usuario.models import PerfilUsuario
from pago.models import Pago
from inscripcion.models import Inscripcion
from jornada.models import Jornada

RUTA_EXCEL = r'..\bdd form.xlsx'
JORNADA_ID = 1
PASSWORD_DEFAULT = 'Comezu2026*'


def limpiar(texto):
    if texto is None:
        return ''
    return re.sub(r'\s+', ' ', str(texto)).strip()


def parse_fecha(valor):
    """Devuelve un date o None si no se puede interpretar."""
    if isinstance(valor, datetime):
        return valor.date()
    if isinstance(valor, date):
        return valor
    texto = limpiar(valor).lower()
    if not texto:
        return None
    texto = texto.replace('de septiembre', 'sep').replace('septiembre', 'sep')
    texto = texto.replace('octubre', 'oct').replace('agosto', 'ago')
    texto = texto.replace(' de ', ' ').strip(' .,')
    meses = {m: i + 1 for i, m in enumerate(
        ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
         'jul', 'ago', 'sep', 'oct', 'nov', 'dic'])}
    # dd/mm/yyyy o dd-mm-yyyy o dd.mm.yyyy
    m = re.search(r'\b(\d{1,2})\s*[/.,\-]\s*(\d{1,2})\s*[/.,\-]\s*(\d{2,4})\b', texto)
    if m:
        d, mo, y = (int(x) for x in m.groups())
        y = y + 2000 if y < 100 else y
        # Corrección de años mal tecleados (todas las fechas son de 2026)
        if y != 2026:
            y = 2026
        try:
            return date(y, mo, d)
        except ValueError:
            return None
    # "30 sep" o "30 sep 2026"
    m = re.match(r'^(\d{1,2})\s+([a-záéíóú]+)', texto)
    if m:
        d = int(m.group(1))
        mo = meses.get(m.group(2)[:3])
        ym = re.search(r'(20\d{2})', texto)
        y = int(ym.group(1)) if ym else 2026
        if mo:
            try:
                return date(y, mo, d)
            except ValueError:
                return None
    # "30/9" o "30-9" (sin año, se asume 2026)
    m = re.match(r'^(\d{1,2})\s*[/.,\-]\s*(\d{1,2})$', texto)
    if m:
        d, mo = int(m.group(1)), int(m.group(2))
        try:
            return date(2026, mo, d)
        except ValueError:
            return None
    return None


def parse_monto(valor):
    """Devuelve un Decimal o None."""
    if valor is None:
        return None
    if isinstance(valor, (int, float)):
        m = float(valor)
        # Montos mal tecleados (punto decimal perdido): 8.72 -> 8720
        if 0 < m < 100:
            m = m * 1000
        elif 100 < m < 1000:
            m = m * 10
        elif m >= 100000:
            m = m / 100
        return round(m, 2)
    texto = limpiar(valor).lower()
    if not texto or 'ponente' in texto or 'exonerado' in texto:
        return None
    texto = re.sub(r'[^0-9.,]', '', texto)
    if not texto:
        return None
    if ',' in texto:
        texto = texto.replace('.', '').replace(',', '.')
    try:
        return round(float(texto), 2)
    except ValueError:
        return None


def parse_cedula(valor):
    if isinstance(valor, (int, float)) and valor == int(valor):
        texto = str(int(valor))
    else:
        texto = limpiar(valor).replace(' ', '')
    if not texto or not texto.isdigit():
        return None
    return texto.lstrip('0') or None


def nombre_usuario(nombre_completo, cedula):
    """Genera un username a partir del nombre completo (sin acentos)."""
    base = unicodedata.normalize('NFKD', nombre_completo)
    base = ''.join(c for c in base if not unicodedata.combining(c))
    base = re.sub(r"[^a-zA-Z\s]", '', base).strip().lower()
    partes = base.split()
    if not partes:
        return f'user{cedula}'
    usuario = partes[0] + (partes[-1] if len(partes) > 1 else '')
    return (usuario or f'user{cedula}')[:30]


def dividir_nombre(nombre_completo):
    partes = limpiar(nombre_completo).split()
    if not partes:
        return '', ''
    if len(partes) == 1:
        return partes[0], ''
    return ' '.join(partes[:-1]), partes[-1]


def run():
    # Evitamos enviar correos de bienvenida reales durante la importación
    from django.db.models.signals import post_save
    from usuario import signals as usuario_signals
    post_save.disconnect(usuario_signals.notificar_registro_exitoso, sender=User)

    wb = openpyxl.load_workbook(RUTA_EXCEL, data_only=True)
    ws = wb.worksheets[0]

    jornada = Jornada.objects.get(id=JORNADA_ID)
    creados, duplicados, sin_datos, inscritos = 0, 0, 0, 0

    for fila in ws.iter_rows(min_row=2):
        valores = [c.value for c in fila]
        email = limpiar(valores[1]).lower()
        nombre = limpiar(valores[2])
        nacionalidad = (limpiar(valores[3]) or 'V').upper()[:1] or 'V'
        cedula = parse_cedula(valores[4])
        titulo = limpiar(valores[5]).upper()
        telefono = limpiar(valores[6])
        fecha_pago = parse_fecha(valores[7])
        monto = parse_monto(valores[8])
        referencia = limpiar(valores[9])

        # Fila vacía o sin nombre
        if not nombre or not email:
            if nombre or email:
                sin_datos += 1
            continue

        # Filas de prueba con datos basura ("Bdnnd", "Ndndn")
        if cedula is None and monto is None:
            sin_datos += 1
            continue

        clave = cedula or email
        if cedula and PerfilUsuario.objects.filter(cedula=cedula).exists():
            duplicados += 1
            continue
        if not cedula and User.objects.filter(email__iexact=email).exists():
            duplicados += 1
            continue

        tipo = 'E' if 'ESTUD' in titulo else 'D'
        first_name, last_name = dividir_nombre(nombre)
        username = nombre_usuario(nombre, cedula or 'x')
        username_base, n = username, 1
        while User.objects.filter(username=username).exists():
            n += 1
            username = f'{username_base}{n}'[:30]

        with transaction.atomic():
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                password=PASSWORD_DEFAULT,
            )
            PerfilUsuario.objects.create(
                user=user,
                tipo=tipo,
                nacionalidad=nacionalidad if nacionalidad in ('V', 'E') else 'V',
                cedula=cedula,
                telefono=telefono or None,
            )

            # Pago e inscripción solo si hay datos de pago reales
            if fecha_pago and monto is not None:
                ref = referencia or f'SIN-REF-{user.id}'
                pago = Pago.objects.create(
                    fecha_pago=fecha_pago,
                    monto=monto,
                    referencia_pago=ref[:50],
                    tipo_pago='PM',
                    usuario=user,
                )
                Inscripcion.objects.get_or_create(
                    usuario=user, jornada=jornada, defaults={'pago': pago}
                )
                inscritos += 1

        creados += 1
        print(f'[OK] {username} | {nombre} | ced={cedula} | pago={monto} {fecha_pago}')

    print(f'\nResumen: {creados} creados, {duplicados} duplicados omitidos, '
          f'{sin_datos} filas sin datos válidos, {inscritos} con pago/inscripción.')


if __name__ == '__main__':
    run()
