import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Componente reutilizável — será usado nas Fases 3 e 4
export default function StatusBadge({ tomado }) {
  return (
    <View style={[styles.badge, tomado ? styles.tomado : styles.pendente]}>
      <Text style={styles.texto}>{tomado ? '✅ Tomado' : '⏰ Pendente'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  tomado: { backgroundColor: '#DCFCE7' },
  pendente: { backgroundColor: '#FEF9C3' },
  texto: { fontSize: 14, fontWeight: '600' },
});
