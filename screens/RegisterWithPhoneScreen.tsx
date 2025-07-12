import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';

import { AppConfig } from '@config/hirovo-config';
import { IAMAPI } from '@api/base_modules/iam';
import { RootStackParamList } from '../navigation/RootNavigator';
import { LanguageSelectorDropdown } from 'components/LanguageSelector';

const schema = z.object({
    phoneNumber: z.string().min(10, { message: 'ui.registerWithPhone.invalidPhone' }).max(15),
});

type FormData = z.infer<typeof schema>;

export default function RegisterWithPhoneScreen() {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState(i18n.language);

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

    const handleLanguageChange = (lang: string) => {
        setLanguage(lang);
        i18n.changeLanguage(lang);
    };

    const onSubmit = async (data: FormData) => {
        try {
            setLoading(true);
            var response = await IAMAPI.Auth.SendOtp.Request({
                phoneNumber: data.phoneNumber,
                companyId: AppConfig.DefaultCompanyId,
                language,
            });

            Alert.alert('✅', t('ui.registerWithPhone.sendSuccess'));
            navigation.navigate('OtpVerificationScreen', { phoneNumber: data.phoneNumber, otpCode: response.otpCode });
        } catch (error: any) {
            Alert.alert(t('ui.error'), error?.response?.data?.message || t('ui.registerWithPhone.sendFail'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{t('ui.form.phoneNumber')}</Text>
            <Controller
                control={control}
                name="phoneNumber"
                render={({ field: { onChange, value } }) => (
                    <TextInput
                        placeholder={t('ui.registerWithPhone.phonePlaceholder')}
                        keyboardType="phone-pad"
                        maxLength={15}
                        autoComplete="tel"
                        value={value}
                        onChangeText={onChange}
                        style={styles.input}
                    />
                )}
            />
            {errors.phoneNumber && (
                <Text style={styles.error}>{t(errors.phoneNumber.message || '')}</Text>
            )}

            <Text style={styles.label}>{t('common.language')}</Text>
            <LanguageSelectorDropdown />

            <Button
                title={loading ? t('ui.registerWithPhone.sending') : t('ui.registerWithPhone.send')}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    label: { fontSize: 16, marginBottom: 8 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 12,
        borderRadius: 5,
    },
    error: { color: 'red', marginBottom: 10 },
    picker: { height: 50, marginBottom: 20 },
});
