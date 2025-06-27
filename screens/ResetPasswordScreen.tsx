import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { IAMAPI } from '@api/base_modules/iam';
import { useTranslation } from 'react-i18next';
import {
    useNavigation,
    useRoute,
    RouteProp,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'ResetPassword'>;

type FormData = {
    newPassword: string;
    confirmPassword: string;
};

export default function ResetPasswordScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<NavigationProps>();
    const route = useRoute<RouteProps>();
    const { token } = route.params;

    // 🔍 Debug logları
    useEffect(() => {
        console.log('📦 ResetPasswordScreen mounted');
        console.log('Decoded Token:', decodeURIComponent(token).replace(/ /g, '+'));
        console.log('🔑 Gelen parametreler:', route.params);
        console.log('🔐 Token:', token);
    }, []);

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const schema = z
        .object({
            newPassword: z
                .string()
                .min(8, t('ui.resetPassword.errors.minPassword')),
            confirmPassword: z.string(),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
            message: t('ui.resetPassword.errors.passwordMismatch'),
            path: ['confirmPassword'],
        });

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        const decodedToken = decodeURIComponent(token).replace(/ /g, '+');
        console.log('Reset Password Data:', data);
        console.log('Reset Password Token:', token);
        console.log('Corrected Decoded Token:', decodedToken);
        try {
            console.log('⏳ API isteği gönderiliyor...');
            const req = await IAMAPI.Users.ResetPassword.Request({
                token: decodedToken,
                newPassword: data.newPassword,
            });
            console.log('✅ API yanıtı:', req);

            Alert.alert(
                t('ui.resetPassword.successTitle'),
                t('ui.resetPassword.successMessage')
            );
            navigation.navigate('Login');
        } catch (err: any) {
            Alert.alert(
                t('ui.common.error'),
                t(`error.${err?.response?.data?.messageCode || 'unexpectedError'}`)
            );
        }
    };


    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('ui.resetPassword.title')}</Text>
            <Text style={styles.subtitle}>{t('ui.resetPassword.subtitle')}</Text>

            {/* Yeni Şifre */}
            <Controller
                control={control}
                name="newPassword"
                render={({ field: { onChange, value, onBlur } }) => (
                    <>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                placeholder={t('ui.resetPassword.newPassword')}
                                secureTextEntry={!showNewPassword}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                style={styles.input}
                            />
                            <TouchableOpacity
                                onPress={() => setShowNewPassword((prev) => !prev)}
                                style={styles.eyeButton}
                            >
                                <Text>{showNewPassword ? '🙈' : '👁️'}</Text>
                            </TouchableOpacity>
                        </View>
                        {errors.newPassword && (
                            <Text style={styles.error}>{errors.newPassword.message}</Text>
                        )}
                    </>
                )}
            />

            {/* Şifre Tekrar */}
            <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value, onBlur } }) => (
                    <>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                placeholder={t('ui.resetPassword.confirmPassword')}
                                secureTextEntry={!showConfirmPassword}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                style={styles.input}
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword((prev) => !prev)}
                                style={styles.eyeButton}
                            >
                                <Text>{showConfirmPassword ? '🙈' : '👁️'}</Text>
                            </TouchableOpacity>
                        </View>
                        {errors.confirmPassword && (
                            <Text style={styles.error}>
                                {errors.confirmPassword.message}
                            </Text>
                        )}
                    </>
                )}
            />

            <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                style={[styles.button, isSubmitting && styles.buttonDisabled]}
            >
                <Text style={styles.buttonText}>{t('ui.resetPassword.submit')}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
        textAlign: 'center',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 8,
        marginBottom: 8,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    eyeButton: {
        padding: 8,
    },
    error: {
        color: '#ef4444',
        marginBottom: 8,
    },
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
