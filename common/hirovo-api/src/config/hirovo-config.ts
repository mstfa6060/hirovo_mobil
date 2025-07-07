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
  BaseApi: "https://api.hirovo.com/",
  HirovoUrl: 'https://api.hirovo.com/hirovo',
  IAMUrl: 'https://api.hirovo.com/iam',
  FileProviderUrl: 'https://api.hirovo.com/fileprovider',
  GoogleIosClientId: '842035070407-dfa9ck6rf0vg8pi4o9meen616gsmkkds.apps.googleusercontent.com',
  GoogleAndroidClientIdDev: '1053973213164-p9j88c7th2uma4u6lftfi5durebts0dn.apps.googleusercontent.com',
  // GoogleWebClientId: '842035070407-sgc4mteltb0p41e6cghfcqeh8k0flo55.apps.googleusercontent.com',
  GoogleAndroidClientId: '88926208060-grg2h3ium7g5jaqbvugr4bq64hs6e5q3.apps.googleusercontent.com',
  GoogleWebClientId: '88926208060-9mrke9kitb6qfms46had13830ma1kr7l.apps.googleusercontent.com',
  DefaultCompanyId: 'c9d8c846-10fc-466d-8f45-a4fa4e856abd',
};

