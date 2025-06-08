import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import './common/hirovo-api/src/config/i18n';
import { NavigationContainer } from '@react-navigation/native';
import MainStack from './navigation/RootNavigator';
import i18n from 'i18next';

export default function App() {
  const [ready, setReady] = useState(i18n.isInitialized);

  useEffect(() => {
    if (!i18n.isInitialized) {
      i18n.on('initialized', () => setReady(true));
    }
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <MainStack />
    </NavigationContainer>
  );
}
