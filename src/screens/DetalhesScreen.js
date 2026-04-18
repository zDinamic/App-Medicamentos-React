import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert,
} from 'react-native';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function DetalhesScreen({ navigation, route }) {
  const { medicamento } = route.params;

  const excluir = () => {
    Alert.alert(
      'Excluir Medicamento',
      `Tem certeza que deseja excluir "${medicamento.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'medicamentos', medicamento.id));
              navigation.goBack();
            } catch (e) {
              Alert.alert('Erro', 'Não foi possível excluir o medicamento.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.nome}>{medicamento.nome}</Text>
        <Text style={styles.dose}>{medicamento.dose}</Text>

        {medicamento.horarios?.length > 0 && (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Horários</Text>
            <View style={styles.tagsRow}>
              {medicamento.horarios.map(h => (
                <View key={h} style={styles.tag}>
                  <Text style={styles.tagText}>🕐 {h}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {medicamento.diasDaSemana?.length > 0 && (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Dias da Semana</Text>
            <View style={styles.tagsRow}>
              {medicamento.diasDaSemana.map(d => (
                <View key={d} style={styles.tag}>
                  <Text style={styles.tagText}>{d}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {!!medicamento.observacoes && (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Observações</Text>
            <Text style={styles.observacoes}>{medicamento.observacoes}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.btnEditar}
        onPress={() => navigation.navigate('Formulario', { medicamento })}
      >
        <Text style={styles.btnEditarText}>✏️  Editar Medicamento</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnExcluir} onPress={excluir}>
        <Text style={styles.btnExcluirText}>🗑️  Excluir Medicamento</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nome: { fontSize: 26, fontWeight: 'bold', color: '#1E293B' },
  dose: { fontSize: 20, color: '#2563EB', marginTop: 6, fontWeight: '600' },
  secao: { marginTop: 20 },
  secaoTitulo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#DBEAFE', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  tagText: { fontSize: 14, color: '#2563EB', fontWeight: '600' },
  observacoes: { fontSize: 15, color: '#475569', lineHeight: 22 },
  btnEditar: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  btnEditarText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  btnExcluir: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 40,
  },
  btnExcluirText: { fontSize: 16, fontWeight: 'bold', color: '#DC2626' },
});
