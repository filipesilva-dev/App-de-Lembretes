import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { v4 as uuidv4 } from 'uuid';
import {
  carregarLembretes,
  salvarLembretes,
} from '../storage/reminderStorage';
import type { CreateReminderScreenProps } from '../navigation/types';
import type { Recorrencia } from '../types';

export default function CreateReminderScreen({
  navigation,
}: CreateReminderScreenProps): JSX.Element {
  const [nome, setNome] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [horario, setHorario] = useState<Date>(new Date());
  const [mostrarPicker, setMostrarPicker] = useState<boolean>(false);
  const [recorrencia, setRecorrencia] = useState<Recorrencia>('Única');

  const agendarLembrete = async (): Promise<void> => {
    if (!nome.trim() || !descricao.trim()) {
      alert('Preencha todos os campos!');
      return;
    }

    const id = uuidv4();

    const gatilho = new Date();
    gatilho.setHours(horario.getHours());
    gatilho.setMinutes(horario.getMinutes());
    gatilho.setSeconds(0);
    if (gatilho <= new Date()) {
      gatilho.setDate(gatilho.getDate() + 1);
    }

    try {
      await Notifications.scheduleNotificationAsync({
        identifier: id,
        content: {
          title: `Lembrete: ${nome}`,
          body: descricao,
          data: { id, nome, descricao, recorrencia },
          categoryIdentifier: 'lembrete',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: gatilho,
        },
      });

      const atuais = await carregarLembretes();
      await salvarLembretes([
        ...atuais,
        {
          id,
          nome,
          descricao,
          horario: gatilho.toISOString(),
          recorrencia,
        },
      ]);

      navigation.goBack();
    } catch (error) {
      console.error(error);
      alert('Erro ao agendar o lembrete.');
    }
  };

  const onChangeTime = (
    event: DateTimePickerEvent,
    selected?: Date,
  ): void => {
    setMostrarPicker(Platform.OS === 'ios');
    if (selected) setHorario(selected);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Ex: Beber água"
        placeholderTextColor="#94A3B8"
      />

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={styles.input}
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Ex: Um copo de 300ml"
        placeholderTextColor="#94A3B8"
      />

      <Text style={styles.label}>Horário</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setMostrarPicker(true)}
      >
        <Text>
          {horario.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </TouchableOpacity>

      {mostrarPicker && (
        <DateTimePicker
          value={horario}
          mode="time"
          is24Hour
          display="default"
          onChange={onChangeTime}
        />
      )}

      <Text style={styles.label}>Repetição</Text>
      <View style={styles.recorrenciaContainer}>
        <TouchableOpacity
          style={[
            styles.recorrenciaBtn,
            recorrencia === 'Única' && styles.ativo,
          ]}
          onPress={() => setRecorrencia('Única')}
        >
          <Text
            style={
              recorrencia === 'Única' ? styles.textoAtivo : styles.textoInativo
            }
          >
            Única
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.recorrenciaBtn,
            recorrencia === 'Diária' && styles.ativo,
          ]}
          onPress={() => setRecorrencia('Diária')}
        >
          <Text
            style={
              recorrencia === 'Diária' ? styles.textoAtivo : styles.textoInativo
            }
          >
            Diária
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.botaoSalvar} onPress={agendarLembrete}>
        <Text style={styles.textoBotao}>Agendar Lembrete</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F1F5F9' },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    color: '#334155',
  },
  input: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 16,
  },
  recorrenciaContainer: { flexDirection: 'row', gap: 10 },
  recorrenciaBtn: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  ativo: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  textoAtivo: { color: '#FFF', fontWeight: 'bold' },
  textoInativo: { color: '#333' },
  botaoSalvar: {
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
    alignItems: 'center',
  },
  textoBotao: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});
