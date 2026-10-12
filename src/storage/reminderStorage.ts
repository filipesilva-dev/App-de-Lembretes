import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Lembrete } from '../types';

const KEY = '@lembretes';

export const salvarLembretes = async (lembretes: Lembrete[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(lembretes));
  } catch (e) {
    console.error('Erro ao salvar lembretes', e);
  }
};

export const carregarLembretes = async (): Promise<Lembrete[]> => {
  try {
    const json = await AsyncStorage.getItem(KEY);
    return json != null ? (JSON.parse(json) as Lembrete[]) : [];
  } catch (e) {
    console.error('Erro ao carregar lembretes', e);
    return [];
  }
};
