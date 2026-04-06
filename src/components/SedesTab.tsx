import { apiClient } from '@/src/services/ApiClient';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

interface Sede {
  id: number;
  nombre: string;
  direccion: string;
  telefono: number;
  // Agrega otros campos según tu API
}

export default function SedesTab() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSedes = async () => {
      try {
        const response = await apiClient.get<Sede[]>('/sedes', false);
        setSedes(response);
      } catch (err) {
        setError('Error al cargar las sedes');
        console.error('Error fetching sedes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSedes();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Cargando sedes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sedes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.sedeCard}>
            <View style={styles.cardContent}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text style={styles.direccion}>{item.direccion}</Text>
              {item.telefono && (
                <Text style={styles.telefono}>Tel: {item.telefono}</Text>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>No hay sedes disponibles</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
  sedeCard: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 20,
  },
  nombre: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  direccion: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  telefono: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});
