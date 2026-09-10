#!/usr/bin/env bash
# Build para Render.com / Railway
set -o errexit
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate

# Crea los grupos de roles (superadmin/staff/participante) si no existen
python manage.py shell -c "from django.contrib.auth.models import Group; [Group.objects.get_or_create(name=n) for n in ['superadmin','staff','participante']]; print('Grupos verificados')"
