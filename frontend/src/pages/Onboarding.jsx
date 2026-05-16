import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../api/axios';
import { useToast } from '../components/ui/Toast';
import { ChevronRight, Target, Brain, DollarSign } from 'lucide-react';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    monthly_income_level: '',
    financial_knowledge: '',
    main_financial_goal: ''
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/users/onboarding/', data);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: 'Perfil configurado', description: '¡Todo listo para empezar!', variant: 'success' });
      navigate('/app');
    },
    onError: () => {
      toast({ title: 'Error', description: 'Ocurrió un problema guardando tu perfil.', variant: 'error' });
    }
  });

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);
  const handleSelect = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  const handleSubmit = () => {
    mutation.mutate(formData);
  };

  const steps = [
    {
      title: '¿Cuál es tu nivel de ingresos mensuales?',
      field: 'monthly_income_level',
      icon: DollarSign,
      options: [
        { value: 'bajo', label: 'Menos de $500.000' },
        { value: 'medio', label: '$500.000 - $1.500.000' },
        { value: 'alto', label: 'Más de $1.500.000' }
      ]
    },
    {
      title: '¿Cómo evaluarías tu conocimiento financiero?',
      field: 'financial_knowledge',
      icon: Brain,
      options: [
        { value: 'principiante', label: 'Principiante', desc: 'No llevo control de mi dinero' },
        { value: 'intermedio', label: 'Intermedio', desc: 'Tengo un presupuesto y ahorro algo' },
        { value: 'avanzado', label: 'Avanzado', desc: 'Invierto y planifico a futuro' }
      ]
    },
    {
      title: '¿Cuál es tu meta principal en EduFinanzas?',
      field: 'main_financial_goal',
      icon: Target,
      options: [
        { value: 'ahorrar', label: 'Aprender a ahorrar' },
        { value: 'deudas', label: 'Salir de deudas' },
        { value: 'presupuesto', label: 'Controlar mi presupuesto' },
        { value: 'invertir', label: 'Empezar a invertir' }
      ]
    }
  ];

  const currentStep = steps[step - 1];
  const isLastStep = step === steps.length;
  const isStepValid = !!formData[currentStep.field];

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 animate-fade-in">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-lg border border-slate-100">
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-2 flex-1 rounded-full transition-colors ${i + 1 <= step ? 'bg-brand-blue' : 'bg-slate-100'}`} />
          ))}
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 text-brand-blue rounded-2xl mb-4 shadow-sm">
            <currentStep.icon size={28} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">{currentStep.title}</h2>
        </div>

        <div className="space-y-3 mb-10">
          {currentStep.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(currentStep.field, opt.value)}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                formData[currentStep.field] === opt.value
                  ? 'border-brand-blue bg-blue-50/50 shadow-md shadow-blue-100/50 scale-[1.02]'
                  : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="font-bold text-slate-800">{opt.label}</div>
              {opt.desc && <div className="text-sm text-slate-500 mt-0.5">{opt.desc}</div>}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          {step > 1 && (
            <button onClick={handleBack} className="px-6 py-4 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors">
              Atrás
            </button>
          )}
          <button
            onClick={isLastStep ? handleSubmit : handleNext}
            disabled={!isStepValid || mutation.isPending}
            className="flex-1 bg-brand-blue text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {mutation.isPending ? 'Guardando...' : (isLastStep ? 'Finalizar' : 'Siguiente')}
            {!mutation.isPending && !isLastStep && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
