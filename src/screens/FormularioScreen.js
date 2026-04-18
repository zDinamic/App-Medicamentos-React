import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function formatarHora(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export default function FormularioScreen({ navigation, route }) {
  const editando = route.params?.medicamento;

  const [nome, setNome] = useState('');
  const [dose, setDose] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [horarios, setHorarios] = useState([]);
  const [diasSelecionados, setDiasSelecionados] = useState([]);
  const [salvando, setSalvando] = useState(false);

  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [horarioSelecionado, setHorarioSelecionado] = useState(new Date());

  useEffect(() => {
    if (editando) {
      setNome(editando.nome || '');
      setDose(editando.dose || '');
      setObservacoes(editando.observacoes || '');
      setHorarios(editando.horarios || []);
      setDiasSelecionados(editando.diasDaSemana || []);
    }
    navigation.setOptions({ title: editando ? 'Editar Medicamento' : 'Novo Medicamento' });
  }, []);

  const onChangePicker = (event, date) => {
    if (Platform.OS === 'android') setMostrarPicker(false);
    if (event.type === 'dismissed') return;
    if (date) setHorarioSelecionado(date);
  };

  const adicionarHorario = () => {
    const h = formatarHora(horarioSelecionado);
    if (horarios.includes(h)) {
      Alert.alert('Já adicionado', 'Esse horário já está na lista.');
      return;
    }
    setHorarios([...horarios, h].sort());
    setMostrarPicker(false);
  };

  const toggleDia = (dia) =>
    setDiasSelecionados(prev =>
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
    );

  const salvar = async () => {
    if (!nome.trim()) { Alert.alert('Campo obrigatório', 'Informe o nome do medicamento.'); return; }
    if (!dose.trim()) { Alert.alert('Campo obrigatório', 'Informe a dose.'); return; }

    setSalvando(true);
    try {
      const dados = {
        nome: nome.trim(),
        dose: dose.trim(),
        horarios,
        diasDaSemana: diasSelecionados,
        observacoes: observacoes.trim(),
      };

      if (editando) {
        await updateDoc(doc(db, 'medicamentos', editando.id), dados);
        Alert.alert('Salvo!', 'Medicamento atualizado.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        await addDoc(collection(db, 'medicamentos'), { ...dados, criadoEm: serverTimestamp() });
        Alert.alert('Cadastrado!', 'Medicamento adicionado.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar.\nVerifique a configuração do Firebase.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

      <Text style={styles.label}>Nome do Medicamento *</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Ex: Losartana"
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.label}>Dose *</Text>
      <TextInput
        style={styles.input}
        value={dose}
        onChangeText={setDose}
        placeholder="Ex: 50mg"
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.label}>Horários</Text>

      <TouchableOpacity style={styles.btnHorario} onPress={() => setMostrarPicker(true)}>
        <Text style={styles.btnHorarioText}>🕐  Selecionar horário</Text>
      </TouchableOpacity>

      {mostrarPicker && (
        <View>
          <DateTimePicker
            value={horarioSelecionado}
            mode="time"
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangePicker}
          />
          {Platform.OS === 'ios' && (
            <View style={styles.iosPickerBtns}>
              <TouchableOpacity onPress={() => setMostrarPicker(false)} style={styles.btnCancelar}>
                <Text style={styles.btnCancelarText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={adicionarHorario} style={styles.btnConfirmar}>
                <Text style={styles.btnConfirmarText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {!mostrarPicker && Platform.OS === 'android' && (
        <TouchableOpacity style={styles.btnAddHorario} onPress={adicionarHorario}>
          <Text style={styles.btnAddHorarioText}>+ Adicionar {formatarHora(horarioSelecionado)}</Text>
        </TouchableOpacity>
      )}

      {horarios.length > 0 && (
        <View style={styles.tagsRow}>
          {horarios.map(h => (
            <TouchableOpacity key={h} style={styles.tag} onPress={() => setHorarios(horarios.filter(x => x !== h))}>
              <Text style={styles.tagText}>{h}  ✕</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.label}>Dias da Semana</Text>
      <View style={styles.diasRow}>
        {DIAS.map(dia => (
          <TouchableOpacity
            key={dia}
            style={[styles.diaBtn, diasSelecionados.includes(dia) && styles.diaBtnAtivo]}
            onPress={() => toggleDia(dia)}
          >
            <Text style={[styles.diaBtnText, diasSelecionados.includes(dia) && styles.diaBtnTextAtivo]}>
              {dia}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Observações</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={observacoes}
        onChangeText={setObservacoes}
        placeholder="Ex: Tomar com água, em jejum..."
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={3}
      />

      <TouchableOpacity
        style={[styles.btnSalvar, salvando && { opacity: 0.7 }]}
        onPress={salvar}
        disabled={salvando}
      >
        {salvando
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnSalvarText}>{editando ? 'Salvar Alterações' : 'Cadastrar Medicamento'}</Text>
        }
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF', padding: 16 },
  label: { fontSize: 15, fontWeight: '600', color: '#1E293B', marginTop: 20, marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  btnHorario: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2563EB',
    alignItems: 'center',
  },
  btnHorarioText: { fontSize: 16, color: '#2563EB', fontWeight: '600' },
  btnAddHorario: {
    backgroundColor: '#DBEAFE',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  btnAddHorarioText: { fontSize: 15, color: '#2563EB', fontWeight: '600' },
  iosPickerBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  btnCancelar: { padding: 12 },
  btnCancelarText: { fontSize: 16, color: '#64748B' },
  btnConfirmar: { backgroundColor: '#2563EB', borderRadius: 10, padding: 12, paddingHorizontal: 20 },
  btnConfirmarText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  tag: { backgroundColor: '#DBEAFE', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  tagText: { fontSize: 14, color: '#2563EB', fontWeight: '600' },
  diasRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  diaBtn: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#fff',
  },
  diaBtnAtivo: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  diaBtnText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  diaBtnTextAtivo: { color: '#fff' },
  btnSalvar: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 48,
  },
  btnSalvarText: { fontSize: 17, fontWeight: 'bold', color: '#fff' },
});
