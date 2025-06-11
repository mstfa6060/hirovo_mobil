import React, { useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import TopBar from '../../components/TopBar';
import { HirovoAPI } from '@api/business_modules/hirovo';
import { useAuth } from '../../src/hooks/useAuth';

const schema = z.object({
    phoneNumber: z.string().min(10, 'formErrors.phoneInvalid'),
    city: z.string().min(1, 'formErrors.required'),
    district: z.string().min(1, 'formErrors.required'),
});

type FormData = z.infer<typeof schema>;

export default function EmployerProfileForm({ userId }: { userId: string }) {
    const { t } = useTranslation();
    const { user } = useAuth();

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        formState: { isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            phoneNumber: '',
            city: '',
            district: '',
        },
    });

    useEffect(() => {
        if (!userId) return;

        const fetchProfile = async () => {
            try {
                const res = await HirovoAPI.Employers.Detail.Request({ userId });
                reset({
                    phoneNumber: res.phoneNumber ?? '',
                    city: res.city ?? '',
                    district: res.district ?? '',
                });
            } catch (err) {
                Alert.alert(t('ui.error'), t('ui.profile.fetchError'));
            }
        };

        fetchProfile();
    }, [userId]);

    const onSubmit = async (data: FormData) => {
        try {
            await HirovoAPI.Employers.UpdateProfile.Request({
                userId,
                phoneNumber: data.phoneNumber,
                city: data.city,
                district: data.district,
            });
            Alert.alert(t('ui.success'), t('ui.profile.updated'));
        } catch (error) {
            Alert.alert(t('ui.error'), t('ui.profile.updateError'));
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TopBar title={t('ui.editProfile')} showBackButton />

            <View style={styles.card}>
                <Text style={styles.label}>{t('ui.profile.email')}</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: '#f9fafb' }]}
                    placeholder={t('ui.form.emailPlaceholder') || 'employer@example.com'}
                    value={user.email}
                    editable={false}
                />
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>{t('ui.profile.phoneNumber')}</Text>
                <Controller
                    control={control}
                    name="phoneNumber"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            style={styles.input}
                            placeholder={t('ui.form.phoneNumberPlaceholder') || '(123) 456-7890'}
                            keyboardType="phone-pad"
                            value={value}
                            onChangeText={onChange}
                        />
                    )}
                />
            </View>

            <View style={styles.row}>
                <View style={styles.cardRow}>
                    <Text style={styles.label}>{t('ui.profile.city')}</Text>
                    <Controller
                        control={control}
                        name="city"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={styles.input}
                                placeholder={t('ui.form.cityPlaceholder') || 'e.g., İstanbul'}
                                value={value}
                                onChangeText={onChange}
                            />
                        )}
                    />
                </View>

                <View style={styles.cardRow}>
                    <Text style={styles.label}>{t('ui.profile.district')}</Text>
                    <Controller
                        control={control}
                        name="district"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={styles.input}
                                placeholder={t('ui.form.districtPlaceholder') || 'e.g., Kadıköy'}
                                value={value}
                                onChangeText={onChange}
                            />
                        )}
                    />
                </View>
            </View>

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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
    card: { marginTop: 16 },
    cardRow: { flex: 1, marginTop: 16 },
    label: { fontSize: 14, color: '#374151', marginBottom: 6 },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#111827',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#2563eb',
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 32,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
