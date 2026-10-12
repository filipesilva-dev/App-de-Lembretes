export type Recorrencia = 'Única' | 'Diária';

export interface Lembrete {
  id: string;
  nome: string;
  descricao: string;
  horario: string;
  recorrencia: Recorrencia;
}

export interface LembreteData {
  id: string;
  nome: string;
  descricao: string;
  recorrencia: Recorrencia;
}
