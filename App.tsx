import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import '@config/i18n'; // i18n'i config alias üzerinden çağır
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

export default function App() {
  const { t } = useTranslation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // i18n init olduktan sonra "isReady" true yapılır
    i18n.on('initialized', () => {
      setIsReady(true);
    });
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('hello')}</Text>
      <Button title="TR" onPress={() => i18n.changeLanguage('tr')} />
      <Button title="EN" onPress={() => i18n.changeLanguage('en')} />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
