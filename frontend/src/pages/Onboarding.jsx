const Onboarding = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold text-teal-700 mb-2">
          ¡Bienvenido a EduFinanzas!
        </h1>
        <p className="text-gray-500 mb-6">
          Responde estas 3 preguntas para personalizar tu experiencia.
        </p>
        {/* TODO: Implement 3-step onboarding wizard */}
        <p className="text-center text-sm text-gray-400 mt-4">
          Página en construcción - Onboarding
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
