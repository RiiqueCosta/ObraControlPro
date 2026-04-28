import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChevronLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Sun, 
  CloudSun, 
  CloudRain, 
  Edit, 
  Trash2, 
  Printer, 
  Loader2,
  HardHat,
  Clock,
  User,
  Briefcase,
  CheckCircle2,
  MessageSquare,
  Camera
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Lancamento } from '../types';

export function VisualizarLancamento() {
  const { id } = useParams();
  const { profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [lancamento, setLancamento] = useState<Lancamento | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLancamento() {
      if (!id) return;
      try {
        const snap = await getDoc(doc(db, 'lancamentos', id));
        if (snap.exists()) {
          setLancamento({ id: snap.id, ...snap.data() } as Lancamento);
        } else {
          alert("Lançamento não encontrado.");
          navigate('/lancamentos');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchLancamento();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!lancamento || !id) return;
    const canDelete = isAdmin || lancamento.criadoPor === profile?.id;
    if (!canDelete) return alert("Você não tem permissão.");
    
    if (confirm("Tem certeza que deseja excluir?")) {
      await deleteDoc(doc(db, 'lancamentos', id));
      navigate('/lancamentos');
    }
  };

  const formatCreatedDate = (criadoEm: any) => {
    if (!criadoEm) return '';
    const date = criadoEm.toDate ? criadoEm.toDate() : new Date(criadoEm);
    return format(date, "dd/MM/yy 'às' HH:mm");
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  if (!lancamento) return null;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Link to="/lancamentos" className="inline-flex items-center gap-2 text-neutral-500 hover:text-blue-600 mb-6 transition-colors font-medium">
        <ChevronLeft className="w-5 h-5" />
        Voltar para a lista
      </Link>

      <div className="bg-white rounded-3xl shadow-xl border border-neutral-100 overflow-hidden">
        {/* Header Colorido */}
        <div className="bg-blue-600 px-8 py-10 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <HardHat className="w-5 h-5 text-blue-200" />
                <span className="uppercase text-xs font-bold tracking-widest text-blue-100">Relatório Diário de Obra</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight uppercase">{lancamento.obraNome}</h1>
              <div className="flex items-center gap-4 mt-4 text-blue-50">
                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4 opacity-70" />
                  {format(new Date(lancamento.data + 'T12:00:00'), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                </div>
                <div className="w-px h-4 bg-white/20" />
                <div className="flex items-center gap-1.5 font-medium">
                  <Users className="w-4 h-4 opacity-70" />
                  {lancamento.totalFuncionarios} Funcionários
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {(isAdmin || lancamento.criadoPor === profile?.id) && (
                <Link
                  to={`/lancamentos/${lancamento.id}/editar`}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-md"
                  title="Editar"
                >
                  <Edit className="w-6 h-6" />
                </Link>
              )}
              <button 
                onClick={() => window.print()}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-md"
                title="Imprimir / PDF"
              >
                <Printer className="w-6 h-6" />
              </button>
              {(isAdmin || lancamento.criadoPor === profile?.id) && (
                <button 
                  onClick={handleDelete}
                  className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-100 rounded-xl transition-colors backdrop-blur-md"
                  title="Excluir"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 md:p-12 space-y-12 print:p-0">
          
          {/* Sessão 1: Resumo do Dia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Sun className="w-4 h-4" />
                Condições Climáticas
              </h3>
              <div className="flex gap-4">
                <div className="flex-1 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                  <span className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Período Manhã</span>
                  <span className="text-lg font-bold text-neutral-900">{lancamento.climaManha}</span>
                </div>
                <div className="flex-1 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                  <span className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Período Tarde</span>
                  <span className="text-lg font-bold text-neutral-900">{lancamento.climaTarde}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Responsável pelo Lançamento
              </h3>
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center font-bold text-blue-600 uppercase">
                  {lancamento.criadoPorNome.substring(0, 2)}
                </div>
                <div>
                  <div className="text-lg font-bold text-neutral-900">{lancamento.criadoPorNome}</div>
                  <div className="text-sm text-neutral-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Enviado em {formatCreatedDate(lancamento.criadoEm)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sessão 2: Serviços Realizados */}
          <div>
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Serviços Realizados no Dia
            </h3>
            <div className="space-y-3">
              {lancamento.servicos.map((servico, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100 group hover:bg-emerald-50 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-lg font-semibold text-neutral-800">{servico}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sessão 3: Efetivo Detalhado */}
          <div>
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Efetivo e Equipes
            </h3>
            <div className="bg-neutral-900 rounded-3xl p-1 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-6 py-4 text-xs font-bold text-neutral-400 uppercase">Função / Cargo</th>
                      <th className="px-6 py-4 text-xs font-bold text-neutral-400 uppercase text-center">Qtde</th>
                      <th className="px-6 py-4 text-xs font-bold text-neutral-400 uppercase">Colaborador Principal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white">
                    {lancamento.efetivo.map((item, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4 font-bold text-blue-400">{item.funcao}</td>
                        <td className="px-6 py-4 text-center font-bold">{item.quantidade}</td>
                        <td className="px-6 py-4 text-neutral-300 font-medium">{item.nome || '-'}</td>
                      </tr>
                    ))}
                    <tr className="bg-white/5 font-bold">
                      <td className="px-6 py-4 uppercase text-blue-500 tracking-tighter">Total Geral de Efetivo</td>
                      <td className="px-6 py-4 text-center text-xl">{lancamento.totalFuncionarios}</td>
                      <td className="px-6 py-4 text-neutral-500 md:text-sm italic">Soma de todos os funcionários</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sessão 4: Observações e Terceiros */}
          {(lancamento.observacoes || lancamento.empresasTerceirizadas) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {lancamento.empresasTerceirizadas && (
                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                  <h4 className="text-xs font-bold text-blue-600 uppercase mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Empresas Terceirizadas
                  </h4>
                  <p className="text-blue-900 font-bold leading-relaxed">
                    {lancamento.empresasTerceirizadas}
                  </p>
                </div>
              )}
              {lancamento.observacoes && (
                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
                  <h4 className="text-xs font-bold text-amber-600 uppercase mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Observações / Observação
                  </h4>
                  <p className="text-amber-900 font-medium italic leading-relaxed whitespace-pre-wrap">
                    "{lancamento.observacoes}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Sessão 5: Galeria de Fotos */}
          {lancamento.fotos.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Registro Fotográfico ({lancamento.fotos.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {lancamento.fotos.map((url, i) => (
                  <div key={i} className="aspect-video bg-neutral-100 rounded-3xl overflow-hidden border-2 border-neutral-50 group hover:border-blue-200 transition-all cursor-zoom-in">
                    <img src={url} alt={`Obra ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
      
      <p className="mt-8 text-center text-neutral-400 text-xs font-medium">
        Este é um documento digital oficial do sistema ObraControl.
      </p>
    </div>
  );
}
