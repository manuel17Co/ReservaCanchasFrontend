import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import { Alert, Button, Text, View } from "react-native";

export default function Perfil() {
  const { logout } = useAuth();
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