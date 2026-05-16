import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from education.models import Challenge, Guide

def populate():
    # Clear existing
    Challenge.objects.all().delete()
    Guide.objects.all().delete()

    # Create Challenges
    Challenge.objects.create(title='Registra tus primeros 5 gastos', description='Crea el hábito de registrar todo lo que gastas. Empieza anotando tus pasajes, comidas y pequeños gastos del día a día.', difficulty='facil', reward_points=50)
    Challenge.objects.create(title='Configura tu primer presupuesto', description='Establece un límite de gasto en alguna categoría, como "Entretenimiento" o "Alimentación", para mantener tus finanzas bajo control.', difficulty='facil', reward_points=30)
    Challenge.objects.create(title='Ahorra el 10% este mes', description='Termina el mes gastando menos de lo que ganas, logrando guardar al menos el 10% de tus ingresos.', difficulty='medio', reward_points=100)
    Challenge.objects.create(title='Sobrevive una semana sin gastos hormiga', description='Pasa 7 días sin comprar cafés, snacks u otras pequeñas fugas de dinero que no sean esenciales.', difficulty='dificil', reward_points=200)
    Challenge.objects.create(title='Crea tu Fondo de Emergencia (Nivel 1)', description='Ahorra tus primeros $100.000 destinados exclusivamente para imprevistos.', difficulty='medio', reward_points=150)

    # Create Guides
    Guide.objects.create(
        title='La regla del 50/30/20', 
        category='Presupuesto', 
        read_time='5 min', 
        color='blue', 
        content='''Esta regla es el mejor punto de partida para tu vida financiera universitaria. Consiste en dividir tus ingresos en tres categorías principales:
1. **Necesidades (50%)**: Dinero destinado a lo indispensable: arriendo, servicios públicos, transporte, alimentación y matrícula. Si eres estudiante y vives con tus padres, es posible que este porcentaje sea mucho menor, lo cual es excelente porque te permite aumentar tus ahorros.
2. **Deseos (30%)**: Esto incluye salidas con amigos, suscripciones como Netflix o Spotify, ropa, y ese café en la universidad. ¡Es importante disfrutar, pero con un límite!
3. **Ahorro e Inversión (20%)**: Este porcentaje es innegociable. Debes pagarte a ti mismo primero. Puedes destinarlo a tu fondo de emergencia o a metas a largo plazo, como un viaje de grado o tu primer emprendimiento.

**¿Cómo aplicarla?**
El día que recibas tus ingresos (ya sea tu salario, mesada o beca), transfiere inmediatamente el 20% a otra cuenta (como una cuenta de ahorros o un bolsillo de tu app bancaria) y actúa como si ese dinero no existiera. Luego, distribuye el resto según tus gastos fijos y variables.'''
    )
    
    Guide.objects.create(
        title='Fondo de Emergencia', 
        category='Ahorro', 
        read_time='8 min', 
        color='violet', 
        content='''Un fondo de emergencia no es para un viaje de vacaciones ni para aprovechar un descuento en ropa. Es un dinero reservado estrictamente para situaciones imprevistas: la pérdida de un empleo, una urgencia médica, el daño de tu computador (esencial para la universidad) o un arreglo urgente en casa.

**¿Cuánto debes tener?**
La regla de oro para un adulto es tener entre 3 y 6 meses de gastos básicos cubiertos. Como estudiante, una meta realista es alcanzar tu primer **millón de pesos** ($1.000.000 COP) o el equivalente a 2 meses de tus gastos fijos (pasajes y comida).

**¿Dónde guardarlo?**
El fondo de emergencia debe ser líquido (fácil de retirar) pero no estar mezclado con tu dinero diario. Una excelente opción es una cuenta de ahorros de alto rendimiento o "bolsillos" en aplicaciones financieras que den algo de rentabilidad sin cobrar cuotas de manejo, evitando que la inflación se coma tus ahorros. 
¡Empieza con pequeñas metas! $50.000 mensuales en tu fondo harán la diferencia cuando llegue el imprevisto.'''
    )
    
    Guide.objects.create(
        title='Tarjetas de Crédito 101', 
        category='Crédito', 
        read_time='10 min', 
        color='rose', 
        content='''Muchos estudiantes le tienen terror a las tarjetas de crédito o, por el contrario, las usan como dinero extra. Ninguno de los dos extremos es bueno. Una tarjeta de crédito es solo un medio de pago, y si la usas bien, es la mejor herramienta para construir tu historial crediticio.

**Reglas de Oro:**
1. **Nunca la uses para comprar cosas que no puedes pagar hoy.** Si no tienes el dinero en tu cuenta de débito, no lo compres con crédito.
2. **Todo a una (1) cuota.** Si difieres a más de una cuota, el banco te cobrará intereses. Al pagar a una cuota, estarás financiándote gratis por hasta 45 días.
3. **Paga el saldo total antes de la fecha límite.** Si pagas solo el "pago mínimo", estarás pagando intereses carísimos (tasas de usura) y la deuda se hará eterna.
4. **Cuidado con la cuota de manejo.** Busca bancos que ofrezcan tarjetas para jóvenes sin cuota de manejo (o que te la exoneren por hacer un número de transacciones al mes).

Tener buen historial desde la universidad te abrirá las puertas para créditos de vivienda o emprendimiento en el futuro con tasas de interés mucho más bajas.'''
    )

    print("Módulo Educativo poblado con éxito!")

if __name__ == '__main__':
    populate()
