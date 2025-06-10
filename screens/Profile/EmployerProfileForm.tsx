import React from 'react';
import {
    View,
    Text,
    TextInput,
    Switch,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import TopBar from '../../components/TopBar'; // 👈 JobsDetail'deki gibi üst bar

const schema = z.object({
    phoneNumber: z.string().min(10, 'formErrors.phoneInvalid'),
    birthDate: z.string().min(1, 'formErrors.required'),
    city: z.string().min(1, 'formErrors.required'),
    district: z.string().min(1, 'formErrors.required'),
    description: z.string().optional(),
    isAvailable: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function WorkerProfileForm({ userId }: { userId: string }) {
    const { t } = useTranslation();

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
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

    const onSubmit = async (data: FormData) => {
        console.log(data);
        // API çağrısı yapılabilir.
    };

    return (
        <SafeAreaView style={styles.container}>
            <TopBar title={t('ui.editProfile')} showBackButton />

            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                <View style={styles.card}>
                    <Text style={styles.label}>{t('profile.description')}</Text>
                    <Controller
                        control={control}
                        name="description"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                multiline
                                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                                placeholder={t('form.descriptionPlaceholdersssssss') || 'Tell us about yourself...'}
                                value={value}
                                onChangeText={onChange}
                            />
                        )}
                    />
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>{t('profile.phoneNumber')}</Text>
                    <Controller
                        control={control}
                        name="phoneNumber"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={styles.input}
                                placeholder={t('form.phoneNumberPlaceholder') || 'e.g., +905...'}
                                keyboardType="phone-pad"
                                value={value}
                                onChangeText={onChange}
                            />
                        )}
                    />
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>{t('profile.birthDate')}</Text>
                    <Controller
                        control={control}
                        name="birthDate"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={styles.input}
                                placeholder={t('form.birthDatePlaceholder') || 'YYYY-MM-DD'}
                                value={value}
                                onChangeText={onChange}
                            />
                        )}
                    />
                </View>

                <View style={[styles.card, { flexDirection: 'row', gap: 12 }]}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>{t('profile.city')}</Text>
                        <Controller
                            control={control}
                            name="city"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('form.cityPlaceholder') || 'e.g., İstanbul'}
                                    value={value}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>{t('profile.district')}</Text>
                        <Controller
                            control={control}
                            name="district"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('form.districtPlaceholder') || 'e.g., Kadıköy'}
                                    value={value}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                    </View>
                </View>

                <View style={styles.switchCard}>
                    <Text style={styles.label}>{t('profile.isAvailable')}</Text>
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
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.primaryButtonText}>{t('form.save')}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    card: {
        marginHorizontal: 16,
        marginTop: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    label: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#111827',
    },
    switchCard: {
        marginHorizontal: 16,
        marginTop: 16,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
