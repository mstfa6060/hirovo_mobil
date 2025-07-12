import React, { useState, useEffect } from 'react';
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
import { IAMAPI } from '@api/base_modules/iam';
import { AppConfig } from '@config/hirovo-config';
import { RootStackParamList } from '../navigation/RootNavigator';

export default function OtpVerificationScreen() {
    const route = useRoute();
    const { phoneNumber, otpCode } = route.params as { phoneNumber: string, otpCode: string };
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [otpInput, setOtpInput] = useState('');
    const [loading, setLoading] = useState(false);

    // OTP ilk açılışta inputa yazılsın ve 5 saniye sonra silinsin
    useEffect(() => {
        if (otpCode) {
            setOtpInput(otpCode);

            const timer = setTimeout(() => {
                setOtpInput('');
            }, 5000); // 5 saniye sonra temizle

            return () => clearTimeout(timer);
        }
    }, [otpCode]);

    const handleVerify = async () => {
        setLoading(true);
        Keyboard.dismiss();

        if (otpInput.length !== 6) {
            Alert.alert('Hata', '6 haneli doğrulama kodunu giriniz');
            setLoading(false);
            return;
        }

        try {
            const response = await IAMAPI.Auth.VerifyOtp.Request({
                phoneNumber,
                companyId: AppConfig.DefaultCompanyId,
                otpCode: otpInput,
            });

            await AsyncStorage.setItem('jwt', response.accessToken);
            Alert.alert('✅', 'Giriş başarılı');

            navigation.reset({
                index: 0,
                routes: [{ name: 'Drawer' }],
            });
        } catch (error: any) {
            Alert.alert('Hata', error?.response?.data?.message || 'OTP doğrulama başarısız');
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
