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
        await AsyncStorage.setItem('jwt', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJkOTJlMDJkYS02MDZiLTRmYzQtYTNhNC1kYmNiZTJlMDRhZjIiLCJnaXZlbl9uYW1lIjoibW9jYWsiLCJ1bmlxdWVfbmFtZSI6Ik11c3RhZmEgT2NhayIsInRlbmFudElkIjoiYzlkOGM4NDYtMTBmYy00NjZkLThmNDUtYTRmYTRlODU2YWJkIiwicGxhdGZvcm0iOiIwIiwidXNlclNvdXJjZSI6IjAiLCJyZWZyZXNoVG9rZW5JZCI6IjU2OWI4M2M5LTQwMGQtNDU4MC05ODE0LTJhN2VhNmJiODQzZiIsInVzZXJUeXBlIjoiMSIsIm5iZiI6MTc1MDA2NzQ1MCwiZXhwIjoxNzUwNjcyMjUwLCJpYXQiOjE3NTAwNjc0NTAsImF1ZCI6ImFwaS5oaXJvdm8uY29tIn0.B_pBpiP_MUZsptb9nKJ5TKLt2AVJcJiB43VeOiFSOfQ");

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
