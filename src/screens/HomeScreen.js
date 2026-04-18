import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import { db, firebaseConfigurado } from '../config/firebase';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const NOMES_DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function getDataHoje() {
  const hoje = new Date();
  const y = hoje.getFullYear();
  const m = String(hoje.getMonth() + 1).padStart(2, '0');
  const d = String(hoje.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getLabelHoje() {
  const hoje = new Date();
  const dia = NOMES_DIAS[hoje.getDay()];
  return `${dia}, ${hoje.getDate()} de ${MESES[hoje.getMonth()]}`;
}

function getDiaHoje() {
  return DIAS_SEMANA[new Date().getDay()];
}

export default function HomeScreen() {
  const [doses, setDoses] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarDados = async () => {
    if (!firebaseConfigurado) { setLoading(false); return; }
    setLoading(true);
    try {
      const dataHoje = getDataHoje();
      const diaHoje = getDiaHoje();

      const [medSnap, regSnap] = await Promise.all([
        getDocs(collection(db, 'medicamentos')),
        getDocs(query(collection(db, 'registros'), where('data', '==', dataHoje))),
      ]);

      const medicamentos = medSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const registros = regSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const lista = [];
      for (const med of medicamentos) {
        if (med.diasDaSemana?.length > 0 && !med.diasDaSemana.includes(diaHoje)) continue;

        const horariosDoDia = med.horarios?.length > 0 ? med.horarios : [''];
        for (const horario of horariosDoDia) {
          const reg = registros.find(r => r.medicamentoId === med.id && r.horario === horario) || null;
          lista.push({ medicamento: med, horario, registro: reg });
        }
      }

      lista.sort((a, b) => a.horario.localeCompare(b.horario));
      setDoses(lista);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { carregarDados(); }, []));

  const marcarTomado = async (dose) => {
    try {
      if (dose.registro) {
        await updateDoc(doc(db, 'registros', dose.registro.id), { tomado: !dose.registro.tomado });
      } else {
        await addDoc(collection(db, 'registros'), {
          medicamentoId: dose.medicamento.id,
          data: getDataHoje(),
          horario: dose.horario,
          tomado: true,
        });
      }
      carregarDados();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível registrar.');
    }
  };

  const renderDose = ({ item }) => {
    const tomado = item.registro?.tomado === true;
    return (
      <View style={[styles.card, tomado && styles.cardTomado]}>
        <View style={styles.cardInfo}>
          <Text style={styles.nomeMed}>{item.medicamento.nome}</Text>
          <Text style={styles.doseMed}>{item.medicamento.dose}</Text>
          {!!item.horario && <Text style={styles.horarioMed}>🕐 {item.horario}</Text>}
        </View>
        <TouchableOpacity
          style={[styles.btnStatus, tomado ? styles.btnTomado : styles.btnPendente]}
          onPress={() => marcarTomado(item)}
        >
          <Text style={styles.btnStatusText}>{tomado ? '✅ Tomado' : '⏰ Pendente'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Hoje</Text>
        <Text style={styles.headerData}>{getLabelHoje()}</Text>
        {doses.length > 0 && (
          <Text style={styles.headerResumo}>
            {doses.filter(d => d.registro?.tomado).length}/{doses.length} tomados
          </Text>
        )}
      </View>

      <FlatList
        data={doses}
        keyExtractor={(item, i) => `${item.medicamento.id}_${item.horario}_${i}`}
        renderItem={renderDose}
        contentContainerStyle={doses.length === 0 ? { flex: 1 } : { paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={styles.center}>
            {!firebaseConfigurado ? (
              <>
                <Text style={styles.emoji}>⚙️</Text>
                <Text style={styles.emptyTitle}>Firebase não configurado</Text>
              </>
            ) : (
              <>
                <Text style={styles.emoji}>🎉</Text>
                <Text style={styles.emptyTitle}>Nenhum medicamento para hoje</Text>
                <Text style={styles.emptyHint}>Cadastre medicamentos na aba Medicamentos</Text>
              </>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: '#2563EB',
    padding: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerLabel: { fontSize: 13, color: '#BFDBFE', fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  headerData: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 2 },
  headerResumo: { fontSize: 14, color: '#BFDBFE', marginTop: 6 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardTomado: { opacity: 0.65 },
  cardInfo: { flex: 1, marginRight: 12 },
  nomeMed: { fontSize: 17, fontWeight: 'bold', color: '#1E293B' },
  doseMed: { fontSize: 14, color: '#64748B', marginTop: 2 },
  horarioMed: { fontSize: 13, color: '#2563EB', marginTop: 4, fontWeight: '600' },
  btnStatus: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  btnPendente: { backgroundColor: '#FEF9C3' },
  btnTomado: { backgroundColor: '#DCFCE7' },
  btnStatusText: { fontSize: 13, fontWeight: '700' },
  emoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#2563EB', textAlign: 'center' },
  emptyHint: { fontSize: 14, color: '#9CA3AF', marginTop: 8, textAlign: 'center' },
});
