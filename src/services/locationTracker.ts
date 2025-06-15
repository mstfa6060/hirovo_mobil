// import Constants from 'expo-constants';

// export const startBackgroundLocationTracking = async () => {
//     // Expo Go ortamındaysa (standalone değilse) atla
//     if (Constants.appOwnership === 'expo') {
//         console.log('Expo Go ortamı: konum takibi başlatılmadı');
//         return;
//     }

//     const Location = await import('expo-location');

//     const { status } = await Location.requestBackgroundPermissionsAsync();
//     if (status !== 'granted') {
//         console.warn('Arka plan konum izni verilmedi');
//         return;
//     }

//     const started = await Location.hasStartedLocationUpdatesAsync('background-location-task');
//     if (!started) {
//         await Location.startLocationUpdatesAsync('background-location-task', {
//             accuracy: Location.Accuracy.Balanced,
//             timeInterval: 600000, // 10 dakika
//             distanceInterval: 200, // 200 metre
//             showsBackgroundLocationIndicator: true,
//             foregroundService: {
//                 notificationTitle: 'Hirovo',
//                 notificationBody: 'Konum güncelleniyor...',
//             },
//         });
//         console.log('✅ Arka plan konum takibi başlatıldı');
//     } else {
//         console.log('ℹ️ Zaten çalışıyor');
//     }
// };
