import { Stack } from 'expo-router';

export default function MiPerfilLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="perfil" />
    </Stack>
  );
}
