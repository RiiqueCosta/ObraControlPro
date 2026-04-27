import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Save, Loader2, CheckCircle } from 'lucide-react';

export function Perfil() {
  const { profile } = useAuth();
  const [nome, setNome] = useState(profile?.nome || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    setSuccess(false);

    try {
      await updateDoc(doc(db, 'users', profile.id), {
        nome: nome
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Meu Perfil</h1>
        <p className="text-neutral-500 mt-1">Gerencie suas informações pessoais e nível de acesso.</p>
      </header>

      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-400 relative">
          <div className="absolute -bottom-10 left-8">
            <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center font-bold text-3xl text-blue-600 uppercase border-4 border-white">
              {profile?.nome.substring(0, 2)}
            </div>
          </div>
        </div>
        
        <div className="pt-16 p-8 space-y-8">
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest pl-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input 
                    type="text" 
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest pl-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input 
                    type="email" 
                    disabled
                    value={profile?.email}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-400 cursor-not-allowed font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
              <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Nível de Acesso</p>
                <p className="text-neutral-900 font-bold capitalize">{profile?.role === 'admin' ? 'Administrador' : 'Usuário Comum'}</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {profile?.role === 'admin' 
                    ? "Você tem controle total sobre obras, usuários e lançamentos." 
                    : "Você pode criar lançamentos e visualizar as obras da empresa."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-neutral-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-100 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Salvar Alterações
              </button>
              {success && (
                <div className="flex items-center gap-2 text-emerald-600 font-bold animate-in fade-in slide-in-from-left-4">
                  <CheckCircle className="w-5 h-5" />
                  Perfil atualizado!
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
