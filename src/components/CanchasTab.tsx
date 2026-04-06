import { apiClient } from '@/src/services/ApiClient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CanchaDTO } from '../dtos/CanchaDTO';

const ImagenConFallback = ({ source, style }: { source: any; style: any }) => {
  const [hasError, setHasError] = useState(false);

  return hasError ? (
    <View style={[style, styles.placeholderContainer]}>
      <Text style={styles.placeholderText}>Sin imagen</Text>
    </View>
  ) : (
    <Image
      source={source}
      style={style}
      onError={() => setHasError(true)}
    />
  );
};

export default function CanchasTab() {
  const router = useRouter();
  const [canchas, setCanchas] = useState<CanchaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCanchas = async () => {
      try {
        const response = await apiClient.get<CanchaDTO[]>('/canchas', false);
        setCanchas(response);
      } catch (err) {
        setError('Error al cargar las canchas');
        console.error('Error fetching canchas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCanchas();
  }, []);

  const handleCanchaPress = (cancha: CanchaDTO) => {
    console.log("Navegando a cancha:", cancha.id);
    router.push(`/(tabs)/(canchas)/${cancha.id}`);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Cargando canchas...</Text>
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
        data={canchas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.canchaCard}
            onPress={() => handleCanchaPress(item)}
          >
            <ImagenConFallback source={{ uri: item.imagen }} style={styles.imagen} />
            <View style={styles.cardContent}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text style={styles.descripcion}>{item.descripcion}</Text>
              <Text style={styles.detalle}>Capacidad: {item.capacidad} personas</Text>
              <Text style={styles.detalle}>Tipo: {item.tipoCanchaNombre}</Text>
              <Text style={styles.detalle}>Sede: {item.sedeNombre}</Text>
              <Text style={styles.precio}>${item.precioHora}/hora</Text>
              <Text style={[styles.estado, item.activa ? styles.activa : styles.inactiva]}>
                {item.activa ? 'Disponible' : 'No disponible'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>No hay canchas disponibles</Text>
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
  canchaCard: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imagen: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  placeholderContainer: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
  },
  cardContent: {
    padding: 15,
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  descripcion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  detalle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  precio: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 5,
  },
  estado: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  activa: {
    color: 'green',
  },
  inactiva: {
    color: 'red',
  },
});
