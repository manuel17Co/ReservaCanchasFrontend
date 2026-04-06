import { useRouter } from "expo-router";
import { Alert, Button, Text, View } from "react-native";
import { secureStoreService } from "../../../src/services/SecureStoreService";

export default function Perfil() {
  const logout = async () => {
    await secureStoreService.remove('auth_token');
  };
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar Sesión",
          onPress: async () => {
            await logout();
            router.replace("/(auth)/FormularioLoginComponent");
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Perfil</Text>
      <Button title="Cerrar Sesión" onPress={handleLogout} />
    </View>
  );
}