import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import './src/i18n/i18n'; // i18n dosyasını içeri aktar
import { useTranslation } from 'react-i18next';

export default function App() {
  const { t, i18n } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('hello')}</Text>
      <Button title="TR" onPress={() => i18n.changeLanguage('tr')} />
      <Button title="EN" onPress={() => i18n.changeLanguage('en')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    gap: 12,
  },
  text: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
