// import * as TaskManager from 'expo-task-manager';
// import * as Location from 'expo-location';
// import Constants from 'expo-constants';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { HirovoAPI } from '@api/business_modules/hirovo';
// import { jwtDecode } from 'jwt-decode';

// if (Constants.appOwnership !== 'expo') {
//     TaskManager.defineTask('background-location-task', async ({
//         data,
//         error,
//     }: {
//         data: { locations: Location.LocationObject[] };
//         error: TaskManager.TaskManagerError | null;
//     }) => {
//         if (error) {
//             console.error('Konum Task Hatası:', error.message ?? error);
//             return;
//         }

//         const latest = data?.locations?.[0];
//         if (!latest) return;

//         try {
//             const jwt = await AsyncStorage.getItem('jwt');
//             if (!jwt) return;

//             const decoded: any = jwtDecode(jwt);
//             const userId = decoded?.nameid;
//             const companyId = 'c9d8c846-10fc-466d-8f45-a4fa4e856abd';

//             if (!userId) return;

//             await HirovoAPI.Location.SetLocation.Request({
//                 userId,
//                 latitude: latest.coords.latitude,
//                 longitude: latest.coords.longitude,
//                 companyId,
//             });
//         } catch (e) {
//             console.error('Konum gönderme hatası:', e);
//         }
//     });
// } else {
//     console.log('Expo Go ortamında task tanımlanmadı.');
// }
