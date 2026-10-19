# -*- coding: utf-8 -*-
"""Verificacion post-correccion."""
import os, sys, unicodedata, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'colegio_backend.settings')
django.setup()
from usuario.models import PerfilUsuario
from fix_genero_conferencistas import clasificar_persona, norm

restantes_conf = PerfilUsuario.objects.filter(conferencista='C').count()
print(f"Conferencistas 'C' restantes: {restantes_conf}")

malos = []
sin = []
for p in PerfilUsuario.objects.select_related('user'):
    g = p.genero
    guess = clasificar_persona(p.user.first_name)
    if g in ('M','F') and guess and g != guess:
        malos.append((p.user.username, p.user.first_name, g, guess))
    if g not in ('M','F'):
        sin.append((p.user.username, p.user.first_name))

print(f"Generos incorrectos segun el nombre: {len(malos)}")
for m in malos: print("  ", m)
print(f"Sin genero: {len(sin)}")
for s in sin: print("  ", s)
