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
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


export const AppConfig = {
  HirovoUrl: 'https://api.hirovo.com/hirovo',
  IAMUrl: 'https://api.hirovo.com/iam',
  GoogleIosClientId: '',
  GoogleAndroidClientIdDev: '1053973213164-p9j88c7th2uma4u6lftfi5durebts0dn.apps.googleusercontent.com',
  GoogleAndroidClientIdProd: '1053973213164-vj9stnat1m31lf9j4nhbge6vg2h537ns.apps.googleusercontent.com',
  GoogleExpoClientId: '1053973213164-41a19hj800bf21j5btnaeffvqbni8ibk.apps.googleusercontent.com',
  DefaultCompanyId: 'c9d8c846-10fc-466d-8f45-a4fa4e856abd',
};

