import AsyncStorage from '@react-native-async-storage/async-storage';
import { IAMAPI } from '@api/base_modules/iam';

export const TokenManager = {
    isTokenExpired: async () => {
        const expiration = await AsyncStorage.getItem('sessionExpiration');
        console.log('TokenManager.isTokenExpired', expiration);
        if (!expiration) return true;

        const now = new Date();
        const expDate = new Date(expiration);
        return now >= expDate;
    },

    refreshToken: async () => {
        const token = await AsyncStorage.getItem('refreshToken');
        if (!token) return null;

        try {
            const result = await IAMAPI.Auth.RefreshToken.Request({
                refreshToken: token,
                platform: IAMAPI.Enums.ClientPlatforms.Mobile,
            });

            await AsyncStorage.setItem('jwt', result.jwt);
            await AsyncStorage.setItem('refreshToken', result.refreshToken);
            await AsyncStorage.setItem('sessionExpiration', result.sessionExpirationDate.toString());
            return result.jwt;
        } catch (err) {
            // refresh token geçersiz → logout yönlendirmesi gerekebilir
            await AsyncStorage.clear();
            return null;
        }
    }
};
