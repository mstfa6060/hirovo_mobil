// import Constants from 'expo-constants';
// import * as Location from 'expo-location';
// import { HirovoAPI } from '@api/business_modules/hirovo';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { jwtDecode } from 'jwt-decode';

// export const getLocationAndSend = async () => {
//     if (Constants.appOwnership === 'expo') {
//         console.log('Expo Go ortamı: konum gönderimi atlandı.');
//         return;
//     }

//     try {
//         const { status } = await Location.requestForegroundPermissionsAsync();
//         if (status !== 'granted') return;

//         const location = await Location.getCurrentPositionAsync({
//             accuracy: Location.Accuracy.Balanced,
//         });

//         const jwt = await AsyncStorage.getItem('jwt');
//         if (!jwt) return;

//         const decoded: any = jwtDecode(jwt);
//         const userId = decoded?.nameid;
//         const companyId = 'c9d8c846-10fc-466d-8f45-a4fa4e856abd';

//         if (userId) {
//             await HirovoAPI.Location.SetLocation.Request({
//                 userId,
//                 latitude: location.coords.latitude,
//                 longitude: location.coords.longitude,
//                 companyId,
//             });
//         }
//     } catch (e) {
//         console.warn('Konum gönderimi hatası:', e);
//     }
// };
