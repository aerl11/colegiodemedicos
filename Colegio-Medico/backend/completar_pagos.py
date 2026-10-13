"""
Completa los pagos e inscripciones que faltan del archivo 'bdd form.xlsx'.

Busca usuarios ya registrados por cédula (PerfilUsuario) o correo, y crea el
Pago y la Inscripción en la Jornada 1 cuando no existen. Filas "Ponente" o
"exonerado" se registran como inscripción sin pago. Filas con datos basura se
omiten. Es idempotente: no duplica pagos ni inscripciones existentes.
"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'colegio_backend.settings')
import django
django.setup()

import re
from datetime import datetime, date
from decimal import Decimal, InvalidOperation

import openpyxl
from django.db import transaction
from django.db.models.signals import post_save

from django.contrib.auth.models import User
from usuario.models import PerfilUsuario
from pago.models import Pago
from inscripcion.models import Inscripcion
from jornada.models import Jornada

RUTA = r'..\bdd form.xlsx'
JORNADA_ID = 1

# Desconectamos correos automáticos mientras corre la importación
try:
    from usuario import signals as usuario_signals
    post_save.disconnect(usuario_signals.notificar_registro_exitoso, sender=User)
except Exception:
    pass

# Desconectamos también el correo de notificación de inscripción (SMTP lento)
try:
    from inscripcion import signals as inscripcion_signals
    post_save.disconnect(inscripcion_signals.notificar_inscripcion, sender=Inscripcion)
except Exception:
    pass


def limpiar(t):
    return '' if t is None else ' '.join(str(t).split())


def cedula_de(v):
    if isinstance(v, float) and v == int(v):
        v = int(v)
    t = limpiar(v).replace(' ', '')
    return t if t.isdigit() else None


def parse_fecha(valor):
    """Devuelve un date o None."""
    if isinstance(valor, datetime):
        return valor.date()
    if isinstance(valor, date):
        return valor
    texto = limpiar(valor).lower()
    if not texto:
        return None
    texto = (texto
             .replace('de septiembre', 'sep').replace('septiembre', 'sep')
             .replace('de octubre', 'oct').replace('octubre', 'oct')
             .replace('de agosto', 'ago').replace('agosto', 'ago')
             .replace(' de ', ' ')
             .strip(' .,'))
    meses = {m: i + 1 for i, m in enumerate(
        ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'])}
    # dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy, y también mm/dd invertidas corregibles
    m = re.search(r'\b(\d{1,2})\s*[/.,\-]\s*(\d{1,2})\s*[/.,\-]\s*(\d{2,4})\b', texto)
    if m:
        d, mo, y = (int(x) for x in m.groups())
        y = y + 2000 if y < 100 else y
        if y != 2026:
            y = 2026
        if mo > 12 and d <= 12:   # mm/dd -> dd/mm
            d, mo = mo, d
        try:
            return date(y, mo, d)
        except ValueError:
            return None
    # "30 sep", "2 de OCTUBRE 2026", "5 de octubre"
    m = re.match(r'^(\d{1,2})\s+([a-záéíóú]+)', texto)
    if m:
        d = int(m.group(1))
        mo = meses.get(m.group(2)[:3])
        if mo:
            try:
                return date(2026, mo, d)
            except ValueError:
                return None
    # "08/10" sin año
    m = re.match(r'^(\d{1,2})\s*[/.,\-]\s*(\d{1,2})$', texto)
    if m:
        d, mo = int(m.group(1)), int(m.group(2))
        if mo > 12 and d <= 12:
            d, mo = mo, d
        try:
            return date(2026, mo, d)
        except ValueError:
            return None
    return None


def parse_monto(valor):
    """Devuelve Decimal o None."""
    if valor is None:
        return None
    if isinstance(valor, (int, float)):
        m = float(valor)
        if 0 < m < 100:
            m *= 1000          # 8.72 -> 8720 (punto decimal perdido)
        elif 100 < m < 1000:
            m *= 10            # 875 -> 8750
        elif m >= 100000:
            m /= 100           # 875678 -> 8756.78 (miles tecleados sin punto)
        return Decimal(str(round(m, 2)))
    texto = limpiar(valor).lower()
    if not texto or 'ponente' in texto or 'exonerado' in texto:
        return None
    texto = re.sub(r'[^0-9.,]', '', texto)
    if not texto:
        return None
    if ',' in texto:
        texto = texto.replace('.', '').replace(',', '.')
    try:
        m = float(texto)
    except ValueError:
        # "8.713.69" / "8,713,69": varios separadores. Quitar todo y asumir
        # que el último grupo de 2 dígitos son los decimales.
        t2 = texto.replace('.', '').replace(',', '')
        m2 = re.fullmatch(r'(\d+)(\d{2})', t2)
        if m2:
            m = int(m2.group(1)) + int(m2.group(2)) / 100
        else:
            return None
    # "8.590.00" / "8.738.67": puntos como separadores de miles con decimales reales.
    # Si quedó con valor absurdo (>50000) es porque faltó convertir el último punto.
    if m >= 50000:
        m /= 1000
    if 0 < m < 100:
        m *= 1000
    elif 100 < m < 1000:
        m *= 10
    elif m >= 100000:
        m /= 100
    return Decimal(str(round(m, 2)))


def parse_ref(valor):
    t = limpiar(valor)
    # Extrae el primer número largo como referencia
    m = re.search(r'\d{4,}', t)
    return m.group(0)[:50] if m else ''


def es_basura(nombre, ced, fecha, monto, ref):
    """Filas de prueba o con datos no interpretables."""
    if ced is None:
        return True
    # Monto y fecha basura ("Fndj", "Ndndj") -> nada de lo que recuperar
    if isinstance(monto, str) and not re.search(r'\d', monto) and isinstance(fecha, str) and not re.search(r'\d', fecha):
        return True
    # fecha numérica absurda ('123567' / '123567.0' como fecha de prueba):
    # solo si el valor ORIGINAL es puramente numérico
    texto_fecha = limpiar(fecha).replace('.0', '')
    if re.fullmatch(r'\d{5,}', texto_fecha):
        return True
    return False


def run():
    wb = openpyxl.load_workbook(RUTA, data_only=True)
    ws = wb.worksheets[0]
    jornada = Jornada.objects.get(id=JORNADA_ID)

    perfiles = {}
    for p in PerfilUsuario.objects.exclude(cedula__isnull=True).select_related('user'):
        perfiles[p.cedula] = p
    emails_bd = {e.lower(): None for e in User.objects.values_list('email', flat=True) if e}
    # mapa email -> user
    emails_bd = {u.email.lower(): u for u in User.objects.exclude(email='')}

    pagos_user = {}
    for p in Pago.objects.all():
        pagos_user.setdefault(p.usuario_id, 0)
        pagos_user[p.usuario_id] += 1
    insc_user = {i.usuario_id: i.jornada_id for i in Inscripcion.objects.all()}

    creados_pago, creados_insc, ponentes, omitidas, ya_ok = 0, 0, 0, 0, 0
    problemas = []
    vistos = set()

    for n, fila in enumerate(ws.iter_rows(min_row=2), start=2):
        v = [c.value for c in fila]
        email = limpiar(v[1]).lower()
        nombre = limpiar(v[2])
        ced = cedula_de(v[4])
        fecha_raw = v[7]
        monto_raw = v[8]
        ref = parse_ref(v[9])

        if not nombre and not email:
            continue
        clave = ced or email
        if clave in vistos:
            omitidas += 1      # duplicado en el Excel
            continue
        vistos.add(clave)

        if es_basura(nombre, ced, fecha_raw, monto_raw, ref):
            omitidas += 1
            continue

        # Buscar usuario
        user = None
        perfil = perfiles.get(ced) if ced else None
        if perfil:
            user = perfil.user
        elif email and email in emails_bd:
            user = emails_bd[email]
        if user is None:
            problemas.append(f'fila {n}: {nombre} (ced={ced}, {email}) — usuario no encontrado en BD')
            continue

        ya_inscrito = insc_user.get(user.id) == jornada.id
        tiene_pago = pagos_user.get(user.id, 0) > 0

        if ya_inscrito and tiene_pago:
            ya_ok += 1
            continue

        monto = parse_monto(monto_raw)
        fecha = parse_fecha(fecha_raw)
        # Respaldo: usar la marca temporal de la fila (columna 0) como fecha de pago
        if fecha is None and monto is not None and v[0] is not None:
            fecha = parse_fecha(v[0])
        es_ponente = 'ponente' in limpiar(monto_raw).lower() or 'exonerado' in limpiar(monto_raw).lower()

        with transaction.atomic():
            # Crear inscripción si falta (también para ponentes/exonerados)
            if not ya_inscrito:
                Inscripcion.objects.get_or_create(
                    usuario=user, jornada=jornada,
                    defaults={'pago': None})
                creados_insc += 1

            # Crear pago solo si hay datos reales
            if monto is not None and fecha is not None and not es_ponente:
                Pago.objects.create(
                    fecha_pago=fecha,
                    monto=monto,
                    referencia_pago=(ref or f'SIN-REF-{user.id}')[:50],
                    tipo_pago='PM',
                    usuario=user,
                )
                pagos_user[user.id] = pagos_user.get(user.id, 0) + 1
                creados_pago += 1
                # Vincular el pago a la inscripción si no tiene
                ins = Inscripcion.objects.filter(usuario=user, jornada=jornada, pago__isnull=True).first()
                if ins:
                    ins.pago = Pago.objects.filter(usuario=user).order_by('-id').first()
                    ins.save(update_fields=['pago'])
            elif es_ponente:
                ponentes += 1

    print(f'Resultado: {creados_pago} pagos creados, {creados_insc} inscripciones creadas, '
          f'{ponentes} ponentes/exonerados (sin pago), {ya_ok} ya completos, {omitidas} omitidas (duplicadas/basura).')
    if problemas:
        print(f'\nATENCIÓN — {len(problemas)} filas sin usuario en BD:')
        for p in problemas:
            print('  ' + p)


if __name__ == '__main__':
    run()
