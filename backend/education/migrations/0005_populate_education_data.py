from django.db import migrations

def populate_education(apps, schema_editor):
    Challenge = apps.get_model('education', 'Challenge')
    UserChallenge = apps.get_model('education', 'UserChallenge')
    Guide = apps.get_model('education', 'Guide')
    Quiz = apps.get_model('education', 'Quiz')
    Question = apps.get_model('education', 'Question')
    Choice = apps.get_model('education', 'Choice')
    UserGuideRead = apps.get_model('education', 'UserGuideRead')

    print("Limpiando datos anteriores de educación...")
    UserChallenge.objects.all().delete()
    Challenge.objects.all().delete()
    UserGuideRead.objects.all().delete()
    Choice.objects.all().delete()
    Question.objects.all().delete()
    Quiz.objects.all().delete()
    Guide.objects.all().delete()

    print("Creando Misiones con triggers automáticos...")
    missions = [
        # --- FÁCILES ---
        dict(title='Primer Paso', description='Registra tu primera transacción. Empieza el hábito hoy mismo.', difficulty='facil', reward_points=20, trigger_type='register_transactions', trigger_total=1),
        dict(title='Hábito Diario', description='Registra al menos una transacción hoy. Un registro al día aleja los problemas del camino.', difficulty='facil', reward_points=15, trigger_type='daily_transaction', trigger_total=1),
        dict(title='Planificador Inicial', description='Configura un límite de presupuesto en al menos una categoría de gasto.', difficulty='facil', reward_points=30, trigger_type='set_budget', trigger_total=1),
        dict(title='Ahorrador Inicial', description='Crea tu primera meta de ahorro, no importa qué tan pequeña sea.', difficulty='facil', reward_points=30, trigger_type='create_goal', trigger_total=1),
        dict(title='Primer Aporte', description='Realiza tu primer aporte a una meta de ahorro existente.', difficulty='facil', reward_points=25, trigger_type='fund_goal', trigger_total=1),
        dict(title='Lector Activo', description='Lee tu primera guía de educación financiera.', difficulty='facil', reward_points=20, trigger_type='read_guide', trigger_total=1),
        dict(title='Estudiante Financiero', description='Completa y aprueba tu primer quiz con más del 60% de respuestas correctas.', difficulty='facil', reward_points=50, trigger_type='complete_quiz', trigger_total=1),
        dict(title='Suscriptor Controlado', description='Registra una suscripción recurrente para tener control de tus gastos fijos.', difficulty='facil', reward_points=20, trigger_type='add_subscription', trigger_total=1),

        # --- MEDIOS ---
        dict(title='Registra 5 Gastos', description='Registra 5 transacciones en total. La constancia es clave para entender tus finanzas.', difficulty='facil', reward_points=50, trigger_type='register_transactions', trigger_total=5),
        dict(title='Maestro del Presupuesto', description='Configura límites de presupuesto en 3 categorías distintas de gasto.', difficulty='medio', reward_points=80, trigger_type='set_budget', trigger_total=3),
        dict(title='Metas al Poder', description='Crea 3 metas de ahorro diferentes. Tener metas múltiples te mantiene enfocado.', difficulty='medio', reward_points=80, trigger_type='create_goal', trigger_total=3),
        dict(title='Racha de 3 Días', description='Ingresa a la app 3 días seguidos. La constancia es el hábito más poderoso.', difficulty='medio', reward_points=40, trigger_type='streak_3', trigger_total=1),
        dict(title='Ahorra el 10%', description='Logra que tus ahorros de este mes representen al menos el 10% de tus ingresos.', difficulty='medio', reward_points=100, trigger_type='savings_rate_10', trigger_total=1),
        dict(title='Fondo de Emergencia Nivel 1', description='Acumula al menos $100.000 COP en una de tus metas de ahorro.', difficulty='medio', reward_points=150, trigger_type='emergency_fund_100k', trigger_total=1),

        # --- DIFÍCILES ---
        dict(title='Racha de 7 Días', description='Mantén una racha de 7 días seguidos activo en la app. ¡El hábito está en formación!', difficulty='dificil', reward_points=100, trigger_type='streak_7', trigger_total=1),
        dict(title='Ahorra el 20%', description='Logra una tasa de ahorro del 20% o más en el mes actual. ¡El nivel pro de las finanzas!', difficulty='dificil', reward_points=200, trigger_type='savings_rate_20', trigger_total=1),
        dict(title='Sin Gastos Hormiga (7 días)', description='Pasa 7 días consecutivos sin registrar gastos en la categoría de Entretenimiento.', difficulty='dificil', reward_points=200, trigger_type='no_small_expenses_7', trigger_total=1),
    ]

    for m in missions:
        Challenge.objects.create(**m)

    print("Creando Guías...")
    guides_data = [
        {
            'title': 'La regla del 50/30/20',
            'category': 'Presupuesto',
            'read_time': '5 min',
            'color': 'blue',
            'content': 'Esta regla es el mejor punto de partida para tu vida financiera universitaria. Consiste en dividir tus ingresos en tres categorías principales:\n\n1. **Necesidades (50%)**: Dinero destinado a lo indispensable: arriendo, servicios públicos, transporte, alimentación y matrícula. Si eres estudiante y vives con tus padres, es posible que este porcentaje sea mucho menor, lo cual es excelente porque te permite aumentar tus ahorros.\n\n2. **Deseos (30%)**: Esto incluye salidas con amigos, suscripciones como Netflix o Spotify, ropa, y ese café en la universidad. ¡Es importante disfrutar, pero con un límite!\n\n3. **Ahorro e Inversión (20%)**: Este porcentaje es innegociable. Debes pagarte a ti mismo primero. Puedes destinarlo a tu fondo de emergencia o a metas a largo plazo, como un viaje de grado o tu primer emprendimiento.\n\n**¿Cómo aplicarla?**\nEl día que recibas tus ingresos (ya sea tu salario, mesada o beca), transfiere inmediatamente el 20% a otra cuenta y actúa como si ese dinero no existiera. Luego, distribuye el resto según tus gastos fijos y variables.'
        },
        {
            'title': 'Fondo de Emergencia',
            'category': 'Ahorro',
            'read_time': '8 min',
            'color': 'violet',
            'content': 'Un fondo de emergencia no es para un viaje de vacaciones ni para aprovechar un descuento en ropa. Es un dinero reservado estrictamente para situaciones imprevistas: la pérdida de un empleo, una urgencia médica, el daño de tu computador (esencial para la universidad) o un arreglo urgente en casa.\n\n**¿Cuánto debes tener?**\nLa regla de oro para un adulto es tener entre 3 y 6 meses de gastos básicos cubiertos. Como estudiante, una meta realista es alcanzar tu primer **millón de pesos** ($1.000.000 COP) o el equivalente a 2 meses de tus gastos fijos.\n\n**¿Dónde guardarlo?**\nEl fondo de emergencia debe ser líquido (fácil de retirar) pero no estar mezclado con tu dinero diario. Una excelente opción es una cuenta de ahorros de alto rendimiento o "bolsillos" en aplicaciones financieras.\n\n¡Empieza con pequeñas metas! $50.000 mensuales en tu fondo harán la diferencia cuando llegue el imprevisto.'
        },
        {
            'title': 'Tarjetas de Crédito 101',
            'category': 'Crédito',
            'read_time': '10 min',
            'color': 'rose',
            'content': 'Muchos estudiantes le tienen terror a las tarjetas de crédito o, por el contrario, las usan como dinero extra. Ninguno de los dos extremos es bueno. Una tarjeta de crédito es solo un medio de pago, y si la usas bien, es la mejor herramienta para construir tu historial crediticio.\n\n**Reglas de Oro:**\n\n1. **Nunca la uses para comprar cosas que no puedes pagar hoy.** Si no tienes el dinero en tu cuenta de débito, no lo compres con crédito.\n\n2. **Todo a una (1) cuota.** Si difieres a más de una cuota, el banco te cobrará intereses. Al pagar a una cuota, estarás financiándote gratis por hasta 45 días.\n\n3. **Paga el saldo total antes de la fecha límite.** Si pagas solo el "pago mínimo", estarás pagando intereses carísimos y la deuda se hará eterna.\n\n4. **Cuidado con la cuota de manejo.** Busca bancos que ofrezcan tarjetas para jóvenes sin cuota de manejo.'
        },
    ]

    for gd in guides_data:
        Guide.objects.create(**gd)

    print("Creando Quizzes...")
    guide1 = Guide.objects.get(title='La regla del 50/30/20')
    quiz1 = Quiz.objects.create(guide=guide1, title='Quiz: Regla 50/30/20', reward_points=50)
    q1 = Question.objects.create(quiz=quiz1, text='¿Qué porcentaje se destina al ahorro/inversión según la regla 50/30/20?')
    Choice.objects.create(question=q1, text='50%')
    Choice.objects.create(question=q1, text='30%')
    Choice.objects.create(question=q1, text='20%', is_correct=True)
    q2 = Question.objects.create(quiz=quiz1, text='¿Qué se incluye en la categoría de "Necesidades"?')
    Choice.objects.create(question=q2, text='Salidas al cine y restaurantes')
    Choice.objects.create(question=q2, text='Arriendo, servicios y alimentación', is_correct=True)
    Choice.objects.create(question=q2, text='Ropa de marca y accesorios')

    guide2 = Guide.objects.get(title='Fondo de Emergencia')
    quiz2 = Quiz.objects.create(guide=guide2, title='Quiz: Fondo de Emergencia', reward_points=50)
    q3 = Question.objects.create(quiz=quiz2, text='¿Para qué sirve principalmente el fondo de emergencia?')
    Choice.objects.create(question=q3, text='Para irse de viaje de vacaciones')
    Choice.objects.create(question=q3, text='Para situaciones imprevistas como emergencias médicas', is_correct=True)
    Choice.objects.create(question=q3, text='Para comprar ropa o accesorios cuando hay descuento')
    q4 = Question.objects.create(quiz=quiz2, text='¿Cuántos meses de gastos básicos se recomienda tener en el fondo de emergencia?')
    Choice.objects.create(question=q4, text='1 mes')
    Choice.objects.create(question=q4, text='Entre 3 y 6 meses', is_correct=True)
    Choice.objects.create(question=q4, text='10 meses')


class Migration(migrations.Migration):

    dependencies = [
        ('education', '0004_alter_challenge_options_challenge_trigger_total_and_more'),
    ]

    operations = [
        migrations.RunPython(populate_education),
    ]
