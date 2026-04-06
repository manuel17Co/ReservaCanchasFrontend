import { CanchaDTO } from "@/src/dtos/CanchaDTO";
import { apiClient } from "@/src/services/ApiClient";
import { asyncStorageService } from "@/src/services/AsyncStorageService";
import { StackActions } from "@react-navigation/native";
import { Stack, useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function CanchaDetalle() {
  // Capturamos id y nombre (si lo envías por params)
  const { id, nombre } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();

  // Estados de la vista
  const [cancha, setCancha] = useState<CanchaDTO | null>(null);
  const [notaPrivada, setNotaPrivada] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Clave única para el AsyncStorage basada en la cancha
  const STORAGE_KEY = `nota_cancha_${id}`;

  // 1. Control de la pila de navegación (tu requerimiento)
  useFocusEffect(
    useCallback(() => {
      return () => {
        // Al desmontar/perder foco, si puede ir atrás, limpia la pila y vuelve al inicio del Stack
        if (navigation.canGoBack()) {
          navigation.dispatch(StackActions.popToTop());
        }
      };
    }, [navigation])
  );

  // 2. Carga inicial de datos de la API y de AsyncStorage
  useEffect(() => {
    if (id) {
      cargarDetallesCancha();
      cargarNotaLocal();
    }
  }, [id]);

  const cargarDetallesCancha = async () => {
    setCargando(true);
    try {
      const response = await apiClient.get<CanchaDTO>(`/canchas/${id}`, false);
      setCancha(response);
      setCargando(false);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los detalles de la cancha.");
      setCargando(false);
    }
  };

  const cargarNotaLocal = async () => {
    const notaGuardada = await asyncStorageService.get<string>(STORAGE_KEY);
    if (notaGuardada) {
      setNotaPrivada(notaGuardada);
    }
  };

  // 3. Funciones de acción
  const guardarNotaLocal = async () => {
    await asyncStorageService.set(STORAGE_KEY, notaPrivada);
    Alert.alert("Guardado", "Tu nota privada ha sido guardada en este dispositivo.");
  };

  const confirmarReserva = async () => {
    try {
      // Endpoint real:
      // await apiClient.post("/reservas", { canchaId: id, fecha: new Date() });
      
      setModalVisible(false);
      Alert.alert("¡Reserva Exitosa!", "La cancha ha sido reservada.");
      router.back(); // Regresamos a la lista
    } catch (error) {
      Alert.alert("Error", "No se pudo completar la reserva.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Configuración dinámica del Header de Expo Router */}
      <Stack.Screen
        options={{
          title: (nombre as string) || cancha?.nombre || "Detalle",
          headerBackTitle: "",
          headerTintColor: "#007BFF",
        }}
      />

      {cargando ? (
        <Text style={styles.cargandoTexto}>Cargando información...</Text>
      ) : cancha ? (
        <>
          <View style={styles.tarjetaInfo}>
            <Text style={styles.titulo}>{cancha.nombre}</Text>
            <Text style={styles.info}>Sede: {cancha.sedeNombre} | Tipo: {cancha.tipoCanchaNombre}</Text>
            <Text style={styles.precio}>Precio: ${cancha.precioHora}/hr</Text>

            <TouchableOpacity style={styles.botonReserva} onPress={() => setModalVisible(true)}>
              <Text style={styles.textoBoton}>Ver Horarios y Reservar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divisor} />

          <Text style={styles.subtitulo}>Mis Notas (Privado)</Text>
          <Text style={styles.notaDesc}>Escribe recordatorios para ti. Solo se guardan en tu celular.</Text>
          
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={5}
            placeholder="Ej: Llevar hidratación, recordar pagar el saldo..."
            value={notaPrivada}
            onChangeText={setNotaPrivada}
          />
          
          <TouchableOpacity style={styles.botonGuardar} onPress={guardarNotaLocal}>
            <Text style={styles.textoBotonSecundario}>Guardar Nota Local</Text>
          </TouchableOpacity>

          {/* Modal de Confirmación de Reserva */}
          <Modal
            visible={modalVisible}
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
            animationType="fade"
          >
            <View style={styles.modalPrincipal}>
              <View style={styles.contenidoModal}>
                <Text style={styles.tituloModal}>Confirmar Reserva</Text>
                <Text style={styles.textoModal}>¿Deseas reservar {cancha.nombre}?</Text>
                
                <View style={styles.modalAcciones}>
                  <TouchableOpacity style={styles.botonCancelar} onPress={() => setModalVisible(false)}>
                    <Text style={styles.textoBotonSecundario}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.botonConfirmar} onPress={confirmarReserva}>
                    <Text style={styles.textoBoton}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <Text>No se encontró la cancha.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  cargandoTexto: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  tarjetaInfo: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  info: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  precio: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 10,
  },
  botonReserva: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divisor: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  notaDesc: {
    fontSize: 12,
    color: '#888',
    marginBottom: 10,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    backgroundColor: '#fafafa',
  },
  botonGuardar: {
    backgroundColor: '#e1e1e1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  textoBotonSecundario: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalPrincipal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contenidoModal: {
    width: 320,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  tituloModal: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textoModal: {
    fontSize: 16,
    color: '#444',
    marginBottom: 20,
  },
  modalAcciones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botonCancelar: {
    padding: 12,
    backgroundColor: '#ccc',
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  botonConfirmar: {
    padding: 12,
    backgroundColor: '#28a745',
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
});