"""
Segunda pasada: importa las personas del Excel que faltan en la BD,
permitiendo que varias personas compartan el mismo correo (familiares).

La clave de persona es: cedula (si es válida) o (email + nombre completo).
"""
import importlib.util
import re
import unicodedata

import openpyxl

import importar_bdd_form as base
from django.db import transaction
from django.contrib.auth.models import User
from usuario.models import PerfilUsuario
from pago.models import Pago
from inscripcion.models import Inscripcion
from jornada.models import Jornada


def slug(nombre):
    base_txt = unicodedata.normalize('NFKD', nombre)
    base_txt = ''.join(c for c in base_txt if not unicodedata.combining(c))
    base_txt = re.sub(r"[^a-zA-Z\s]", '', base_txt).strip().lower()
    partes = base_txt.split()
    if not partes:
        return 'user'
    return (partes[0] + (partes[-1] if len(partes) > 1 else ''))[:30]


def run():
    # Sin correos automáticos durante la importación
    from django.db.models.signals import post_save
    from usuario import signals as usuario_signals
    post_save.disconnect(usuario_signals.notificar_registro_exitoso, sender=User)

    wb = openpyxl.load_workbook(base.RUTA_EXCEL, data_only=True)
    ws = wb.worksheets[0]
    jornada = Jornada.objects.get(id=base.JORNADA_ID)

    creados = omitidos = 0
    for fila in ws.iter_rows(min_row=2):
        v = [c.value for c in fila]
        email = base.limpiar(v[1]).lower()
        nombre = base.limpiar(v[2])
        nacionalidad = (base.limpiar(v[3]) or 'V').upper()[:1] or 'V'
        cedula = base.parse_cedula(v[4])
        titulo = base.limpiar(v[5]).upper()
        telefono = base.limpiar(v[6])
        fecha_pago = base.parse_fecha(v[7])
        monto = base.parse_monto(v[8])
        referencia = base.limpiar(v[9])

        if not nombre or not email:
            continue
        if cedula is None and monto is None:
            continue  # filas de prueba

        # ¿Ya existe esta persona?
        if cedula and PerfilUsuario.objects.filter(cedula=cedula).exists():
            omitidos += 1
            continue
        if not cedula:
            existe = User.objects.filter(
                email__iexact=email,
                first_name__iexact=base.dividir_nombre(nombre)[0],
            ).exists()
            if existe:
                omitidos += 1
                continue

        tipo = 'E' if 'ESTUD' in titulo else 'D'
        first_name, last_name = base.dividir_nombre(nombre)
        usuario_base = slug(nombre)
        username, n = usuario_base, 1
        while User.objects.filter(username=username).exists():
            n += 1
            username = f'{usuario_base}{n}'[:30]

        with transaction.atomic():
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                password=base.PASSWORD_DEFAULT,
            )
            PerfilUsuario.objects.create(
                user=user,
                tipo=tipo,
                nacionalidad=nacionalidad if nacionalidad in ('V', 'E') else 'V',
                cedula=cedula,
                telefono=telefono or None,
            )
            if fecha_pago and monto is not None:
                ref = (referencia or f'SIN-REF-{user.id}').replace('\n', ' ')[:50]
                pago = Pago.objects.create(
                    fecha_pago=fecha_pago,
                    monto=monto,
                    referencia_pago=ref,
                    tipo_pago='PM',
                    usuario=user,
                )
                Inscripcion.objects.get_or_create(
                    usuario=user, jornada=jornada, defaults={'pago': pago}
                )
        creados += 1
        print(f'[OK] {username} | {nombre} | ced={cedula} | {email}')

    print(f'\nResumen 2da pasada: {creados} creados, {omitidos} ya existían.')


if __name__ == '__main__':
    run()
