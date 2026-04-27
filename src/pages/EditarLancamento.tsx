import React, { useState, useEffect } from 'react';
import { mockDb } from '../lib/mockDb';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Trash2, 
  Camera, 
  Loader2,
  X,
  PlusCircle,
  Package,
  Users,
  ClipboardList,
  ChevronLeft
} from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Obra, EfetivoItem, Lancamento } from '../types';

export function EditarLancamento() {
  const { id } = useParams();
  const { profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [obras, setObras] = useState<Obra[]>([]);
  
  // Form State
  const [obraId, setObraId] = useState('');
  const [data, setData] = useState('');
  const [climaManha, setClimaManha] = useState('Ensolarado');
  const [climaTarde, setClimaTarde] = useState('Ensolarado');
  const [empresasTerceirizadas, setEmpresasTerceirizadas] = useState('');
  const [observacoes, setObservacoes] = useState('');
  
  // List States
  const [servicos, setServicos] = useState<string[]>(['']);
  const [efetivo, setEfetivo] = useState<EfetivoItem[]>([{ funcao: '', quantidade: 1, nome: '' }]);
  const [fotosUrls, setFotosUrls] = useState<string[]>([]);
  const [fotosFiles, setFotosFiles] = useState<File[]>([]);
  const [fotosPreviews, setFotosPreviews] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        const obrasSnap = mockDb.query('obras', 'status', '==', 'ativa');
        setObras(obrasSnap);

        const l = mockDb.getOne('lancamentos', id);
        if (l) {
          // Permission check
          if (profile && !isAdmin && l.criadoPor !== profile.id) {
            alert("Sem permissão para editar.");
            navigate('/lancamentos');
            return;
          }

          setObraId(l.obraId);
          setData(l.data);
          setClimaManha(l.climaManha);
          setClimaTarde(l.climaTarde);
          setEmpresasTerceirizadas(l.empresasTerceirizadas || '');
          setObservacoes(l.observacoes || '');
          setServicos(l.servicos);
          setEfetivo(l.efetivo);
          setFotosUrls(l.fotos || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, isAdmin, profile, navigate]);

  const handleAddServico = () => setServicos([...servicos, '']);
  const handleRemoveServico = (index: number) => setServicos(servicos.filter((_, i) => i !== index));
  const handleChangeServico = (index: number, val: string) => {
    const newServicos = [...servicos];
    newServicos[index] = val;
    setServicos(newServicos);
  };

  const handleAddEfetivo = () => setEfetivo([...efetivo, { funcao: '', quantidade: 1, nome: '' }]);
  const handleRemoveEfetivo = (index: number) => setEfetivo(efetivo.filter((_, i) => i !== index));
  const handleChangeEfetivo = (index: number, field: keyof EfetivoItem, val: any) => {
    const newEfetivo = [...efetivo];
    newEfetivo[index] = { ...newEfetivo[index], [field]: val };
    setEfetivo(newEfetivo);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFotosFiles([...fotosFiles, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file as Blob));
      setFotosPreviews([...fotosPreviews, ...newPreviews]);
    }
  };

  const handleRemoveFotoExistente = (index: number) => {
    setFotosUrls(fotosUrls.filter((_, i) => i !== index));
  };

  const handleRemoveFotoPreview = (index: number) => {
    setFotosFiles(fotosFiles.filter((_, i) => i !== index));
    setFotosPreviews(fotosPreviews.filter((_, i) => i !== index));
  };

  const totalFuncionarios = efetivo.reduce((sum, item) => sum + (Number(item.quantidade) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !obraId) return;
    
    setSaving(true);
    try {
      const allUrls = [...fotosUrls, ...fotosPreviews]; // Previews serve as placeholders since storage is disabled

      const selectedObra = obras.find(o => o.id === obraId);

      mockDb.update('lancamentos', id, {
        obraId,
        obraNome: selectedObra?.nome || 'Obra Desconhecida',
        data,
        servicos: servicos.filter(s => s.trim() !== ''),
        climaManha,
        climaTarde,
        efetivo: efetivo.filter(e => e.funcao.trim() !== ''),
        totalFuncionarios,
        empresasTerceirizadas,
        observacoes,
        fotos: allUrls,
      });

      navigate(`/lancamentos/${id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };


  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <Link to={`/lancamentos/${id}`} className="inline-flex items-center gap-2 text-neutral-500 hover:text-blue-600 mb-2 transition-all font-medium">
        <ChevronLeft className="w-5 h-5" />
        Voltar para visualização
      </Link>

      <header>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Editar Lançamento</h1>
        <p className="text-neutral-500 mt-1">Atualize as informações do diário de obra.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basicamente o mesmo form do NovoLancamento */}
        <section className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-50 pb-2 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            Informações Gerais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Obra *</label>
              <select 
                required
                value={obraId}
                onChange={(e) => setObraId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="">Selecione uma obra</option>
                {obras.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Data *</label>
              <input 
                type="date" 
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Clima Manhã</label>
              <div className="flex gap-2">
                {['Ensolarado', 'Nublado', 'Chuvoso', 'Instável'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setClimaManha(c)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${climaManha === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Clima Tarde</label>
              <div className="flex gap-2">
                {['Ensolarado', 'Nublado', 'Chuvoso', 'Instável'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setClimaTarde(c)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${climaTarde === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-50 pb-2">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Serviços Realizados
            </h2>
            <button type="button" onClick={handleAddServico} className="text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-lg">
              <PlusCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {servicos.map((servico, index) => (
              <div key={index} className="flex gap-2">
                <input 
                  type="text" 
                  value={servico}
                  onChange={(e) => handleChangeServico(index, e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 outline-none"
                />
                <button type="button" onClick={() => handleRemoveServico(index)} className="p-2 text-neutral-400">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-50 pb-2">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Efetivo (Total: {totalFuncionarios})
            </h2>
            <button type="button" onClick={handleAddEfetivo} className="text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-lg">
              <PlusCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {efetivo.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                <div className="md:col-span-5">
                  <input type="text" value={item.funcao} onChange={(e) => handleChangeEfetivo(index, 'funcao', e.target.value)} placeholder="Função" className="w-full px-4 py-2 rounded-lg border text-sm" />
                </div>
                <div className="md:col-span-2">
                  <input type="number" value={item.quantidade} onChange={(e) => handleChangeEfetivo(index, 'quantidade', Number(e.target.value))} className="w-full px-4 py-2 rounded-lg border text-sm text-center" />
                </div>
                <div className="md:col-span-4">
                  <input type="text" value={item.nome} onChange={(e) => handleChangeEfetivo(index, 'nome', e.target.value)} placeholder="Nome" className="w-full px-4 py-2 rounded-lg border text-sm" />
                </div>
                <div className="md:col-span-1 flex items-center justify-center">
                  <button type="button" onClick={() => handleRemoveEfetivo(index)} className="text-neutral-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-50 pb-2">Observações</h2>
            <textarea rows={4} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 outline-none resize-none"></textarea>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-50 pb-2 flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              Fotos
            </h2>
            <div className="grid grid-cols-3 gap-2">
              <label className="aspect-square bg-neutral-50 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer">
                <Plus className="w-6 h-6 text-neutral-400" />
                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
              {fotosUrls.map((url, idx) => (
                <div key={`existing-${idx}`} className="aspect-square relative rounded-xl overflow-hidden shadow-sm group">
                  <img src={url} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => handleRemoveFotoExistente(idx)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {fotosPreviews.map((preview, idx) => (
                <div key={`new-${idx}`} className="aspect-square relative rounded-xl overflow-hidden shadow-sm group ring-2 ring-blue-400">
                  <img src={preview} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => handleRemoveFotoPreview(idx)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100">
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[8px] text-center py-0.5">NEW</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-bold shadow-xl shadow-blue-200 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Atualizar Lançamento'}
          </button>
        </div>
      </form>
    </div>
  );
}
