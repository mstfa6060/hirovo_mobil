import React from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppConfig } from '@config/hirovo-config';
import { IAMAPI } from '@api/base_modules/iam';
import { RootStackParamList } from '../navigation/RootNavigator';

const schema = z.object({
    phoneNumber: z.string().min(10, 'Geçerli bir telefon giriniz'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterWithPhoneScreen() {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            phoneNumber: '',
        },
    });

    const onSubmit = async (data: FormData) => {
        try {
            await IAMAPI.Auth.SendOtp.Request({
                phoneNumber: data.phoneNumber,
                companyId: AppConfig.DefaultCompanyId,
                language: i18n.language,
            });

            Alert.alert('✅', 'OTP başarıyla gönderildi.');

            navigation.navigate('OtpVerificationScreen', {
                phoneNumber: data.phoneNumber,
            });
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
