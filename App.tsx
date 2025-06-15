import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { I18nextProvider } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
console.log('Çalışma ortamı:', Constants.appOwnership); // 'expo' ya da 'standalone'

// import './src/location-task';

// i18n ayarları
import i18n from './common/hirovo-api/src/config/i18n';
import RootNavigator from './navigation/RootNavigator'; // ✅ Doğru import

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<'Login' | 'Drawer' | null>(null);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        if (!i18n.isInitialized) {
          await new Promise<void>((resolve) => {
            i18n.on('initialized', () => resolve());
          });
        }

        const token = await AsyncStorage.getItem('jwt');
        setInitialRoute(token ? 'Drawer' : 'Login');
      } catch (error) {
        setInitialRoute('Login');
      } finally {
        setIsAppReady(true);
      }
    };

    prepareApp();
  }, []);

  if (!isAppReady || initialRoute === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <NavigationContainer>
        <RootNavigator initialRoute={initialRoute} />
      </NavigationContainer>
    </I18nextProvider>
  );
}
