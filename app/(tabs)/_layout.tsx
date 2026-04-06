import { useAuth } from '@/src/context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  const { logout } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 13,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="(canchas)"
        options={{
          title: 'Canchas',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="sports-soccer" color={color} size={size || 24} />
          ),
        }}
      />
      <Tabs.Screen
        name="(reservas)"
        options={{
          title: 'Reservas',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event-note" color={color} size={size || 24} />
          ),
        }}
      />
      <Tabs.Screen
        name="(miperfil)"
        options={{
          title: 'Mi Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" color={color} size={size || 24} />
          ),
        }}
      />
    </Tabs>
  );
}
