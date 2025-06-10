import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nextProvider } from 'react-i18next';

// Ekranlar
import LoginScreen from './screens/LoginScreen';
import DrawerNavigator from './navigation/DrawerNavigator';

// i18n ayarları
import i18n from './common/hirovo-api/src/config/i18n';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<'Login' | 'Drawer' | null>(null);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        // i18n init bekleniyor
        if (!i18n.isInitialized) {
          await new Promise<void>(resolve => {
            i18n.on('initialized', () => resolve());
          });
        }

        // Token kontrolü
        const token = await AsyncStorage.getItem('jwt');
        setInitialRoute(token ? 'Drawer' : 'Login');
      } catch (error) {
        console.warn('Hazırlık sırasında hata:', error);
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
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Drawer" component={DrawerNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </I18nextProvider>
  );
}
