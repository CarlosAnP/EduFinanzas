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

    def test_create_advanced_credit_with_skip_disbursement(self):
        """
        Verifica que al registrar un crédito avanzado con skip_disbursement=True,
        se calcule proporcionalmente el saldo vivo, se mueva la próxima cuota y no haya desembolso.
        """
        url = '/api/finance/credits/'
        data = {
            'name': 'Crédito Moto En Curso',
            'total_amount': '120000.00',
            'installment_amount': '10000.00',
            'total_installments': 12,
            'paid_installments': 3,  # 3 cuotas pagadas
            'interest_rate': '0.00',
            'start_date': '2026-05-20',
            'category': 'transporte',
            'skip_disbursement': True
        }

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        credit = Credit.objects.get(id=response.data['id'])
        # Saldo vivo esperado: 10000 * (12 - 3) = 90000
        self.assertEqual(credit.remaining_amount, 90000.00)
        self.assertEqual(credit.paid_installments, 3)
        self.assertEqual(credit.is_active, True)
        # Próxima fecha esperada: start_date + 4 meses
        self.assertEqual(credit.next_payment_date, datetime.date(2026, 9, 20))

        # Verificar que NO se generó ninguna transacción de ingreso (skip_disbursement=True)
        tx = Transaction.objects.filter(user=self.user, transaction_type='ingreso').first()
        self.assertIsNone(tx)

    def test_create_already_fully_paid_credit(self):
        """
        Verifica que si un crédito se registra con cuotas pagadas >= totales,
        se guarde como inactivo, saldo 0 y sin fecha de cobro futura.
        """
        url = '/api/finance/credits/'
        data = {
            'name': 'Crédito Finalizado',
            'total_amount': '120000.00',
            'installment_amount': '10000.00',
            'total_installments': 12,
            'paid_installments': 12,  # Completamente pago
            'interest_rate': '0.00',
            'start_date': '2026-05-20',
            'category': 'otro',
            'skip_disbursement': True
        }

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        credit = Credit.objects.get(id=response.data['id'])
        self.assertEqual(credit.remaining_amount, 0.00)
        self.assertEqual(credit.paid_installments, 12)
        self.assertEqual(credit.is_active, False)
        self.assertIsNone(credit.next_payment_date)

    def test_upcoming_credit_and_subscription_alerts(self):
        """
        Verifica que se generen alertas para créditos y suscripciones próximas a vencer (<= 3 días),
        y que se aplique la lógica anti-spam correctamente.
        """
        from users.models import Notification
        from finance.models import Subscription
        from finance.services import check_and_create_financial_alerts

        today = timezone.localdate()

        # 1. Crédito próximo a vencer (2 días)
        credit = Credit.objects.create(
            user=self.user,
            name='Crédito Próximo',
            total_amount=30000.00,
            remaining_amount=30000.00,
            installment_amount=10000.00,
            total_installments=3,
            paid_installments=0,
            start_date=today - datetime.timedelta(days=28),
            next_payment_date=today + datetime.timedelta(days=2),
            category='otro',
            is_active=True
        )

        # 2. Suscripción próxima a renovar (1 día)
        sub = Subscription.objects.create(
            user=self.user,
            name='Netflix Premium',
            amount=44900.00,
            category='entretenimiento',
            frequency='monthly',
            start_date=today - datetime.timedelta(days=29),
            next_billing_date=today + datetime.timedelta(days=1),
            is_active=True
        )

        # Ejecutar verificación de alertas
        check_and_create_financial_alerts(self.user)

        # Verificar notificaciones creadas
        notifs = Notification.objects.filter(user=self.user)
        # Debería haber una para el crédito y otra para la suscripción
        self.assertEqual(notifs.filter(title="Vencimiento de Crédito Próximo").count(), 1)
        self.assertEqual(notifs.filter(title="Vencimiento de Suscripción Próximo").count(), 1)

        # Verificar que el mensaje contiene los datos esperados
        credit_notif = notifs.filter(title="Vencimiento de Crédito Próximo").first()
        self.assertIn('Crédito Próximo', credit_notif.message)
        self.assertIn(str(credit.next_payment_date), credit_notif.message)

        # Ejecutar de nuevo para validar anti-spam
        check_and_create_financial_alerts(self.user)
        # No deberían duplicarse
        self.assertEqual(Notification.objects.filter(user=self.user, title="Vencimiento de Crédito Próximo").count(), 1)
        self.assertEqual(Notification.objects.filter(user=self.user, title="Vencimiento de Suscripción Próximo").count(), 1)

    def test_budget_threshold_alerts(self):
        """
        Verifica que se generen alertas de presupuesto al límite (>=75%) y excedido (>=100%),
        y que no se dupliquen para el mismo mes.
        """
        from users.models import Notification
        from finance.models import CategoryBudget

        # Crear presupuesto para Alimentación de $100.000
        budget = CategoryBudget.objects.create(
            user=self.user,
            category='alimentacion',
            budget=100000.00
        )

        # 1. Crear un gasto por $80.000 (80% del presupuesto)
        # Esto debería gatillar la alerta de 75%
        url = '/api/finance/transactions/'
        data = {
            'transaction_type': 'gasto',
            'amount': '80000.00',
            'category': 'alimentacion',
            'description': 'Mercado quincenal',
            'date': str(timezone.localdate())
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        notifs = Notification.objects.filter(user=self.user, title="Presupuesto al Límite: Alimentación")
        self.assertEqual(notifs.count(), 1)
        self.assertIn('80%', notifs.first().message)

        # 2. Registrar otro gasto por $30.000 (acumulado $110.000, 110% del presupuesto)
        # Esto debería gatillar la alerta de 100%
        data2 = {
            'transaction_type': 'gasto',
            'amount': '30000.00',
            'category': 'alimentacion',
            'description': 'Cena restaurante',
            'date': str(timezone.localdate())
        }
        response = self.client.post(url, data2, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        notifs_exceeded = Notification.objects.filter(user=self.user, title="Presupuesto Excedido: Alimentación")
        self.assertEqual(notifs_exceeded.count(), 1)
        self.assertIn('100%', notifs_exceeded.first().message)

        # 3. Registrar un tercer gasto y validar anti-spam (no debe crearse otra alerta de 100%)
        data3 = {
            'transaction_type': 'gasto',
            'amount': '10000.00',
            'category': 'alimentacion',
            'description': 'Snack',
            'date': str(timezone.localdate())
        }
        self.client.post(url, data3, format='json')
        self.assertEqual(Notification.objects.filter(user=self.user, title="Presupuesto Excedido: Alimentación").count(), 1)

    def test_high_monthly_spending_ratio_alert(self):
        """
        Verifica que se dispare la alerta de gastos elevados si el gasto acumulado
        en el mes actual supera el 85% de los ingresos totales del mes.
        """
        from users.models import Notification
        from finance.services import check_and_create_financial_alerts

        # Registrar ingresos por $1,000,000
        Transaction.objects.create(
            user=self.user,
            transaction_type='ingreso',
            amount=1000000.00,
            category='mesada',
            date=timezone.localdate()
        )

        # Registrar gastos por $900,000 (90% de los ingresos)
        Transaction.objects.create(
            user=self.user,
            transaction_type='gasto',
            amount=900000.00,
            category='otro',
            date=timezone.localdate()
        )

        # Evaluar alertas
        check_and_create_financial_alerts(self.user)

        # Debe haberse creado la alerta global
        notifs = Notification.objects.filter(user=self.user, title="¡Alerta de Gastos Elevados!")
        self.assertEqual(notifs.count(), 1)
        self.assertIn('90%', notifs.first().message)

