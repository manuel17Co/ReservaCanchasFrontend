import { CanchaDTO } from "@/src/dtos/CanchaDTO";
import { apiClient } from "@/src/services/ApiClient";
import { asyncStorageService } from "@/src/services/AsyncStorageService";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface Horario { id: number; horaInicio: string; horaFin: string; disponible: boolean; }

export default function DetalleCanchaComponent() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [cancha, setCancha] = useState<CanchaDTO | null>(null);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState<Horario | null>(null);
  const [notaPrivada, setNotaPrivada] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [cargando, setCargando] = useState(true);

  const FECHA_CONSULTA = "2026-04-04"; // Podrías usar un DatePicker aquí
  const STORAGE_KEY = `nota_cancha_${id}`;

  useEffect(() => {
    if (id) {
      inicializarDatos();
    }
  }, [id]);

  const inicializarDatos = async () => {
    setCargando(true);
    await Promise.all([cargarDetalle(), cargarHorarios(), cargarNotaLocal()]);
    setCargando(false);
  };

  const cargarDetalle = async () => {
    try {
      const res = await apiClient.get<CanchaDTO>(`/canchas/${id}`);
      setCancha(res);
    } catch (e) { console.error(e); }
  };

  const cargarHorarios = async () => {
    try {
      // Endpoint: /horarios/disponibles?canchaId=1&fecha=2026-04-04
      const res = await apiClient.get<Horario[]>(`/horarios/disponibles?canchaId=${id}&fecha=${FECHA_CONSULTA}`);
      setHorarios(res);
    } catch (e) { console.error(e); }
  };

  const cargarNotaLocal = async () => {
    const nota = await asyncStorageService.get<string>(STORAGE_KEY);
    if (nota) setNotaPrivada(nota);
  };

  const guardarNota = async () => {
    await asyncStorageService.set(STORAGE_KEY, notaPrivada);
    Alert.alert("Éxito", "Nota guardada localmente.");
  };

  const ejecutarReserva = async () => {
    if (!horarioSeleccionado) return;
    try {
      // Endpoint: /horarios/2 (asumiendo que un PUT o POST confirma la reserva del slot)
      await apiClient.post(`/horarios/${horarioSeleccionado.id}`, {}); 
      setModalVisible(false);
      Alert.alert("¡Reservado!", "Tu espacio ha sido asegurado.");
      router.replace("/(tabs)/(misReservas)"); // Redirigir a ver reservas
    } catch (error) {
      Alert.alert("Error", "No se pudo realizar la reserva.");
    }
  };

  if (cargando) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{cancha?.nombre}</Text>
      <Text style={styles.info}>{cancha?.tipoCanchaNombre} - {cancha?.sedeNombre}</Text>

      <View style={styles.divisor} />

      <Text style={styles.subtitulo}>Horarios disponibles para {FECHA_CONSULTA}:</Text>
      <View style={styles.listaHorarios}>
        {horarios.map(h => (
          <TouchableOpacity 
            key={h.id} 
            style={[styles.btnHorario, horarioSeleccionado?.id === h.id && styles.btnHorarioActivo]}
            onPress={() => setHorarioSeleccionado(h)}
          >
            <Text style={horarioSeleccionado?.id === h.id ? {color: '#fff'} : {}}>{h.horaInicio} - {h.horaFin}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={[styles.botonReserva, !horarioSeleccionado && {backgroundColor: '#ccc'}]} 
        disabled={!horarioSeleccionado}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.textoBoton}>Reservar ahora</Text>
      </TouchableOpacity>

      <View style={styles.divisor} />

      <Text style={styles.subtitulo}>Mis notas personales:</Text>
      <TextInput
        style={styles.textArea}
        multiline
        value={notaPrivada}
        onChangeText={setNotaPrivada}
        placeholder="Escribe algo sobre esta cancha..."
      />
      <TouchableOpacity style={styles.botonGuardar} onPress={guardarNota}>
        <Text>Guardar Nota</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalCentrado}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Confirmar Reserva</Text>
            <Text>¿Confirmas la reserva para las {horarioSeleccionado?.horaInicio}?</Text>
            <View style={styles.filaBotones}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.btnCerrar}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={ejecutarReserva} style={styles.btnConfirmar}>
                <Text style={{color: '#fff'}}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  titulo: { fontSize: 26, fontWeight: 'bold' },
  info: { fontSize: 16, color: '#666' },
  divisor: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  subtitulo: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  listaHorarios: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  btnHorario: { padding: 10, borderWidth: 1, borderColor: '#007BFF', borderRadius: 8 },
  btnHorarioActivo: { backgroundColor: '#007BFF' },
  botonReserva: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  textoBoton: { color: '#fff', fontWeight: 'bold' },
  textArea: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, height: 80, marginTop: 10 },
  botonGuardar: { marginTop: 10, alignItems: 'center', padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 },
  modalCentrado: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: 300, backgroundColor: '#fff', padding: 20, borderRadius: 15 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  filaBotones: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  btnCerrar: { padding: 10 },
  btnConfirmar: { backgroundColor: '#007BFF', padding: 10, borderRadius: 5 }
});