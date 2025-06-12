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
  GoogleClientId: '606884613202-3voc3mec471dnd5fg2fpe4b51bb7i2s3.apps.googleusercontent.com',
  GoogleIosClientId: '',
  GoogleAndroidClientId: '606884613202-6hp92guha11qm77a1a6hfhre7238i5vl.apps.googleusercontent.com',
  GoogleExpoClientId: '606884613202-3voc3mec471dnd5fg2fpe4b51bb7i2s3.apps.googleusercontent.com',

};
