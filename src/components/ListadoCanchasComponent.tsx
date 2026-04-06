import { CanchaDTO } from "@/src/dtos/CanchaDTO";
import { apiClient } from "@/src/services/ApiClient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Interfaces para los nuevos endpoints
interface Sede { id: number; nombre: string; }
interface TipoCancha { id: number; nombre: string; }

export default function ListadoCanchasComponent() {
  const router = useRouter();
  const [canchas, setCanchas] = useState<CanchaDTO[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [deportes, setDeportes] = useState<TipoCancha[]>([]);
  
  const [sedeId, setSedeId] = useState<number | null>(null);
  const [tipoId, setTipoId] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatosMaestros();
  }, []);

  useEffect(() => {
    fetchCanchas();
  }, [sedeId, tipoId]);

  const cargarDatosMaestros = async () => {
    try {
      // Consumimos los endpoints de maestros
      const [resSedes, resTipos] = await Promise.all([
        apiClient.get<Sede[]>("/sedes"),
        apiClient.get<TipoCancha[]>("/tipos-cancha")
      ]);
      setSedes(resSedes);
      setDeportes(resTipos);
    } catch (error) {
      console.error("Error cargando filtros:", error);
    }
  };

  const fetchCanchas = async () => {
    setCargando(true);
    try {
      let url = "/canchas";
      const params = new URLSearchParams();
      if (sedeId) params.append("sedeId", sedeId.toString());
      if (tipoId) params.append("tipoId", tipoId.toString());
      
      const query = params.toString();
      const res = await apiClient.get<CanchaDTO[]>(query ? `${url}?${query}` : url);
      setCanchas(res);
    } catch (error) {
      Alert.alert("Error", "No se pudieron obtener las canchas.");
    } finally {
      setCargando(false);
    }
  };

  const renderFiltro = <T extends { id: number; nombre: string }>(
    titulo: string, 
    datos: T[], 
    seleccionado: number | null, 
    onSelect: (id: number | null) => void
  ) => (
    <View style={styles.seccionFiltro}>
      <Text style={styles.subtitulo}>{titulo}:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity 
          style={[styles.chip, seleccionado === null && styles.chipActivo]}
          onPress={() => onSelect(null)}
        >
          <Text style={[styles.chipTexto, seleccionado === null && styles.chipTextoActivo]}>Todos</Text>
        </TouchableOpacity>
        {datos.map(item => (
          <TouchableOpacity 
            key={item.id}
            style={[styles.chip, seleccionado === item.id && styles.chipActivo]}
            onPress={() => onSelect(item.id)}
          >
            <Text style={[styles.chipTexto, seleccionado === item.id && styles.chipTextoActivo]}>{item.nombre}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Reserva tu Cancha</Text>
      
      {renderFiltro("Sedes", sedes, sedeId, setSedeId)}
      {renderFiltro("Deportes", deportes, tipoId, setTipoId)}

      {cargando ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <FlatList
          data={canchas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => {
                console.log("Navegando a cancha:", item.id);
                router.push(`/(tabs)/(canchas)/${item.id}`);
              }}
            >
              <Text style={styles.cardTitulo}>{item.nombre}</Text>
              <Text style={styles.cardDetalle}>{item.tipoCanchaNombre} • {item.sedeNombre}</Text>
              <Text style={styles.cardPrecio}>${item.precioHora}/hr</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay canchas disponibles.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f5f5f5'},
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  seccionFiltro: { marginBottom: 10 },
  subtitulo: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 5 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, backgroundColor: '#ddd', marginRight: 8 },
  chipActivo: { backgroundColor: '#007BFF' },
  chipTexto: { fontSize: 13, color: '#333' },
  chipTextoActivo: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 3 },
  cardTitulo: { fontSize: 18, fontWeight: 'bold' },
  cardDetalle: { color: '#666' },
  cardPrecio: { color: '#28a745', fontWeight: 'bold', marginTop: 5 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#999' }
});