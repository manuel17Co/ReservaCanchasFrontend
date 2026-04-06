import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Siempre redirigir al login al iniciar
    router.replace('/(auth)/FormularioLoginComponent');
  }, []);

  return null;
}
