import React, { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  limit, 
  orderBy, 
  where 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  HardHat, 
  ClipboardList, 
  Users as UsersIcon, 
  Plus, 
  Calendar as CalendarIcon,
  ChevronRight,
  TrendingUp,
  Clock,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Obra, Lancamento } from '../types';

export function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    obrasAtivas: 0,
    lancamentosMes: 0,
    usuariosAtivos: 0
  });
  const [recentLancamentos, setRecentLancamentos] = useState<Lancamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!auth.currentUser) return;
      
      try {
        setLoading(true);
        // Queries baseadas no perfil
        let obrasQuery = query(collection(db, 'obras'));
        let lancQuery = query(collection(db, 'lancamentos'));

        const obrasSnap = await getDocs(obrasQuery);
        const activeObras = obrasSnap.docs.filter(d => d.data().status === 'ativa');
        
        // Stats: Lancamentos Mes
        const monthStart = startOfMonth(new Date());
        const monthStartStr = format(monthStart, 'yyyy-MM-dd');
        
        const allUserLancSnap = await getDocs(lancQuery);
        const lancamentosMes = allUserLancSnap.docs.filter(d => d.data().data >= monthStartStr);

        // Stats: Usuarios
        let activeUsers = 0;
        if (profile?.role === 'admin') {
          try {
            const usersQuery = query(collection(db, 'users'), where('ativo', '==', true));
            const usersSnap = await getDocs(usersQuery);
            activeUsers = usersSnap.size;
          } catch (e) {
            console.warn("Could not fetch active users:", e);
          }
        }

        // Recent Lancamentos
        const recent = allUserLancSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Lancamento))
          .sort((a, b) => {
            const dateA = a.criadoEm?.toDate?.() || new Date(a.criadoEm || 0);
            const dateB = b.criadoEm?.toDate?.() || new Date(b.criadoEm || 0);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 5);

        setStats({
          obrasAtivas: activeObras.length,
          lancamentosMes: lancamentosMes.length,
          usuariosAtivos: activeUsers || (profile?.ativo ? 1 : 0)
        });

        setRecentLancamentos(recent);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    if (profile) {
      fetchData();
    }
  }, [profile]);

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-neutral-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-neutral-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-full">
          <TrendingUp className="w-3 h-3" />
          <span>{trend}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Bem-vindo, {profile?.nome}</h1>
          <p className="text-neutral-500 mt-1">Veja o que está acontecendo nas suas obras hoje.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/obras?novo=true" 
            className="flex items-center gap-2 bg-white border border-blue-600 text-blue-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-50 active:scale-95 transition-all text-sm md:text-base"
          >
            <Plus className="w-5 h-5" />
            Nova Obra
          </Link>
          <Link 
            to="/novo-lancamento" 
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all text-sm md:text-base"
          >
            <Plus className="w-5 h-5" />
            Novo Lançamento
          </Link>
        </div>
      </header>

      {/* Grid de Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Obras Ativas" 
          value={stats.obrasAtivas} 
          icon={HardHat} 
          color="blue" 
        />
        <StatCard 
          title="Lançamentos no Mês" 
          value={stats.lancamentosMes} 
          icon={ClipboardList} 
          color="orange" 
        />
        <StatCard 
          title="Equipe Ativa" 
          value={stats.usuariosAtivos} 
          icon={UsersIcon} 
          color="emerald" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Últimos Lançamentos */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-50 flex items-center justify-between">
            <h2 className="font-bold text-neutral-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-neutral-400" />
              Últimos Lançamentos
            </h2>
            <Link to="/lancamentos" className="text-sm font-medium text-blue-600 hover:underline">Ver todos</Link>
          </div>
          <div className="divide-y divide-neutral-50">
            {recentLancamentos.length > 0 ? (
              recentLancamentos.map((item) => (
                <Link 
                  key={item.id} 
                  to={`/lancamentos/${item.id}`}
                  className="flex items-center justify-between p-6 hover:bg-neutral-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 font-bold text-xs uppercase">
                      {item.obraNome.substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">{item.obraNome}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-neutral-400 flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {format(new Date(item.data + 'T12:00:00'), "dd 'de' MMM", { locale: ptBR })}
                        </span>
                        <span className="text-xs text-neutral-400 flex items-center gap-1">
                          <UsersIcon className="w-3 h-3" />
                          {item.totalFuncionarios} funcionários
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-neutral-500 transform group-hover:translate-x-1 transition-all" />
                </Link>
              ))
            ) : (
              <div className="p-12 text-center text-neutral-400">
                {loading ? "Carregando..." : "Nenhum lançamento encontrado."}
              </div>
            )}
          </div>
        </div>

        {/* Calendar / Shortcuts */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
            <h2 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-neutral-400" />
              Calendário
            </h2>
            <div className="aspect-square bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-400 text-sm">
              Visualização de Calendário
            </div>
          </div>

          <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-100 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">Relatórios Rápidos</h3>
              <p className="text-blue-100 text-sm mb-4">Acesse relatórios detalhados de todas as suas obras em segundos.</p>
              <Link 
                to="/relatorios"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors"
              >
                Explorar relatórios
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <BarChart3 className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 rotate-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
