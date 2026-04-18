import React, { useState, useCallback } from 'react';
import {
  View, Text, SectionList, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, firebaseConfigurado } from '../config/firebase';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function getUltimos7Dias() {
  const dias = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dias.push(`${y}-${m}-${day}`);
  }
  return dias;
}

function formatarData(dataStr) {
  const hoje = new Date();
  const fmt = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  if (dataStr === fmt(hoje)) return 'Hoje';

  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);
  if (dataStr === fmt(ontem)) return 'Ontem';

  const [y, m, d] = dataStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${DIAS_SEMANA[date.getDay()]}, ${d} de ${MESES[m - 1]}`;
}

export default function HistoricoScreen() {
  const [secoes, setSecoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarHistorico = async () => {
    if (!firebaseConfigurado) { setLoading(false); return; }
    setLoading(true);
    try {
      const dias = getUltimos7Dias();
      const dataInicio = dias[0];

      const [regSnap, medSnap] = await Promise.all([
        getDocs(query(collection(db, 'registros'), where('data', '>=', dataInicio))),
        getDocs(collection(db, 'medicamentos')),
      ]);

      const medMap = {};
      medSnap.docs.forEach(d => { medMap[d.id] = d.data(); });

      const registros = regSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const agrupado = {};
      dias.forEach(dia => { agrupado[dia] = []; });
      registros.forEach(reg => {
        if (agrupado[reg.data] !== undefined) {
          agrupado[reg.data].push(reg);
        }
      });

      const resultado = dias
        .filter(dia => agrupado[dia].length > 0)
        .reverse()
        .map(dia => ({
          title: dia,
          data: agrupado[dia].sort((a, b) => a.horario.localeCompare(b.horario)),
          medMap,
        }));

      setSecoes(resultado);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar o histórico.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { carregarHistorico(); }, []));

  const renderItem = ({ item, section }) => {
    const med = section.medMap[item.medicamentoId];
    const nomeMed = med?.nome ?? 'Medicamento removido';
    const doseMed = med?.dose ?? '';
    return (
      <View style={styles.item}>
        <View style={styles.itemIcone}>
          <Text style={styles.icone}>{item.tomado ? '✅' : '❌'}</Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemNome}>{nomeMed}</Text>
          {!!doseMed && <Text style={styles.itemDose}>{doseMed}</Text>}
          {!!item.horario && <Text style={styles.itemHorario}>🕐 {item.horario}</Text>}
        </View>
        <View style={[styles.badge, item.tomado ? styles.badgeTomado : styles.badgePendente]}>
          <Text style={[styles.badgeText, item.tomado ? styles.badgeTextTomado : styles.badgeTextPendente]}>
            {item.tomado ? 'Tomado' : 'Não tomado'}
          </Text>
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section }) => {
    const tomados = section.data.filter(r => r.tomado).length;
    const total = section.data.length;
    return (
      <View style={styles.secaoHeader}>
        <Text style={styles.secaoTitulo}>{formatarData(section.title)}</Text>
        <Text style={styles.secaoResumo}>{tomados}/{total} tomados</Text>
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
      <SectionList
        sections={secoes}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={secoes.length === 0 ? { flex: 1 } : { paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emoji}>📅</Text>
            <Text style={styles.emptyTitle}>Nenhum registro nos últimos 7 dias</Text>
            <Text style={styles.emptyHint}>Use a aba Hoje para marcar os medicamentos</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  secaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E0EAFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 8,
  },
  secaoTitulo: { fontSize: 15, fontWeight: '700', color: '#2563EB' },
  secaoResumo: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  item: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemIcone: { marginRight: 12 },
  icone: { fontSize: 22 },
  itemInfo: { flex: 1 },
  itemNome: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  itemDose: { fontSize: 13, color: '#64748B', marginTop: 1 },
  itemHorario: { fontSize: 13, color: '#2563EB', marginTop: 2 },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeTomado: { backgroundColor: '#DCFCE7' },
  badgePendente: { backgroundColor: '#FEE2E2' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  badgeTextTomado: { color: '#16A34A' },
  badgeTextPendente: { color: '#DC2626' },
  emoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#2563EB', textAlign: 'center' },
  emptyHint: { fontSize: 14, color: '#9CA3AF', marginTop: 8, textAlign: 'center' },
});
