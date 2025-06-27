import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { IAMAPI } from '@api/base_modules/iam';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppConfig } from '@config/hirovo-config';

const schema = z.object({
    email: z.string().email('Geçerli bir e-posta adresi girin'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        try {
            const res = await IAMAPI.Users.ForgotPassword.Request({ email: data.email, companyId: AppConfig.DefaultCompanyId });
            console.log('Forgot password response:', res);
            Alert.alert(
                t('ui.forgotPassword.successTitle'),
                t('ui.forgotPassword.successMessage', { email: res.email })
            );
            navigation.goBack();
        } catch (err: any) {
            Alert.alert(t('ui.common.error'), t(`error.${err?.response?.data?.messageCode || 'unexpectedError'}`));
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('ui.forgotPassword.title')}</Text>
            <Text style={styles.subtitle}>{t('ui.forgotPassword.subtitle')}</Text>

            <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                    <>
                        <TextInput
                            style={styles.input}
                            placeholder={t('ui.forgotPassword.emailPlaceholder')}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                        />
                        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
                    </>
                )}
            />

            <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                style={[styles.button, isSubmitting && styles.buttonDisabled]}
            >
                <Text style={styles.buttonText}>{t('ui.forgotPassword.submit')}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
    subtitle: { fontSize: 14, color: '#666', marginBottom: 24, textAlign: 'center' },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    error: { color: '#ef4444', marginBottom: 8 },
    button: {
        backgroundColor: '#007bff',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
