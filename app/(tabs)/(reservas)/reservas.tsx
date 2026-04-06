import { ReservaDTO } from "@/src/dtos/ReservaDTO";
import { apiClient } from "@/src/services/ApiClient";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Reservas() {
  const [reservas, setReservas] = useState<ReservaDTO[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      cargarReservas();
      return undefined;
    }, [])
  );

  const cargarReservas = async () => {
    setCargando(true);
    try {
      console.log("Consultando reservas del usuario autenticado...");
      const response = await apiClient.get<ReservaDTO[]>(
        "/reservas/mis-reservas",
        true
      );
      console.log("Reservas obtenidas:", response);
      setReservas(response);
    } catch (error: any) {
      console.error("Error cargando reservas:", error);
      console.error("Detalles del error:", error.response?.data);
      Alert.alert("Error", `No se pudieron cargar las reservas: ${error.response?.data?.message || error.message}`);
    } finally {
      setCargando(false);
    }
  };

  const onRefresh = async () => {
    setRefrescando(true);
    try {
      const response = await apiClient.get<ReservaDTO[]>(
        "/reservas/mis-reservas",
        true
      );
      setReservas(response);
    } catch (error: any) {
      Alert.alert("Error", `No se pudieron actualizar las reservas: ${error.response?.data?.message || error.message}`);
    } finally {
      setRefrescando(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "CONFIRMADA":
        return "#28a745";
      case "PENDIENTE":
        return "#ffc107";
      case "CANCELADA":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getEstadoBgColor = (estado: string) => {
    switch (estado) {
      case "CONFIRMADA":
        return "#d4edda";
      case "PENDIENTE":
        return "#fff3cd";
      case "CANCELADA":
        return "#f8d7da";
      default:
        return "#e2e3e5";
    }
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderReserva = ({ item }: { item: ReservaDTO }) => (
    <View style={styles.tarjetaReserva}>
      <View style={styles.encabezado}>
        <Text style={styles.canchaNombre}>{item.canchaNombre}</Text>
        <View
          style={[
            styles.estadoBadge,
            { backgroundColor: getEstadoBgColor(item.estado) },
          ]}
        >
          <Text style={[styles.estadoTexto, { color: getEstadoColor(item.estado) }]}>
            {item.estado}
          </Text>
        </View>
      </View>

      <View style={styles.detallesReserva}>
        <View style={styles.fila}>
          <Text style={styles.label}>📅 Fecha:</Text>
          <Text style={styles.valor}>{formatearFecha(item.fecha)}</Text>
        </View>

        <View style={styles.fila}>
          <Text style={styles.label}>⏰ Horario:</Text>
          <Text style={styles.valor}>
            {item.horaInicio} - {item.horaFin}
          </Text>
        </View>

        <View style={styles.fila}>
          <Text style={styles.label}>🏟️ Tipo:</Text>
          <Text style={styles.valor}>{item.tipoCancha}</Text>
        </View>

        <View style={styles.fila}>
          <Text style={styles.label}>📍 Sede:</Text>
          <Text style={styles.valor}>{item.sede}</Text>
        </View>

        <View style={[styles.fila, styles.filaTotal]}>
          <Text style={styles.label}>💰 Total:</Text>
          <Text style={styles.valorTotal}>${item.totalPago.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.pieReserva}>
        <Text style={styles.fechaCreacion}>
          Reservado: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  if (cargando) {
    return (
      <View style={styles.container}>
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.textoEspera}>Cargando reservas...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {reservas.length === 0 ? (
        <View style={styles.centrado}>
          <Text style={styles.textoVacio}>No tiene reservas</Text>
          <Text style={styles.textoVacioSub}>
            Reserva ya una cancha
          </Text>
        </View>
      ) : (
        <FlatList
          data={reservas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderReserva}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  tarjetaReserva: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  encabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  canchaNombre: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  estadoTexto: {
    fontSize: 12,
    fontWeight: "bold",
  },
  detallesReserva: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  filaTotal: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  valor: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  valorTotal: {
    fontSize: 16,
    color: "#28a745",
    fontWeight: "bold",
  },
  pieReserva: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  fechaCreacion: {
    fontSize: 12,
    color: "#999",
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textoEspera: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
  textoVacio: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#999",
    textAlign: "center",
  },
  textoVacioSub: {
    fontSize: 14,
    color: "#bbb",
    marginTop: 10,
    textAlign: "center",
  },
});