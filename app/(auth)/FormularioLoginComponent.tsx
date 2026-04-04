import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ImageBackground, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from '../../src/context/AuthContext';
import { LoginRequest, LoginResponse } from '../../src/dtos/LoginDTO';
import { apiClient } from '../../src/services/ApiClient';

export default function FormularioLoginComponent() {
  const router = useRouter();
  const { login } = useAuth();

  const [formulario, setFormulario] = useState<LoginRequest>({
    correo: '',
    contrasena: '',
  });

  const [errores, setErrores] = useState({
    correo: false,
    contrasena: false,
  });

  const [cargando, setCargando] = useState(false);

  const handleInput = (campo: keyof LoginRequest, valor: string) => {
    setFormulario({ ...formulario, [campo]: valor });
    setErrores({ ...errores, [campo]: valor === '' });
  };

  const handleLogin = async () => {
    const nuevosErrores = {
      correo: formulario.correo.trim() === '',
      contrasena: formulario.contrasena.trim() === '',
    };

    setErrores(nuevosErrores);

    if (Object.values(nuevosErrores).some(error => error)) {
      Alert.alert("Error", "Ingresa tus credenciales.");
      return;
    }

    setCargando(true);

    try {
      const API = process.env.EXPO_PUBLIC_API_RESERVAS;

      const response = await apiClient.post<LoginResponse, LoginRequest>(
        `${API}/auth/login`,
        formulario,
        false
      );

      if (response.token) {
        await login(response.token);
        Alert.alert("¡Bienvenido!", "Inicio de sesión exitoso.");
        router.replace('/(tabs)/(canchas)');
      }

    } catch (error: any) {
      console.log("Error de login:", error);
      const msj = error.response?.status === 403
        ? "Correo o contraseña incorrectos."
        : "No se pudo conectar con el servidor.";
      Alert.alert("Error", msj);
    } finally {
      setCargando(false);
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://www.ceoe.es/sites/ceoe-corporativo/files/styles/image_1200/public/content/image/2021/03/25/104/diseno-sin-titulo-27.png?itok=aiH46YuA' }}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.appTitleContainer}>
        <Text style={styles.appTitle}>Field Reserve</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Pressable onPress={() => Keyboard.dismiss()} style={styles.container}>
          <View style={styles.formWrapper}>
            <Text style={styles.titulo}>Iniciar Sesión</Text>

            <TextInput
              style={[styles.input, errores.correo && styles.inputError]}
              placeholder="Correo electrónico"
              placeholderTextColor="#888"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formulario.correo}
              onChangeText={(valor) => handleInput('correo', valor)}
            />

            <TextInput
              style={[styles.input, errores.contrasena && styles.inputError]}
              placeholder="Contraseña"
              placeholderTextColor="#888"
              secureTextEntry={true}
              autoCapitalize="none"
              value={formulario.contrasena}
              onChangeText={(valor) => handleInput('contrasena', valor)}
            />

            <Pressable
              style={[styles.boton, cargando && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={cargando}
            >
              <Text style={styles.textoBoton}>
                {cargando ? "Entrando..." : "Entrar"}
              </Text>
            </Pressable>

            <TouchableOpacity onPress={() => router.push("/(auth)/FormularioRegisterComponent")}>
              <Text style={styles.link}>¿No tienes cuenta? Regístrate aquí</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  appTitleContainer: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
    textShadowColor: '#007BFF',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 14,
    letterSpacing: 5,
  },
  container: {
    padding: 15,
    marginTop: -350,
  },
  formWrapper: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 10,
    width: '100%',
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: 'red',
    backgroundColor: '#fff5f5',
  },
  boton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  textoBoton: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: '#000',
    fontSize: 14,
    marginTop: 15,
    textAlign: 'center',
  },
});