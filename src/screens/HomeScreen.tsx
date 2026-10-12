import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import ReminderCard from '../components/ReminderCard';
import {
  carregarLembretes,
  salvarLembretes,
} from '../storage/reminderStorage';
import type { HomeScreenProps } from '../navigation/types';
import type { Lembrete, LembreteData } from '../types';

export default function HomeScreen({
  navigation,
}: HomeScreenProps): JSX.Element {
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);

  const recarregar = useCallback(async (): Promise<void> => {
    const dados = await carregarLembretes();
    setLembretes(dados);
  }, []);

  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [recarregar]),
  );

  const cancelarLembrete = useCallback(
    async (id: string): Promise<void> => {
      await Notifications.cancelScheduledNotificationAsync(id);
      const novaLista = lembretes.filter((item) => item.id !== id);
      setLembretes(novaLista);
      await salvarLembretes(novaLista);
    },
    [lembretes],
  );

  const adiarLembrete = useCallback(
    async (data: LembreteData, idOriginal: string): Promise<void> => {
      await Notifications.cancelScheduledNotificationAsync(idOriginal);

      const novoId = `${idOriginal}_adiado_${Date.now()}`;
      await Notifications.scheduleNotificationAsync({
        identifier: novoId,
        content: {
          title: `Lembrete (Adiado): ${data.nome}`,
          body: data.descricao,
          data: { ...data, id: novoId },
          categoryIdentifier: 'lembrete',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 600,
        },
      });

      alert(`Lembrete "${data.nome}" adiado por 10 minutos.`);
    },
    [],
  );

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const actionId = response.actionIdentifier;
        const dados = response.notification.request.content
          .data as unknown as LembreteData;

        if (actionId === 'concluir' && dados?.id) {
          cancelarLembrete(dados.id);
        } else if (actionId === 'adiar' && dados?.id) {
          adiarLembrete(dados, dados.id);
        }
      },
    );

    return () => subscription.remove();
  }, [cancelarLembrete, adiarLembrete]);

  return (
    <View style={styles.container}>
      <FlatList
        data={lembretes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReminderCard lembrete={item} onCancelar={cancelarLembrete} />
        )}
        ListEmptyComponent={
          <Text style={styles.listaVazia}>Nenhum lembrete agendado.</Text>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity
        style={styles.botaoFlutuante}
        onPress={() => navigation.navigate('CreateReminder')}
      >
        <Text style={styles.textoBotaoFlutuante}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#F1F5F9' },
  listaVazia: {
    textAlign: 'center',
    marginTop: 50,
    color: '#94A3B8',
    fontSize: 16,
  },
  botaoFlutuante: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#4F46E5',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  textoBotaoFlutuante: { color: '#FFF', fontSize: 30, fontWeight: 'bold' },
});
