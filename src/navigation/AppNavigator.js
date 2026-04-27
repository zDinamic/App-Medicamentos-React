import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import MedicamentosScreen from '../screens/MedicamentosScreen';
import DetalhesScreen from '../screens/DetalhesScreen';
import FormularioScreen from '../screens/FormularioScreen';
import HistoricoScreen from '../screens/HistoricoScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MedicamentosStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#17172B' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '800' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Lista"
        component={MedicamentosScreen}
        options={{ title: 'Remédios' }}
      />
      <Stack.Screen
        name="Detalhes"
        component={DetalhesScreen}
        options={{ title: 'Detalhes' }}
      />
      <Stack.Screen
        name="Formulario"
        component={FormularioScreen}
        options={{ title: 'Medicamento' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#17172B',
          tabBarInactiveTintColor: '#B4B8C6',
          tabBarStyle: {
            paddingTop: 7,
            paddingBottom: 7,
            height: 68,
            borderTopColor: '#ECEEF3',
            backgroundColor: colors.surface,
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '800' },
          headerStyle: { backgroundColor: '#17172B' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '800', fontSize: 18 },
          headerShadowVisible: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Hoje',
            headerShown: false,
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>●</Text>,
          }}
        />
        <Tab.Screen
          name="Medicamentos"
          component={MedicamentosStack}
          options={{
            title: 'Remédios',
            headerShown: false,
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>◆</Text>,
          }}
        />
        <Tab.Screen
          name="Historico"
          component={HistoricoScreen}
          options={{
            title: 'Histórico',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>■</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
