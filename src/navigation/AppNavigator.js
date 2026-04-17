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

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MedicamentosStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#2563EB' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="Lista"
        component={MedicamentosScreen}
        options={{ title: 'Medicamentos' }}
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
          tabBarActiveTintColor: '#2563EB',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: { paddingBottom: 4, height: 60 },
          tabBarLabelStyle: { fontSize: 13, fontWeight: '600' },
          headerStyle: { backgroundColor: '#2563EB' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Hoje',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>💊</Text>,
          }}
        />
        <Tab.Screen
          name="Medicamentos"
          component={MedicamentosStack}
          options={{
            title: 'Medicamentos',
            headerShown: false,
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📋</Text>,
          }}
        />
        <Tab.Screen
          name="Historico"
          component={HistoricoScreen}
          options={{
            title: 'Histórico',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📅</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
