import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ImageBackground, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { RegistroUsuario } from '../../src/dtos/RegisterDTO';
import { apiClient } from '../../src/services/ApiClient';

export default function FormularioRegisterComponent() {
  const router = useRouter();
  const [formulario, setFormulario] = useState<RegistroUsuario>({
    nombre: '',
    correo: '',
    contrasena: '',
  });

  const [errores, setErrores] = useState({
    nombre: false,
    correo: false,
    contrasena: false,
  });

  const [cargando, setCargando] = useState(false);

  const handleInput = (campo: keyof RegistroUsuario, valor: string) => {
    setFormulario({
      ...formulario,
      [campo]: valor
    });
    setErrores({
      ...errores,
      [campo]: valor === ''
    });
  };

  const handleSubmit = async () => {
    const nuevosErrores = {
      nombre: formulario.nombre.trim() === '',
      correo: formulario.correo.trim() === '',
      contrasena: formulario.contrasena.trim() === '',
    };

    setErrores(nuevosErrores);

    if (Object.values(nuevosErrores).some(error => error)) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }

    setCargando(true);

    try {
      const API = process.env.EXPO_PUBLIC_API_RESERVAS;
      await apiClient.post<any, RegistroUsuario>(
        `${API}/auth/register`,
        formulario,
        true
      );

      Alert.alert("¡Éxito!", "Usuario registrado correctamente en Field Reserve.");
      setFormulario({ nombre: '', correo: '', contrasena: '' });
      router.push("/(auth)/FormularioLoginComponent");

    } catch (error) {
      console.log("Error al guardar el usuario:", error);
      Alert.alert("Error de Registro", "No se pudo completar la operación. Revisa tu conexión.");
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
        <Pressable onPress={() => Keyboard.dismiss()} accessible={false} style={styles.container}>
          <View style={styles.formWrapper}>
            <Text style={styles.titulo}>Crear Cuenta</Text>

            <TextInput
              style={[styles.input, errores.nombre && styles.inputError]}
              placeholder="Nombre completo"
              placeholderTextColor="#888"
              value={formulario.nombre}
              onChangeText={(valor) => handleInput('nombre', valor)}
              autoCapitalize="words"
            />

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
              autoCorrect={false}
              autoCapitalize="none"
              value={formulario.contrasena}
              onChangeText={(valor) => handleInput('contrasena', valor)}
            />

            <Pressable
              style={[styles.boton, cargando && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={cargando}
            >
              <Text style={styles.textoBoton}>
                {cargando ? "Registrando..." : "Registrarse"}
              </Text>
            </Pressable>

            <TouchableOpacity onPress={() => router.push("/(auth)/FormularioLoginComponent")}>
              <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
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
    paddingHorizontal: 8,
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
    marginTop: -400,
  },
  formWrapper: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 20,
    color: '#333',
  },
  input: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginVertical: 10,
    width: "100%",
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: 'red',
    backgroundColor: '#fff5f5'
  },
  boton: {
    backgroundColor: "#007BFF",
    padding: 15,
    width: "100%",
    borderRadius: 8,
    marginTop: 15,
  },
  textoBoton: {
    color: 'white',
    textAlign: "center",
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: "#000000",
    fontSize: 14,
    padding: 8,
    marginTop: 10,
    textAlign: 'center',
  },
});