export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  ativo: boolean;
  criadoEm: any;
}

export interface Obra {
  id: string;
  nome: string;
  endereco: string;
  cliente: string;
  status: 'ativa' | 'pausada' | 'finalizada';
  dataInicio: string;
  observacoes: string;
  criadoPor: string;
  criadoEm: any;
}

export interface EfetivoItem {
  funcao: string;
  quantidade: number;
  nome?: string;
}

export interface Lancamento {
  id: string;
  obraId: string;
  obraNome: string;
  data: string;
  servicos: string[];
  climaManha: string;
  climaTarde: string;
  efetivo: EfetivoItem[];
  totalFuncionarios: number;
  empresasTerceirizadas: string;
  observacoes: string;
  fotos: string[];
  criadoPor: string;
  criadoPorNome: string;
  criadoEm: any;
  atualizadoEm: any;
}
