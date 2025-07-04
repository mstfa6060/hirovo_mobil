// @services/ApiService.ts
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { api } from '@config/hirovo-config';
import { TokenManager } from './TokenManager';
import i18next from 'i18next';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class ApiService {
  static async call<T>(
    promise: Promise<AxiosResponse<{ payload: T; error: any; hasError: boolean }>>
  ): Promise<T> {
    try {
      const response = await promise;

      const { hasError, error, payload } = response.data;

      if (hasError) {
        const backendKey = error?.code || error?.message;

        const errorMessage = backendKey
          ? i18next.t(`error.${backendKey}`, `⚠ ${backendKey}`)
          : i18next.t('ui.common.unknownError');

        Alert.alert(i18next.t('common.errorTitle'), errorMessage);

        const enrichedError = new Error(errorMessage);
        (enrichedError as any).original = error;
        throw enrichedError;
      }

      return payload;
    } catch (err: any) {
      if (err?.response?.status === 401) {
        console.log('🔐 Token expired, attempting to refresh...', err);
        const expired = await TokenManager.isTokenExpired();
        if (expired) {
          const newJwt = await TokenManager.refreshToken();
          if (newJwt) {
            const retryConfig = err.config;
            retryConfig.headers['Authorization'] = `Bearer ${newJwt}`;
            const retryResponse = await api.request(retryConfig);
            return retryResponse.data.payload;
          }
        }
      }

      throw err;
    }
  }

  // ✅ Yeni: multipart/form-data destekleyen çağrı
  static async callMultipart<T>(
    url: string,
    formData: FormData,
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    const token = await AsyncStorage.getItem('jwt');
    const response = await axios.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
        ...(config.headers || {}),
      },
    });

    const { hasError, error, payload } = response.data;

    if (hasError) {
      const backendKey = error?.code || error?.message;
      const errorMessage = backendKey
        ? i18next.t(`error.${backendKey}`, `⚠ ${backendKey}`)
        : i18next.t('ui.common.unknownError');

      Alert.alert(i18next.t('common.errorTitle'), errorMessage);

      const enrichedError = new Error(errorMessage);
      (enrichedError as any).original = error;
      throw enrichedError;
    }

    return payload;
  }
}
