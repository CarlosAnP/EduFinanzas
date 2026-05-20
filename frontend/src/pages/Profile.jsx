import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { 
  User, Mail, Phone, Calendar, BookOpen, GraduationCap, 
  Briefcase, Award, Key, Flame, Star, Loader2, Save, Sparkles, CheckCircle
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';

export default function Profile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('info'); // 'info' or 'security'

  // Query profile details
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await api.get('/users/profile/');
      return response.data;
    }
  });

  // Profile fields state
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    birth_date: '',
    institution_type: '',
    university: '',
    career: '',
    semester: '',
    study_work_status: '',
    bio: ''
  });

  // Password fields state
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Synchronize backend data into state once loaded
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        phone_number: userProfile.phone_number || '',
        birth_date: userProfile.birth_date || '',
        institution_type: userProfile.institution_type || '',
        university: userProfile.university || '',
        career: userProfile.career || '',
        semester: userProfile.semester || '',
        study_work_status: userProfile.study_work_status || '',
        bio: userProfile.bio || ''
      });
    }
  }, [userProfile]);

  // Update profile details mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      // Use clean payload (nullify blank number fields)
      const payload = {
        ...data,
        semester: data.semester === '' ? null : parseInt(data.semester, 10)
      };
      const response = await api.put('/users/profile/', payload);
      return response.data;
    },
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['userProfile'], updatedData);
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      toast({ 
        title: '¡Perfil actualizado!', 
        description: 'Tus datos personales y académicos se han guardado con éxito.', 
        variant: 'success' 
      });
    },
    onError: (error) => {
      const detail = error.response?.data?.detail || 'Ocurrió un error al guardar los datos.';
      toast({ title: 'Error', description: detail, variant: 'error' });
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/users/profile/change-password/', data);
      return response.data;
    },
    onSuccess: () => {
      toast({ 
        title: '¡Contraseña cambiada!', 
        description: 'Tu contraseña de seguridad se ha actualizado correctamente.', 
        variant: 'success' 
      });
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    },
    onError: (error) => {
      const errors = error.response?.data;
      let msg = 'No se pudo cambiar la contraseña.';
      if (errors) {
        if (typeof errors === 'object') {
          msg = Object.values(errors).flat().join(' ');
        } else if (errors.detail) {
          msg = errors.detail;
        }
      }
      toast({ title: 'Error', description: msg, variant: 'error' });
    }
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordData.old_password || !passwordData.new_password || !passwordData.confirm_password) {
      return toast({ title: 'Campos vacíos', description: 'Por favor completa todos los campos de contraseña.', variant: 'error' });
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      return toast({ title: 'Contraseñas no coinciden', description: 'La nueva contraseña y la confirmación no son iguales.', variant: 'error' });
    }
    if (passwordData.new_password.length < 8) {
      return toast({ title: 'Contraseña muy corta', description: 'La nueva contraseña debe tener al menos 8 caracteres.', variant: 'error' });
    }
    changePasswordMutation.mutate(passwordData);
  };

  if (isLoading || !userProfile) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="animate-spin text-brand-blue" size={40} />
      </div>
    );
  }

  const initial1 = userProfile.first_name ? userProfile.first_name[0] : 'U';
  const initial2 = userProfile.last_name ? userProfile.last_name[0] : '';

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          Mi Perfil
          <Sparkles className="text-blue-500 fill-blue-500" size={24} />
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Gestiona tus datos personales, información de estudio, estado laboral y seguridad.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: User Card & Achievements */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-[2rem] border-slate-100 shadow-xl bg-gradient-to-br from-white via-white to-blue-50/10 overflow-hidden">
            <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                <div className="w-20 h-20 rounded-full border-4 border-white bg-blue-100 text-brand-blue flex items-center justify-center text-3xl font-black shadow-lg">
                  {initial1}{initial2}
                </div>
              </div>
            </div>
            
            <CardContent className="pt-14 pb-6 text-center space-y-4">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                  {userProfile.first_name || 'Estudiante'} {userProfile.last_name || ''}
                </h2>
                <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1 mt-0.5">
                  <Mail size={12} /> {userProfile.email}
                </p>
              </div>

              {userProfile.bio && (
                <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-100 max-w-xs mx-auto leading-relaxed">
                  "{userProfile.bio}"
                </p>
              )}

              {/* Quick Academic Details */}
              <div className="pt-2 flex flex-col items-center space-y-1">
                {userProfile.university && (
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                    🏫 {userProfile.university}
                  </span>
                )}
                {userProfile.career && (
                  <span className="text-[10px] font-extrabold text-brand-blue tracking-wide uppercase mt-1">
                    📖 {userProfile.career} {userProfile.semester ? `(${userProfile.semester}° semestre)` : ''}
                  </span>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <div className="bg-amber-50/60 border border-amber-100 p-3 rounded-2xl flex flex-col items-center">
                  <div className="flex items-center gap-1.5 text-amber-600 font-black">
                    <Flame size={16} />
                    <span className="text-lg leading-none">{userProfile.streak}</span>
                  </div>
                  <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider mt-1">Racha diaria</span>
                </div>

                <div className="bg-violet-50/60 border border-violet-100 p-3 rounded-2xl flex flex-col items-center">
                  <div className="flex items-center gap-1.5 text-violet-600 font-black">
                    <Star size={16} />
                    <span className="text-lg leading-none">{userProfile.points}</span>
                  </div>
                  <span className="text-[9px] text-violet-500 font-bold uppercase tracking-wider mt-1">Puntos XP</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges / Insignias Card */}
          <Card className="rounded-[2rem] border-slate-100 shadow-lg">
            <CardHeader 
              title="Mis Insignias" 
              subtitle="Medallas de conocimiento financiero"
              className="px-6 pt-6 pb-2"
            />
            <CardContent className="px-6 pb-6">
              {!userProfile.badges || userProfile.badges.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <Award className="mx-auto text-slate-300 mb-2" size={32} />
                  <p className="text-xs text-slate-500 font-bold">Sin medallas aún</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Lee guías y aprueba quizzes para ganar insignias.</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {userProfile.badges.map(b => {
                    const badgeInfo = b.badge;
                    return (
                      <div 
                        key={b.id} 
                        className="group relative flex flex-col items-center p-2.5 rounded-2xl border border-amber-100 bg-amber-50/40 hover:bg-amber-50 hover:scale-105 transition-all duration-300 cursor-help"
                        title={`${badgeInfo.name}: ${badgeInfo.description}`}
                      >
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-500 shadow-sm border border-amber-200">
                          <Star size={20} className="fill-amber-500" />
                        </div>
                        <span className="text-[9px] font-black text-slate-700 mt-2 text-center truncate w-full">
                          {badgeInfo.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tabbed Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section Selector Menu */}
          <div className="bg-slate-100 p-1 rounded-2xl flex max-w-sm border border-slate-200/55 shadow-sm">
            <button
              onClick={() => setActiveSection('info')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                activeSection === 'info' 
                  ? 'bg-white text-brand-blue shadow-md' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <User size={16} />
              Editar Información
            </button>
            <button
              onClick={() => setActiveSection('security')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                activeSection === 'security' 
                  ? 'bg-white text-brand-blue shadow-md' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Key size={16} />
              Seguridad
            </button>
          </div>

          {/* Form: Edit Profile Details */}
          {activeSection === 'info' && (
            <Card className="rounded-[2.5rem] border-slate-100 shadow-xl overflow-hidden bg-white">
              <form onSubmit={handleProfileSubmit}>
                <CardHeader 
                  title="Información Personal y Académica" 
                  subtitle="Completa tus datos para personalizar tus simulaciones e insights financieros."
                  className="px-8 pt-8 pb-4 border-b border-slate-100"
                />

                <CardContent className="px-8 py-6 space-y-6">
                  
                  {/* Basic Data Grid */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <User size={14} className="text-slate-400" /> Datos Básicos
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Nombres</label>
                        <input
                          type="text"
                          required
                          value={profileData.first_name}
                          onChange={(e) => setProfileData(p => ({ ...p, first_name: e.target.value }))}
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:bg-white transition-all duration-200 shadow-inner"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Apellidos</label>
                        <input
                          type="text"
                          required
                          value={profileData.last_name}
                          onChange={(e) => setProfileData(p => ({ ...p, last_name: e.target.value }))}
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:bg-white transition-all duration-200 shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 flex items-center gap-1">
                          <Phone size={12} /> Teléfono
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. +57 300 123 4567"
                          value={profileData.phone_number}
                          onChange={(e) => setProfileData(p => ({ ...p, phone_number: e.target.value }))}
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:bg-white transition-all duration-200 shadow-inner"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 flex items-center gap-1">
                          <Calendar size={12} /> Fecha de Nacimiento
                        </label>
                        <input
                          type="date"
                          value={profileData.birth_date}
                          onChange={(e) => setProfileData(p => ({ ...p, birth_date: e.target.value }))}
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:bg-white transition-all duration-200 shadow-inner"
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Academic / Work Data Grid */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <GraduationCap size={14} className="text-slate-400" /> Datos Educativos y Laborales
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Tipo de Institución</label>
                        <select
                          value={profileData.institution_type}
                          onChange={(e) => setProfileData(p => ({ ...p, institution_type: e.target.value }))}
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-brand-blue focus:bg-white transition-all duration-200 cursor-pointer"
                        >
                          <option value="">-- Selecciona --</option>
                          <option value="universidad">Universidad</option>
                          <option value="instituto">Instituto Técnico/Tecnológico</option>
                          <option value="colegio">Colegio / Escuela</option>
                          <option value="otro">Otro</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Nombre de la Institución</label>
                        <input
                          type="text"
                          placeholder="Ej. Universidad de los Andes"
                          value={profileData.university}
                          onChange={(e) => setProfileData(p => ({ ...p, university: e.target.value }))}
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:bg-white transition-all duration-200 shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Carrera / Área de Estudio</label>
                        <input
                          type="text"
                          placeholder="Ej. Ingeniería de Sistemas"
                          value={profileData.career}
                          onChange={(e) => setProfileData(p => ({ ...p, career: e.target.value }))}
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:bg-white transition-all duration-200 shadow-inner"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Semestre / Grado</label>
                        <select
                          value={profileData.semester}
                          onChange={(e) => setProfileData(p => ({ ...p, semester: e.target.value }))}
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-brand-blue focus:bg-white transition-all duration-200 cursor-pointer"
                        >
                          <option value="">-- N/A --</option>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                            <option key={n} value={n}>{n}°</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 flex items-center gap-1">
                        <Briefcase size={12} /> Estado Académico y Laboral Actual
                      </label>
                      <select
                        value={profileData.study_work_status}
                        onChange={(e) => setProfileData(p => ({ ...p, study_work_status: e.target.value }))}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-brand-blue focus:bg-white transition-all duration-200 cursor-pointer"
                      >
                        <option value="">-- Selecciona --</option>
                        <option value="solo_estudia">Solo Estudia</option>
                        <option value="estudia_trabaja">Estudia y Trabaja</option>
                        <option value="solo_trabaja">Solo Trabaja</option>
                        <option value="buscando_empleo">Buscando Empleo</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Biography / Description */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <BookOpen size={14} className="text-slate-400" /> Biografía y Descripción
                    </h3>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Sobre mí (Máx. 500 caracteres)</label>
                      <textarea
                        rows="3"
                        maxLength="500"
                        placeholder="Escribe una breve descripción de tus metas o pasiones financieras. Ej: Estudiante motivado por aprender a ahorrar y estructurar mi primer portafolio de inversión..."
                        value={profileData.bio}
                        onChange={(e) => setProfileData(p => ({ ...p, bio: e.target.value }))}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:bg-white transition-all duration-200 shadow-inner resize-none leading-relaxed"
                      />
                      <div className="text-right text-[10px] text-slate-400 font-bold mt-1.5 mr-1">
                        {profileData.bio.length} / 500 caracteres
                      </div>
                    </div>
                  </div>

                </CardContent>

                <div className="bg-slate-50/80 px-8 py-5 border-t border-slate-100 flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={updateProfileMutation.isPending}
                    className="bg-brand-blue hover:bg-blue-700 text-white rounded-xl shadow-md font-bold px-6 py-2.5 flex items-center gap-2"
                  >
                    {updateProfileMutation.isPending ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Save size={16} />
                    )}
                    Guardar Cambios
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Form: Change Password */}
          {activeSection === 'security' && (
            <Card className="rounded-[2.5rem] border-slate-100 shadow-xl overflow-hidden bg-white">
              <form onSubmit={handlePasswordSubmit}>
                <CardHeader 
                  title="Ajustes de Seguridad" 
                  subtitle="Actualiza tu contraseña periódicamente para mantener tu cuenta y balances seguros."
                  className="px-8 pt-8 pb-4 border-b border-slate-100"
                />

                <CardContent className="px-8 py-6 space-y-5">
                  <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-xs text-blue-800 leading-relaxed font-medium">
                    <CheckCircle className="text-brand-blue shrink-0 mt-0.5" size={16} />
                    <div>
                      <span className="font-bold">Consejo de Seguridad:</span> Utiliza una contraseña robusta de al menos 8 caracteres con números, letras mayúsculas y caracteres especiales. Nunca uses contraseñas idénticas a otros sitios web.
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Contraseña Actual</label>
                      <input
                        type="password"
                        required
                        value={passwordData.old_password}
                        onChange={(e) => setPasswordData(p => ({ ...p, old_password: e.target.value }))}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-brand-blue focus:bg-white transition-all duration-200 shadow-inner"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Nueva Contraseña</label>
                        <input
                          type="password"
                          required
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData(p => ({ ...p, new_password: e.target.value }))}
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-brand-blue focus:bg-white transition-all duration-200 shadow-inner"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Confirmar Nueva Contraseña</label>
                        <input
                          type="password"
                          required
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData(p => ({ ...p, confirm_password: e.target.value }))}
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-brand-blue focus:bg-white transition-all duration-200 shadow-inner"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>

                <div className="bg-slate-50/80 px-8 py-5 border-t border-slate-100 flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={changePasswordMutation.isPending}
                    className="bg-brand-blue hover:bg-blue-700 text-white rounded-xl shadow-md font-bold px-6 py-2.5 flex items-center gap-2"
                  >
                    {changePasswordMutation.isPending ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Key size={16} />
                    )}
                    Actualizar Contraseña
                  </Button>
                </div>
              </form>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
