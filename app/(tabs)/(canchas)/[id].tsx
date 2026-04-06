import { CanchaDTO } from "@/src/dtos/CanchaDTO";
import { apiClient } from "@/src/services/ApiClient";
import { asyncStorageService } from "@/src/services/AsyncStorageService";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface HorarioDisponible {
  id: number;
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
  fecha: string;
}

// Función para obtener los próximos 7 días
const getProximosDias = (cantidad: number) => {
  const dias: { fecha: string; label: string }[] = [];
  const hoy = new Date();

  for (let i = 0; i < cantidad; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + i);
    const fechaISO = fecha.toISOString().split("T")[0];
    const label = i === 0 ? "Hoy" :
                  i === 1 ? "Mañana" :
                  fecha.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
    dias.push({ fecha: fechaISO, label });
  }
  return dias;
};

export default function CanchaDetalle() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [cancha, setCancha] = useState<CanchaDTO | null>(null);
  const [notaPrivada, setNotaPrivada] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [horarios, setHorarios] = useState<HorarioDisponible[]>([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState<HorarioDisponible | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(new Date().toISOString().split("T")[0]);

  const STORAGE_KEY = `nota_cancha_${id}`;

  useFocusEffect(
    useCallback(() => {
      console.log("Cargando detalles de cancha con ID:", id);
      if (id) {
        cargarDetallesCancha();
        cargarNotaLocal();
        cargarHorariosDisponibles();
      }
      return undefined;
    }, [id, fechaSeleccionada])
  );

  const cargarDetallesCancha = async () => {
    setCargando(true);
    try {
      console.log("Consultando endpoint:", `/canchas/${id}`);
      const response = await apiClient.get<CanchaDTO>(`/canchas/${id}`, false);
      console.log("Respuesta de cancha:", response);
      setCancha(response);
    } catch (error: any) {
      console.error("Error cargando detalles de cancha:", error);
      console.error("Detalles del error:", error.response?.data);
      Alert.alert("Error", "No se pudieron cargar los detalles de la cancha.");
    } finally {
      setCargando(false);
    }
  };

  const cargarHorariosDisponibles = async () => {
    if (!id) return;
    try {
      console.log("Consultando horarios disponibles:", `/horarios/disponibles?canchaId=${id}&fecha=${fechaSeleccionada}`);
      const response = await apiClient.get<HorarioDisponible[]>(
        `/horarios/disponibles?canchaId=${id}&fecha=${fechaSeleccionada}`,
        false
      );
      console.log("Horarios disponibles:", response);
      setHorarios(response);
      setHorarioSeleccionado(null);
    } catch (error: any) {
      console.error("Error cargando horarios:", error);
      console.error("Detalles del error:", error.response?.data);
      // Si el endpoint no existe, mostramos horarios vacíos
      setHorarios([]);
    }
  };

  const cargarNotaLocal = async () => {
    const notaGuardada = await asyncStorageService.get<string>(STORAGE_KEY);
    if (notaGuardada) {
      setNotaPrivada(notaGuardada);
    }
  };

  const guardarNotaLocal = async () => {
    await asyncStorageService.set(STORAGE_KEY, notaPrivada);
    Alert.alert("Guardado", "Tu nota privada ha sido guardada en este dispositivo.");
  };

  const confirmarReserva = async () => {
    if (!horarioSeleccionado || !cancha) {
      Alert.alert("Error", "Debes seleccionar un horario disponible.");
      return;
    }

    try {
      // Calcular el total basado en el precio por hora de la cancha
      const horaInicio = parseInt(horarioSeleccionado.horaInicio.split(":")[0]);
      const horaFin = parseInt(horarioSeleccionado.horaFin.split(":")[0]);
      const horas = horaFin - horaInicio;
      const totalPago = horas * cancha.precioHora;

      // Crear la reserva en el backend
      const reservaData = {
        canchaId: cancha.id,
        fecha: fechaSeleccionada,
        horaInicio: horarioSeleccionado.horaInicio,
        horaFin: horarioSeleccionado.horaFin,
      };

      console.log("Creando reserva:", reservaData);
      await apiClient.post("/reservas", reservaData, true);

      setModalVisible(false);
      Alert.alert(
        "¡Reserva Exitosa!",
        `Reserva de ${cancha.nombre} para el ${fechaSeleccionada} de ${horarioSeleccionado.horaInicio} a ${horarioSeleccionado.horaFin}.`
      );
      router.push("/reservas/mis-reservas");
    } catch (error: any) {
      console.error("Error creando reserva:", error);
      console.error("Detalles del error:", error.response?.data);
      const mensaje = error.response?.data?.message || "No se pudo completar la reserva.";
      Alert.alert("Error", mensaje);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: cancha?.nombre || "Detalle de Cancha",
          headerBackTitle: "",
          headerTintColor: "#007BFF",
        }}
      />

      {cargando ? (
        <View style={styles.cargandoContainer}>
          <Text style={styles.cargandoTexto}>Cargando información...</Text>
        </View>
      ) : cancha ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Imagen */}
          {cancha.imagen && (
            <Image
              source={{ uri: cancha.imagen }}
              style={styles.imagen}
            />
          )}

          {/* Tarjeta Principal */}
          <View style={styles.tarjetaPrincipal}>
            <Text style={styles.nombre}>{cancha.nombre}</Text>
            
            <View style={styles.detallesRow}>
              <View style={styles.detalleItem}>
                <Text style={styles.detalleLabel}>Tipo</Text>
                <Text style={styles.detalleValor}>{cancha.tipoCanchaNombre}</Text>
              </View>
              <View style={styles.detalleItem}>
                <Text style={styles.detalleLabel}>Sede</Text>
                <Text style={styles.detalleValor}>{cancha.sedeNombre}</Text>
              </View>
              <View style={styles.detalleItem}>
                <Text style={styles.detalleLabel}>Capacidad</Text>
                <Text style={styles.detalleValor}>{cancha.capacidad} personas</Text>
              </View>
            </View>

            <View style={styles.precioContainer}>
              <Text style={styles.precioLabel}>Precio por hora</Text>
              <Text style={styles.precioValor}>${cancha.precioHora}</Text>
            </View>

            {/* Descripción */}
            {cancha.descripcion && (
              <View style={styles.descripcionContainer}>
                <Text style={styles.subtitulo}>Descripción</Text>
                <Text style={styles.descripcion}>{cancha.descripcion}</Text>
              </View>
            )}

            {/* Estado */}
            <View style={styles.estadoContainer}>
              <Text style={styles.estadoLabel}>Estado:</Text>
              <Text style={[styles.estado, cancha.activa ? styles.activa : styles.inactiva]}>
                {cancha.activa ? "Disponible" : "No Disponible"}
              </Text>
            </View>

            {cancha.activa && (
              <TouchableOpacity style={styles.botonReserva} onPress={() => setModalVisible(true)}>
                <Text style={styles.textoBoton}>Reservar Cancha</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Sección de Notas */}
          <View style={styles.notasSection}>
            <Text style={styles.subtitulo}>Mis Notas Privadas</Text>
            <Text style={styles.notaDesc}>Notas solo para ti, guardadas en tu dispositivo</Text>
            
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={5}
              placeholder="Ej: Llevar hidratación, horario preferido, etc."
              value={notaPrivada}
              onChangeText={setNotaPrivada}
              placeholderTextColor="#999"
            />
            
            <TouchableOpacity style={styles.botonGuardar} onPress={guardarNotaLocal}>
              <Text style={styles.textoBotonGuardar}>💾 Guardar Nota</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.espacioFinal} />
        </ScrollView>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTexto}>No se encontró la cancha</Text>
        </View>
      )}

      {/* Modal de Selección de Reserva */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Reservar {cancha?.nombre}</Text>

            {/* Selector de Fecha */}
            <Text style={styles.modalSubtitulo}>Selecciona una fecha:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.fechaScroll}
            >
              {getProximosDias(7).map((dia) => (
                <TouchableOpacity
                  key={dia.fecha}
                  style={[
                    styles.fechaOption,
                    fechaSeleccionada === dia.fecha && styles.fechaOptionActiva
                  ]}
                  onPress={() => setFechaSeleccionada(dia.fecha)}
                >
                  <Text style={[
                    styles.fechaTexto,
                    fechaSeleccionada === dia.fecha && styles.fechaTextoActivo
                  ]}>
                    {dia.label}
                  </Text>
                  <Text style={[
                    styles.fechaDia,
                    fechaSeleccionada === dia.fecha && styles.fechaDiaActivo
                  ]}>
                    {dia.fecha}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Selector de Horarios */}
            <Text style={styles.modalSubtitulo}>Horarios disponibles:</Text>
            {horarios.length === 0 ? (
              <Text style={styles.sinHorarios}>No hay horarios disponibles para esta fecha</Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.horariosScroll}
              >
                {horarios.map((horario) => (
                  <TouchableOpacity
                    key={horario.id}
                    style={[
                      styles.horarioOption,
                      horarioSeleccionado?.id === horario.id && styles.horarioOptionActivo
                    ]}
                    onPress={() => setHorarioSeleccionado(horario)}
                  >
                    <Text style={[
                      styles.horarioTexto,
                      horarioSeleccionado?.id === horario.id && styles.horarioTextoActivo
                    ]}>
                      {horario.horaInicio}
                    </Text>
                    <Text style={[
                      styles.horarioFin,
                      horarioSeleccionado?.id === horario.id && styles.horarioFinActivo
                    ]}>
                      {horario.horaFin}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Resumen de Reserva */}
            {horarioSeleccionado && (
              <View style={styles.resumenContainer}>
                <Text style={styles.resumenTitulo}>Resumen:</Text>
                <Text style={styles.resumenTexto}>📅 {fechaSeleccionada}</Text>
                <Text style={styles.resumenTexto}>⏰ {horarioSeleccionado.horaInicio} - {horarioSeleccionado.horaFin}</Text>
                <Text style={styles.resumenTotal}>
                  Total: ${((parseInt(horarioSeleccionado.horaFin) - parseInt(horarioSeleccionado.horaInicio)) * (cancha?.precioHora || 0)).toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.modalBotones}>
              <TouchableOpacity
                style={styles.botonModalCancelar}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.textoBotonCancelar}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.botonModalConfirmar,
                  !horarioSeleccionado && styles.botonModalConfirmarDeshabilitado
                ]}
                onPress={confirmarReserva}
                disabled={!horarioSeleccionado}
              >
                <Text style={styles.textoBoton}>
                  {horarioSeleccionado ? "Confirmar Reserva" : "Selecciona un horario"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  cargandoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cargandoTexto: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  imagen: {
    width: '100%',
    height: 250,
    backgroundColor: '#e0e0e0',
  },
  tarjetaPrincipal: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  nombre: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  detallesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detalleItem: {
    alignItems: 'center',
    flex: 1,
  },
  detalleLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  detalleValor: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    marginTop: 4,
  },
  precioContainer: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  precioLabel: {
    fontSize: 14,
    color: '#666',
  },
  precioValor: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 5,
  },
  descripcionContainer: {
    marginBottom: 20,
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  descripcion: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  estadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  estadoLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  estado: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activa: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  inactiva: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  botonReserva: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  notasSection: {
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  notaDesc: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    fontSize: 14,
    marginBottom: 12,
    color: '#333',
  },
  botonGuardar: {
    backgroundColor: '#e8f4f8',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007BFF',
  },
  textoBotonGuardar: {
    color: '#007BFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  espacioFinal: {
    height: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTexto: {
    fontSize: 16,
    color: '#888',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
  },
  modalTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  modalSubtitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
    marginBottom: 10,
  },
  modalTexto: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  modalCanchaNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 10,
  },
  modalPrecio: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
    marginBottom: 25,
  },
  fechaScroll: {
    maxHeight: 80,
  },
  fechaOption: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    minWidth: 80,
  },
  fechaOptionActiva: {
    backgroundColor: '#007BFF',
  },
  fechaTexto: {
    fontSize: 12,
    color: '#666',
  },
  fechaTextoActivo: {
    color: '#fff',
    fontWeight: 'bold',
  },
  fechaDia: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  fechaDiaActivo: {
    color: '#fff',
  },
  horariosScroll: {
    maxHeight: 60,
  },
  horarioOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    alignItems: 'center',
  },
  horarioOptionActivo: {
    backgroundColor: '#28a745',
  },
  horarioTexto: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  horarioTextoActivo: {
    color: '#fff',
  },
  horarioFin: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  horarioFinActivo: {
    color: '#fff',
  },
  sinHorarios: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 15,
  },
  resumenContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    width: '100%',
  },
  resumenTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  resumenTexto: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  resumenTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 8,
  },
  modalBotones: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginTop: 20,
  },
  botonModalCancelar: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotonCancelar: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  botonModalConfirmar: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#28a745',
    borderRadius: 8,
    alignItems: 'center',
  },
  botonModalConfirmarDeshabilitado: {
    backgroundColor: '#ccc',
  },
});