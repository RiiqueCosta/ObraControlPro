import React, { useEffect, useState } from 'react';
import { mockDb } from '../lib/mockDb';
import { auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  MapPin, 
  User, 
  Calendar,
  X,
  Loader2,
  HardHat
} from 'lucide-react';
import { Obra } from '../types';
import { format } from 'date-fns';
import { useSearchParams } from 'react-router-dom';

export function Obras() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingObra, setEditingObra] = useState<Obra | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    cliente: '',
    status: 'ativa',
    dataInicio: format(new Date(), 'yyyy-MM-dd'),
    observacoes: ''
  });

  useEffect(() => {
    fetchObras();
    if (searchParams.get('novo') === 'true') {
      setShowModal(true);
      setSearchParams({}); // Clear param after opening
    }
  }, [searchParams]);

  async function fetchObras() {
    setLoading(true);
    try {
      const data = mockDb.getAll('obras');
      setObras(data.sort((a: any, b: any) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()));
    } catch (error) {
      console.error("Erro ao buscar obras:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      if (editingObra) {
        mockDb.update('obras', editingObra.id, {
          ...formData,
        });
      } else {
        mockDb.save('obras', {
          ...formData,
          criadoPor: profile?.id || auth.currentUser?.uid,
        });
      }
      setShowModal(false);
      setEditingObra(null);
      setFormData({
        nome: '',
        endereco: '',
        cliente: '',
        status: 'ativa',
        dataInicio: format(new Date(), 'yyyy-MM-dd'),
        observacoes: ''
      });
      fetchObras();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (obra: Obra) => {
    setEditingObra(obra);
    setFormData({
      nome: obra.nome,
      endereco: obra.endereco || '',
      cliente: obra.cliente,
      status: obra.status,
      dataInicio: obra.dataInicio,
      observacoes: obra.observacoes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta obra?")) return;
    
    try {
      mockDb.delete('obras', id);
      fetchObras();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredObras = obras.filter(obra => 
    obra.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obra.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors: any = {
    ativa: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    pausada: 'bg-amber-50 text-amber-700 border-amber-100',
    finalizada: 'bg-neutral-50 text-neutral-700 border-neutral-100'
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Obras</h1>
          <p className="text-neutral-500 mt-1">Gerencie todos os seus projetos ativos e finalizados.</p>
        </div>
        <button 
          onClick={() => {
            setEditingObra(null);
            setFormData({
              nome: '',
              endereco: '',
              cliente: '',
              status: 'ativa',
              dataInicio: format(new Date(), 'yyyy-MM-dd'),
              observacoes: ''
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all w-full md:w-auto"
        >
          <Plus className="w-5 h-5" />
          Cadastrar Obra
        </button>
      </header>

      {/* Search & Stats Banner */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="px-4 py-2.5 bg-blue-50 rounded-xl flex items-center gap-2">
            <span className="text-sm font-bold text-blue-700">{obras.length}</span>
            <span className="text-xs font-semibold text-blue-600 uppercase">Total</span>
          </div>
          <div className="px-4 py-2.5 bg-emerald-50 rounded-xl flex items-center gap-2">
            <span className="text-sm font-bold text-emerald-700">{obras.filter(o => o.status === 'ativa').length}</span>
            <span className="text-xs font-semibold text-emerald-600 uppercase">Ativas</span>
          </div>
        </div>
      </div>

      {/* Obras Grid */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredObras.map((obra) => (
            <div key={obra.id} className="bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-all overflow-hidden group border-b-4 border-b-neutral-100 focus-within:border-b-blue-600">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[obra.status]}`}>
                    {obra.status}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(obra)} className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(obra.id)} className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <HardHat className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-neutral-900 text-lg group-hover:text-blue-600 transition-colors uppercase">{obra.nome}</h3>
                </div>

                <div className="space-y-3 text-sm text-neutral-500">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-neutral-400" />
                    <span>{obra.endereco}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-neutral-400" />
                    <span>Cliente: <span className="text-neutral-900 font-medium">{obra.cliente}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    <span>Início: <span className="text-neutral-900 font-medium">{format(new Date(obra.dataInicio + 'T12:00:00'), 'dd/MM/yyyy')}</span></span>
                  </div>
                </div>

                {obra.observacoes && (
                  <div className="mt-4 pt-4 border-t border-neutral-50 text-xs text-neutral-400 italic line-clamp-2">
                    "{obra.observacoes}"
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 bg-neutral-50 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">{editingObra ? 'Editar Obra' : 'Nova Obra'}</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-neutral-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">Nome da Obra *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    placeholder="Ex: Edifício Horizonte"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">Endereço</label>
                  <input 
                    type="text" 
                    value={formData.endereco}
                    onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                    placeholder="Rua, Número, Bairro, Cidade"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">Cliente *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.cliente}
                    onChange={(e) => setFormData({...formData, cliente: e.target.value})}
                    placeholder="Nome do cliente ou empresa"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1">Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    >
                      <option value="ativa">Ativa</option>
                      <option value="pausada">Pausada</option>
                      <option value="finalizada">Finalizada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1">Data Início</label>
                    <input 
                      type="date" 
                      value={formData.dataInicio}
                      onChange={(e) => setFormData({...formData, dataInicio: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">Observações</label>
                  <textarea 
                    rows={3}
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                    placeholder="Informações adicionais..."
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 font-bold text-neutral-700 hover:bg-neutral-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Obra'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
