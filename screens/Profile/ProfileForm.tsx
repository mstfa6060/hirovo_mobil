import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ActivityIndicator,
    StyleSheet, ScrollView, Alert, Switch, Platform, Image, KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { HirovoAPI } from '@api/business_modules/hirovo';
import TopBar from '../../components/TopBar';
import { useAuth } from '../../src/hooks/useAuth';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from 'date-fns';
import PhoneInputCustom from '../../components/PhoneInputCustom';
import { AppConfig } from '@config/hirovo-config';
import { pickAndUploadProfilePhoto } from 'src/utils/uploadProfilePhoto';
import { LanguageSelectorDropdown } from 'components/LanguageSelector';
import { FileProviderAPI } from '@api/base_modules/FileProvider';

const schema = z.object({
    phoneNumber: z.string().min(10, { message: 'ui.profile.validation.phoneNumber' }),
    birthDate: z.string().min(1, { message: 'ui.profile.validation.birthDate' }),
    city: z.string().min(1, { message: 'ui.profile.validation.city' }),
    district: z.string().min(1, { message: 'ui.profile.validation.district' }),
    description: z.string().min(10, { message: 'ui.profile.validation.descriptionMin' }),
    isAvailable: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function ProfileForm() {
    const { t } = useTranslation();
    const { user, updateUser } = useAuth();

    const {
        control,
        handleSubmit,
        setValue,
        reset,
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

    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [photoUrl, setPhotoUrl] = useState<FileProviderAPI.Files.Upload.IFileResponse | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedBucketId, setUploadedBucketId] = useState<string | null>(null);

    useFocusEffect(
        React.useCallback(() => {
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

                    const responseImage = await FileProviderAPI.Buckets.Detail.Request({
                        bucketId: user.bucketId,
                        changeId: '00000000-0000-0000-0000-000000000000',
                    });

                    const file = responseImage.files?.[responseImage.files?.length - 1] || null;
                    if (file) {
                        setPhotoUrl(file);
                    }
                } catch (error) {
                    Alert.alert(t('ui.error'), t('ui.profile.fetchError'));
                }
            };
            if (user.id) fetchProfile();
            return () => { };
        }, [user.id, reset])
    );

    const onSubmit = async (data: FormData) => {
        try {
            await HirovoAPI.UpdateProfile.Update.Request({
                userId: user.id,
                firstName: "user.firstName",
                lastName: "user.surname",
                email: user.email,
                phoneNumber: data.phoneNumber,

                city: data.city,
                district: data.district,
                description: data.description ?? '',
                birthDate: new Date(data.birthDate),
                isAvailable: data.isAvailable,
                bucketId: uploadedBucketId ?? user.bucketId,
            });
            Alert.alert(t('ui.success'), t('ui.profile.updated'));
        } catch (error) {
            Alert.alert(t('ui.error'), t('ui.profile.updateError'));
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TopBar title={t('ui.editProfile')} showBackButton />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Profil Fotoğrafı */}
                    <View style={{ alignItems: 'center', marginTop: 16 }}>
                        {photoUrl ? (
                            <Image
                                source={{ uri: `${user.profilePhotoUrl}` }}
                                style={{ width: 120, height: 120, borderRadius: 60 }}
                            />
                        ) : (
                            <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color: '#6B7280' }}>No Photo</Text>
                            </View>
                        )}
                        <TouchableOpacity
                            onPress={async () => {
                                try {
                                    setIsUploading(true);
                                    const uploadResponse = await pickAndUploadProfilePhoto({
                                        userId: user.id,
                                        tenantId: AppConfig.DefaultCompanyId,
                                        bucketId: user.bucketId,
                                    });
                                    const uploadedFile = uploadResponse?.files?.[uploadResponse?.files?.length - 1];
                                    if (uploadedFile) {
                                        setPhotoUrl(uploadedFile);
                                        setUploadedBucketId(uploadResponse.bucketId);
                                        updateUser({
                                            bucketId: uploadResponse.bucketId,
                                            profilePhotoUrl: `${AppConfig.BaseApi}/file-storage/${uploadedFile.path}`,
                                        });
                                    }
                                } catch {
                                    Alert.alert(t('ui.error'), t('ui.profile.photoUploadError'));
                                } finally {
                                    setIsUploading(false);
                                }
                            }}
                            style={{ marginTop: 12, backgroundColor: '#0b80ee', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999 }}
                        >
                            {isUploading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff' }}>{t('ui.profile.uploadPhoto')}</Text>}
                        </TouchableOpacity>
                    </View>

                    {/* E-posta */}
                    <Text style={styles.label}>{t('ui.profile.email')}</Text>
                    <TextInput
                        value={user.email}
                        editable={false}
                        style={[styles.input, { backgroundColor: '#f3f4f6' }]}
                    />

                    {/* Telefon */}
                    <Text style={styles.label}>{t('ui.profile.phoneNumber')}</Text>
                    <Controller
                        control={control}
                        name="phoneNumber"
                        render={({ field: { onChange, value } }) => (
                            <>
                                <PhoneInputCustom value={value} onChange={onChange} />
                                {errors.phoneNumber && <Text style={styles.errorText}>{t(errors.phoneNumber.message || '')}</Text>}
                            </>
                        )}
                    />

                    {/* Doğum Tarihi */}
                    <Text style={styles.label}>{t('ui.profile.birthDate')}</Text>
                    <Controller
                        control={control}
                        name="birthDate"
                        render={({ field: { value, onChange } }) => (
                            <>
                                <TouchableOpacity onPress={() => setDatePickerVisibility(true)}>
                                    <TextInput
                                        style={styles.input}
                                        value={value}
                                        editable={false}
                                        placeholder="YYYY-MM-DD"
                                    />
                                </TouchableOpacity>
                                <DateTimePickerModal
                                    isVisible={isDatePickerVisible}
                                    mode="date"
                                    maximumDate={new Date()}
                                    onConfirm={(date) => {
                                        onChange(format(date, 'yyyy-MM-dd'));
                                        setDatePickerVisibility(false);
                                    }}
                                    onCancel={() => setDatePickerVisibility(false)}
                                />
                                {errors.birthDate && <Text style={styles.errorText}>{t(errors.birthDate.message || '')}</Text>}
                            </>
                        )}
                    />

                    {/* Şehir ve İlçe */}
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>{t('ui.profile.city')}</Text>
                            <Controller
                                control={control}
                                name="city"
                                render={({ field: { onChange, value } }) => (
                                    <>
                                        <TextInput
                                            style={[styles.input, errors.city && { borderColor: 'red' }]}
                                            placeholder={t('ui.form.cityPlaceholder') || ''}
                                            value={value}
                                            onChangeText={onChange}
                                        />
                                        {errors.city && <Text style={styles.errorText}>{t(errors.city.message || '')}</Text>}
                                    </>
                                )}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.label}>{t('ui.profile.district')}</Text>
                            <Controller
                                control={control}
                                name="district"
                                render={({ field: { onChange, value } }) => (
                                    <>
                                        <TextInput
                                            style={[styles.input, errors.district && { borderColor: 'red' }]}
                                            placeholder={t('ui.form.districtPlaceholder') || ''}
                                            value={value}
                                            onChangeText={onChange}
                                        />
                                        {errors.district && <Text style={styles.errorText}>{t(errors.district.message || '')}</Text>}
                                    </>
                                )}
                            />
                        </View>
                    </View>

                    {/* Açıklama */}
                    <Text style={styles.label}>{t('ui.profile.description')}</Text>
                    <Controller
                        control={control}
                        name="description"
                        render={({ field: { onChange, value } }) => (
                            <>
                                <TextInput
                                    style={[styles.input, { height: 100, textAlignVertical: 'top' }, errors.description && { borderColor: 'red' }]}
                                    multiline
                                    placeholder={t('ui.form.descriptionPlaceholder') || ''}
                                    value={value}
                                    onChangeText={onChange}
                                />
                                {errors.description && <Text style={styles.errorText}>{t(errors.description.message || '')}</Text>}
                            </>
                        )}
                    />

                    {/* Müsaitlik */}
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

                    {/* Dil Seçici */}
                    <Text style={styles.label}>{t('common.language')}</Text>
                    <LanguageSelectorDropdown />
                </ScrollView>

                {/* Kaydet Butonu */}
                <View style={styles.bottomButtonContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.primaryButtonText}>{t('ui.form.save')}</Text>}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
    bottomButtonContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: '#e5e7eb',
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
    errorText: {
        color: 'red',
        marginTop: 4,
    },
});
