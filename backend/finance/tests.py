from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
import datetime
from finance.models import Credit, Transaction
from finance.services import process_recurring_payments, add_months

User = get_user_model()

class CreditTests(APITestCase):

    def setUp(self):
        # Crear usuario de prueba (CustomUser utiliza email en lugar de username)
        self.user = User.objects.create_user(
            email='estudiante@edu.com',
            password='testpassword123'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_credit_triggers_disbursement(self):
        """
        Verifica que al registrar un nuevo crédito se inicialice el saldo pendiente,
        se calcule la siguiente fecha de cobro (+1 mes) y se cree automáticamente
        la transacción de desembolso (Ingreso).
        """
        url = '/api/finance/credits/'
        data = {
            'name': 'Préstamo Académico',
            'total_amount': '120000.00',
            'installment_amount': '10000.00',
            'total_installments': 12,
            'interest_rate': '0.00',
            'start_date': '2026-05-20',
            'category': 'materiales'
        }

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verificar modelo en BD
        credit = Credit.objects.get(id=response.data['id'])
        self.assertEqual(credit.remaining_amount, 120000.00)
        self.assertEqual(credit.paid_installments, 0)
        self.assertEqual(credit.is_active, True)
        self.assertEqual(credit.next_payment_date, datetime.date(2026, 6, 20))

        # Verificar desembolso automático (Ingreso)
        tx = Transaction.objects.filter(user=self.user, transaction_type='ingreso').first()
        self.assertIsNotNone(tx)
        self.assertEqual(tx.amount, 120000.00)
        self.assertEqual(tx.category, 'materiales')
        self.assertEqual(tx.description, 'Desembolso de crédito: Préstamo Académico')

    def test_process_recurring_payments_for_credits(self):
        """
        Verifica que el procesador cree la cuota (Gasto) cuando la fecha de cobro vence,
        incremente las cuotas pagadas, reduzca el saldo pendiente y avance la fecha.
        """
        # Crear crédito con vencimiento de cuota en el pasado (ayer)
        yesterday = timezone.localdate() - datetime.timedelta(days=1)
        credit = Credit.objects.create(
            user=self.user,
            name='Tarjeta de Crédito',
            total_amount=50000.00,
            remaining_amount=50000.00,
            installment_amount=5000.00,
            total_installments=10,
            paid_installments=0,
            start_date=yesterday - datetime.timedelta(days=30),
            next_payment_date=yesterday,
            category='entretenimiento',
            is_active=True
        )

        # Ejecutar procesador de pagos
        processed = process_recurring_payments(self.user)
        self.assertTrue(processed)

        # Recargar crédito
        credit.refresh_from_db()
        self.assertEqual(credit.paid_installments, 1)
        self.assertEqual(credit.remaining_amount, 45000.00)
        self.assertEqual(credit.is_active, True)
        # La fecha debió avanzar 1 mes desde ayer
        expected_next_date = add_months(yesterday, 1)
        self.assertEqual(credit.next_payment_date, expected_next_date)

        # Verificar transacción de gasto creada para la cuota
        tx = Transaction.objects.filter(user=self.user, transaction_type='gasto').first()
        self.assertIsNotNone(tx)
        self.assertEqual(tx.amount, 5000.00)
        self.assertEqual(tx.description, 'Pago cuota 1/10 - Crédito: Tarjeta de Crédito')
        self.assertEqual(tx.date, yesterday)

    def test_credit_fully_paid(self):
        """
        Verifica que al cobrar la última cuota, el crédito pase a inactivo (is_active=False)
        y su saldo pendiente se reduzca a 0.
        """
        yesterday = timezone.localdate() - datetime.timedelta(days=1)
        credit = Credit.objects.create(
            user=self.user,
            name='Préstamo Corto',
            total_amount=10000.00,
            remaining_amount=5000.00,
            installment_amount=5000.00,
            total_installments=2,
            paid_installments=1, # Ya se pagó 1 cuota, falta la última
            start_date=yesterday - datetime.timedelta(days=30),
            next_payment_date=yesterday,
            category='otro',
            is_active=True
        )

        processed = process_recurring_payments(self.user)
        self.assertTrue(processed)

        # Recargar
        credit.refresh_from_db()
        self.assertEqual(credit.paid_installments, 2)
        self.assertEqual(credit.remaining_amount, 0.00)
        self.assertEqual(credit.is_active, False)
        self.assertIsNone(credit.next_payment_date)

        # Verificar transacción
        tx = Transaction.objects.filter(user=self.user, transaction_type='gasto').first()
        self.assertIsNotNone(tx)
        self.assertEqual(tx.amount, 5000.00)
        self.assertEqual(tx.description, 'Pago cuota 2/2 - Crédito: Préstamo Corto')
