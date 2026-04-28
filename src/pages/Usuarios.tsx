import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users as UsersIcon, 
  Shield, 
  User, 
  CheckCircle2, 
  XCircle, 
  ToggleLeft, 
  ToggleRight,
  Search,
  Loader2,
  Mail,
  Calendar
} from 'lucide-react';
import { UserProfile } from '../types';
import { format } from 'date-fns';

export function Usuarios() {
  const { profile: myProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), orderBy('criadoEm', 'desc'));
      const snap = await getDocs(q);
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const toggleStatus = async (user: UserProfile) => {
    if (user.id === myProfile?.id) return alert("Você não pode desativar a si mesmo.");
    try {
      await updateDoc(doc(db, 'users', user.id), {
        ativo: !user.ativo
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleRole = async (user: UserProfile) => {
    if (user.id === myProfile?.id) return alert("Você não pode alterar seu próprio nível de acesso.");
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await updateDoc(doc(db, 'users', user.id), {
        role: newRole
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Gestão de Usuários</h1>
        <p className="text-neutral-500 mt-1">Gerencie permissões e acesso da equipe ao sistema.</p>
      </header>

      <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div key={user.id} className={`bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm transition-all ${!user.ativo ? 'opacity-60 grayscale' : 'hover:shadow-md'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg uppercase ${user.role === 'admin' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-neutral-100 text-neutral-500'}`}>
                  {user.nome.substring(0, 2)}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-blue-50 text-blue-700' : 'bg-neutral-100 text-neutral-500'}`}>
                    {user.role}
                  </span>
                  <span className={`flex items-center gap-1 text-[10px] font-bold uppercase ${user.ativo ? 'text-emerald-500' : 'text-red-500'}`}>
                    {user.ativo ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {user.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-neutral-900 leading-tight truncate">{user.nome}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1">
                    <Mail className="w-3 h-3" />
                    {user.email}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-50 grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => toggleStatus(user)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${user.ativo ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                  >
                    {user.ativo ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    {user.ativo ? 'Sustar' : 'Ativar'}
                  </button>
                  <button 
                    onClick={() => toggleRole(user)}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-all border border-neutral-200"
                  >
                    <Shield className="w-4 h-4" />
                    Hierarquia
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
