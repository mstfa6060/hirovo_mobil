import React from 'react';
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
        try {
            await IAMAPI.Users.ResetPassword.Request({
                token,
                newPassword: data.newPassword,
            });

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

            <Controller
                control={control}
                name="newPassword"
                render={({ field: { onChange, value, onBlur } }) => (
                    <>
                        <TextInput
                            placeholder={t('ui.resetPassword.newPassword')}
                            secureTextEntry
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            style={styles.input}
                        />
                        {errors.newPassword && (
                            <Text style={styles.error}>{errors.newPassword.message}</Text>
                        )}
                    </>
                )}
            />

            <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value, onBlur } }) => (
                    <>
                        <TextInput
                            placeholder={t('ui.resetPassword.confirmPassword')}
                            secureTextEntry
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            style={styles.input}
                        />
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
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
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
