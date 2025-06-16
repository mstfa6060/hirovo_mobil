import Constants from 'expo-constants';

export const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
    // Expo Go'da native modül çalışmaz
    if (Constants.appOwnership === 'expo') {
        console.log('❌ Expo Go ortamında expo-location kullanılamaz.');
        return null;
    }

    try {
        const Location = await import('expo-location'); // dinamik import
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            console.warn('📍 Konum izni verilmedi');
            return null;
        }

        const result = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });

        return {
            latitude: result.coords.latitude,
            longitude: result.coords.longitude,
        };
    } catch (error) {
        console.error('Konum alınamadı:', error);
        return null;
    }
};
