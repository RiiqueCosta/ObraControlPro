import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  doc,
  setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Trash2, 
  Camera, 
  CloudSun, 
  CloudRain, 
  Sun, 
  Loader2,
  HardHat,
  X,
  PlusCircle,
  Package,
  Clock,
  Briefcase,
  Users,
  ClipboardList
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Obra, EfetivoItem } from '../types';

export function NovoLancamento() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [obras, setObras] = useState<Obra[]>([]);
  
  // Form State
  const [obraId, setObraId] = useState('');
  const [data, setData] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [climaManha, setClimaManha] = useState('Ensolarado');
  const [climaTarde, setClimaTarde] = useState('Ensolarado');
  const [empresasTerceirizadas, setEmpresasTerceirizadas] = useState('');
  const [observacoes, setObservacoes] = useState('');
  
  // List States
  const [servicos, setServicos] = useState<string[]>(['']);
  const [efetivo, setEfetivo] = useState<EfetivoItem[]>([{ funcao: '', quantidade: 1, nome: '' }]);
  const [fotosFiles, setFotosFiles] = useState<File[]>([]);
  const [fotosPreviews, setFotosPreviews] = useState<string[]>([]);

  useEffect(() => {
    async function fetchObras() {
      if (!profile || !auth.currentUser) return;
      try {
        const q = query(collection(db, 'obras'), where('status', '==', 'ativa'));
        const snap = await getDocs(q);
        setObras(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Obra)));
      } catch (err) {
        console.error("Erro ao buscar obras:", err);
      }
    }
    fetchObras();
  }, [profile]);

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

  const handleRemoveFoto = (index: number) => {
    setFotosFiles(fotosFiles.filter((_, i) => i !== index));
    URL.revokeObjectURL(fotosPreviews[index]);
    setFotosPreviews(fotosPreviews.filter((_, i) => i !== index));
  };

  const totalFuncionarios = efetivo.reduce((sum, item) => sum + (Number(item.quantidade) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!obraId) return alert("Selecione uma obra.");
    if (servicos.every(s => !s.trim())) return alert("Adicione ao menos um serviço.");
    
    setLoading(true);
    try {
      // 1. Upload Fotos
      const fotoUrls = [];
      for (const file of fotosFiles) {
        const storageRef = ref(storage, `fotos-obras/${Date.now()}-${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        fotoUrls.push(url);
      }

      const selectedObra = obras.find(o => o.id === obraId);

      // 2. Save Lancamento
      const newLancRef = doc(collection(db, 'lancamentos'));
      await setDoc(newLancRef, {
        id: newLancRef.id,
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
        fotos: fotoUrls,
        criadoPor: auth.currentUser?.uid,
        criadoPorNome: profile?.nome || auth.currentUser?.email,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp()
      });

      navigate('/lancamentos');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'lancamentos');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Novo Lançamento Diário</h1>
        <p className="text-neutral-500 mt-1">Registre o progresso e o efetivo do dia na obra.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção 1: Informações Básicas */}
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
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              >
                <option value="">Selecione uma obra</option>
                {obras.map(o => (
                  <option key={o.id} value={o.id}>{o.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Data *</label>
              <input 
                type="date" 
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
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

        {/* Seção 2: Serviços Realizados */}
        <section className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-50 pb-2">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Serviços Realizados
            </h2>
            <button 
              type="button" 
              onClick={handleAddServico}
              className="text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Adicionar
            </button>
          </div>
          <div className="space-y-3">
            {servicos.map((servico, index) => (
              <div key={index} className="flex gap-2 group">
                <input 
                  type="text" 
                  value={servico}
                  onChange={(e) => handleChangeServico(index, e.target.value)}
                  placeholder="Ex: Demolição de muro"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
                {servicos.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => handleRemoveServico(index)}
                    className="p-2.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Seção 3: Efetivo */}
        <section className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-50 pb-2">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Efetivo da Equipe
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-neutral-500">Total: <span className="text-blue-600">{totalFuncionarios}</span></span>
              <button 
                type="button" 
                onClick={handleAddEfetivo}
                className="text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Adicionar
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {efetivo.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100 relative group">
                <div className="md:col-span-5">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 mb-1 block">Função / Cargo</label>
                  <input 
                    type="text" 
                    value={item.funcao}
                    required
                    onChange={(e) => handleChangeEfetivo(index, 'funcao', e.target.value)}
                    placeholder="Ex: Pedreiro"
                    className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 mb-1 block">Quantidade</label>
                  <input 
                    type="number" 
                    min="1"
                    required
                    value={item.quantidade}
                    onChange={(e) => handleChangeEfetivo(index, 'quantidade', Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-bold text-center"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 mb-1 block">Nome (Opcional)</label>
                  <input 
                    type="text" 
                    value={item.nome}
                    onChange={(e) => handleChangeEfetivo(index, 'nome', e.target.value)}
                    placeholder="Nome do funcionário"
                    className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                  />
                </div>
                <div className="md:col-span-1 flex items-end pb-0.5">
                  {efetivo.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => handleRemoveEfetivo(index)}
                      className="p-2 text-neutral-400 hover:text-red-500 hover:bg-neutral-200 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Seção 4: Outras Infos e Fotos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-50 pb-2 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Observações
            </h2>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Empresas Terceirizadas</label>
              <input 
                type="text" 
                value={empresasTerceirizadas}
                onChange={(e) => setEmpresasTerceirizadas(e.target.value)}
                placeholder="Ex: Oni Engenharia, Solo Limpo..."
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Observações Gerais</label>
              <textarea 
                rows={4}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Relate impasses, visitas técnicas ou avisos importantes..."
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
              ></textarea>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-50 pb-2 flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              Fotos da Obra
            </h2>
            <div className="grid grid-cols-3 gap-2">
              <label className="aspect-square bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-100 transition-all text-neutral-400 group">
                <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase mt-1">Adicionar</span>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden" 
                />
              </label>
              {fotosPreviews.map((preview, idx) => (
                <div key={idx} className="aspect-square relative rounded-xl overflow-hidden shadow-sm group">
                  <img src={preview} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => handleRemoveFoto(idx)}
                    className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="button"
            onClick={() => navigate('/lancamentos')}
            className="flex-1 bg-white border border-neutral-200 text-neutral-700 py-3 rounded-2xl font-bold hover:bg-neutral-50 active:scale-[0.98] transition-all"
          >
            Sair sem salvar
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="flex-[2] bg-blue-600 text-white py-3 rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Salvar Diário de Obra'}
          </button>
        </div>
      </form>
    </div>
  );
}
