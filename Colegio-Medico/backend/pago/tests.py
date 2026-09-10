from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User, Group
from pago.models import Pago
from datetime import date

class PagoReportePdfTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff_user = User.objects.create_superuser(
            username='staff_test',
            password='password123',
            first_name='Dr. Pedro',
            last_name='Perez',
            email='pedro@example.com',
            is_staff=True,
            is_superuser=True
        )
        staff_group, _ = Group.objects.get_or_create(name='staff')
        self.staff_user.groups.add(staff_group)

        # Crear pagos de prueba
        Pago.objects.create(
            fecha_pago=date(2026, 5, 1),
            monto=150.00,
            referencia_pago='REF-12345',
            tipo_pago='PM',
            usuario=self.staff_user
        )

    def test_descargar_reporte_pagos_pdf(self):
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.get('/api/pago/reporte-pdf/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertTrue('attachment;' in response['Content-Disposition'])
        self.assertTrue(len(response.content) > 0)

    def test_descargar_reporte_admin_django_pdf(self):
        self.client.force_login(self.staff_user)
        response = self.client.get('/admin/pago/pago/descargar-reporte-general-pdf/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertTrue('attachment;' in response['Content-Disposition'])
        self.assertTrue(len(response.content) > 0)

    def test_admin_pago_changelist_shows_pdf_button(self):
        self.client.force_login(self.staff_user)
        response = self.client.get('/admin/pago/pago/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, 'descargar-reporte-general-pdf/')
        self.assertContains(response, 'Descargar Reporte PDF Completo')



