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

// Interfaces
interface Cancha {
  id: number;
  nombre: string;
  descripcion: string;
  capacidad: number;
  imagen: string;
  precioHora: number;
  tipoCanchaId: number; // ID para el filtrado
  tipoCanchaNombre: string; // Nombre para mostrar en la card
  sedeNombre: string;
}

interface TipoCancha {
  id: number;
  nombre: string;
}

export default function DeportesTab() {
  const [tipos, setTipos] = useState<TipoCancha[]>([]);
  const [tipoIdSeleccionado, setTipoIdSeleccionado] = useState<number | null>(null);
  const [todasLasCanchas, setTodasLasCanchas] = useState<Cancha[]>([]);
  const [canchasFiltradas, setCanchasFiltradas] = useState<Cancha[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);

  // 1. Carga inicial de Tipos de Cancha y todas las Canchas
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        // Asumiendo que existe un endpoint /tipos-cancha para el Picker
        // Si no existe, se puede extraer una lista única de todasLasCanchas
        const [resTipos, resCanchas] = await Promise.all([
          apiClient.get<TipoCancha[]>('/tipos-cancha', true), 
          apiClient.get<Cancha[]>('/canchas', true)
        ]);

        setTipos(resTipos);
        setTodasLasCanchas(resCanchas);

        if (resTipos.length > 0) {
          setTipoIdSeleccionado(resTipos[0].id);
        }
      } catch (err) {
        Alert.alert('Error', 'No se pudieron cargar los deportes disponibles');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, []);

  // 2. Lógica de filtrado por Deporte
  useEffect(() => {
    if (tipoIdSeleccionado !== null) {
      setFiltering(true);
      
      const resultado = todasLasCanchas.filter(
        cancha => cancha.tipoCanchaId === tipoIdSeleccionado
      );
      
      setCanchasFiltradas(resultado);
      setFiltering(false);
    }
  }, [tipoIdSeleccionado, todasLasCanchas]);

  const renderCanchaCard = ({ item }: { item: Cancha }) => (
    <View style={styles.card}>
      <Image 
        source={{ uri: item.imagen || 'https://via.placeholder.com/300x150' }} 
        style={styles.imagen} 
      />
      <View style={styles.info}>
        <View style={styles.tagContainer}>
          <Text style={styles.tagDeporte}>{item.tipoCanchaNombre}</Text>
          <Text style={styles.tagSede}>{item.sedeNombre}</Text>
        </View>
        <Text style={styles.nombre}>{item.nombre}</Text>
        <Text style={styles.descripcion} numberOfLines={2}>{item.descripcion}</Text>
        
        <View style={styles.footer}>
          <Text style={styles.capacidad}>👥 Máx. {item.capacidad} pers.</Text>
          <Text style={styles.precio}>${item.precioHora.toLocaleString()}/hr</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF5722" />
        <Text style={styles.loadingText}>Buscando deportes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.pickerWrapper}>
        <Text style={styles.pickerLabel}>Selecciona un deporte para buscar las canchas</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={tipoIdSeleccionado}
            onValueChange={(val) => setTipoIdSeleccionado(val)}
          >
            {tipos.map((tipo) => (
              <Picker.Item key={tipo.id} label={tipo.nombre} value={tipo.id} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.content}>
        {filtering ? (
          <ActivityIndicator color="#FF5722" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={canchasFiltradas}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCanchaCard}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <Text style={styles.empty}>No hay canchas de este deporte disponibles.</Text>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666', fontWeight: '500' },
  pickerWrapper: {
    backgroundColor: '#FFF',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    elevation: 3,
  },
  pickerLabel: { fontSize: 14, fontWeight: '700', color: '#FF5722', marginBottom: 8 },
  pickerContainer: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  content: { flex: 1, padding: 10 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  imagen: { width: '100%', height: 150 },
  info: { padding: 15 },
  tagContainer: { flexDirection: 'row', marginBottom: 8, gap: 8 },
  tagDeporte: { 
    backgroundColor: '#FFF3E0', 
    color: '#FF5722', 
    fontSize: 11, 
    fontWeight: 'bold', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6 
  },
  tagSede: { 
    backgroundColor: '#E3F2FD', 
    color: '#1E88E5', 
    fontSize: 11, 
    fontWeight: 'bold', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6 
  },
  nombre: { fontSize: 18, fontWeight: 'bold', color: '#212121' },
  descripcion: { fontSize: 13, color: '#757575', marginVertical: 6, lineHeight: 18 },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5'
  },
  capacidad: { fontSize: 12, color: '#616161' },
  precio: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },
  empty: { textAlign: 'center', marginTop: 50, color: '#9E9E9E', fontSize: 15 },
});