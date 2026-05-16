import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Modal, { ModalBody, ModalFooter } from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import api from '../../api/axios';
import { Users, MessageSquare, Loader2 } from 'lucide-react';

export default function AdminModal({ isOpen, onClose }) {
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await api.get('/users/admin/users/');
      return res.data;
    },
    enabled: isOpen
  });

  const { data: messages, isLoading: loadingMsgs } = useQuery({
    queryKey: ['adminMessages'],
    queryFn: async () => {
      const res = await api.get('/users/admin/messages/');
      return res.data;
    },
    enabled: isOpen
  });

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Panel de Administración" size="lg">
      <ModalBody>
        <div className="space-y-6">
          {/* Users Panel */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
              <Users className="text-brand-blue" /> Usuarios Registrados ({users?.length || 0})
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-xl max-h-60 overflow-y-auto">
              {loadingUsers ? (
                <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-brand-blue" /></div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 text-slate-600 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Usuario</th>
                      <th className="px-4 py-2 font-semibold">Estado</th>
                      <th className="px-4 py-2 font-semibold">Rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.map(u => (
                      <tr key={u.id} className="border-t border-slate-200 hover:bg-slate-100/50 transition">
                        <td className="px-4 py-2">
                          <p className="font-semibold text-slate-800">{u.first_name} {u.last_name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </td>
                        <td className="px-4 py-2">
                          <div className="text-xs">
                            <p className="text-slate-600">Registro: {new Date(u.date_joined).toLocaleDateString()}</p>
                            <p className="text-amber-600 font-medium">Puntos: {u.points}</p>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          {u.is_staff ? <Badge variant="info">Admin</Badge> : <Badge variant="outline">Estudiante</Badge>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Messages Panel */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
              <MessageSquare className="text-brand-yellow" /> Mensajes de Contacto ({messages?.length || 0})
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {loadingMsgs ? (
                <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-brand-blue" /></div>
              ) : messages?.map(m => (
                <div key={m.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-slate-800">{m.name}</p>
                      <p className="text-xs text-blue-600">{m.email}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-1 rounded-full">
                      {new Date(m.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 italic bg-slate-50 p-3 rounded-lg border border-slate-100">"{m.message}"</p>
                </div>
              ))}
              {messages?.length === 0 && <p className="text-sm text-slate-500">No hay mensajes recientes.</p>}
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose}>Cerrar Panel</Button>
      </ModalFooter>
    </Modal>
  );
}
