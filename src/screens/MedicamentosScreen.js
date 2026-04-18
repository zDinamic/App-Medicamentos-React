import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db, firebaseConfigurado } from '../config/firebase';

export default function MedicamentosScreen({ navigation }) {
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  const buscarMedicamentos = async () => {
    if (!firebaseConfigurado) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const q = query(collection(db, 'medicamentos'), orderBy('criadoEm', 'desc'));
      const snapshot = await getDocs(q);
      setMedicamentos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar os medicamentos.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { buscarMedicamentos(); }, []));

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Detalhes', { medicamento: item })}
    >
      <Text style={styles.nome}>{item.nome}</Text>
      <Text style={styles.dose}>{item.dose}</Text>
      {item.horarios?.length > 0 && (
        <Text style={styles.horarios}>🕐 {item.horarios.join('  •  ')}</Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={medicamentos}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={medicamentos.length === 0 ? { flex: 1 } : { paddingBottom: 90 }}
        ListEmptyComponent={
          <View style={styles.center}>
            {!firebaseConfigurado ? (
              <>
                <Text style={styles.emoji}>⚙️</Text>
                <Text style={styles.emptyTitle}>Firebase não configurado</Text>
                <Text style={styles.emptyHint}>Configure as credenciais em{'\n'}src/config/firebase.js</Text>
              </>
            ) : (
              <>
                <Text style={styles.emoji}>💊</Text>
                <Text style={styles.emptyTitle}>Nenhum medicamento cadastrado</Text>
                <Text style={styles.emptyHint}>Toque em + para adicionar</Text>
              </>
            )}
          </View>
        }
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Formulario')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nome: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  dose: { fontSize: 15, color: '#64748B', marginTop: 4 },
  horarios: { fontSize: 13, color: '#2563EB', marginTop: 6 },
  emoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#2563EB' },
  emptyHint: { fontSize: 14, color: '#9CA3AF', marginTop: 8 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  fabText: { fontSize: 32, color: '#fff', lineHeight: 38 },
});
