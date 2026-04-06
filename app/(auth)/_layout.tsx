import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FormularioLoginComponent" />
      <Stack.Screen name="FormularioRegisterComponent" />
    </Stack>
  );
}
