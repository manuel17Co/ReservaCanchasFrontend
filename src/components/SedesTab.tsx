import React, { useEffect, useState } from 'react';
import { 
  FlatList, 
  StyleSheet, 
  Text, 
  View, 
  ActivityIndicator, 
  Image, 
  Alert 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { apiClient } from '@/src/services/ApiClient';

interface Cancha {
  id: number;
  nombre: string;
  descripcion: string;
  capacidad: number;
  imagen: string;
  precioHora: number;
  tipoCanchaNombre: string;
  sedeId: number; // Campo clave para el filtrado
}

interface Sede {
  id: number;
  nombre: string;
}

export default function SedesTab() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [sedeIdSeleccionada, setSedeIdSeleccionada] = useState<number | null>(null);
  const [todasLasCanchas, setTodasLasCanchas] = useState<Cancha[]>([]);
  const [canchasFiltradas, setCanchasFiltradas] = useState<Cancha[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingCanchas, setLoadingCanchas] = useState(false);

  // 1. Carga inicial: Sedes y todas las Canchas
  useEffect(() => {
    const inicializarDatos = async () => {
      try {
        const [resSedes, resCanchas] = await Promise.all([
          apiClient.get<Sede[]>('/sedes', true),
          apiClient.get<Cancha[]>('/canchas', true)
        ]);

        setSedes(resSedes);
        setTodasLasCanchas(resCanchas);

        if (resSedes.length > 0) {
          setSedeIdSeleccionada(resSedes[0].id);
        }
      } catch (err) {
        Alert.alert('Error', 'No se pudo sincronizar la información del servidor');
      } finally {
        setLoading(false);
      }
    };
    inicializarDatos();
  }, []);

  // 2. Filtrado lógico: Cada vez que cambie la sede seleccionada o la lista de canchas
  useEffect(() => {
    if (sedeIdSeleccionada !== null) {
      setLoadingCanchas(true);
      
      // Filtramos en el cliente para mayor rapidez de respuesta
      const filtradas = todasLasCanchas.filter(
        cancha => cancha.sedeId === sedeIdSeleccionada
      );
      
      setCanchasFiltradas(filtradas);
      setLoadingCanchas(false);
    }
  }, [sedeIdSeleccionada, todasLasCanchas]);

  const renderCanchaCard = ({ item }: { item: Cancha }) => (
    <View style={styles.canchaCard}>
      <Image 
        source={{ uri: item.imagen || 'https://via.placeholder.com/150' }} 
        style={styles.canchaImagen} 
      />
      <View style={styles.canchaInfo}>
        <Text style={styles.canchaNombre}>{item.nombre}</Text>
        <Text style={styles.canchaTipo}>{item.tipoCanchaNombre}</Text>
        <Text style={styles.canchaDesc} numberOfLines={2}>{item.descripcion}</Text>
        <View style={styles.canchaFooter}>
          <Text style={styles.canchaCapacidad}>👥 Capacidad: {item.capacidad}</Text>
          <Text style={styles.canchaPrecio}>${item.precioHora.toLocaleString()}/hr</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Sincronizando datos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.pickerWrapper}>
        <Text style={styles.pickerLabel}>📍 Sede seleccionada:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={sedeIdSeleccionada}
            onValueChange={(itemValue) => setSedeIdSeleccionada(itemValue)}
          >
            {sedes.map((sede) => (
              <Picker.Item key={sede.id} label={sede.nombre} value={sede.id} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Canchas disponibles</Text>
        
        {loadingCanchas ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <FlatList
            data={canchasFiltradas}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCanchaCard}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Esta sede no tiene canchas registradas aún.</Text>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' },
  pickerWrapper: {
    backgroundColor: '#FFF',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  pickerLabel: { fontSize: 13, fontWeight: '700', color: '#007AFF', marginBottom: 5, textTransform: 'uppercase' },
  pickerContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    overflow: 'hidden',
  },
  content: { flex: 1, padding: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: '#1F2937' },
  canchaCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  canchaImagen: { width: '100%', height: 160 },
  canchaInfo: { padding: 15 },
  canchaNombre: { fontSize: 19, fontWeight: 'bold', color: '#111827' },
  canchaTipo: { fontSize: 12, color: '#3B82F6', fontWeight: 'bold', marginBottom: 4 },
  canchaDesc: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  canchaFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  canchaCapacidad: { fontSize: 13, color: '#374151' },
  canchaPrecio: { fontSize: 16, fontWeight: 'bold', color: '#10B981' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#9CA3AF', fontSize: 16 }
});