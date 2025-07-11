import React from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppConfig } from '@config/hirovo-config';
import { IAMAPI } from '@api/base_modules/iam';

type Guid = string;

const schema = z.object({
    phoneNumber: z.string().min(10, 'Geçerli bir telefon giriniz'),
    companyId: z.string().uuid('Geçerli companyId giriniz'),
    language: z.string().min(2),
});

type FormData = z.infer<typeof schema>;

export default function RegisterWithPhoneScreen() {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            phoneNumber: '',
            companyId: AppConfig.DefaultCompanyId,
            language: i18n.language,
        },
    });

    const onSubmit = async (data: FormData) => {
        try {
            const response = await IAMAPI.Auth.SendOtp.Request({
                phoneNumber: data.phoneNumber,
                companyId: data.companyId,
                language: data.language,
            });

            const { accessToken, refreshToken, expiresAt } = response;

            await AsyncStorage.setItem('jwt', accessToken);
            await AsyncStorage.setItem('refreshToken', refreshToken);
            await AsyncStorage.setItem('expiresAt', String(expiresAt));

            Alert.alert('Başarılı', 'OTP başarıyla gönderildi.');
            navigation.navigate('OtpVerificationScreen');
        } catch (error: any) {
            Alert.alert('Hata', error?.response?.data?.message || 'OTP gönderilemedi');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{t('ui.phoneNumber')}</Text>
            <Controller
                control={control}
                name="phoneNumber"
                render={({ field: { onChange, value } }) => (
                    <TextInput
                        placeholder="Telefon numarası"
                        keyboardType="phone-pad"
                        value={value}
                        onChangeText={onChange}
                        style={styles.input}
                    />
                )}
            />
            {errors.phoneNumber && <Text style={styles.error}>{errors.phoneNumber.message}</Text>}

            <Button title="OTP Gönder" onPress={handleSubmit(onSubmit)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    label: { fontSize: 16, marginBottom: 8 },
    input: { borderWidth: 1, padding: 10, marginBottom: 12, borderRadius: 5 },
    error: { color: 'red', marginBottom: 10 },
});
