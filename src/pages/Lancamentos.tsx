import React, { useEffect, useState } from 'react';
import { mockDb } from '../lib/mockDb';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Calendar, 
  ChevronRight, 
  Filter, 
  Trash2, 
  Clock, 
  Users,
  HardHat,
  Loader2,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Lancamento } from '../types';

export function Lancamentos() {
  const { profile, isAdmin } = useAuth();
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedObra, setSelectedObra] = useState('all');
  const [obrasList, setObrasList] = useState<{id: string, nome: string}[]>([]);

  useEffect(() => {
    fetchLancamentos();
    fetchObras();
  }, []);

  async function fetchObras() {
    try {
      const snap = mockDb.getAll('obras');
      setObrasList(snap.map((doc: any) => ({ id: doc.id, nome: doc.nome })));
    } catch (error) {
      console.error("Erro ao buscar obras:", error);
    }
  }

  async function fetchLancamentos() {
    setLoading(true);
    try {
      const snap = mockDb.getAll('lancamentos');
      setLancamentos(snap.sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime()));
    } catch (error) {
      console.error("Erro ao buscar lançamentos:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (e: React.MouseEvent, item: Lancamento) => {
    e.preventDefault();
    e.stopPropagation();
    
    const canDelete = isAdmin || item.criadoPor === profile?.id;
    if (!canDelete) return alert("Você não tem permissão para excluir este lançamento.");
    
    if (!confirm("Excluir este lançamento permanentemente?")) return;
    
    try {
      mockDb.delete('lancamentos', item.id);
      fetchLancamentos();
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  const filteredLancamentos = lancamentos.filter(item => {
    const matchesSearch = item.obraNome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.criadoPorNome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesObra = selectedObra === 'all' || item.obraId === selectedObra;
    return matchesSearch && matchesObra;
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Lançamentos Diários</h1>
          <p className="text-neutral-500 mt-1">Histórico completo de atividades em campo.</p>
        </div>
        <Link 
          to="/novo-lancamento" 
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all text-center justify-center"
        >
          <Plus className="w-5 h-5" />
          Novo Lançamento
        </Link>
      </header>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Buscar por obra ou responsável..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
        </div>
        <div className="md:col-span-4 relative">
          <HardHat className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <select
            value={selectedObra}
            onChange={(e) => setSelectedObra(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none"
          >
            <option value="all">Todas as Obras</option>
            {obrasList.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <button 
            onClick={fetchLancamentos}
            className="w-full h-full bg-neutral-50 text-neutral-600 font-bold border border-neutral-200 rounded-xl hover:bg-neutral-100 flex items-center justify-center gap-2 transition-all"
          >
            <Clock className="w-4 h-4" />
            Atualizar
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-neutral-50 border-b border-neutral-100 italic">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-widest">Data / Obra</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-widest hidden md:table-cell">Efetivo</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-widest hidden lg:table-cell">Serviços</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-widest">Responsável</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {filteredLancamentos.map((item) => (
                  <tr key={item.id} className="group hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/lancamentos/${item.id}`} className="block">
                        <div className="text-sm font-bold text-blue-600">{format(new Date(item.data + 'T12:00:00'), 'dd/MM/yyyy')}</div>
                        <div className="text-base font-bold text-neutral-900 uppercase mt-0.5">{item.obraNome}</div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1 text-sm font-medium text-neutral-600">
                        <Users className="w-4 h-4 text-neutral-400" />
                        {item.totalFuncionarios} func.
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {item.servicos.slice(0, 2).map((s, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded font-medium">
                            {s}
                          </span>
                        ))}
                        {item.servicos.length > 2 && <span className="text-[10px] text-neutral-400">+{item.servicos.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-neutral-700 font-medium">{item.criadoPorNome}</div>
                      <div className="text-[10px] text-neutral-400 italic">Enviado em {format(new Date(item.criadoEm), 'HH:mm')}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/lancamentos/${item.id}`}
                          className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                        {(isAdmin || item.criadoPor === profile?.id) && (
                          <button 
                            onClick={(e) => handleDelete(e, item)}
                            className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredLancamentos.length === 0 && (
            <div className="p-12 text-center text-neutral-400 flex flex-col items-center">
              <FileText className="w-12 h-12 mb-4 opacity-10" />
              <p>Nenhum lançamento encontrado para os filtros selecionados.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
