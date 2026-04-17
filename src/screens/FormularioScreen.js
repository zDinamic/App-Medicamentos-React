import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Fase 2 — será implementado na semana 2 (24–30/abr)
export default function FormularioScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>✏️</Text>
      <Text style={styles.title}>Adicionar Medicamento</Text>
      <Text style={styles.subtitle}>Em desenvolvimento — Fase 2</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F4FF' },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2563EB' },
  subtitle: { fontSize: 15, color: '#9CA3AF', marginTop: 8 },
});
