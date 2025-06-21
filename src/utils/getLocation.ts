// import { HirovoAPI } from '@api/business_modules/hirovo';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { jwtDecode } from 'jwt-decode';

// export const getLocationAndSend = async () => {
//     try {
//         const { status } = await Location.requestForegroundPermissionsAsync();
//         if (status !== 'granted') {
//             console.warn('Konum izni reddedildi');
//             return;
//         }

//         const location = await Location.getCurrentPositionAsync({
//             accuracy: Location.Accuracy.Balanced,
//         });

//         const jwt = await AsyncStorage.getItem('jwt');
//         if (!jwt) return;

//         const decoded: any = jwtDecode(jwt);
//         const userId = decoded?.nameid;
//         const companyId = AppConfig.DefaultCompanyId;

//         if (userId) {
//             await HirovoAPI.Location.SetLocation.Request({
//                 userId,
//                 latitude: location.coords.latitude,
//                 longitude: location.coords.longitude,
//                 companyId,
//             });
//         }
//     } catch (e) {
//         console.error('Konum gönderme hatası:', e);
//     }
// };
