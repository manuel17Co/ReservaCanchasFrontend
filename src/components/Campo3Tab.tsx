import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Campo3Tab() {
  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>Campo 3</Text>
        <Text style={styles.subtitle}>Esta funcionalidad estará disponible próximamente</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
