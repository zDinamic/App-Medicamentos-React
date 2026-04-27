import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, shadows } from '../theme';

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
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    marginVertical: 7,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  nome: { fontSize: 18, fontWeight: '900', color: colors.text },
  dose: { fontSize: 14, color: colors.muted, marginTop: 4, fontWeight: '600' },
});
