import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  AppState,
  AppStateStatus,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { HirovoAPI } from '@api/business_modules/hirovo';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCurrentLocation } from '../src/hooks/useLocation';
import Constants from 'expo-constants';
import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConfig } from '@config/hirovo-config';
import * as Device from 'expo-device';

type Job = HirovoAPI.Jobs.All.IResponseModel;

export default function JobsAllScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = async () => {
    try {
      const response = await HirovoAPI.Jobs.All.Request({
        sorting: {
          key: 'createdAt',
          direction: HirovoAPI.Enums.XSortingDirection.Descending,
        },
        filters: [],
        pageRequest: {
          currentPage: 1,
          perPageCount: 20,
          listAll: false,
        },
      });
      setJobs(response);
    } catch (err) {
      console.error(err);
      setError(t('ui.jobs.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  }, []);

  const sendLocation = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      if (!token) return;

      const decoded: any = jwtDecode(token);
      const userId = decoded?.nameid;

      if (Constants.appOwnership !== 'expo') {
        const location = await getCurrentLocation();

        if (location) {
          const response = await HirovoAPI.Location.SetLocation.Request({
            userId: userId,
            latitude: location.latitude,
            longitude: location.longitude,
            companyId: AppConfig.DefaultCompanyId,
          });
          console.log('📍 Konum gönderildi:', response);
        }
      } else {
        console.log('Expo Go modunda konum gönderilmedi');
      }
    } catch (error) {
      console.warn('Konum gönderme hatası:', error);
    }
  };

  const registerPushToken = async () => {
    try {
      if (!Device.isDevice) {
        console.warn('Fiziksel cihaz gerekli (simülatör desteklemez)');
        return;
      }

      const jwt = await AsyncStorage.getItem('jwt');
      const decoded: any = jwt ? jwtDecode(jwt) : null;
      const userId = decoded?.nameid;

      if (userId) {
        const response = await HirovoAPI.Workers.SetExpoPushToken.Request({
          userId,
          expoPushToken: userId, // Gerçek token buraya gelecek
        });
        console.log('✅ Push token kaydedildi:', response);
      }
    } catch (error) {
      console.warn('Push token kaydında hata:', error);
    }
  };

  useEffect(() => {
    fetchJobs();
    sendLocation();
    registerPushToken();

    // App tekrar aktifleştirilince job verisini güncelle
    const appStateListener = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        fetchJobs();
      }
    });

    // 30 saniyede bir job verisi yenile
    const interval = setInterval(() => {
      fetchJobs();
    }, 30000);

    return () => {
      appStateListener.remove();
      clearInterval(interval);
    };
  }, []);

  const goToJobDetail = (jobId: string) => {
    navigation.navigate('JobsDetail', { id: jobId });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 8 }}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
      <Text style={styles.subHeader}>{t('ui.jobs.feedSubtitle')}</Text>

      <FlatList
        style={{ marginTop: 12 }}
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.subInfo}>Hirovo Inc. – Remote</Text>
            <Text style={styles.description}>
              {item.salary}₺ – {t(`jobType.${HirovoAPI.Enums.HirovoJobType[item.type]}`)}, {t(`jobStatus.${HirovoAPI.Enums.HirovoJobStatus[item.status]}`)}
            </Text>
            <TouchableOpacity onPress={() => goToJobDetail(item.id)} style={styles.button}>
              <Text style={styles.buttonText}>{t('ui.jobs.viewDetails')}</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  subHeader: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    marginHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  subInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: '#374151',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  container: {
    paddingBottom: 16,
  },
});
