

import axios from 'axios';

type AxiosInstance = ReturnType<typeof axios.create>;

export const api: AxiosInstance = axios.create({
	baseURL: 'https://api.hirovo.com',
	timeout: 10000
});

export const AppConfig = {
	HirovoUrl: 'https://api.hirovo.com',
	IAMUrl: 'https://iam.hirovo.com',
	GoogleClientId: 'YOUR_GOOGLE_CLIENT_ID',
	GoogleIosClientId: 'YOUR_IOS_CLIENT_ID',
	GoogleAndroidClientId: 'YOUR_ANDROID_CLIENT_ID',
	GoogleExpoClientId: 'YOUR_EXPO_CLIENT_ID'
};
