from django.test import TestCase
from django.utils import timezone
from users.models import CustomUser, Notification
from education.models import Challenge, UserChallenge
from finance.models import Transaction, CategoryBudget, Goal
from education.services import evaluate_user_challenges
import datetime

class MissionAutoCompletionTestCase(TestCase):
    def setUp(self):
        # Create user
        self.user = CustomUser.objects.create_user(
            email="estudiante@universidad.edu",
            password="password123",
            first_name="Carlos",
            last_name="Perez"
        )

        # Create challenges
        self.c_step = Challenge.objects.create(
            title="Primer Paso",
            description="Registra una transacción",
            difficulty="facil",
            reward_points=20,
            trigger_type="register_transactions",
            trigger_total=1
        )
        self.c_habit = Challenge.objects.create(
            title="Hábito Diario",
            description="Registra una transacción hoy",
            difficulty="facil",
            reward_points=15,
            trigger_type="daily_transaction",
            trigger_total=1
        )
        self.c_budget = Challenge.objects.create(
            title="Planificador",
            description="Configura límite de presupuesto",
            difficulty="facil",
            reward_points=30,
            trigger_type="set_budget",
            trigger_total=1
        )
        self.c_goal = Challenge.objects.create(
            title="Ahorrador Inicial",
            description="Crea tu primera meta",
            difficulty="facil",
            reward_points=30,
            trigger_type="create_goal",
            trigger_total=1
        )

        # Auto-assign challenges (similar to UserChallengeListView logic)
        for c in [self.c_step, self.c_habit, self.c_budget, self.c_goal]:
            UserChallenge.objects.create(
                user=self.user,
                challenge=c,
                total=c.trigger_total,
                status="active"
            )

    def test_register_transaction_trigger(self):
        # Check initial state
        uc_step = UserChallenge.objects.get(user=self.user, challenge=self.c_step)
        self.assertEqual(uc_step.status, "active")
        self.assertEqual(uc_step.progress, 0)
        self.assertEqual(self.user.points, 0)

        # Log a transaction
        Transaction.objects.create(
            user=self.user,
            transaction_type="gasto",
            amount=5000.0,
            category="comida",
            description="Almuerzo U",
            date=datetime.date.today()
        )

        # Evaluate trigger
        completed = evaluate_user_challenges(self.user, trigger_hints=["register_transactions"])

        # Check results
        self.assertEqual(len(completed), 1)
        self.assertEqual(completed[0].id, self.c_step.id)

        uc_step.refresh_from_db()
        self.assertEqual(uc_step.status, "completed")
        self.assertEqual(uc_step.progress, 1)

        self.user.refresh_from_db()
        self.assertEqual(self.user.points, 20)

        # Check notification
        notif = Notification.objects.filter(user=self.user, type="success").first()
        self.assertIsNotNone(notif)
        self.assertIn("Misión completada", notif.title)

    def test_daily_transaction_trigger(self):
        # Log a transaction
        Transaction.objects.create(
            user=self.user,
            transaction_type="gasto",
            amount=12000.0,
            category="transporte",
            description="Taxi",
            date=datetime.date.today()
        )

        completed = evaluate_user_challenges(self.user, trigger_hints=["daily_transaction"])
        self.assertEqual(len(completed), 1)
        self.assertEqual(completed[0].id, self.c_habit.id)

        uc_habit = UserChallenge.objects.get(user=self.user, challenge=self.c_habit)
        self.assertEqual(uc_habit.status, "completed")
        self.assertEqual(uc_habit.progress, 1)

    def test_set_budget_trigger(self):
        # Config budget
        CategoryBudget.objects.create(
            user=self.user,
            category="comida",
            budget=200000.0,
            color="emerald"
        )

        completed = evaluate_user_challenges(self.user, trigger_hints=["set_budget"])
        self.assertEqual(len(completed), 1)
        self.assertEqual(completed[0].id, self.c_budget.id)

        uc_budget = UserChallenge.objects.get(user=self.user, challenge=self.c_budget)
        self.assertEqual(uc_budget.status, "completed")

    def test_create_goal_trigger(self):
        # Create savings goal
        Goal.objects.create(
            user=self.user,
            title="Laptop nueva",
            target_amount=1500000.0,
            current_amount=0.0,
            deadline=datetime.date.today() + datetime.timedelta(days=90)
        )

        completed = evaluate_user_challenges(self.user, trigger_hints=["create_goal"])
        self.assertEqual(len(completed), 1)
        self.assertEqual(completed[0].id, self.c_goal.id)

        uc_goal = UserChallenge.objects.get(user=self.user, challenge=self.c_goal)
        self.assertEqual(uc_goal.status, "completed")

