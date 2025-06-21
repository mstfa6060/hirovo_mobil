import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { I18nextProvider } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

import { getCurrentLocation } from './src/hooks/useLocation';
import { jwtDecode } from 'jwt-decode';
import { HirovoAPI } from '@api/business_modules/hirovo';

// i18n ayarları
import i18n from './common/hirovo-api/src/config/i18n';
import RootNavigator from './navigation/RootNavigator';
import { AppConfig } from '@config/hirovo-config';

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<'Login' | 'Drawer' | null>(null);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        // i18n başlatma bekleniyor
        if (!i18n.isInitialized) {
          await new Promise<void>((resolve) => {
            i18n.on('initialized', () => resolve());
          });
        }

        // JWT varsa otomatik Drawer'a yönlendir
        const token = await AsyncStorage.getItem('jwt');
        console.log('JWT:', token);
        setInitialRoute(token ? 'Drawer' : 'Login');

        if (token) {
          try {
            const decoded: any = jwtDecode(token);
            const userId = decoded?.nameid;

            // ⛔️ Expo Go'da native modül çalışmasın
            if (Constants.appOwnership !== 'expo') {
              const location = await getCurrentLocation();

              if (location) {
                const response = await HirovoAPI.Location.SetLocation.Request({
                  userId: userId,
                  latitude: location.latitude,
                  longitude: location.longitude,
                  companyId: AppConfig.DefaultCompanyId,
                });
                console.log('📍 Konum API yanıtı:', response);
                console.log(userId, location.latitude, location.longitude, AppConfig.DefaultCompanyId);

              }
            } else {
              console.log('Expo Go modunda, konum alınmadı');
            }

          } catch (err) {
            console.warn('Konum gönderilemedi:', err);
          }
        }
      } catch (error) {
        console.error('❌ App başlatma hatası:', error);
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
