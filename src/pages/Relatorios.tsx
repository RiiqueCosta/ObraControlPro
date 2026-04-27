import React, { useState, useEffect } from 'react';
import { mockDb } from '../lib/mockDb';
import { 
  FileText, 
  Search, 
  Download, 
  Calendar, 
  HardHat, 
  User, 
  FileCheck,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Lancamento, Obra, UserProfile } from '../types';

export function Relatorios() {
  const [loading, setLoading] = useState(false);
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [usuarios, setUsuarios] = useState<UserProfile[]>([]);
  
  // Filters
  const [filtros, setFiltros] = useState({
    obraId: 'all',
    dataInicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    dataFim: format(new Date(), 'yyyy-MM-dd'),
    usuarioId: 'all'
  });

  useEffect(() => {
    async function loadData() {
      try {
        const obrasData = mockDb.getAll('obras');
        setObras(obrasData);
        
        const usersData = mockDb.getAll('users');
        setUsuarios(usersData);
      } catch (err) {
        console.error("Erro ao carregar dados para relatórios:", err);
      }
    }
    loadData();
  }, []);

  const handleFiltrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res = mockDb.getAll('lancamentos');
      
      // Filter by date
      res = res.filter((l: any) => l.data >= filtros.dataInicio && l.data <= filtros.dataFim);
      
      if (filtros.obraId !== 'all') {
        res = res.filter((l: any) => l.obraId === filtros.obraId);
      }
      if (filtros.usuarioId !== 'all') {
        res = res.filter((l: any) => l.criadoPor === filtros.usuarioId);
      }
      
      setLancamentos(res.sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime()));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    const title = "Relatório Diário de Obras (RDO)";
    
    doc.setFontSize(20);
    doc.text(title, 20, 20);
    
    doc.setFontSize(10);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 20, 30);
    doc.text(`Período: ${format(new Date(filtros.dataInicio + 'T12:00:00'), 'dd/MM/yy')} até ${format(new Date(filtros.dataFim + 'T12:00:00'), 'dd/MM/yy')}`, 20, 35);

    const tableData = lancamentos.map(l => [
      format(new Date(l.data + 'T12:00:00'), 'dd/MM/yyyy'),
      l.obraNome,
      l.totalFuncionarios.toString(),
      l.servicos.join('\n'),
      l.criadoPorNome
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['Data', 'Obra', 'Efetivo', 'Serviços Realizados', 'Responsável']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        3: { cellWidth: 60 } // Serviços
      }
    });

    doc.save(`relatorio_obra_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Relatórios Extração</h1>
        <p className="text-neutral-500 mt-1">Gere relatórios consolidados em PDF das atividades realizadas.</p>
      </header>

      {/* Filtros Card */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
        <form onSubmit={handleFiltrar} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Data Inicial</label>
            <input 
              type="date" 
              value={filtros.dataInicio} 
              onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-100 outline-none" 
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Data Final</label>
            <input 
              type="date" 
              value={filtros.dataFim} 
              onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-100 outline-none" 
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Obra</label>
            <select 
              value={filtros.obraId}
              onChange={(e) => setFiltros({...filtros, obraId: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white focus:ring-2 focus:ring-blue-100 outline-none"
            >
              <option value="all">Todas as Obras</option>
              {obras.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
            </select>
          </div>
          <div className="md:col-span-1 flex gap-2">
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 bg-neutral-900 text-white font-bold py-2.5 rounded-xl hover:bg-neutral-800 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Filtrar
            </button>
            {lancamentos.length > 0 && (
              <button 
                type="button"
                onClick={exportarPDF}
                className="bg-emerald-600 text-white p-2.5 rounded-xl hover:bg-emerald-700 transition-all font-bold"
                title="Exportar PDF"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Resultados List */}
      <div className="bg-neutral-900 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-white font-bold flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            Resultados Encontrados ({lancamentos.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
          ) : lancamentos.length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/5 italic">
                <tr>
                  <th className="px-6 py-4 text-neutral-400 font-bold uppercase tracking-widest text-[10px]">Data</th>
                  <th className="px-6 py-4 text-neutral-400 font-bold uppercase tracking-widest text-[10px]">Projeto</th>
                  <th className="px-6 py-4 text-neutral-400 font-bold uppercase tracking-widest text-[10px]">Funcionários</th>
                  <th className="px-6 py-4 text-neutral-400 font-bold uppercase tracking-widest text-[10px]">Responsável</th>
                  <th className="px-6 py-4 text-neutral-400 font-bold uppercase tracking-widest text-[10px]">Serviços (Resumo)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {lancamentos.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 font-bold text-white">{format(new Date(item.data + 'T12:00:00'), 'dd/MM/yyyy')}</td>
                    <td className="px-6 py-4 text-neutral-300 font-bold uppercase tracking-tighter">{item.obraNome}</td>
                    <td className="px-6 py-4 text-blue-400 font-bold">{item.totalFuncionarios}</td>
                    <td className="px-6 py-4 text-neutral-300">{item.criadoPorNome}</td>
                    <td className="px-6 py-4 text-neutral-500 truncate max-w-xs">{item.servicos.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-20 text-center text-neutral-500">
              <div className="flex flex-col items-center gap-4">
                <AlertCircle className="w-10 h-10 opacity-20" />
                <p>Nenhum dado encontrado para este período/filtro.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
