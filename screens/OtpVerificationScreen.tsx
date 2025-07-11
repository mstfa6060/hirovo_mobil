import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    Keyboard,
    StyleSheet,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/RootNavigator';

export default function OtpVerificationScreen() {
    const route = useRoute();
    const { phoneNumber } = route.params as { phoneNumber: string };
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [otpInput, setOtpInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        setLoading(true);
        Keyboard.dismiss();

        // (isteğe bağlı) gelen otp burada AsyncStorage’da tutulmuş olabilir
        // Biz şu an gerçek doğrulama yapmıyoruz çünkü JWT zaten hazır
        if (otpInput.length === 6) {
            const jwt = await AsyncStorage.getItem('jwt');
            if (jwt) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Drawer' }],
                });
            } else {
                Alert.alert('Hata', 'JWT bulunamadı, yeniden giriş yapınız.');
                navigation.navigate('RegisterWithPhone');
            }
        } else {
            Alert.alert('Hata', 'Geçerli bir doğrulama kodu giriniz');
        }

        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Doğrulama</Text>
            <Text style={styles.subtitle}>
                {phoneNumber} numarasına gelen 6 haneli kodu girin.
            </Text>

            <TextInput
                style={styles.input}
                value={otpInput}
                onChangeText={setOtpInput}
                keyboardType="number-pad"
                placeholder="123456"
                maxLength={6}
                autoFocus
            />

            <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
                <Text style={styles.buttonText}>
                    {loading ? 'Doğrulanıyor...' : 'Devam Et'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
    subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 32 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 16,
        fontSize: 20,
        textAlign: 'center',
        letterSpacing: 10,
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 16,
        borderRadius: 999,
        alignItems: 'center',
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
