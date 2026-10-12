import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { Lembrete } from '../types';

interface ReminderCardProps {
  lembrete: Lembrete;
  onCancelar: (id: string) => void;
}

export default function ReminderCard({
  lembrete,
  onCancelar,
}: ReminderCardProps): JSX.Element {
  const horaFormatada = new Date(lembrete.horario).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.titulo}>{lembrete.nome}</Text>
        <Text style={styles.descricao}>{lembrete.descricao}</Text>
        <Text style={styles.detalhes}>
          {lembrete.recorrencia} • {horaFormatada}
        </Text>
      </View>

      <Pressable
        style={styles.botaoCancelar}
        onPress={() => onCancelar(lembrete.id)}
      >
        <Text style={styles.textoCancelar}>X</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    alignItems: 'center',
  },
  content: { flex: 1 },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  descricao: { fontSize: 14, color: '#64748B', marginTop: 2 },
  detalhes: { fontSize: 12, color: '#94A3B8', marginTop: 5 },
  botaoCancelar: {
    backgroundColor: '#EF4444',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoCancelar: { color: '#FFF', fontWeight: 'bold' },
});
