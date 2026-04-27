import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function StatusBadge({ tomado }) {
  return (
    <View style={[styles.badge, tomado ? styles.tomado : styles.pendente]}>
      <Text style={[styles.texto, tomado ? styles.textoTomado : styles.textoPendente]}>
        {tomado ? 'Tomado' : 'Pendente'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  tomado: { backgroundColor: colors.successSoft },
  pendente: { backgroundColor: colors.warningSoft },
  texto: { fontSize: 13, fontWeight: '900' },
  textoTomado: { color: colors.success },
  textoPendente: { color: colors.warning },
});
