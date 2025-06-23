import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { I18nextProvider } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { jwtDecode } from 'jwt-decode';

import { getCurrentLocation } from './src/hooks/useLocation';
import { HirovoAPI } from '@api/business_modules/hirovo';
import i18n from './common/hirovo-api/src/config/i18n';
import RootNavigator from './navigation/RootNavigator';
import { AppConfig } from '@config/hirovo-config';

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<'Login' | 'Drawer' | null>(null);

  // ✅ Deep linking ayarları
  const linking = {
    prefixes: ['hirovo://', 'https://hirovo.page.link'],
    config: {
      screens: {
        Login: 'login',
        Register: 'register',
        Drawer: 'drawer', // sade tanım!
        JobsDetail: {
          path: 'jobs/:id',
          parse: {
            id: (id: string) => id,
          },
        },
        ProfileEdit: 'profile-edit',
        WorkerProfile: {
          path: 'worker/:id',
          parse: {
            id: (id: string) => id,
          },
        },
      },
    },
  };


  useEffect(() => {
    const prepareApp = async () => {
      try {
        // 🌐 i18n başlat
        if (!i18n.isInitialized) {
          await new Promise<void>((resolve) => {
            i18n.on('initialized', () => resolve());
          });
        }

        // 🔐 JWT kontrolü
        const token = await AsyncStorage.getItem('jwt');
        setInitialRoute(token ? 'Drawer' : 'Login');

        if (token) {
          try {
            const decoded: any = jwtDecode(token);
            const userId = decoded?.nameid;

            // 📍 Konum güncelle (sadece build ortamında)
            if (Constants.appOwnership !== 'expo') {
              const location = await getCurrentLocation();

              if (location) {
                const response = await HirovoAPI.Location.SetLocation.Request({
                  userId,
                  latitude: location.latitude,
                  longitude: location.longitude,
                  companyId: AppConfig.DefaultCompanyId,
                });
                console.log('📍 Konum API yanıtı:', response);
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
      <NavigationContainer linking={linking}>
        <RootNavigator initialRoute={initialRoute} />
      </NavigationContainer>
    </I18nextProvider>
  );
}
