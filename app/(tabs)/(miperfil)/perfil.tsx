import React from "react";
import { useRouter } from "expo-router";
import { 
  Alert, 
  Text, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image 
} from "react-native";
import { secureStoreService } from "../../../src/services/SecureStoreService";

export default function Perfil() {
  const router = useRouter();

  const logout = async () => {
    await secureStoreService.remove('auth_token');
  };

  const handleLogout = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/(auth)/FormularioLoginComponent");
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* HEADER: Información del Usuario */}
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>FR</Text>
        </View>
        <Text style={styles.userName}>Field Reserve User</Text>
        <Text style={styles.userEmail}>usuario@fieldreserve.com</Text>
      </View>

      {/* SECCIÓN SOBRE LA APP */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre Field Reserve</Text>
        <View style={styles.card}>
          <Text style={styles.appDescription}>
            Somos la plataforma líder en Manizales para la gestión y reserva de escenarios deportivos. 
            Nuestra misión es conectar a los deportistas con las mejores canchas de la ciudad de forma rápida y sencilla (Pronto nuesvas Actualizaciones).
          </Text>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Versión</Text>
            <Text style={styles.infoValue}>1.0.1</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Desarrollado por</Text>
            <Text style={styles.infoValue}>Manuel M Rubio</Text>
          </View>
        </View>
      </View>

      {/* SECCIÓN DE AJUSTES/AYUDA (Visual) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ayuda y Soporte</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Términos y Condiciones</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Política de Privacidad</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* BOTÓN DE LOGOUT ESTILIZADO */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>© 2026 Field Reserve App</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FA",
  },
  header: {
    backgroundColor: "#FFF",
    paddingVertical: 40,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarText: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 15,
    elevation: 2,
  },
  appDescription: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: "#888",
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemText: {
    fontSize: 15,
    color: "#333",
  },
  arrow: {
    fontSize: 20,
    color: "#CCC",
  },
  logoutContainer: {
    padding: 20,
    marginTop: 20,
    marginBottom: 40,
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    width: "100%",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerText: {
    marginTop: 15,
    fontSize: 12,
    color: "#AAA",
  },
});