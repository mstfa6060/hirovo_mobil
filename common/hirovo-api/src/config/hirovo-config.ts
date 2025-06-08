// @config/hirovo-config.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AxiosInstance = ReturnType<typeof axios.create>;

export const api: AxiosInstance = axios.create({
	baseURL: 'https://api.hirovo.com',
	timeout: 10000
});

// 🔐 Tüm isteklere token ekle
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('jwt');
    if (token && config.headers && typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);


export const AppConfig = {
	HirovoUrl: 'https://api.hirovo.com/hirovo',
	IAMUrl: 'https://api.hirovo.com/iam',
	GoogleClientId: 'YOUR_GOOGLE_CLIENT_ID',
	GoogleIosClientId: 'YOUR_IOS_CLIENT_ID',
	GoogleAndroidClientId: 'YOUR_ANDROID_CLIENT_ID',
	GoogleExpoClientId: 'YOUR_EXPO_CLIENT_ID'
};
