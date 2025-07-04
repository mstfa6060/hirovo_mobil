import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { IAMAPI } from '@api/base_modules/iam';
import { useAuth } from 'src/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

const schema = z
    .object({
        oldPassword: z.string().min(6, 'ui.changePasswordScreen.oldPasswordRequired'),
        newPassword: z.string().regex(passwordRegex, 'ui.changePasswordScreen.newPasswordRules'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        path: ['confirmPassword'],
        message: 'ui.changePasswordScreen.passwordsMustMatch',
    });

type FormData = z.infer<typeof schema>;

const ChangePasswordScreen = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigation = useNavigation();

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const onSubmit = async (data: FormData) => {
        try {
            const payload: IAMAPI.Users.UpdatePassword.IRequestModel = {
                userId: user.id,
                oldPassword: data.oldPassword,
                newPassword: data.newPassword,
            };

            await IAMAPI.Users.UpdatePassword.Request(payload);
            Alert.alert(t('ui.changePasswordScreen.passwordChangedSuccess'));
        } catch (error) {
            Alert.alert(t('error.passwordChangeFailed'));
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>{t('ui.changePasswordScreen.changePassword')}</Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.container}>
                    {/* Mevcut Şifre */}
                    <Controller
                        control={control}
                        name="oldPassword"
                        render={({ field: { onChange, value } }) => (
                            <>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        placeholder={t('ui.changePasswordScreen.oldPassword')}
                                        secureTextEntry={!showOldPassword}
                                        value={value}
                                        onChangeText={onChange}
                                        style={styles.input}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowOldPassword((prev) => !prev)}
                                        style={styles.eyeButton}
                                    >
                                        <Text>{showOldPassword ? '🙈' : '👁️'}</Text>
                                    </TouchableOpacity>
                                </View>
                                {errors.oldPassword && <Text style={styles.error}>{t(errors.oldPassword.message!)}</Text>}
                            </>
                        )}
                    />

                    {/* Yeni Şifre */}
                    <Controller
                        control={control}
                        name="newPassword"
                        render={({ field: { onChange, value } }) => (
                            <>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        placeholder={t('ui.changePasswordScreen.newPassword')}
                                        secureTextEntry={!showNewPassword}
                                        value={value}
                                        onChangeText={onChange}
                                        style={styles.input}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowNewPassword((prev) => !prev)}
                                        style={styles.eyeButton}
                                    >
                                        <Text>{showNewPassword ? '🙈' : '👁️'}</Text>
                                    </TouchableOpacity>
                                </View>
                                {errors.newPassword && <Text style={styles.error}>{t(errors.newPassword.message!)}</Text>}
                            </>
                        )}
                    />

                    {/* Şifreyi Onayla */}
                    <Controller
                        control={control}
                        name="confirmPassword"
                        render={({ field: { onChange, value } }) => (
                            <>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        placeholder={t('ui.changePasswordScreen.confirmPassword')}
                                        secureTextEntry={!showConfirmPassword}
                                        value={value}
                                        onChangeText={onChange}
                                        style={styles.input}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowConfirmPassword((prev) => !prev)}
                                        style={styles.eyeButton}
                                    >
                                        <Text>{showConfirmPassword ? '🙈' : '👁️'}</Text>
                                    </TouchableOpacity>
                                </View>
                                {errors.confirmPassword && <Text style={styles.error}>{t(errors.confirmPassword.message!)}</Text>}
                            </>
                        )}
                    />

                    <TouchableOpacity
                        style={[styles.button, isSubmitting && styles.buttonDisabled]}
                        onPress={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.buttonText}>{t('ui.changePasswordScreen.savePassword')}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
        paddingTop: 8,
        borderBottomWidth: 1,
        borderColor: '#e5e7eb',
    },
    backButton: {
        marginRight: 8,
        padding: 4,
    },
    topBarTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    container: {
        padding: 16,
        flexGrow: 1,
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

export default ChangePasswordScreen;
