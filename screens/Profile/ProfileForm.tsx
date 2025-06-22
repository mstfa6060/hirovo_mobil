import React, { useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ActivityIndicator,
    StyleSheet, ScrollView, Alert, Switch, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { HirovoAPI } from '@api/business_modules/hirovo';
import TopBar from '../../components/TopBar';
import { useAuth } from '../../src/hooks/useAuth';

const schema = z.object({
    phoneNumber: z.string().min(10, 'formErrors.phoneInvalid'),
    birthDate: z.string().min(1, 'formErrors.required'),
    city: z.string().min(1, 'formErrors.required'),
    district: z.string().min(1, 'formErrors.required'),
    description: z.string().optional(),
    isAvailable: z.boolean()
});

type FormData = z.infer<typeof schema>;

export default function ProfileForm() {
    const { t } = useTranslation();
    const { user } = useAuth();

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            phoneNumber: '',
            birthDate: '',
            city: '',
            district: '',
            description: '',
            isAvailable: true,
        },
    });

    useEffect(() => {
        if (!user.id) return;

        const fetchProfile = async () => {
            try {
                const response = await HirovoAPI.DetailProfile.Detail.Request({ userId: user.id });
                reset({
                    phoneNumber: response.phoneNumber ?? '',
                    birthDate: response.birthDate?.toString().substring(0, 10) ?? '',
                    city: response.city ?? '',
                    district: response.district ?? '',
                    description: response.description ?? '',
                    isAvailable: response.isAvailable ?? true,
                });
            } catch (error) {
                Alert.alert(t('ui.error'), t('ui.profile.fetchError'));
            }
        };

        fetchProfile();
    }, [user.id]);

    const onSubmit = async (data: FormData) => {
        try {
            await HirovoAPI.UpdateProfile.Update.Request({
                userId: user.id,
                phoneNumber: data.phoneNumber,
                city: data.city,
                district: data.district,
                description: data.description ?? '',
                birthDate: new Date(data.birthDate),
                isAvailable: data.isAvailable
            });

            Alert.alert(t('ui.success'), t('ui.profile.updated'));
        } catch (error) {
            Alert.alert(t('ui.error'), t('ui.profile.updateError'));
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TopBar title={t('ui.editProfile')} showBackButton />
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                <Text style={styles.label}>{t('ui.profile.email')}</Text>
                <TextInput
                    value={user.email}
                    editable={false}
                    style={[styles.input, { backgroundColor: '#f3f4f6' }]}
                />

                <Text style={styles.label}>{t('ui.profile.phoneNumber')}</Text>
                <Controller
                    control={control}
                    name="phoneNumber"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            style={styles.input}
                            keyboardType="phone-pad"
                            placeholder={t('ui.form.phoneNumberPlaceholder') || ''}
                            value={value}
                            onChangeText={onChange}
                        />
                    )}
                />

                <Text style={styles.label}>{t('ui.profile.birthDate')}</Text>
                <Controller
                    control={control}
                    name="birthDate"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            style={styles.input}
                            placeholder="YYYY-MM-DD"
                            keyboardType="numeric"
                            value={value}
                            onChangeText={onChange}
                        />
                    )}
                />

                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>{t('ui.profile.city')}</Text>
                        <Controller
                            control={control}
                            name="city"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('ui.form.cityPlaceholder') || ''}
                                    value={value}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.label}>{t('ui.profile.district')}</Text>
                        <Controller
                            control={control}
                            name="district"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('ui.form.districtPlaceholder') || ''}
                                    value={value}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                    </View>
                </View>

                <Text style={styles.label}>{t('ui.profile.description')}</Text>
                <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                            multiline
                            placeholder={t('ui.form.descriptionPlaceholder') || ''}
                            value={value}
                            onChangeText={onChange}
                        />
                    )}
                />

                <View style={styles.switchRow}>
                    <Text style={styles.label}>{t('ui.profile.isAvailable')}</Text>
                    <Controller
                        control={control}
                        name="isAvailable"
                        render={({ field: { value, onChange } }) => (
                            <Switch value={value} onValueChange={onChange} />
                        )}
                    />
                </View>
            </ScrollView>

            <View style={styles.footer}>
                {Object.keys(errors).length > 0 && (
                    <Text style={{ color: 'red', textAlign: 'center', marginBottom: 8 }}>
                        {t('ui.form.validationError')}
                    </Text>
                )}
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.primaryButtonText}>{t('ui.form.save')}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
    label: { marginTop: 16, marginBottom: 6, fontWeight: '500', fontSize: 14, color: '#374151' },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#111827',
    },
    row: { flexDirection: 'row', marginTop: 8 },
    switchRow: {
        marginTop: 20,
        padding: 12,
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    footer: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 20 : 12,
        left: 16,
        right: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: -2 },
        shadowRadius: 8,
        elevation: 8,
    },
    primaryButton: {
        backgroundColor: '#0b80ee',
        height: 48,
        borderRadius: 9999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
