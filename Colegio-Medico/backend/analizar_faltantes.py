"""
Análisis: compara 'bdd form.xlsx' contra la BD y reporta lo que falta.
"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'colegio_backend.settings')
import django
django.setup()

from collections import Counter
import openpyxl
from django.contrib.auth.models import User
from usuario.models import PerfilUsuario
from pago.models import Pago
from inscripcion.models import Inscripcion
from jornada.models import Jornada

RUTA = r'..\bdd form.xlsx'

def limpiar(t):
    return '' if t is None else ' '.join(str(t).split())

def cedula_de(v):
    if isinstance(v, float) and v == int(v):
        v = int(v)
    t = limpiar(v).replace(' ', '')
    return t if t.isdigit() else None

wb = openpyxl.load_workbook(RUTA, data_only=True)
ws = wb.worksheets[0]

jornada = Jornada.objects.first()
print(f'Jornada en BD: id={jornada.id} {jornada.nombre}')
perfiles = {p.cedula: p for p in PerfilUsuario.objects.exclude(cedula__isnull=True)}
print(f'Perfiles con cedula en BD: {len(perfiles)}')
emails_bd = set(User.objects.values_list('email', flat=True))
emails_bd_low = {e.lower() for e in emails_bd if e}
pagos_por_user = Counter(Pago.objects.values_list('usuario_id', flat=True))
inscripciones_user = {i.usuario_id: i.jornada_id for i in Inscripcion.objects.all()}

faltan_todo, faltan_pago, ok, filas_basura = [], [], 0, 0
duplicados_excel = []

vistos = set()
for n, fila in enumerate(ws.iter_rows(min_row=2), start=2):
    v = [c.value for c in fila]
    email = limpiar(v[1]).lower()
    nombre = limpiar(v[2])
    ced = cedula_de(v[4])
    fecha = v[7]
    monto = v[8]

    if not nombre and not email:
        continue
    if ced is None and not str(monto or '').strip().replace('.', '').isdigit():
        # fila de prueba / basura
        filas_basura += 1
        continue
    clave = ced or email
    if clave in vistos:
        duplicados_excel.append((n, nombre, ced))
        continue
    vistos.add(clave)

    perfil = perfiles.get(ced) if ced else None
    user = None
    if perfil:
        user = perfil.user
    elif email in emails_bd_low:
        user = User.objects.filter(email__iexact=email).first()

    if user is None:
        faltan_todo.append((n, nombre, ced, email, str(fecha), str(monto)))
        continue

    npagos = pagos_por_user.get(user.id, 0)
    inscr = inscripciones_user.get(user.id)
    if npagos == 0:
        faltan_pago.append((n, nombre, ced, email, user.id, str(fecha), str(monto), limpiar(v[9])))
    elif inscr != jornada.id:
        faltan_pago.append((n, nombre, ced, email, user.id, str(fecha), str(monto), limpiar(v[9]), 'SIN INSCRIPCION'))
    else:
        ok += 1

print(f'\nFilas únicas válidas: {len(vistos)} | OK en BD: {ok} | basura/prueba: {filas_basura} | duplicadas en Excel: {len(duplicados_excel)}')
print(f'\n=== SIN USUARIO NI PERFIL EN BD ({len(faltan_todo)}) ===')
for f in faltan_todo:
    print(f'  fila {f[0]}: {f[1]} | ced={f[2]} | {f[3]} | fecha={f[4]} | monto={f[5]}')
print(f'\n=== CON USUARIO PERO SIN PAGO/INSCRIPCION ({len(faltan_pago)}) ===')
for f in faltan_pago:
    print(f'  fila {f[0]}: {f[1]} | ced={f[2]} | user_id={f[4]} | fecha={f[5]} | monto={f[6]} | ref={f[7]} {f[8] if len(f)>8 else ""}')
