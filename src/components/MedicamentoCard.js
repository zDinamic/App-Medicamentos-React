import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Componente reutilizável — será preenchido nas Fases 2 e 3
export default function MedicamentoCard({ nome, dose }) {
  return (
    <View style={styles.card}>
      <Text style={styles.nome}>{nome}</Text>
      <Text style={styles.dose}>{dose}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nome: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  dose: { fontSize: 15, color: '#64748B', marginTop: 4 },
});
