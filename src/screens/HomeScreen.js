import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Fase 3 — será implementado na semana 3 (01–07/mai)
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💊</Text>
      <Text style={styles.title}>Medicamentos de Hoje</Text>
      <Text style={styles.subtitle}>Em desenvolvimento — Fase 3</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F4FF' },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2563EB' },
  subtitle: { fontSize: 15, color: '#9CA3AF', marginTop: 8 },
});
